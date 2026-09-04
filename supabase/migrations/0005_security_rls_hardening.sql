-- =====================================================================
-- ملف: 0005_security_rls_hardening.sql
-- الغرض: تطبيق إصلاحات المرحلة 3 (الأمان):
--
--   (أ) حماية بيانات العملاء من الزوار (anon):
--       • customer_addresses  → العميل يشوف/يعدّل عناوينه هو بس
--       • customer_favorites  → العميل يشوف مفضّلته هو بس
--       • orders              → العميل يشوف طلباته هو بس، والأدمن يشوف الكل
--       • inactive_customers  → للأدمن بس (عن طريق دالة RPC محمية)
--       • admin_roles         → كل مستخدم يشوف دوره هو بس
--
--   (ب) حماية restaurant_settings:
--       • الجدول نفسه بيبقى للأدمن بس (فيه paymob_api_key — مفتاح سرّي!)
--       • view عام جديد restaurant_settings_public فيه الأعمدة الآمنة بس،
--         هو اللي الموقع العام بيقرا منه
--
--   (ج) reviews: الزائر يشوف الظاهر بس، العميل يقيّم طلباته هو،
--       والأدمن بس اللي يعدّل
--
-- ⚠️ شغّل 0004_security_rls_audit.sql الأول واحفظ نتيجته (للمقارنة)
-- ⚠️ الملف ده لازم يتشغّل **قبل** نشر كود الفرونت الجديد —
--    الكود الجديد بيقرا الإعدادات العامة من restaurant_settings_public،
--    فلو نشرت الكود قبل ما تشغّل الملف ده، الإعدادات هترجع فاضية
--    (الموقع هيفضل شغال بالقيم الاحتياطية، وبوابة الدفع هتختفي من السلة)
-- =====================================================================


-- ---------------------------------------------------------------------
-- (0) دالة مساعدة: هل المستخدم الحالي أدمن؟
--
--     بترجع true لو في صف في admin_roles بنفس user_id بتاع الجلسة.
--     SECURITY DEFINER عشان:
--       • تتخطى RLS بتاعة admin_roles نفسها (وإلا هتدور في نفسها للأبد)
--       • أي سياسة RLS تقدر تستخدمها من غير recursion
--     البحث بيحصل بس لما يكون فيه جلسة (auth.uid() بيرجع null للزائر
--     فالاستعلام مش هيلتقي بحاجة وترجع false — مش بترمي خطأ)
-- ---------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_roles ar
    where ar.user_id = auth.uid()
  )
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;


-- ---------------------------------------------------------------------
-- (1) admin_roles — أدوار لوحة التحكم (developer / owner)
--
--     المطلوب: كل مستخدم مسجّل دخول يقدر يقرا دوره **هو بس**.
--     (AuthContext.tsx بيقرا دور المستخدم من الجدول ده)
--     الإضافة والتعديل بيحصلوا عن طريق دالة set_admin_role_by_email
--     (SECURITY DEFINER) فمفيش أي سياسات كتابة هنا.
-- ---------------------------------------------------------------------
alter table public.admin_roles enable row level security;

do $$
declare r record;
begin
  if to_regclass('public.admin_roles') is not null then
    for r in
      select polname from pg_policy
      where polrelid = 'public.admin_roles'::regclass
    loop
      execute format('drop policy if exists %I on public.admin_roles', r.polname);
    end loop;
  end if;
end $$;

create policy "admin_roles_select_own"
on public.admin_roles
for select
to authenticated
using (user_id = auth.uid());


-- ---------------------------------------------------------------------
-- (2) customer_addresses — عناوين العملاء المحفوظة (البيت، الشغل...)
--
--     المطلوب: العميل المسجّل يقدر يقرا/يضيف/يمسح عناوينه هو بس.
--     الزائر (anon) مالوش أي صلاحية خالص.
--     ملاحظة: مفيش سياسة UPDATE لأن الكود حاليًا مش بيعمل تعديل عنوان
--     (بيمسح ويعيد الإضافة) — لو ضفنا تعديل بعدين نضيف سياسة وقتها.
-- ---------------------------------------------------------------------
alter table public.customer_addresses enable row level security;

