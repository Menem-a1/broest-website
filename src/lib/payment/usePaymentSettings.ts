// =====================================================
// ملف: usePaymentSettings.ts
// الغرض: يجيب إعدادات بوابة الدفع من قاعدة البيانات —
// يستخدمه الموقع العام عشان يقرر يعرض خيار "دفع إلكتروني"
// ولا لأ، ولوحة التحكم عشان تفعّل/تعطّل البوابة
// =====================================================
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { PaymentSettings } from "./types";

const FALLBACK: PaymentSettings = {
  gatewayEnabled: false,
  paymobApiKey: "",
  paymobIntegrationId: "",
};

export function usePaymentSettings() {
  const [settings, setSettings] = useState<PaymentSettings>(FALLBACK);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function fetchSettings() {
      // الخطوة 1: نجيب حالة التفعيل (مفتوح/مقفول) — العميل العادي
      // مسموحله يقرا العمود ده لأنه مش سري (مجرد true/false)
      const { data: general, error: generalError } = await supabase
        .from("restaurant_settings")
        .select("payment_gateway_enabled")
        .eq("id", 1)
        .single();

      if (!isMounted) return;

      if (generalError || !general) {
        // لو حصل أي مشكلة هنا، نسيب الزرار مقفول (الحالة الآمنة الافتراضية)
        console.error("فشل تحميل حالة الدفع الإلكتروني:", generalError);
        setLoading(false);
        return;
      }

      // الخطوة 2: نجيب بيانات Paymob (المفتاح ورقم الـ Integration).
      // العميل العادي مش هيقدر يقراها (محمية بالتصميم)، وده متوقع
      // وسليم — الفرونت إند مش محتاج المفتاح نفسه أصلاً عشان يعرض
      // الزرار، محتاجه بس لوحة تحكم الأدمن.
      const { data: secrets } = await supabase
        .from("payment_secrets")
        .select("paymob_secret_key, paymob_integration_id")
        .eq("id", 1)
        .maybeSingle();

      if (!isMounted) return;

      setSettings({
        gatewayEnabled: general.payment_gateway_enabled,
        paymobApiKey: secrets?.paymob_secret_key || "",
        paymobIntegrationId: secrets?.paymob_integration_id || "",
      });
      setLoading(false);
    }

    fetchSettings();
    return () => {
      isMounted = false;
    };
  }, []);

  return { settings, loading };
}
