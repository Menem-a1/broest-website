// =====================================================
// ملف: useReviews.ts
// الغرض: يجيب المراجعات الظاهرة بس من قاعدة البيانات
// بدل ما تكون مكتوبة جوه الكود
// =====================================================
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export type Review = {
  id: string;
  customerName: string;
  stars: number;
  reviewText: string;
};

export function useReviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function fetchReviews() {
      const { data, error } = await supabase
        .from("reviews")
        .select("id, customer_name, stars, review_text")
        .eq("is_visible", true)
        .order("sort_order");

      if (!isMounted) return;

      if (!error && data) {
        setReviews(
          data.map((r) => ({
            id: r.id,
            customerName: r.customer_name,
            stars: r.stars,
            reviewText: r.review_text,
          }))
        );
      }
      setLoading(false);
    }

    fetchReviews();
    return () => {
      isMounted = false;
    };
  }, []);

  return { reviews, loading };
}