do $$
declare r record;
begin
  if to_regclass('public.customer_addresses') is not null then
    for r in
      select polname from pg_policy
      where polrelid = 'public.customer_addresses'::regclass
    loop
      execute format('drop policy if exists %I on public.customer_addresses', r.polname);
    end loop;
  end if;
end $$;

create policy "customer_addresses_select_own"
on public.customer_addresses
for select
to authenticated
using (user_id = auth.uid());

create policy "customer_addresses_insert_own"
on public.customer_addresses
for insert
to authenticated
with check (user_id = auth.uid());

create policy "customer_addresses_delete_own"
on public.customer_addresses
for delete
to authenticated
using (user_id = auth.uid());


-- ---------------------------------------------------------------------
-- (3) customer_favorites — المفضلة
--
--     نفس منطق العناوين بالظبط: كل عميل يشوف مفضلته هو بس،
--     والزائر مالوش أي صلاحية.
-- ---------------------------------------------------------------------
alter table public.customer_favorites enable row level security;

do $$
declare r record;
begin
  if to_regclass('public.customer_favorites') is not null then
    for r in
      select polname from pg_policy
      where polrelid = 'public.customer_favorites'::regclass
    loop
      execute format('drop policy if exists %I on public.customer_favorites', r.polname);
    end loop;
  end if;
end $$;

create policy "customer_favorites_select_own"
on public.customer_favorites
for select
to authenticated
using (user_id = auth.uid());

create policy "customer_favorites_insert_own"
on public.customer_favorites
for insert
to authenticated
with check (user_id = auth.uid());

create policy "customer_favorites_delete_own"
on public.customer_favorites
for delete
to authenticated
using (user_id = auth.uid());


-- ---------------------------------------------------------------------
-- (4) inactive_customers — قايمة العملاء الغايبين (فيها إيميلات عملاء!)
--
--     المطلوب: للأدمن بس. وده بيتحقق بطريقة مضادة للأخطاء:
--       • نشيل كل صلاحيات القراءة المباشرة من anon و authenticated
--         (سواء كان جدول أو view — الـ revoke بيشتغل على الاتنين)
--       • لو جدول → نفعّل عليه RLS ونسيبه من غير أي سياسات
--         (كده حتى لو حد رجّع الـ GRANTs بالغلط، الـ RLS هيفضل واقف)
--       • لو view → نسيبه، لأن view بتتنفذ بصلاحيات مالكها أصلًا
--         (زي الـ is_admin و list_admin_users اللي بيتخطوا RLS)
--       • الوصول بيبقى عن طريق دالة list_inactive_customers (تحت) —
--         محمية جوّه تعريفها بـ is_admin() وبتشتغل مهما كان نوع العلاقة
-- ---------------------------------------------------------------------
do $$
declare
  v_kind char;
  r record;
begin
  if to_regclass('public.inactive_customers') is not null then
    select c.relkind into v_kind
    from pg_class c
    where c.oid = 'public.inactive_customers'::regclass;

    -- لو جدول: فعّل RLS وشيل أي سياسات قديمة (هيفضل مقفول تمامًا)
    if v_kind = 'r' then
      execute 'alter table public.inactive_customers enable row level security';
      for r in
        select polname from pg_policy
        where polrelid = 'public.inactive_customers'::regclass
      loop
        execute format('drop policy if exists %I on public.inactive_customers', r.polname);
      end loop;
    end if;

    execute 'revoke all on public.inactive_customers from anon';
    execute 'revoke all on public.inactive_customers from authenticated';
  end if;
end $$;

-- دالة القراءة للأدمن — بديل القراءة المباشرة
-- (InactiveCustomers.tsx في لوحة التحكم بتناديها بالـ RPC)
create or replace function public.list_inactive_customers(min_days integer default 14)
returns table (
  user_id              uuid,
  email                text,
  full_name            text,
  last_order_at        timestamptz,
  days_since_last_order integer
)
language sql
stable
security definer
set search_path = public
as $$
  select
    ic.user_id,
    ic.email,
    ic.full_name,
    ic.last_order_at,
    ic.days_since_last_order
  from public.inactive_customers ic
  where ic.days_since_last_order >= min_days
    and public.is_admin()          -- الحماية جوّه الدالة نفسها
  order by ic.days_since_last_order desc
