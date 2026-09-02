import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type DbDiscount = {
  id: string;
  scope: "all" | "category" | "items";
  category_id: string | null;
  item_ids: string[];
  discount_type: "percentage" | "fixed_amount";
  discount_value: number;
  is_active: boolean;
};

export function useMenuDiscounts() {
  const [discounts, setDiscounts] = useState<DbDiscount[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchDiscounts() {
    const { data } = await supabase.from("menu_discounts").select("*").eq("is_active", true);
    setDiscounts(data || []);
    setLoading(false);
  }

  useEffect(() => {
    fetchDiscounts();
  }, []);

  // بترجع السعر بعد الخصم لصنف معين، أو نفس السعر لو مفيش خصم عليه
  // لو فيه أكتر من خصم منطبق، بناخد الأقوى (الأرخص للعميل)
  function applyDiscount(itemId: string, categoryId: string, price: number): number {
    const applicable = discounts.filter(
      (d) =>
        d.scope === "all" ||
        (d.scope === "category" && d.category_id === categoryId) ||
        (d.scope === "items" && d.item_ids.includes(itemId))
    );
    if (applicable.length === 0) return price;

    const prices = applicable.map((d) =>
      d.discount_type === "percentage"
        ? price - (price * d.discount_value) / 100
        : price - d.discount_value
    );
    return Math.max(0, Math.min(...prices));
  }

  return { discounts, loading, applyDiscount, refetch: fetchDiscounts };
}
