// =====================================================
// ملف: useSettings.ts
// الغرض: يجيب إعدادات المطعم (تليفون، واتساب، ساعات العمل)
// من قاعدة البيانات بدل الملف الثابت restaurant.ts
// =====================================================
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export type RestaurantSettings = {
  nameAr: string;
  phoneDisplay: string;
  phoneHref: string;
  whatsappNumber: string;
  addressAr: string;
  hoursAr: string;
  avgSpendAr: string;
};

const FALLBACK_SETTINGS: RestaurantSettings = {
  nameAr: "بروست",
  phoneDisplay: "0120 259 4444",
  phoneHref: "tel:01202594444",
  whatsappNumber: "201202594444",
  addressAr: "2 ميدان سيوف، تاني الرمل، الإسكندرية",
  hoursAr: "يوميًا من 10 صباحًا حتى 2 بعد منتصف الليل",
  avgSpendAr: "٢٠٠–٤٠٠ ج.م للفرد",
};

export function useSettings() {
  const [settings, setSettings] = useState<RestaurantSettings>(FALLBACK_SETTINGS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function fetchSettings() {
      const { data, error } = await supabase
        .from("restaurant_settings")
        .select("*")
        .eq("id", 1)
        .single();

      if (!isMounted) return;

      if (!error && data) {
        setSettings({
          nameAr: data.name_ar,
          phoneDisplay: data.phone_display,
          phoneHref: `tel:${data.phone_display.replace(/\s/g, "")}`,
          whatsappNumber: data.whatsapp_number,
          addressAr: data.address_ar,
          hoursAr: data.hours_ar,
          avgSpendAr: data.avg_spend_ar,
        });
      }
      // لو حصل خطأ، بنفضل مستخدمين FALLBACK_SETTINGS عشان الموقع يفضل شغال
      setLoading(false);
    }

    fetchSettings();
    return () => {
      isMounted = false;
    };
  }, []);

  return { settings, loading };
}

export function buildWhatsAppLink(whatsappNumber: string, message: string) {
  const encoded = encodeURIComponent(message);
  return `https://wa.me/${whatsappNumber}?text=${encoded}`;
}
