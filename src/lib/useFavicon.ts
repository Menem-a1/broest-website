// =====================================================
// ملف: useFavicon.ts
// الغرض: يحدّث أيقونة التبويب (favicon) في المتصفح
// تلقائيًا لما صاحب المطعم يرفع أيقونة جديدة من لوحة التحكم
// =====================================================
import { useEffect } from "react";

export function useFavicon(url: string | null) {
  useEffect(() => {
    if (!url) return;

    let link = document.querySelector<HTMLLinkElement>("link[rel~='icon']");
    if (!link) {
      link = document.createElement("link");
      link.rel = "icon";
      document.head.appendChild(link);
    }
    link.href = url;
  }, [url]);
}
