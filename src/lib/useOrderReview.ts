// =====================================================
// ملف: useOrderReview.ts
// الغرض: يسمح للعميل يضيف تقييم (نجوم + تعليق) لطلب اتسلّم،
// والتقييم ده بيتغذّى في نظام المراجعات العام على الموقع
// =====================================================
import { supabase } from "@/lib/supabase";

export async function submitOrderReview(
  orderId: string,
  customerName: string,
  stars: number,
  reviewText: string
) {
  const { error } = await supabase.from("reviews").insert({
    order_id: orderId,
    customer_name: customerName,
    stars,
    review_text: reviewText,
    // التقييم بييجي مخفي لحد ما المطور يراجعه ويظهره من لوحة التحكم،
    // عشان نتجنب ظهور تقييمات غير مناسبة على الموقع مباشرة
    is_visible: false,
  });
  return { success: !error, error: error?.message };
}
