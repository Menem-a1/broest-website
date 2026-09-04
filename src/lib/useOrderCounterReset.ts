import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export function useOrderCounterReset(branchOpensAt: string | undefined) {
  const [autoResetEnabled, setAutoResetEnabled] = useState(true);
  const [loading, setLoading] = useState(true);

  async function checkAndAutoReset() {
    const { data } = await supabase
      .from("order_counter_settings")
      .select("*")
      .eq("id", 1)
      .single();
    if (!data) {
      setLoading(false);
      return;
    }
    setAutoResetEnabled(data.auto_reset_enabled);

    if (!data.auto_reset_enabled || !branchOpensAt) {
      setLoading(false);
      return;
    }

    // بتاريخ القاهرة نفسه (مش UTC)، عشان "النهاردة" تتحسب صح بغض
    // النظر عن توقيت السيرفر أو جهاز العميل
    const today = new Date().toLocaleDateString("en-CA", { timeZone: "Africa/Cairo" });
    const alreadyResetToday = data.last_reset_date === today;
    if (alreadyResetToday) {
      setLoading(false);
      return;
    }

    // بنقارن الوقت الحالي بوقت فتح الفرع، لو عدّينا وقت الفتح ولسه
    // معملناش تصفير النهاردة، نصفّر تلقائي.
    // بنستخدم توقيت القاهرة تحديدًا (مش توقيت جهاز العميل/المتصفح)،
    // عشان لو حد فتح لوحة التحكم من بلد تانية أو جهاز بتوقيت مختلف،
    // العداد ميتصفرش غلط في وقت خاطئ
    const [openHour, openMinute] = branchOpensAt.split(":").map(Number);
    const cairoNowStr = new Date().toLocaleString("en-US", { timeZone: "Africa/Cairo" });
    const cairoNow = new Date(cairoNowStr);
    const opensToday = new Date(cairoNow);
    opensToday.setHours(openHour, openMinute, 0, 0);

    if (cairoNow >= opensToday) {
      await supabase.rpc("reset_order_counter");
    }
    setLoading(false);
  }

  useEffect(() => {
    checkAndAutoReset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [branchOpensAt]);

  async function manualReset() {
    await supabase.rpc("reset_order_counter");
  }

  async function toggleAutoReset(enabled: boolean) {
    await supabase.from("order_counter_settings").update({ auto_reset_enabled: enabled }).eq("id", 1);
    setAutoResetEnabled(enabled);
  }

  return { autoResetEnabled, loading, manualReset, toggleAutoReset };
}
