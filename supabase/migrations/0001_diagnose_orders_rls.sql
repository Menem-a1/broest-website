-- =====================================================================
-- ملف: 0001_diagnose_orders_rls.sql
-- الغرض: يشخّص مشكلة
--         "new row violates row-level security policy for table orders"
--
-- ⚠️ الملف ده للقراءة بس — مش بيعدّل ولا بيضيف ولا بيحذف أي حاجة.
--    شغّله زي ما هو في Supabase Dashboard → SQL Editor،
--    وابعتلي الناتج بتاع كل استعلام.
-- =====================================================================


-- ---------------------------------------------------------------------
-- (1) هل RLS مفعّل على جدول orders أصلًا؟
--     relrowsecurity = true  → مفعّل (ده الطبيعي)
--     relrowsecurity = false → مقفول بالكامل (خطر أمني)
-- ---------------------------------------------------------------------
select
  c.relname                                          as table_name,
  c.relrowsecurity                                   as rls_enabled,
  c.relforcerowsecurity                              as rls_forced
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relname = 'orders';


-- ---------------------------------------------------------------------
-- (2) ⭐ أهم استعلام في الملف ده ⭐
--     بيعرض كل السياسات الموجودة على جدول orders،
--     والأهم: هل كل سياسة بتسمح لدور `anon` (الزائر) ولا لأ.
--
--     لو عمود anon_allowed طلع "NO" في كل الصفوف اللي command = INSERT
--     → دي بالظبط سبب المشكلة.
-- ---------------------------------------------------------------------
select
  p.polname                                          as policy_name,
  case p.polcmd
    when 'r' then 'SELECT'
    when 'a' then 'INSERT'
    when 'w' then 'UPDATE'
    when 'd' then 'DELETE'
    when '*' then 'ALL'
  end                                                as command,
  case
    when (select oid from pg_roles where rolname = 'anon') = any (p.polroles)
      then 'YES'
    else 'NO  <-- الزائر مرفوض'
  end                                                as anon_allowed,
  case
    when (select oid from pg_roles where rolname = 'authenticated') = any (p.polroles)
      then 'YES'
    else 'NO'
  end                                                as authenticated_allowed,
  case when p.polpermissive then 'permissive' else 'RESTRICTIVE' end as kind,
  pg_get_expr(p.polqual,     p.polrelid)              as using_expr,
  pg_get_expr(p.polwithcheck, p.polrelid)             as with_check_expr
from pg_policy p
join pg_class c     on c.oid = p.polrelid
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relname = 'orders'
order by command, policy_name;


-- ---------------------------------------------------------------------
-- (3) أدوار قاعدة البيانات المتاحة — للتأكد إن `anon` موجود أصلًا
-- ---------------------------------------------------------------------
select rolname, rolsuper
from pg_roles
where rolname in ('anon', 'authenticated', 'service_role', 'postgres')
order by rolname;


-- ---------------------------------------------------------------------
-- (4) أعمدة جدول orders وأنواعها
--     محتاجها عشان أكتبلك دالة place_order صح من أول مرة
--     (بالذات: هل delivery_zone_id نوعه uuid ولا text؟)
-- ---------------------------------------------------------------------
select
  column_name,
  data_type,
  is_nullable,
  column_default
from information_schema.columns
where table_schema = 'public'
  and table_name   = 'orders'
order by ordinal_position;


-- ---------------------------------------------------------------------
-- (5) نفس الكلام للجداول المرتبطة بالطلب
-- ---------------------------------------------------------------------
select
  table_name,
  column_name,
  data_type
from information_schema.columns
where table_schema = 'public'
  and table_name in ('delivery_zones', 'branches', 'menu_items', 'item_sizes')
  and column_name in ('id', 'price', 'delivery_price', 'is_active', 'label', 'item_id')
order by table_name, column_name;


-- ---------------------------------------------------------------------
-- (6) مين اللي بيولّد display_number؟ (trigger ولا sequence ولا default)
--     لو طلع صف فاضي، يبقى الرقم بيتحسب في مكان تاني ومحتاج أعرفه.
-- ---------------------------------------------------------------------
select
  t.tgname                                           as trigger_name,
  pg_get_triggerdef(t.oid)                           as definition
from pg_trigger t
join pg_class c     on c.oid = t.tgrelid
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relname = 'orders'
  and not t.tgisinternal;


-- ---------------------------------------------------------------------
-- (7) مراجعة سريعة لكل الجداول: أي جدول RLS مفعّل عليه ومفيش عليه
--     ولا سياسة للزوار؟ ده بيكشفلك مشاكل تانية لسه مجتش.
-- ---------------------------------------------------------------------
select
  c.relname                                          as table_name,
  c.relrowsecurity                                   as rls_enabled,
  count(p.polname)                                   as total_policies,
  count(p.polname) filter (
    where (select oid from pg_roles where rolname = 'anon') = any (p.polroles)
  )                                                  as policies_open_to_anon
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
left join pg_policy p on p.polrelid = c.oid
where n.nspname = 'public'
  and c.relkind  = 'r'
group by c.relname, c.relrowsecurity
order by c.relname;
