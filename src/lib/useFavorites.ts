// =====================================================
// ملف: useFavorites.ts
// الغرض: إضافة/إزالة/عرض الأصناف المفضلة للعميل المسجل دخول
// =====================================================
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export function useFavorites(userId: string | undefined) {
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  async function fetchFavorites() {
    if (!userId) {
      setFavoriteIds(new Set());
      setLoading(false);
      return;
    }
    const { data, error } = await supabase
      .from("customer_favorites")
      .select("item_id")
      .eq("user_id", userId);

    if (!error && data) {
      setFavoriteIds(new Set(data.map((f) => f.item_id)));
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchFavorites();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  async function toggleFavorite(itemId: string) {
    if (!userId) return;
    const isFav = favoriteIds.has(itemId);
    if (isFav) {
      await supabase
        .from("customer_favorites")
        .delete()
        .eq("user_id", userId)
        .eq("item_id", itemId);
      setFavoriteIds((prev) => {
        const next = new Set(prev);
        next.delete(itemId);
        return next;
      });
    } else {
      await supabase.from("customer_favorites").insert({ user_id: userId, item_id: itemId });
      setFavoriteIds((prev) => new Set(prev).add(itemId));
    }
  }

  return { favoriteIds, loading, toggleFavorite };
}
