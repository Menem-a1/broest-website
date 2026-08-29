// =====================================================
// ملف: useTabTitleAlert.ts
// الغرض: يغيّر عنوان تبويب المتصفح لما يكون فيه طلبات
// جديدة، عشان صاحب المطعم ينتبه حتى لو التبويب مش مفتوح
// قدامه (شغال على تبويب تاني)
// =====================================================
import { useEffect } from "react";

const ORIGINAL_TITLE = "بروست | Broest";

export function useTabTitleAlert(newOrdersCount: number) {
  useEffect(() => {
    if (newOrdersCount > 0) {
      document.title = `(${newOrdersCount}) طلب جديد! — ${ORIGINAL_TITLE}`;
    } else {
      document.title = ORIGINAL_TITLE;
    }

    // نرجّع العنوان الأصلي لو المستخدم خرج من لوحة التحكم
    return () => {
      document.title = ORIGINAL_TITLE;
    };
  }, [newOrdersCount]);
}
