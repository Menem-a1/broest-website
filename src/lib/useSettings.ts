// =====================================================
// ملف: useSettings.ts
// الغرض: يجيب إعدادات المطعم (تليفون، واتساب، ساعات العمل)
// من قاعدة البيانات بدل الملف الثابت restaurant.ts
//
// ⚠️ بتقرا من restaurant_settings_public (view عام) مش من
// الجدول مباشرة — الجدول فيه paymob_api_key (مفتاح سرّي)
// وبقى للأدمن بس. الـ view فيه أعمدة العرض العامة بس.
// (supabase/migrations/0005_security_rls_hardening.sql)
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
  logoUrl: string | null;
  faviconUrl: string | null;
  estimatedDeliveryMinutes: number;
};

const FALLBACK_SETTINGS: RestaurantSettings = {
  nameAr: "بروست",
  phoneDisplay: "0120 259 4444",
  phoneHref: "tel:01202594444",
  whatsappNumber: "201202594444",
  addressAr: "2 ميدان سيوف، تاني الرمل، الإسكندرية",
  hoursAr: "يوميًا من 10 صباحًا حتى 2 بعد منتصف الليل",
  avgSpendAr: "٢٠٠–٤٠٠ ج.م للفرد",
  logoUrl: null,
  faviconUrl: null,
  estimatedDeliveryMinutes: 40,
};

export function useSettings() {
  const [settings, setSettings] = useState<RestaurantSettings>(FALLBACK_SETTINGS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function fetchSettings() {
      // من الـ view العام — الجدول نفسه بقى للأدمن بس عشان المفتاح السرّي
      const { data, error } = await supabase
        .from("restaurant_settings_public")
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
          logoUrl: data.logo_url || null,
          faviconUrl: data.favicon_url || null,
          estimatedDeliveryMinutes: data.estimated_delivery_minutes ?? 40,
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
