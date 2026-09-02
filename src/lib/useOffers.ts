// =====================================================
// ملف: useOffers.ts
// الغرض: يجيب العروض الظاهرة من قاعدة البيانات، وهل صفحة
// العروض مفعّلة أصلاً على الموقع ولا لأ
// =====================================================
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export type Offer = {
  id: string;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  imageUrl: string | null;
  discountType: "percentage" | "fixed_amount";
  discountValue: number;
  couponCode: string | null;
};

export function useOffers() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [pageEnabled, setPageEnabled] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function fetchData() {
      const [offersRes, settingsRes] = await Promise.all([
        supabase
          .from("offers")
          .select("*")
          .eq("is_visible", true)
          .order("sort_order"),
        supabase.from("offers_page_settings").select("is_page_enabled").eq("id", 1).single(),
      ]);

      if (!isMounted) return;

      if (offersRes.data) {
        setOffers(
          offersRes.data.map((o) => ({
            id: o.id,
            titleAr: o.title_ar,
            titleEn: o.title_en || "",
            descriptionAr: o.description_ar || "",
            imageUrl: o.image_url || null,
            discountType: o.discount_type,
            discountValue: Number(o.discount_value),
            couponCode: o.coupon_code || null,
          }))
        );
      }
      setPageEnabled(settingsRes.data?.is_page_enabled ?? false);
      setLoading(false);
    }

    fetchData();
    return () => {
      isMounted = false;
    };
  }, []);

  return { offers, pageEnabled, loading };
}
