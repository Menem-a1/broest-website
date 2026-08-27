// =====================================================
// ملف: MenuEditor.tsx
// الغرض: أهم صفحة في لوحة التحكم — من هنا تقدر:
// - تعدّل اسم/سعر/وصف أي صنف
// - تضيف صنف جديد
// - تحذف صنف
// - تخفي صنف مؤقتًا (بدون حذفه)
// =====================================================
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Trash2, Plus, Save, Loader2, EyeOff, Eye, Check } from "lucide-react";

type DbMenuItem = {
  id: string;
  category_id: string;
  name_ar: string;
  name_en: string;
  description_ar: string;
  price: number;
  badge: string | null;
  is_available: boolean;
};

type DbCategory = {
  id: string;
  name_ar: string;
  name_en: string;
};

export function MenuEditor() {
  const [categories, setCategories] = useState<DbCategory[]>([]);
  const [items, setItems] = useState<DbMenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("");

  async function loadData() {
    setLoading(true);
    const { data: cats } = await supabase
      .from("categories")
      .select("id, name_ar, name_en")
      .order("sort_order");
    const { data: menuItems } = await supabase
      .from("menu_items")
      .select("id, category_id, name_ar, name_en, description_ar, price, badge, is_available")
      .order("sort_order");

    setCategories(cats || []);
    setItems(menuItems || []);
    if (cats && cats.length > 0 && !activeCategory) {
      setActiveCategory(cats[0].id);
    }
    setLoading(false);
  }

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function updateLocalItem(id: string, patch: Partial<DbMenuItem>) {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...patch } : it)));
  }

  async function saveItem(item: DbMenuItem) {
    setSavingId(item.id);
    const { error } = await supabase
      .from("menu_items")
      .update({
        name_ar: item.name_ar,
        name_en: item.name_en,
        description_ar: item.description_ar,
        price: item.price,
        is_available: item.is_available,
      })
      .eq("id", item.id);

    setSavingId(null);
    if (!error) {
      setSavedId(item.id);
      setTimeout(() => setSavedId(null), 1500);
    } else {
      alert("حصلت مشكلة في الحفظ، حاول تاني");
    }
  }

  async function deleteItem(id: string) {
    if (!confirm("متأكد إنك عايز تحذف الصنف ده؟ الخطوة دي مش هترجع.")) return;
    const { error } = await supabase.from("menu_items").delete().eq("id", id);
    if (!error) {
      setItems((prev) => prev.filter((it) => it.id !== id));
    } else {
      alert("حصلت مشكلة في الحذف، حاول تاني");
    }
  }

  async function addNewItem() {
    const name = prompt("اسم الصنف الجديد بالعربي:");
    if (!name) return;
    const priceStr = prompt("السعر:");
    const price = Number(priceStr);
    if (!priceStr || isNaN(price)) {
      alert("السعر لازم يكون رقم");
      return;
    }
    const id = `item-${Date.now()}`;
    const { error } = await supabase.from("menu_items").insert({
      id,
      category_id: activeCategory,
      name_ar: name,
      name_en: name,
      description_ar: "",
      price,
      is_available: true,
      sort_order: items.filter((i) => i.category_id === activeCategory).length,
    });
    if (!error) {
      loadData();
    } else {
      alert("حصلت مشكلة في الإضافة، حاول تاني");
    }
  }

  const filteredItems = items.filter((it) => it.category_id === activeCategory);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-fire" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-forest-deep">المنيو والأسعار</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            عدّل أي حقل واضغط "حفظ" جنبه. التعديل بيظهر في الموقع فورًا.
          </p>
        </div>
        <button
          onClick={addNewItem}
          className="flex items-center gap-1.5 rounded-full bg-forest px-4 py-2 text-sm font-semibold text-cream hover:bg-forest-deep"
        >
          <Plus className="h-4 w-4" /> صنف جديد
        </button>
      </div>

      {/* تبويبات الأقسام */}
      <div className="mb-6 flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
              activeCategory === cat.id
                ? "bg-forest text-cream"
                : "bg-muted text-muted-foreground hover:bg-forest/10"
            }`}
          >
            {cat.name_ar}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-3">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className={`rounded-xl border bg-white p-4 transition-opacity ${
              item.is_available ? "border-forest/10" : "border-forest/10 opacity-50"
            }`}
          >
            <div className="grid gap-3 md:grid-cols-[2fr_3fr_1fr_auto]">
              <div>
                <label className="mb-1 block text-xs font-semibold text-muted-foreground">
                  اسم الصنف
                </label>
                <input
                  value={item.name_ar}
                  onChange={(e) => updateLocalItem(item.id, { name_ar: e.target.value })}
                  className="w-full rounded-lg border border-forest/15 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-muted-foreground">
                  الوصف
                </label>
                <input
                  value={item.description_ar || ""}
                  onChange={(e) => updateLocalItem(item.id, { description_ar: e.target.value })}
                  className="w-full rounded-lg border border-forest/15 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-muted-foreground">
                  السعر
                </label>
                <input
                  type="number"
                  value={item.price}
                  onChange={(e) =>
                    updateLocalItem(item.id, { price: Number(e.target.value) })
                  }
                  className="w-full rounded-lg border border-forest/15 px-3 py-2 text-sm font-price"
                />
              </div>
              <div className="flex items-end gap-1.5">
                <button
                  onClick={() => saveItem(item)}
                  disabled={savingId === item.id}
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-fire text-forest-deep hover:opacity-90 disabled:opacity-50"
                  title="حفظ"
                >
                  {savingId === item.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : savedId === item.id ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                </button>
                <button
                  onClick={() => {
                    const updated = { ...item, is_available: !item.is_available };
                    updateLocalItem(item.id, { is_available: updated.is_available });
                    saveItem(updated);
                  }}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-forest/15 text-forest-deep hover:bg-forest/5"
                  title={item.is_available ? "إخفاء من الموقع" : "إظهار في الموقع"}
                >
                  {item.is_available ? (
                    <Eye className="h-4 w-4" />
                  ) : (
                    <EyeOff className="h-4 w-4" />
                  )}
                </button>
                <button
                  onClick={() => deleteItem(item.id)}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-chili/30 text-chili hover:bg-chili/10"
                  title="حذف"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            {!item.is_available && (
              <p className="mt-2 text-xs font-semibold text-chili">
                الصنف ده مخفي دلوقتي، مش ظاهر للعملاء في الموقع
              </p>
            )}
          </div>
        ))}

        {filteredItems.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">
            مفيش أصناف في القسم ده لسه
          </p>
        )}
      </div>
    </div>
  );
}