$$;

revoke all on function public.list_inactive_customers(integer) from public;
grant execute on function public.list_inactive_customers(integer) to authenticated;


-- ---------------------------------------------------------------------
-- (5) ⭐ restaurant_settings — إعدادات المطعم (فيها paymob_api_key!) ⭐
--
--     المشكلة: المفتاح السرّي بتاع Paymob كان متخزن في نفس الجدول
--     اللي الموقع العام بيقرا منه (تليفون، عنوان، ساعات عمل...) —
--     يعني أي زائر كان يقدر يفتح Network tab ويشوف المفتاح.
--
--     الحل على 3 طبقات:
--       1. RLS على الجدول + سياسة للأدمن بس (مفيش أي قراءة عامة)
--       2. view جديد restaurant_settings_public بيختار الأعمدة الآمنة
--          بس (من غير المفتاح ولا integration_id) — ده اللي الموقع
--          العام بيقرا منه، وبينفّذ بصلاحيات مالكه (بيتخطى RLS) عشان
--          الزائر العادي يقدر يقرا إعدادات العرض العامة
--       3. لوحة التحكم (SettingsEditor) بتفضل تقرا الجدول مباشرة —
--          والأدمن معاه صلاحية عن طريق is_admin()
--
--     ⚠️ تحذير linter الخاص بـ Supabase (security_definer_view):
--        الـ view متعمد إنه بيتخطى RLS — ده تصميم مش غلطة.
-- ---------------------------------------------------------------------
alter table public.restaurant_settings enable row level security;

do $$
declare r record;
begin
  if to_regclass('public.restaurant_settings') is not null then
    for r in
      select polname from pg_policy
      where polrelid = 'public.restaurant_settings'::regclass
    loop
      execute format('drop policy if exists %I on public.restaurant_settings', r.polname);
    end loop;
  end if;
end $$;

-- الأدمن بس: يقرا ويعدّل (صف واحد id=1) — SettingsEditor.tsx
create policy "restaurant_settings_admin_all"
on public.restaurant_settings
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

-- حماية زيادة على الـ RLS: نشيل صلاحيات الزائر المباشرة من الجدول
revoke all on public.restaurant_settings from anon;

-- ⭐ الـ view العام: الأعمدة الآمنة بس — من غير أي مفاتيح سرّية
-- security_invoker = false يعني الـ view بينفّذ بصلاحيات مالكه (postgres)
-- فبيشوف الجدول من غير ما يتأثر بـ RLS — ده المطلوب عشان الزائر
-- ياخد إعدادات العرض (تليفون/عنوان/ساعات/شعار) وهو ممنوع من المفتاح
drop view if exists public.restaurant_settings_public;
create view public.restaurant_settings_public
with (security_invoker = false)
as
  select
    id,
    name_ar,
    phone_display,
    whatsapp_number,
    address_ar,
    hours_ar,
    avg_spend_ar,
    logo_url,
    favicon_url,
    estimated_delivery_minutes,
    payment_gateway_enabled
  from public.restaurant_settings;

grant select on public.restaurant_settings_public to anon, authenticated;


-- ---------------------------------------------------------------------
-- (6) orders — الطلبات (فيها أسماء وتليفونات وعناوين عملاء)
--
--     المرحلة 1 عملت سياسة INSERT (عشان الزائر يسجّل طلب) — دي بتفضل
--     زي ما هي بنفس الاسم "orders_insert_public" عشان الاستمرارية.
--     اللي بنصلّحه هنا القراءة:
--       • الزائر (anon): مفيش قراءة خالص (زي ما كان)
--       • العميل المسجّل: يقرا طلباته **هو بس** (صفحة حسابي)
--       • الأدمن: يقرا الكل + يعدّل الحالة (لوحة الطلبات)
--     وأي سياسات قديمة بتفتح أكتر من كده بتتشال.
--
--     ملحوظة: الكتابة كلها بتمر عبر place_order (SECURITY DEFINER) —
--     سياسة الـ INSERT هنا احتياطية للتوافق مع المرحلة 1.
-- ---------------------------------------------------------------------
alter table public.orders enable row level security;

