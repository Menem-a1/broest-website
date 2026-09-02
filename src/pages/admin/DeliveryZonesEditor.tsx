// =====================================================
// ملف: DeliveryZonesEditor.tsx
// الغرض: إضافة/تعديل/حذف مناطق التوصيل وتسعيرها.
// الصفحة دي مقفولة على المطور بس (زي باقي صفحات الإعدادات
// الحساسة)، مش متاحة لصاحب المطعم.
// =====================================================
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Trash2, Plus, Save, Loader2, EyeOff, Eye, Check, Truck } from "lucide-react";

type DbZone = {
  id: string;
  name_ar: string;
  name_en: string;
  delivery_price: number;
  is_active: boolean;
  sort_order: number;
};

const EMPTY_ZONE = {
  name_ar: "منطقة جديدة",
  name_en: "",
  delivery_price: 0,
  is_active: true,
};

export function DeliveryZonesEditor() {
  const [zones, setZones] = useState<DbZone[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);

  async function loadZones() {
    setLoading(true);
    const { data } = await supabase
      .from("delivery_zones")
      .select("*")
      .order("sort_order");
    setZones(data || []);
    setLoading(false);
  }

  useEffect(() => {
    loadZones();
  }, []);

  function updateLocal(id: string, patch: Partial<DbZone>) {
    setZones((prev) => prev.map((z) => (z.id === id ? { ...z, ...patch } : z)));
  }

  async function saveZone(zone: DbZone) {
    setSavingId(zone.id);
    const { error } = await supabase
      .from("delivery_zones")
      .update({
        name_ar: zone.name_ar,
        name_en: zone.name_en,
        delivery_price: zone.delivery_price,
        is_active: zone.is_active,
      })
      .eq("id", zone.id);
    setSavingId(null);
    if (!error) {
      setSavedId(zone.id);
      setTimeout(() => setSavedId(null), 1500);
    } else {
      console.error("خطأ في حفظ منطقة التوصيل:", error);
      alert(`حصلت مشكلة في الحفظ:\n${error.message}`);
    }
  }

  async function deleteZone(id: string) {
    if (!confirm("متأكد إنك عايز تحذف المنطقة دي؟")) return;
    const { error } = await supabase.from("delivery_zones").delete().eq("id", id);
    if (!error) {
      setZones((prev) => prev.filter((z) => z.id !== id));
    } else {
      console.error("خطأ في حذف المنطقة:", error);
      alert(`حصلت مشكلة في الحذف:\n${error.message}`);
    }
  }

  async function addZone() {
    const { error } = await supabase
      .from("delivery_zones")
      .insert({ ...EMPTY_ZONE, sort_order: zones.length });
    if (!error) {
      loadZones();
    } else {
      console.error("خطأ في إضافة المنطقة:", error);
      alert(`حصلت مشكلة في الإضافة:\n${error.message}`);
    }
  }

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
          <h1 className="font-display text-2xl font-bold text-forest-deep">
            مناطق التوصيل
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            كل منطقة بسعر توصيل مستقل، والعميل بيختارها وقت الطلب
          </p>
        </div>
        <button
          onClick={addZone}
          className="flex items-center gap-1.5 rounded-full bg-forest px-4 py-2 text-sm font-semibold text-cream hover:bg-forest-deep"
        >
          <Plus className="h-4 w-4" /> منطقة جديدة
        </button>
      </div>

      <div className="flex flex-col gap-4">
        {zones.map((zone) => (
          <div
            key={zone.id}
            className={`rounded-xl border bg-white p-5 transition-opacity ${
              zone.is_active ? "border-forest/10" : "border-forest/10 opacity-50"
            }`}
          >
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label className="mb-1 block text-xs font-semibold text-muted-foreground">
                  اسم المنطقة (عربي)
                </label>
                <input
                  value={zone.name_ar}
                  onChange={(e) => updateLocal(zone.id, { name_ar: e.target.value })}
                  className="w-full rounded-lg border border-forest/15 px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-muted-foreground">
                  اسم المنطقة (إنجليزي)
                </label>
                <input
                  value={zone.name_en}
                  onChange={(e) => updateLocal(zone.id, { name_en: e.target.value })}
                  className="w-full rounded-lg border border-forest/15 px-3 py-2 text-sm"
                  dir="ltr"
                />
              </div>

              <div>
                <label className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                  <Truck className="h-3.5 w-3.5" /> سعر التوصيل (ج.م)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={zone.delivery_price}
                  onChange={(e) =>
                    updateLocal(zone.id, { delivery_price: parseFloat(e.target.value) || 0 })
                  }
                  className="w-full rounded-lg border border-forest/15 px-3 py-2 text-sm"
                  dir="ltr"
                />
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2 border-t border-forest/5 pt-4">
              <button
                onClick={() => saveZone(zone)}
                disabled={savingId === zone.id}
                className="flex items-center gap-1.5 rounded-full bg-fire px-4 py-2 text-sm font-semibold text-forest-deep hover:opacity-90 disabled:opacity-50"
              >
                {savingId === zone.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : savedId === zone.id ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                حفظ
              </button>
              <button
                onClick={() => {
                  const updated = { ...zone, is_active: !zone.is_active };
                  updateLocal(zone.id, { is_active: updated.is_active });
                  saveZone(updated);
                }}
                className="flex items-center gap-1.5 rounded-full border border-forest/20 px-4 py-2 text-sm font-semibold text-forest-deep hover:bg-forest/5"
              >
                {zone.is_active ? (
                  <>
                    <Eye className="h-4 w-4" /> نشطة
                  </>
                ) : (
                  <>
                    <EyeOff className="h-4 w-4" /> غير نشطة
                  </>
                )}
              </button>
              <button
                onClick={() => deleteZone(zone.id)}
                className="flex items-center gap-1.5 rounded-full border border-chili/30 px-4 py-2 text-sm font-semibold text-chili hover:bg-chili/10"
              >
                <Trash2 className="h-4 w-4" /> حذف
              </button>
            </div>
          </div>
        ))}

        {zones.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">
            مفيش مناطق توصيل مضافة لسه
          </p>
        )}
      </div>
    </div>
  );
}
