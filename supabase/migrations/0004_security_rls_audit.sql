-- =====================================================================
-- ملف: 0004_security_rls_audit.sql
-- الغرض: مراجعة أمنية شاملة (المرحلة 3) — يعرض حالة الحماية
--         لكل جداول وقواعد البيانات، ويكشف بالذات:
--           1. أي جدول فيه بيانات عملاء الزائر (anon) يقدر يقراه
--           2. حالة restaurant_settings اللي فيها paymob_api_key (سرّي!)
--           3. الجداول اللي RLS مقفول عليها خالص (خطر)
--           4. الدوال (RPC) ومين ينفّذها
--
-- ⚠️ الملف ده للقراءة بس — مش بيعدّل ولا بيضيف ولا بيحذف أي حاجة.
--    شغّله في Supabase Dashboard → SQL Editor قبل 0005،
--    و احتفظ بالنتيجة للمقارنة بعد التشغيل.
-- =====================================================================


-- ---------------------------------------------------------------------
-- (1) ⭐ جرد كامل لكل جداول ومُنظّرات السكيمة public ⭐
--     • rls_enabled = false → الجدول مكشوف بالكامل (أخطر حاجة في الملف)
--     • anon_policies > 0 → فيه سياسات بتفتح للزائر
--     بالمقابل: لو جدول مفيهوش أي سياسات وRLS مفعّل → مقفول تمامًا (ده المطلوب لجداول العملاء)
-- ---------------------------------------------------------------------
select
  c.relname                                                      as table_name,
  case c.relkind when 'r' then 'table' else 'view' end           as kind,
  c.relrowsecurity                                               as rls_enabled,
  count(p.polname)                                               as total_policies,
  count(p.polname) filter (
    where (select oid from pg_roles where rolname = 'anon') = any (p.polroles)
  )                                                              as anon_policies,
  count(p.polname) filter (
    where (select oid from pg_roles where rolname = 'authenticated') = any (p.polroles)
  )                                                              as authenticated_policies
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
left join pg_policy p on p.polrelid = c.oid
where n.nspname = 'public'
  and c.relkind in ('r', 'v')
group by c.relname, c.relkind, c.relrowsecurity
order by c.relname;


-- ---------------------------------------------------------------------
-- (2) الصلاحيات الفعلية على SQL level (GRANT) — مستقلة عن الـ RLS
--     ⚠️ ركّز على: anon_can_select على الجداول دي:
--        customer_addresses / customer_favorites / inactive_customers /
--        restaurant_settings / admin_roles
--     لو طلعت true في أي واحدة فيهم → بيانات عملاء (أو مفاتيح سرّية) مكشوفة
--     حتى لو الـ RLS مفعّل، الـ GRANT لوحده مش بيفتح حاجة من غير سياسة،
--     بس هو النص اللي بتتقاس عليه السياسات أصلاً
-- ---------------------------------------------------------------------
select
  c.relname                                          as table_name,
  has_table_privilege('anon',          c.oid, 'SELECT') as anon_select,
  has_table_privilege('anon',          c.oid, 'INSERT') as anon_insert,
  has_table_privilege('anon',          c.oid, 'UPDATE') as anon_update,
  has_table_privilege('anon',          c.oid, 'DELETE') as anon_delete,
  has_table_privilege('authenticated', c.oid, 'SELECT') as auth_select,
  has_table_privilege('authenticated', c.oid, 'UPDATE') as auth_update
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relkind in ('r', 'v')
  and c.relname in (
    'orders', 'reviews', 'customer_addresses', 'customer_favorites',
    'inactive_customers', 'restaurant_settings', 'admin_roles'
  )
order by c.relname;


-- ---------------------------------------------------------------------
-- (3) كل السياسات الموجودة على الجداول الحسّاسة بالتفصيل
--     عشان نعرف بالظبط إيه اللي المفروض يتشال ويتبدّل في 0005
-- ---------------------------------------------------------------------
select
  c.relname                                           as table_name,
  p.polname                                           as policy_name,
  case p.polcmd
    when 'r' then 'SELECT'
    when 'a' then 'INSERT'
    when 'w' then 'UPDATE'
    when 'd' then 'DELETE'
    when '*' then 'ALL'
  end                                                 as command,
  case
    when (select oid from pg_roles where rolname = 'anon') = any (p.polroles)
      then 'YES'
    else 'NO'
  end                                                 as anon_allowed,
  case
    when (select oid from pg_roles where rolname = 'authenticated') = any (p.polroles)
      then 'YES'
    else 'NO'
  end                                                 as authenticated_allowed,
  case when p.polpermissive then 'permissive' else 'RESTRICTIVE' end as kind,
  pg_get_expr(p.polqual,     p.polrelid)              as using_expr,
  pg_get_expr(p.polwithcheck, p.polrelid)             as with_check_expr
