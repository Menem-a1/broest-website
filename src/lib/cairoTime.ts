// =====================================================
// ملف: cairoTime.ts
// الغرض: حسابات الوقت بتوقيت القاهرة بدل توقيت جهاز العميل.
// مهم جدًا عشان مواعيد الفتح/القفل وتقارير الطلبات تبقى صح
// مهما كان العميل أو المطور فاتح الموقع من أي بلد في العالم.
// =====================================================

// التوقيت الثابت بتاع المطعم (القاهرة) — كل الدوال هنا بترجع النتيجة بتوقيته
export const CAIRO_TZ = "Africa/Cairo";

// بترجع عدد الدقايق اللي عدّت من بداية اليوم الحالي بتوقيت القاهرة
// (يعني الساعة 10:00 بتطلع 600، والساعة 00:05 بتطلع 5)
export function cairoMinutesOfDay(date: Date = new Date()): number {
  // بنستخدم en-GB مع hourCycle:"h23" عشان نضمن إن الساعة بتتكتب بنظام 24 ساعة.
  // ⚠️ من غير hourCycle:"h23" نص الليل بيرجع "24" في بعض المتصفحات بدل "00".
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: CAIRO_TZ,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);

  let hour = 0;
  let minute = 0;
  for (const part of parts) {
    if (part.type === "hour") hour = Number(part.value);
    if (part.type === "minute") minute = Number(part.value);
  }

  // حماية إضافية: لو البارت رجّع "24" لأي سبب، بنحوله لصفر ونضمن
  // إن النتيجة دايمًا في المدى 0..1439
  return ((hour % 24) * 60 + minute) % 1440;
}

// بترجع تاريخ اليوم الحالي بتوقيت القاهرة بصيغة YYYY-MM-DD
// (نفس صيغة قيمة <input type="date"> بالظبط)
export function cairoDateKey(date: Date = new Date()): string {
  // تنسيق en-CA بيرجع التاريخ أصلاً بصيغة YYYY-MM-DD
  return new Intl.DateTimeFormat("en-CA", { timeZone: CAIRO_TZ }).format(date);
}