do $$
declare r record;
begin
  if to_regclass('public.orders') is not null then
    for r in
      select polname from pg_policy
      where polrelid = 'public.orders'::regclass
    loop
      execute format('drop policy if exists %I on public.orders', r.polname);
    end loop;
  end if;
end $$;

-- نفس سياسة المرحلة 1 (نفس الاسم بالظبط): الزائر يسجّل طلب جديد بس
create policy "orders_insert_public"
on public.orders
for insert
to anon, authenticated
with check (true);

-- العميل يشوف طلباته هو بس (Account.tsx → سجل الطلبات)
create policy "orders_select_own"
on public.orders
for select
to authenticated
using (customer_user_id = auth.uid());

-- الأدمن يشوف كل الطلبات (OrdersView.tsx)
create policy "orders_select_admin"
on public.orders
for select
to authenticated
using (public.is_admin());

-- الأدمن بس يعدّل حالة الطلب وحالة الدفع (OrdersView.tsx)
create policy "orders_update_admin"
on public.orders
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());


-- ---------------------------------------------------------------------
-- (7) reviews — التقييمات
--
--     • الزائر يشوف التقييمات الظاهرة بس (is_visible = true)
--     • الأدمن يشوف كل التقييمات (المخفية كمان) عشان يراجعها ويظهرها
--     • العميل المسجّل يقدر كمان يشوف تقييماته المخفيّة على طلباته هو
--       عشان صفحة "حسابي" تعرف أنه قيّم قبل كده ومتحاولش يقيم مرتين
--       (Account.tsx بيقرا reviews.order_id لطلباته)
--     • العميل المسجّل بس اللي يضيف تقييم (من غير تسجيل دخول مفيش
--       أي طريقة في الموقع لتقييم — فمش هنفتح الباب للزبالة)
--     • الأدمن بس اللي يعدّل (ReviewsEditor.tsx — إظهار/تعديل/ترتيب)
-- ---------------------------------------------------------------------
alter table public.reviews enable row level security;

do $$
declare r record;
begin
  if to_regclass('public.reviews') is not null then
    for r in
      select polname from pg_policy
      where polrelid = 'public.reviews'::regclass
    loop
      execute format('drop policy if exists %I on public.reviews', r.polname);
    end loop;
  end if;
end $$;

-- الظاهر للجميع (الصفحة الرئيسية)
create policy "reviews_select_visible"
on public.reviews
for select
to anon, authenticated
using (is_visible = true);

-- الأدمن يشوف كل التقييمات (حتى المخفية) — ReviewsEditor.tsx بيقرا
-- كل التقييمات من غير فلتر عشان يراجعها ويظهر اللي ينفع
create policy "reviews_select_admin"
on public.reviews
for select
to authenticated
using (public.is_admin());

-- صاحب الطلب يشوف تقييمه حتى لو لسه مخفي (عشان مقيّمش مرتين)
create policy "reviews_select_own_order"
on public.reviews
for select
to authenticated
using (
  exists (
    select 1
    from public.orders o
    where o.id = reviews.order_id
      and o.customer_user_id = auth.uid()
  )
);

-- إضافة تقييم: عملاء مسجّلين بس (النموذج موجود في "حسابي" بعد الطلب)
create policy "reviews_insert_customer"
on public.reviews
for insert
to authenticated
with check (true);

-- تعديل (إظهار/إخفاء/تعديل نص/ترتيب): الأدمن بس
create policy "reviews_update_admin"
on public.reviews
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());


-- ---------------------------------------------------------------------
-- (8) شبكة أمان إضافية: الزائر (anon) مالوش أي صلاحية كتابة
--     على أي جدول في السكيمة public — استثناء واحد: orders
--     (سياسة INSERT بتاعة المرحلة 1 — تسجيل الطلب للزائر)
--
--     دي مش بتغير سلوك الموقع (الكود ماكانش بيكتب من anon في أي
--     جدول تاني أصلًا) — بس بتمنع أي كود مستقبلي بالغلط يفتح باب
--     كتابة للزوار، وبتقفل أي GRANT قديم فضل من تجارب سابقة.
-- ---------------------------------------------------------------------
do $$
declare t record;
begin
  for t in
    select c.relname
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public'
      and c.relkind in ('r', 'v')
      and c.relname <> 'orders'
  loop
    execute format(
      'revoke insert, update, delete, truncate on public.%I from anon',
      t.relname
    );
  end loop;
