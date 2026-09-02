// =====================================================
// ملف: useOffers.ts
// الغرض: يجيب العروض (الباقات) الظاهرة، وهل صفحة العروض
// مفعّلة أصلاً. كل عرض عبارة عن: أصناف مدفوعة + أصناف مجانية
// + سعر إجمالي واحد للباقة كلها
// =====================================================
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export type OfferItemRef = {
  itemId: string;
  nameAr: string;
  quantity: number;
};

export type Offer = {
  id: string;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  imageUrl: string | null;
  bundlePrice: number;
  paidItems: OfferItemRef[];
  freeItems: OfferItemRef[];
};

export function useOffers() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [pageEnabled, setPageEnabled] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function fetchData() {
      const [offersRes, settingsRes, menuRes] = await Promise.all([
        supabase.from("offers").select("*").eq("is_visible", true).order("sort_order"),
        supabase.from("offers_page_settings").select("is_page_enabled").eq("id", 1).single(),
        supabase.from("menu_items").select("id, name_ar"),
      ]);

      if (!isMounted) return;

      const nameById = new Map((menuRes.data || []).map((m) => [m.id, m.name_ar]));

      if (offersRes.data && offersRes.data.length > 0) {
        const offerIds = offersRes.data.map((o) => o.id);
        const [paidRes, freeRes] = await Promise.all([
          supabase.from("offer_paid_items").select("*").in("offer_id", offerIds),
          supabase.from("offer_free_items").select("*").in("offer_id", offerIds),
        ]);

        if (!isMounted) return;

        setOffers(
          offersRes.data.map((o) => ({
            id: o.id,
            titleAr: o.title_ar,
            titleEn: o.title_en || "",
            descriptionAr: o.description_ar || "",
            imageUrl: o.image_url || null,
            bundlePrice: Number(o.bundle_price),
            paidItems: (paidRes.data || [])
              .filter((p) => p.offer_id === o.id)
              .map((p) => ({
                itemId: p.item_id,
                nameAr: nameById.get(p.item_id) || "صنف محذوف",
                quantity: p.quantity,
              })),
            freeItems: (freeRes.data || [])
              .filter((f) => f.offer_id === o.id)
              .map((f) => ({
                itemId: f.item_id,
                nameAr: nameById.get(f.item_id) || "صنف محذوف",
                quantity: f.quantity,
              })),
          }))
        );
      } else {
        setOffers([]);
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
