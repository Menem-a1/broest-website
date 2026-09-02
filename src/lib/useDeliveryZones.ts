// =====================================================
// ملف: useDeliveryZones.ts
// الغرض: يجيب كل مناطق التوصيل النشطة من قاعدة البيانات
// (اسم المنطقة، سعر التوصيل، الحد الأدنى للطلب)
// =====================================================
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export type DeliveryZone = {
  id: string;
  nameAr: string;
  nameEn: string;
  deliveryPrice: number;
  minOrderAmount: number;
  isActive: boolean;
};

export function useDeliveryZones() {
  const [zones, setZones] = useState<DeliveryZone[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchZones() {
    const { data, error } = await supabase
      .from("delivery_zones")
      .select("*")
      .eq("is_active", true)
      .order("sort_order");

    if (!error && data) {
      setZones(
        data.map((z) => ({
          id: z.id,
          nameAr: z.name_ar,
          nameEn: z.name_en || "",
          deliveryPrice: Number(z.delivery_price),
          minOrderAmount: Number(z.min_order_amount),
          isActive: z.is_active,
        }))
      );
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchZones();
  }, []);

  return { zones, loading, refetch: fetchZones };
}