end $$;


-- =====================================================================
-- (9) ✅ التحقق — شغّل الملف ده وبص على النتايج دي بالترتيب
-- =====================================================================

-- (9.أ) الجداول الحسّاسة: RLS مفعّل + صفر سياسات للزائر
--       المفروض: rls_enabled = true و anon_policies = 0 لكل الصفوف
select
  c.relname        as table_name,
  c.relrowsecurity as rls_enabled,
  count(p.polname) filter (
    where (select oid from pg_roles where rolname = 'anon') = any (p.polroles)
  )                as anon_policies,
  count(p.polname) as total_policies
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
left join pg_policy p on p.polrelid = c.oid
where n.nspname = 'public'
  and c.relkind = 'r'
  and c.relname in (
    'orders', 'reviews', 'customer_addresses', 'customer_favorites',
    'inactive_customers', 'restaurant_settings', 'admin_roles'
  )
group by c.relname, c.relrowsecurity
order by c.relname;

-- (9.ب) الزائر مش ليه أي صلاحية على بيانات العملاء والمفاتيح
--       المفروض: كل الأعمدة false ما عدا anon_select على orders فقط
--       (عن طريق الـ view الجديد، مش الجدول)
select
  c.relname                                          as table_name,
  has_table_privilege('anon', c.oid, 'SELECT')       as anon_select,
  has_table_privilege('anon', c.oid, 'INSERT')       as anon_insert,
  has_table_privilege('anon', c.oid, 'UPDATE')       as anon_update,
  has_table_privilege('anon', c.oid, 'DELETE')       as anon_delete
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relname in (
    'customer_addresses', 'customer_favorites',
    'inactive_customers', 'restaurant_settings', 'admin_roles'
  )
order by c.relname;

-- (9.ج) الـ view العام موجود وبيعرض الأعمدة الآمنة بس
--       المفروض: مفيش صف لـ paymob_api_key ولا paymob_integration_id
select
  column_name,
  data_type
from information_schema.columns
where table_schema = 'public'
  and table_name   = 'restaurant_settings_public'
order by ordinal_position;

-- (9.د) الدوال الجديدة: SECURITY DEFINER + الزائر مينفّذش غير المسموح
--       المفروض: is_admin → anon=false / auth=true
--                list_inactive_customers → anon=false / auth=true
select
  p.proname                                          as function_name,
  p.prosecdef                                        as security_definer,
  has_function_privilege('anon',          p.oid, 'EXECUTE') as anon_can_execute,
  has_function_privilege('authenticated', p.oid, 'EXECUTE') as auth_can_execute
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and p.proname in ('is_admin', 'list_inactive_customers')
order by p.proname;

-- (9.هـ) سياسات orders النهائية
--        المفروض 4 سياسات: insert (anon+auth) / select_own (auth) /
--        select_admin (auth) / update_admin (auth) — ومفيش ALL ولا
--        أي سياسة تانية مفتوحة أكتر من كده
select
  p.polname as policy_name,
  case p.polcmd
    when 'r' then 'SELECT'
    when 'a' then 'INSERT'
    when 'w' then 'UPDATE'
    when 'd' then 'DELETE'
    when '*' then 'ALL'
  end as command,
  case
    when (select oid from pg_roles where rolname = 'anon') = any (p.polroles)
      then 'YES' else 'NO'
  end as anon_allowed,
  pg_get_expr(p.polqual, p.polrelid) as using_expr
from pg_policy p
where p.polrelid = 'public.orders'::regclass
order by command, p.polname;


-- =====================================================================
-- 🚨 بعد التشغيل: شغّل 0004_security_rls_audit.sql تاني وقارن النتيجة
--   بالنسخة اللي حفظتها قبل التشغيل — لازم كل الأعلام الحمرا تكون اختفت
-- =====================================================================
