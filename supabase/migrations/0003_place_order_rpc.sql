-- =====================================================================
-- ملف: 0003_place_order_rpc.sql
-- الغرض: دالة في قاعدة البيانات تسجّل الطلب وترجّع رقمه،
--         من غير ما ندي الزوار أي صلاحية قراءة على جدول orders.
--
-- ⚠️ الملف ده لازم يتشغّل بعد 0002_orders_allow_guest_insert.sql
--
-- ليه الدالة ضرورية مش اختيارية:
--   الكود في src/lib/useOrders.ts بيعمل
--       .insert({...}).select("id, display_number").single()
--   و PostgREST بيترجمها لـ INSERT ... RETURNING.
--   و PostgreSQL بيطبّق سياسات الـ SELECT كمان على RETURNING،
--   فلو مفيش سياسة SELECT للزائر → نفس خطأ 42501 تاني.
--   والحل إننا مديناش الزوار صلاحية قراءة (صح، عشان بيانات العملاء)
--   → فبننقل الإدخال لدالة SECURITY DEFINER بتعدّي RLS من جوّه.
-- =====================================================================


-- ---------------------------------------------------------------------
-- (1) دالة مساعدة: تحوّل نص لـ uuid أو null من غير ما ترمي خطأ
--
--     ليه محتاجينها؟ لأن الكود بيبعت itemId مش uuid حقيقي في حالتين:
--       • العروض:  "offer-<offerId>-<itemId>"   (Offers.tsx:27)
--       • إعادة الطلب: اسم الصنف بالعربي        (Account.tsx:218)
--     فأي cast مباشر لـ uuid هيرمي خطأ ويوقّع الطلب.
--     الـ CASE مضمون إنه يقيّم الشرط قبل التحويل في PostgreSQL.
-- ---------------------------------------------------------------------
create or replace function public.to_uuid_or_null(t text)
returns uuid
language sql
immutable
as $$
  select case
    when t ~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$'
      then t::uuid
  end
$$;


-- ---------------------------------------------------------------------
-- (2) الدالة الأساسية
--
--     SECURITY DEFINER  → بتتنفّذ بصلاحيات صاحبها (postgres)،
--                         وصاحب الجدول بيتعدّى RLS.
--     SET search_path   → حماية من اختطاف الـ search_path
--                         (Supabase بيحذّر من غيره).
-- ---------------------------------------------------------------------
create or replace function public.place_order(payload jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id  uuid;
  v_num integer;
begin
  insert into public.orders (
    items,
    total_price,
    order_channel,
    status,
    customer_name,
    customer_phone,
    customer_phone_2,
    customer_address,
    fulfillment_type,
    delivery_zone_id,
    delivery_price,
    pickup_branch_id,
    payment_method,
    payment_status,
    customer_user_id
  ) values (
    payload->'items',
    (payload->>'total_price')::numeric,
    'website',
    'new',
    payload->>'customer_name',
    payload->>'customer_phone',
    coalesce(payload->>'customer_phone_2', ''),
    coalesce(payload->>'customer_address', ''),
    coalesce(payload->>'fulfillment_type', 'delivery'),
    public.to_uuid_or_null(payload->>'delivery_zone_id'),
    coalesce((payload->>'delivery_price')::numeric, 0),
    public.to_uuid_or_null(payload->>'pickup_branch_id'),
    coalesce(payload->>'payment_method', 'cash'),
    'pending',
    auth.uid()                       -- العميل المسجّل بيتسجّل، والزائر null
  )
  returning id, display_number into v_id, v_num;

  return jsonb_build_object('id', v_id, 'display_number', v_num);
end;
$$;


-- ---------------------------------------------------------------------
-- (3) الصلاحيات: الزوار ينفّذوا الدالة بس — مفيش أي وصول مباشر للجدول
-- ---------------------------------------------------------------------
revoke all on function public.place_order(jsonb) from public;
grant execute on function public.place_order(jsonb) to anon, authenticated;
revoke all on function public.to_uuid_or_null(text) from public;
grant execute on function public.to_uuid_or_null(text) to anon, authenticated;


-- ---------------------------------------------------------------------
-- (4) التحقق
--     الاستعلام ده لازم يوريك صفين: place_order و to_uuid_or_null
-- ---------------------------------------------------------------------
select
  p.proname                                            as function_name,
  pg_get_function_identity_arguments(p.oid)            as args,
  p.prosecdef                                          as security_definer,
  has_function_privilege('anon', p.oid, 'EXECUTE')     as anon_can_execute,
  has_function_privilege('authenticated', p.oid, 'EXECUTE')
                                                       as auth_can_execute
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and p.proname in ('place_order', 'to_uuid_or_null')
order by p.proname;
