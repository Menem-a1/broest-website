-- =====================================================================
-- ملف: 0002_orders_allow_guest_insert.sql
-- الغرض: يخلّي العميل يقدر يسجّل طلب من غير ما يكون مسجّل دخول،
--         ومن غير ما نقفل RLS أو نفتح بيانات العملاء لأي حد.
--
-- ⚠️⚠️ قبل ما تشغّل الملف ده، شغّل 0001_diagnose_orders_rls.sql الأول ⚠️⚠️
--     وابعتلي الناتج. لو فيه سياسة RESTRICTIVE قديمة على الجدول،
--     السياسة الجديدة دي مش هتنفع لوحدها.
--
-- ⚠️ كمان: لو إنت شغّلت قبل كده
--          alter table public.orders disable row level security;
--     فالسطر الأول هنا هيرجّع يفعّلها تاني — وده المقصود.
-- =====================================================================


-- ---------------------------------------------------------------------
-- (1) نتأكد إن RLS مفعّل
--     مهم: من غيره، أي حد على الإنترنت يقدر يقرا أسماء وأرقام
--     وعناوين كل عملائك.
-- ---------------------------------------------------------------------
alter table public.orders enable row level security;


-- ---------------------------------------------------------------------
-- (2) نسيب أي سياسة INSERT قديمة ومكررة — عشان ميبقاش فيه تضارب
--     (drop if exists يعني لو مش موجودة مش هيحصل خطأ)
-- ---------------------------------------------------------------------
drop policy if exists "orders_insert_public"     on public.orders;
drop policy if exists "orders_public_insert"     on public.orders;
drop policy if exists "Allow anonymous inserts"  on public.orders;
drop policy if exists "anon_insert_orders"       on public.orders;


-- ---------------------------------------------------------------------
-- (3) ⭐ الحل الأساسي ⭐
--     سياسة INSERT جديدة تسمح لدورَي `anon` (الزائر) و
--     `authenticated` (العميل المسجّل) بإنشاء طلب جديد.
--
--     `with check (true)` = أي صف جديد مسموح.
--     ده آمن لأن السياسة دي للإدخال بس — مش للقراءة ولا التعديل.
-- ---------------------------------------------------------------------
create policy "orders_insert_public"
on public.orders
for insert
to anon, authenticated
with check (true);


-- ---------------------------------------------------------------------
-- (4) للتأكيد: منعرضش أي صلاحية SELECT للزوار.
--     لو فيه سياسة قديمة بتخلي `anon` يقرا الجدول كله، شيلها.
--     ⚠️ شغّل السطر ده لوحده وبعد ما تتأكد من اسم السياسة من
--        نتيجة الاستعلام رقم (2) في ملف التشخيص.
-- ---------------------------------------------------------------------
-- drop policy if exists "اسم_السياسة_من_نتيجة_التشخيص" on public.orders;


-- ---------------------------------------------------------------------
-- (5) التحقق: بعد ما تشغّل الملف، الاستعلام ده لازم يوريك صف
--     command = INSERT و anon_allowed = YES
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
    else 'NO'
  end                                                as anon_allowed
from pg_policy p
join pg_class c     on c.oid = p.polrelid
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relname = 'orders'
order by command, policy_name;


-- =====================================================================
-- 🚨 الملف ده لوحده مش كفاية — لازم تشغّل 0003 كمان
-- =====================================================================
--
-- السياسة دي بتصلّح الـ INSERT العادي بس.
--
-- بس الكود في src/lib/useOrders.ts سطر 127 بيعمل:
--
--     .select("id, display_number")
--     .single();
--
-- و PostgREST بيترجمها لـ  INSERT ... RETURNING.
-- و PostgreSQL بيطبّق سياسات الـ SELECT كمان على RETURNING،
-- فبما إننا (صح) مديناش الزوار صلاحية قراءة → هيرجع
-- نفس الخطأ بالظبط: 42501 new row violates row-level security policy.
--
-- ✅ الكلام ده متأكَّد منه باختبار فعلي على PostgreSQL حقيقي:
--      • insert عادي بعد الملف ده        → نجح
--      • insert + returning بعد الملف ده → فشل بـ 42501
--      • عن طريق دالة place_order        → نجح
--
-- عشان كده لازم تشغّل 0003_place_order_rpc.sql بعده على طول،
-- وبعدها أعدّل useOrders.ts عشان ينادي الدالة بدل .insert().select().
-- =====================================================================
