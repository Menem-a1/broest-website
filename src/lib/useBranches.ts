// =====================================================
// ملف: useBranches.ts
// الغرض: يجيب كل فروع المطعم من قاعدة البيانات، ويحسب
// هل كل فرع مفتوح دلوقتي ولا مقفول بناءً على مواعيده
// =====================================================
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export type Branch = {
  id: string;
  nameAr: string;
  addressAr: string;
  phoneDisplay: string;
  whatsappNumber: string;
  latitude: number | null;
  longitude: number | null;
  googleMapsUrl: string;
  opensAt: string; // "10:00"
  closesAt: string; // "02:00"
  isActive: boolean;
};

// بتحسب هل الوقت الحالي بين وقت الفتح والقفل
// بتتعامل مع الحالة اللي المطعم بيقفل بعد نص الليل (زي يقفل 02:00 يعني الساعة 2 بليل)
export function isBranchOpenNow(opensAt: string, closesAt: string): boolean {
  const now = new Date();
  const [openH, openM] = opensAt.split(":").map(Number);
  const [closeH, closeM] = closesAt.split(":").map(Number);

  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const openMinutes = openH * 60 + openM;
  const closeMinutes = closeH * 60 + closeM;

  if (closeMinutes > openMinutes) {
    // حالة عادية: بيفتح ويقفل في نفس اليوم (مثلاً 10:00 لحد 22:00)
    return nowMinutes >= openMinutes && nowMinutes < closeMinutes;
  } else {
    // حالة القفل بعد نص الليل (مثلاً بيفتح 10:00 ويقفل 02:00 اليوم اللي بعده)
    return nowMinutes >= openMinutes || nowMinutes < closeMinutes;
  }
}

// بتنسق مواعيد الفرع في جملة عربية سهلة القراءة
export function formatHoursAr(opensAt: string, closesAt: string): string {
  function to12Hour(time: string): string {
    const [h, m] = time.split(":").map(Number);
    const period = h >= 12 ? "م" : "ص";
    const hour12 = h % 12 === 0 ? 12 : h % 12;
    return m === 0 ? `${hour12} ${period}` : `${hour12}:${String(m).padStart(2, "0")} ${period}`;
  }
  return `يوميًا من ${to12Hour(opensAt)} حتى ${to12Hour(closesAt)}`;
}

export function useBranches() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function fetchBranches() {
      const { data, error } = await supabase
        .from("branches")
        .select("*")
        .eq("is_active", true)
        .order("sort_order");

      if (!isMounted) return;

      if (!error && data) {
        setBranches(
          data.map((b) => ({
            id: b.id,
            nameAr: b.name_ar,
            addressAr: b.address_ar,
            phoneDisplay: b.phone_display,
            whatsappNumber: b.whatsapp_number,
            latitude: b.latitude,
            longitude: b.longitude,
            googleMapsUrl: b.google_maps_url || "",
            opensAt: b.opens_at,
            closesAt: b.closes_at,
            isActive: b.is_active,
          }))
        );
      }
      setLoading(false);
    }

    fetchBranches();
    return () => {
      isMounted = false;
    };
  }, []);

  return { branches, loading };
}
