// =====================================================
// ملف: useMenu.ts
// الغرض: يجيب المنيو والأقسام من قاعدة البيانات بدل
// الملف الثابت menu.ts القديم
// =====================================================
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export type MenuItem = {
  id: string;
  nameAr: string;
  nameEn: string;
  descAr: string;
  price: number;
  sizes?: { label: string; price: number }[];
  category: string;
  badge?: string;
  imageUrl?: string;
};

export type Category = {
  id: string;
  nameAr: string;
  nameEn: string;
};

export function useMenu() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchData() {
      setLoading(true);
      setError(null);

      // نجيب الأقسام
      const { data: catsData, error: catsError } = await supabase
        .from("categories")
        .select("id, name_ar, name_en")
        .order("sort_order");

      // نجيب الأصناف
      const { data: itemsData, error: itemsError } = await supabase
        .from("menu_items")
        .select("id, category_id, name_ar, name_en, description_ar, price, badge, is_available, image_url")
        .eq("is_available", true)
        .order("sort_order");

      // نجيب الأحجام
      const { data: sizesData, error: sizesError } = await supabase
        .from("item_sizes")
        .select("item_id, label, price, sort_order")
        .order("sort_order");

      if (!isMounted) return;

      if (catsError || itemsError || sizesError) {
        setError("حصلت مشكلة في تحميل المنيو. حاول تحدّث الصفحة.");
        setLoading(false);
        return;
      }

      const mappedCategories: Category[] = (catsData || []).map((c) => ({
        id: c.id,
        nameAr: c.name_ar,
        nameEn: c.name_en,
      }));

      const mappedItems: MenuItem[] = (itemsData || []).map((item) => {
        const itemSizes = (sizesData || [])
          .filter((s) => s.item_id === item.id)
          .map((s) => ({ label: s.label, price: Number(s.price) }));

        return {
          id: item.id,
          nameAr: item.name_ar,
          nameEn: item.name_en,
          descAr: item.description_ar || "",
          price: Number(item.price),
          category: item.category_id,
          badge: item.badge || undefined,
          imageUrl: item.image_url || undefined,
          sizes: itemSizes.length > 0 ? itemSizes : undefined,
        };
      });

      setCategories(mappedCategories);
      setMenu(mappedItems);
      setLoading(false);
    }

    fetchData();
    return () => {
      isMounted = false;
    };
  }, []);

  return { categories, menu, loading, error };
}
