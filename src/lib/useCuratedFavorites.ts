import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { MenuItem } from "@/lib/useMenu";

export function useCuratedFavorites(menu: MenuItem[]) {
  const [itemIds, setItemIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("curated_favorites")
      .select("item_id")
      .order("sort_order")
      .then(({ data }) => {
        setItemIds((data || []).map((r) => r.item_id));
        setLoading(false);
      });
  }, []);

  const items = itemIds
    .map((id) => menu.find((m) => m.id === id))
    .filter((m): m is MenuItem => !!m);

  return { items, loading };
}
