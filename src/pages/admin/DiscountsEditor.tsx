import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useMenu } from "@/lib/useMenu";
import { Trash2, Plus, Loader2, Percent } from "lucide-react";

type DbDiscount = {
  id: string;
  scope: "all" | "category" | "items";
  category_id: string | null;
  item_ids: string[];
  discount_type: "percentage" | "fixed_amount";
  discount_value: number;
  is_active: boolean;
};

export function DiscountsEditor() {
  const { categories, menu, loading: menuLoading } = useMenu();
  const [discounts, setDiscounts] = useState<DbDiscount[]>([]);
  const [loading, setLoading] = useState(true);

  const [scope, setScope] = useState<"all" | "category" | "items">("all");
  const [categoryId, setCategoryId] = useState("");
  const [selectedItemIds, setSelectedItemIds] = useState<Set<string>>(new Set());
  const [discountType, setDiscountType] = useState<"percentage" | "fixed_amount">("percentage");
  const [discountValue, setDiscountValue] = useState(10);
  const [saving, setSaving] = useState(false);

  async function load() {
    const { data } = await supabase
      .from("menu_discounts")
      .select("*")
      .order("created_at", { ascending: false });
    setDiscounts(data || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  function toggleItem(id: string) {
    setSelectedItemIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function createDiscount() {
    if (scope === "category" && !categoryId) return;
    if (scope === "items" && selectedItemIds.size === 0) return;

    setSaving(true);
    await supabase.from("menu_discounts").insert({
      scope,
      category_id: scope === "category" ? categoryId : null,
      item_ids: scope === "items" ? Array.from(selectedItemIds) : [],
      discount_type: discountType,
      discount_value: discountValue,
      is_active: true,
    });
    setSaving(false);
    setScope("all");
    setCategoryId("");
    setSelectedItemIds(new Set());
    setDiscountValue(10);
    load();
  }

  async function toggleActive(d: DbDiscount) {
    await supabase.from("menu_discounts").update({ is_active: !d.is_active }).eq("id", d.id);
    load();
  }

  async function deleteDiscount(id: string) {
    if (!confirm("متأكد إنك عايز تحذف الخصم ده؟")) return;
    await supabase.from("menu_discounts").delete().eq("id", id);
    load();
  }

  function describeScope(d: DbDiscount): string {
    if (d.scope === "all") return "كل المنيو";
    if (d.scope === "category") {
      const cat = categories.find((c) => c.id === d.category_id);
      return `قسم: ${cat?.nameAr || "—"}`;
    }
    const names = menu.filter((m) => d.item_ids.includes(m.id)).map((m) => m.nameAr);
    return `أصناف: ${names.join("، ") || "—"}`;
  }

  if (loading || menuLoading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-fire" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      <h1 className="font-display text-2xl font-bold text-forest-deep">خصومات المنيو</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        اعمل خصم يطبّق تلقائيًا على كل المنيو، أو قسم معين، أو أصناف مختارة
      </p>

      {/* نموذج إضافة خصم جديد */}
      <div className="mt-6 rounded-xl border border-forest/10 bg-white p-5">
        <label className="mb-2 block text-sm font-semibold text-forest-deep">نطاق الخصم</label>
        <div className="flex flex-wrap gap-2">
          {[
            { v: "all" as const, label: "كل المنيو" },
            { v: "category" as const, label: "قسم معين" },
            { v: "items" as const, label: "أصناف معينة" },
          ].map((o) => (
            <button
              key={o.v}
              onClick={() => setScope(o.v)}
              className={`rounded-full border-2 px-4 py-1.5 text-sm font-semibold ${
                scope === o.v
                  ? "border-fire bg-fire/10 text-forest-deep"
                  : "border-forest/15 text-muted-foreground"
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>

        {scope === "category" && (
          <div className="mt-4">
            <label className="mb-1.5 block text-sm font-semibold text-forest-deep">القسم</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full rounded-lg border border-forest/20 px-3 py-2 text-sm"
            >
              <option value="">اختار القسم</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nameAr}
                </option>
              ))}
            </select>
          </div>
        )}

        {scope === "items" && (
          <div className="mt-4">
            <label className="mb-1.5 block text-sm font-semibold text-forest-deep">
              اختار الأصناف
            </label>
            <div className="max-h-64 overflow-y-auto rounded-lg border border-forest/15 p-2">
              {categories.map((c) => (
                <div key={c.id} className="mb-2">
                  <p className="px-1 py-1 text-xs font-bold text-muted-foreground">{c.nameAr}</p>
                  {menu
                    .filter((m) => m.category === c.id)
                    .map((m) => (
                      <label
                        key={m.id}
                        className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-muted/50"
                      >
                        <input
                          type="checkbox"
                          checked={selectedItemIds.has(m.id)}
                          onChange={() => toggleItem(m.id)}
                        />
                        {m.nameAr}
                      </label>
                    ))}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-forest-deep">
              نوع الخصم
            </label>
            <select
              value={discountType}
              onChange={(e) => setDiscountType(e.target.value as "percentage" | "fixed_amount")}
              className="w-full rounded-lg border border-forest/20 px-3 py-2 text-sm"
            >
              <option value="percentage">نسبة مئوية (%)</option>
              <option value="fixed_amount">مبلغ ثابت (ج.م)</option>
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-forest-deep">القيمة</label>
            <input
              type="number"
              min="0"
              value={discountValue}
              onChange={(e) => setDiscountValue(parseFloat(e.target.value) || 0)}
              className="w-full rounded-lg border border-forest/20 px-3 py-2 text-sm"
              dir="ltr"
            />
          </div>
        </div>

        <button
          onClick={createDiscount}
          disabled={saving}
          className="mt-4 flex items-center gap-1.5 rounded-full bg-forest px-4 py-2 text-sm font-bold text-cream disabled:opacity-50"
        >
          <Plus className="h-4 w-4" /> إضافة الخصم
        </button>
      </div>

      {/* قائمة الخصومات الحالية */}
      <div className="mt-6 flex flex-col gap-3">
        {discounts.map((d) => (
          <div
            key={d.id}
            className={`flex items-center justify-between rounded-xl border p-4 ${
              d.is_active ? "border-forest/10 bg-white" : "border-forest/10 bg-white opacity-50"
            }`}
          >
            <div className="flex items-center gap-2">
              <Percent className="h-4 w-4 text-fire" />
              <div>
                <p className="text-sm font-semibold text-forest-deep">{describeScope(d)}</p>
                <p className="text-xs text-muted-foreground">
                  خصم {d.discount_value}
                  {d.discount_type === "percentage" ? "%" : " ج.م"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => toggleActive(d)}
                className="rounded-full border border-forest/20 px-3 py-1.5 text-xs font-semibold text-forest-deep hover:bg-forest/5"
              >
                {d.is_active ? "شغّال" : "متوقف"}
              </button>
              <button
                onClick={() => deleteDiscount(d.id)}
                className="flex h-8 w-8 items-center justify-center rounded-full text-chili hover:bg-chili/10"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
        {discounts.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">مفيش خصومات مضافة</p>
        )}
      </div>
    </div>
  );
}
