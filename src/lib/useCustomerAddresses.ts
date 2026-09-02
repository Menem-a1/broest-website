// =====================================================
// ملف: useCustomerAddresses.ts
// الغرض: حفظ/جلب/حذف عناوين العميل المتكررة (البيت، الشغل)
// خاص بالعميل المسجل دخول بجوجل بس
// =====================================================
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export type CustomerAddress = {
  id: string;
  label: string;
  deliveryZoneId: string | null;
  addressDetail: string;
  isDefault: boolean;
};

export function useCustomerAddresses(userId: string | undefined) {
  const [addresses, setAddresses] = useState<CustomerAddress[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchAddresses() {
    if (!userId) {
      setAddresses([]);
      setLoading(false);
      return;
    }
    const { data, error } = await supabase
      .from("customer_addresses")
      .select("*")
      .eq("user_id", userId)
      .order("is_default", { ascending: false });

    if (!error && data) {
      setAddresses(
        data.map((a) => ({
          id: a.id,
          label: a.label,
          deliveryZoneId: a.delivery_zone_id,
          addressDetail: a.address_detail,
          isDefault: a.is_default,
        }))
      );
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchAddresses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  async function addAddress(input: {
    label: string;
    deliveryZoneId: string | null;
    addressDetail: string;
  }) {
    if (!userId) return { success: false };
    const { error } = await supabase.from("customer_addresses").insert({
      user_id: userId,
      label: input.label,
      delivery_zone_id: input.deliveryZoneId,
      address_detail: input.addressDetail,
    });
    if (!error) await fetchAddresses();
    return { success: !error };
  }

  async function deleteAddress(id: string) {
    const { error } = await supabase.from("customer_addresses").delete().eq("id", id);
    if (!error) setAddresses((prev) => prev.filter((a) => a.id !== id));
    return { success: !error };
  }

  return { addresses, loading, addAddress, deleteAddress, refetch: fetchAddresses };
}
