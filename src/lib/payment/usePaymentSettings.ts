// =====================================================
// ملف: usePaymentSettings.ts
// الغرض: يجيب حالة بوابة الدفع (مفعّلة ولا لأ) —
// يستخدمه الموقع العام عشان يقرر يعرض خيار "دفع إلكتروني"
// في السلة ولا لأ
//
// ⚠️ الأمان (المرحلة 3): الموقع العام بيقرا **حالة التفعيل بس**
// من restaurant_settings_public (view عام من غير مفاتيح سرّية).
// مفتاح Paymob (paymob_api_key) بقى للأدمن بس في جدول
// restaurant_settings — قبل كده كان بيتحمّل في متصفح أي زائر
// ويظهر في Network tab! (supabase/migrations/0005_security_rls_hardening.sql)
//
// لو حدستقبل هنحتاج نستخدم المفتاح فعليًا في الدفع، لازم يكون
// في عملية سيرفر (Edge Function) مش في المتصفح.
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
      // الـ view العام فيه payment_gateway_enabled بس من غير أي مفاتيح
      const { data, error } = await supabase
        .from("restaurant_settings_public")
        .select("payment_gateway_enabled")
        .eq("id", 1)
        .single();

      if (!isMounted) return;

      if (!error && data) {
        setSettings({
          gatewayEnabled: data.payment_gateway_enabled,
        });
      }
      setLoading(false);
    }

    fetchSettings();
    return () => {
      isMounted = false;
    };
  }, []);

  return { settings, loading };
}
