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

      // الموقع العام محتاج بس يعرف هل الدفع الإلكتروني مفعّل ولا لأ،
      // عشان يقرر يعرض خيار الفيزا في السلة. مش محتاج ولا لازم يوصل
      // لأي مفتاح أو سر بتاع Paymob خالص — دي بيانات سيرفر بس،
      // بيستخدمها create-paymob-payment و paymob-webhook مباشرة.
      setSettings({
        gatewayEnabled: general.payment_gateway_enabled,
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
