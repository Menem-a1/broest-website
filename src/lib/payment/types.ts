// =====================================================
// ملف: types.ts
// الغرض: الأنواع المشتركة لكل ملفات نظام الدفع
// =====================================================

export type PaymentMethod = "cash" | "card";
export type PaymentStatus = "pending" | "paid" | "failed";

// إعدادات الدفع اللي الموقع العام بيشوفها:
// حالة التفعيل بس — مفتاح Paymob السرّي مش بيتحمّل في المتصفح خالص
// (بيتعدّل من لوحة التحكم على الجدول المحمي restaurant_settings)
export type PaymentSettings = {
  gatewayEnabled: boolean;
};

export function paymentMethodLabel(method: PaymentMethod): string {
  return method === "cash" ? "كاش عند الاستلام" : "دفع إلكتروني";
}

export function paymentStatusLabel(status: PaymentStatus): string {
  switch (status) {
    case "paid":
      return "تم الدفع";
    case "failed":
      return "فشلت المحاولة";
    default:
      return "لسه مدفوعش";
  }
}
