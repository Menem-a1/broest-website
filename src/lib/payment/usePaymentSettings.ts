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
      const { data, error } = await supabase
        .from("restaurant_settings")
        .select("payment_gateway_enabled, paymob_api_key, paymob_integration_id")
        .eq("id", 1)
        .single();

      if (!isMounted) return;

      if (!error && data) {
        setSettings({
          gatewayEnabled: data.payment_gateway_enabled,
          paymobApiKey: data.paymob_api_key || "",
          paymobIntegrationId: data.paymob_integration_id || "",
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
