// =====================================================
// ملف: useHomeContent.ts
// الغرض: يجيب كل نصوص الصفحة الرئيسية وصورة الـ Hero
// من قاعدة البيانات بدل ما تكون مكتوبة جوه الكود
// =====================================================
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export type HomeContent = {
  heroBadgeText: string;
  heroTitleLine1: string;
  heroTitleLine2: string;
  heroDescription: string;
  heroImageUrl: string | null;
  whyUsTitle1: string;
  whyUsDesc1: string;
  whyUsTitle2: string;
  whyUsDesc2: string;
  whyUsTitle3: string;
  whyUsDesc3: string;
};

const FALLBACK: HomeContent = {
  heroBadgeText: "أول تندوري بروست في الإسكندرية",
  heroTitleLine1: "دجاج مقرمش",
  heroTitleLine2: "من غير كلام كتير",
  heroDescription: "وجبات عائلية، ساندوتشات بروست، وكريسبي طازة كل يوم.",
  heroImageUrl: null,
  whyUsTitle1: "طازة كل يوم",
  whyUsDesc1: "بنقلي الدجاج طازة من غير أي تخزين.",
  whyUsTitle2: "توصيل سريع",
  whyUsDesc2: "أوردر بيوصلك في أسرع وقت، حار وطازة.",
  whyUsTitle3: "وصفة تندوري مميزة",
  whyUsDesc3: "توابل مخصوصة بنسبة سرية.",
};

export function useHomeContent() {
  const [content, setContent] = useState<HomeContent>(FALLBACK);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function fetchContent() {
      const { data, error } = await supabase
        .from("home_content")
        .select("*")
        .eq("id", 1)
        .single();

      if (!isMounted) return;

      if (!error && data) {
        setContent({
          heroBadgeText: data.hero_badge_text,
          heroTitleLine1: data.hero_title_line1,
          heroTitleLine2: data.hero_title_line2,
          heroDescription: data.hero_description,
          heroImageUrl: data.hero_image_url,
          whyUsTitle1: data.why_us_title_1,
          whyUsDesc1: data.why_us_desc_1,
          whyUsTitle2: data.why_us_title_2,
          whyUsDesc2: data.why_us_desc_2,
          whyUsTitle3: data.why_us_title_3,
          whyUsDesc3: data.why_us_desc_3,
        });
      }
      setLoading(false);
    }

    fetchContent();
    return () => {
      isMounted = false;
    };
  }, []);

  return { content, loading };
}
