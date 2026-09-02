// =====================================================
// ملف: CuratedFavoritesEditor.tsx
// الغرض: يتحكم المطور في قائمة "الأكثر طلبًا" اللي بتظهر
// للعميل — يضيف، يشيل، أو يرتب الأصناف فيها
// =====================================================
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useMenu } from "@/lib/useMenu";
import { Loader2, Plus, Trash2, Heart, ArrowUp, ArrowDown } from "lucide-react";

type Row = { id: string; item_id: string; sort_order: number };

export function CuratedFavoritesEditor() {
  const { categories, menu, loading: menuLoading } = useMenu();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingItemId, setAddingItemId] = useState("");

  async function load() {
    const { data } = await supabase
      .from("curated_favorites")
      .select("*")
      .order("sort_order");
    setRows(data || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  function nameOf(itemId: string) {
    return menu.find((m) => m.id === itemId)?.nameAr || "صنف محذوف";
  }

  async function addItem() {
    if (!addingItemId) return;
    await supabase
      .from("curated_favorites")
      .insert({ item_id: addingItemId, sort_order: rows.length });
    setAddingItemId("");
    load();
  }

  async function removeItem(id: string) {
    await supabase.from("curated_favorites").delete().eq("id", id);
    load();
  }

  async function move(index: number, direction: -1 | 1) {
    const newRows = [...rows];
    const target = index + direction;
    if (target < 0 || target >= newRows.length) return;
    [newRows[index], newRows[target]] = [newRows[target], newRows[index]];
    setRows(newRows);
    await Promise.all(
      newRows.map((r, i) => supabase.from("curated_favorites").update({ sort_order: i }).eq("id", r.id))
    );
  }

  const availableItems = menu.filter((m) => !rows.some((r) => r.item_id === m.id));

  if (loading || menuLoading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-fire" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-2 flex items-center gap-2">
        <Heart className="h-5 w-5 text-fire" />
        <h1 className="font-display text-2xl font-bold text-forest-deep">مفضلة العملاء</h1>
      </div>
      <p className="mb-6 text-sm text-muted-foreground">
        اختار الأصناف اللي عايز تظهر كـ"الأكثر طلبًا" في الموقع، وترتيبهم زي ما يعجبك
      </p>

      <div className="mb-4 flex gap-2">
        <select
          value={addingItemId}
          onChange={(e) => setAddingItemId(e.target.value)}
          className="flex-1 rounded-lg border border-forest/20 px-3 py-2 text-sm"
        >
          <option value="">اختار صنف تضيفه</option>
          {categories.map((c) => (
            <optgroup key={c.id} label={c.nameAr}>
              {availableItems
                .filter((m) => m.category === c.id)
                .map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.nameAr}
                  </option>
                ))}
            </optgroup>
          ))}
        </select>
        <button
          onClick={addItem}
          disabled={!addingItemId}
          className="flex items-center gap-1.5 rounded-full bg-forest px-4 py-2 text-sm font-bold text-cream disabled:opacity-50"
        >
          <Plus className="h-4 w-4" /> إضافة
        </button>
      </div>

      <div className="flex flex-col gap-2">
        {rows.map((r, i) => (
          <div
            key={r.id}
            className="flex items-center justify-between rounded-lg border border-forest/10 bg-white px-4 py-3"
          >
            <span className="text-sm font-semibold text-forest-deep">{nameOf(r.item_id)}</span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => move(i, -1)}
                disabled={i === 0}
                className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-muted disabled:opacity-30"
              >
                <ArrowUp className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => move(i, 1)}
                disabled={i === rows.length - 1}
                className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-muted disabled:opacity-30"
              >
                <ArrowDown className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => removeItem(r.id)}
                className="flex h-7 w-7 items-center justify-center rounded-full text-chili hover:bg-chili/10"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}
        {rows.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">
            لسه ماضفتش أي صنف للقائمة دي
          </p>
        )}
      </div>
    </div>
  );
}
