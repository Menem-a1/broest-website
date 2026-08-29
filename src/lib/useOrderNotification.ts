// =====================================================
// ملف: useOrderNotification.ts
// الغرض: يشغّل صوت تنبيه واضح لما طلب جديد ييجي، وهو
// لوحة التحكم مفتوحة، عشان محدش يفوّت طلب حتى لو الطابعة
// مش موصلة أو مش شغالة
// =====================================================
import { useEffect, useRef } from "react";

// بيولّد صوت "بيب" بسيط باستخدام Web Audio API المدمجة في المتصفح
// (من غير ما نحتاج نرفع ملف صوت خارجي)
function playBeep() {
  try {
    const AudioContextClass =
      window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AudioContextClass();

    // بنعمل نغمتين متتاليتين عشان الصوت يبقى واضح ومميز (مش بيب عادي)
    [880, 1108].forEach((freq, i) => {
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();
      oscillator.connect(gain);
      gain.connect(ctx.destination);
      oscillator.frequency.value = freq;
      oscillator.type = "sine";
      gain.gain.setValueAtTime(0.001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.3, ctx.currentTime + i * 0.15 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.15 + 0.25);
      oscillator.start(ctx.currentTime + i * 0.15);
      oscillator.stop(ctx.currentTime + i * 0.15 + 0.3);
    });
  } catch {
    // لو المتصفح مش مدعوم أو المستخدم قفل الصوت، مش هنعمل حاجة
    // التنبيه البصري (العدد على الجرس) هيفضل شغال برضه
  }
}

// بيتابع عدد الطلبات الجديدة، ولو زاد عن آخر مرة شافها، يشغّل صوت
export function useOrderNotification(newOrdersCount: number) {
  const previousCount = useRef<number | null>(null);

  useEffect(() => {
    if (previousCount.current !== null && newOrdersCount > previousCount.current) {
      playBeep();
    }
    previousCount.current = newOrdersCount;
  }, [newOrdersCount]);
}