from pg_policy p
join pg_class c     on c.oid = p.polrelid
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relname in (
    'orders', 'reviews', 'customer_addresses', 'customer_favorites',
    'inactive_customers', 'restaurant_settings', 'admin_roles'
  )
order by c.relname, command, p.polname;


-- ---------------------------------------------------------------------
-- (4) أعمدة restaurant_settings —
--     عشان نتأكد إن الـ view العام في 0005 بيغطي كل الأعمدة الآمنة،
--     ومفيش عمود سرّي غير paymob_api_key و paymob_integration_id
-- ---------------------------------------------------------------------
select
  column_name,
  data_type,
  is_nullable
from information_schema.columns
where table_schema = 'public'
  and table_name   = 'restaurant_settings'
order by ordinal_position;


-- ---------------------------------------------------------------------
-- (5) inactive_customers: جدول ولا مُنظّر (view)؟ وإيه أعمدته؟
--     ده بيحدد طريقة الحماية في 0005:
--       • جدول  → RLS + سياسة أدمن بس
--       • view  → سحب الصلاحيات مباشرة + دالة RPC للأدمن
-- ---------------------------------------------------------------------
select
  c.relname   as relation_name,
  case c.relkind when 'r' then 'table' when 'v' then 'VIEW' end as kind,
  c.relrowsecurity as rls_enabled
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relname = 'inactive_customers';


select
  column_name,
  data_type,
  is_nullable
from information_schema.columns
where table_schema = 'public'
  and table_name   = 'inactive_customers'
order by ordinal_position;


-- ---------------------------------------------------------------------
-- (6) الدوال (RPC) المستخدمة في الموقع — مراجعة أمنية
--     • security_definer لازم يكون true للدوال اللي بتكتب في الجداول
--     • anon_can_execute: مسموح بس لـ place_order و to_uuid_or_null
--       (وأي دالة تانية مكتوبة في الكود تتأكد إن حمايتها جوّه_body)
--     لو list_admin_users أو set_admin_role_by_email مفتوحين لـ anon
--     → أي زائر يقدر يشوف أو يعدّل أدوار لوحة التحكم! (خطر كبير)
-- ---------------------------------------------------------------------
select
  p.proname                                          as function_name,
  pg_get_function_identity_arguments(p.oid)          as args,
  p.prosecdef                                        as security_definer,
  has_function_privilege('anon',          p.oid, 'EXECUTE') as anon_can_execute,
  has_function_privilege('authenticated', p.oid, 'EXECUTE') as auth_can_execute
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and p.proname in (
    'place_order', 'to_uuid_or_null',
    'list_admin_users', 'set_admin_role_by_email',
    'calculate_verified_items_total'
  )
order by p.proname;


-- ---------------------------------------------------------------------
-- (7) المُنظّرات (views): هل هي security_involer ولا بتنفّذ بصلاحيات مالكها؟
--     security_invoker = false → الـ view بيتخطى RLS الجداول اللي جواه
--     (ده مطلوب عمدًا للـ view العام اللي هنعمله في 0005،
--      بس لازم نراجع إن مفيش view قديم بيفتح بيانات بالغلط)
-- ---------------------------------------------------------------------
select
  c.relname                                        as view_name,
  coalesce(
    (select option_value
     from pg_options_to_table(c.reloptions)
     where option_name = 'security_invoker'),
    'false'
  )                                                as security_invoker
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relkind = 'v'
order by c.relname;


-- =====================================================================
-- ✅ إزاي تقرا النتيجة:
--
--   • استعلام (1): أي جدول rls_enabled = false → خطر فوري
--   • استعلام (2): anon_select = true على جداول العملاء → تسريب بيانات
--   • استعلام (2): anon_select = true على restaurant_settings →
--                  مفتاح Paymob السرّي متاح لأي زائر! (اللي إحنا بصلّحه)
--   • استعلام (6): anon_can_execute = true على list_admin_users → خطر كبير
--
--   بعد ما تشغّل 0005_security_rls_hardening.sql، شغّل الملف ده تاني
--   وقارن — المفروض الجداول الحسّاسة تبقى:
--     rls_enabled = true، anon_policies = 0 (أو SELECT المرئي بس)
-- =====================================================================
