// =====================================================
// ملف: OffersEditor.tsx
// الغرض: إضافة/تعديل/حذف عروض وكوبونات، والتحكم في إظهار
// أو إخفاء صفحة العروض بالكامل من على الموقع.
// الصفحة دي مقفولة على المطور بس.
// =====================================================
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Trash2, Plus, Save, Loader2, EyeOff, Eye, Check, Percent } from "lucide-react";

type DbOffer = {
  id: string;
  title_ar: string;
  title_en: string;
  description_ar: string;
  discount_type: "percentage" | "fixed_amount";
  discount_value: number;
  is_visible: boolean;
};

const EMPTY_OFFER = {
  title_ar: "عرض جديد",
  title_en: "",
  description_ar: "",
  discount_type: "percentage" as const,
  discount_value: 10,
  is_visible: true,
};

export function OffersEditor() {
  const [offers, setOffers] = useState<DbOffer[]>([]);
  const [pageEnabled, setPageEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [savingPageToggle, setSavingPageToggle] = useState(false);

  async function loadData() {
    setLoading(true);
    const [offersRes, settingsRes] = await Promise.all([
      supabase.from("offers").select("*").order("sort_order"),
      supabase.from("offers_page_settings").select("*").eq("id", 1).single(),
    ]);
    setOffers(offersRes.data || []);
    setPageEnabled(settingsRes.data?.is_page_enabled ?? false);
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  async function togglePageEnabled() {
    setSavingPageToggle(true);
    const newValue = !pageEnabled;
    const { error } = await supabase
      .from("offers_page_settings")
      .update({ is_page_enabled: newValue })
      .eq("id", 1);
    setSavingPageToggle(false);
    if (!error) {
      setPageEnabled(newValue);
    } else {
      alert(`حصلت مشكلة في تحديث الإعداد:\n${error.message}`);
    }
  }

  function updateLocal(id: string, patch: Partial<DbOffer>) {
    setOffers((prev) => prev.map((o) => (o.id === id ? { ...o, ...patch } : o)));
  }

  async function saveOffer(offer: DbOffer) {
    setSavingId(offer.id);
    const { error } = await supabase
      .from("offers")
      .update({
        title_ar: offer.title_ar,
        title_en: offer.title_en,
        description_ar: offer.description_ar,
        discount_type: offer.discount_type,
        discount_value: offer.discount_value,
        is_visible: offer.is_visible,
      })
      .eq("id", offer.id);
    setSavingId(null);
    if (!error) {
      setSavedId(offer.id);
      setTimeout(() => setSavedId(null), 1500);
    } else {
      alert(`حصلت مشكلة في الحفظ:\n${error.message}`);
    }
  }

  async function deleteOffer(id: string) {
    if (!confirm("متأكد إنك عايز تحذف العرض ده؟")) return;
    const { error } = await supabase.from("offers").delete().eq("id", id);
    if (!error) {
      setOffers((prev) => prev.filter((o) => o.id !== id));
    } else {
      alert(`حصلت مشكلة في الحذف:\n${error.message}`);
    }
  }

  async function addOffer() {
    const { error } = await supabase
      .from("offers")
      .insert({ ...EMPTY_OFFER, sort_order: offers.length });
    if (!error) {
      loadData();
    } else {
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
          <h1 className="font-display text-2xl font-bold text-forest-deep">العروض</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            عروض تظهر للعميل في صفحة "العروض" على الموقع
          </p>
        </div>
        <button
          onClick={addOffer}
          className="flex items-center gap-1.5 rounded-full bg-forest px-4 py-2 text-sm font-semibold text-cream hover:bg-forest-deep"
        >
          <Plus className="h-4 w-4" /> عرض جديد
        </button>
      </div>

      {/* مفتاح تفعيل/إخفاء صفحة العروض بالكامل */}
      <div className="mb-6 flex items-center justify-between rounded-xl border border-forest/10 bg-white p-5">
        <div>
          <h3 className="font-display text-base font-semibold text-forest-deep">
            صفحة العروض في الموقع
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {pageEnabled
              ? "الصفحة ظاهرة دلوقتي للعملاء على الموقع"
              : "الصفحة مخفية دلوقتي، العملاء مش هيشوفوها خالص"}
          </p>
        </div>
        <button
          onClick={togglePageEnabled}
          disabled={savingPageToggle}
          className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
            pageEnabled
              ? "bg-fire text-forest-deep"
              : "border border-forest/20 text-forest-deep hover:bg-forest/5"
          }`}
        >
          {savingPageToggle ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : pageEnabled ? (
            <Eye className="h-4 w-4" />
          ) : (
            <EyeOff className="h-4 w-4" />
          )}
          {pageEnabled ? "ظاهرة" : "مخفية"}
        </button>
      </div>

      <div className="flex flex-col gap-4">
        {offers.map((offer) => (
          <div
            key={offer.id}
            className={`rounded-xl border bg-white p-5 transition-opacity ${
              offer.is_visible ? "border-forest/10" : "border-forest/10 opacity-50"
            }`}
          >
            <div className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="mb-1 block text-xs font-semibold text-muted-foreground">
                  عنوان العرض
                </label>
                <input
                  value={offer.title_ar}
                  onChange={(e) => updateLocal(offer.id, { title_ar: e.target.value })}
                  className="w-full rounded-lg border border-forest/15 px-3 py-2 text-sm"
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-1 block text-xs font-semibold text-muted-foreground">
                  الوصف
                </label>
                <textarea
                  value={offer.description_ar}
                  onChange={(e) => updateLocal(offer.id, { description_ar: e.target.value })}
                  rows={2}
                  className="w-full resize-none rounded-lg border border-forest/15 px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                  <Percent className="h-3.5 w-3.5" /> نوع الخصم
                </label>
                <select
                  value={offer.discount_type}
                  onChange={(e) =>
                    updateLocal(offer.id, {
                      discount_type: e.target.value as "percentage" | "fixed_amount",
                    })
                  }
                  className="w-full rounded-lg border border-forest/15 px-3 py-2 text-sm"
                >
                  <option value="percentage">نسبة مئوية (%)</option>
                  <option value="fixed_amount">مبلغ ثابت (ج.م)</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-muted-foreground">
                  قيمة الخصم
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={offer.discount_value}
                  onChange={(e) =>
                    updateLocal(offer.id, { discount_value: parseFloat(e.target.value) || 0 })
                  }
                  className="w-full rounded-lg border border-forest/15 px-3 py-2 text-sm"
                  dir="ltr"
                />
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2 border-t border-forest/5 pt-4">
              <button
                onClick={() => saveOffer(offer)}
                disabled={savingId === offer.id}
                className="flex items-center gap-1.5 rounded-full bg-fire px-4 py-2 text-sm font-semibold text-forest-deep hover:opacity-90 disabled:opacity-50"
              >
                {savingId === offer.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : savedId === offer.id ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                حفظ
              </button>
              <button
                onClick={() => {
                  const updated = { ...offer, is_visible: !offer.is_visible };
                  updateLocal(offer.id, { is_visible: updated.is_visible });
                  saveOffer(updated);
                }}
                className="flex items-center gap-1.5 rounded-full border border-forest/20 px-4 py-2 text-sm font-semibold text-forest-deep hover:bg-forest/5"
              >
                {offer.is_visible ? (
                  <>
                    <Eye className="h-4 w-4" /> ظاهر
                  </>
                ) : (
                  <>
                    <EyeOff className="h-4 w-4" /> مخفي
                  </>
                )}
              </button>
              <button
                onClick={() => deleteOffer(offer.id)}
                className="flex items-center gap-1.5 rounded-full border border-chili/30 px-4 py-2 text-sm font-semibold text-chili hover:bg-chili/10"
              >
                <Trash2 className="h-4 w-4" /> حذف
              </button>
            </div>
          </div>
        ))}

        {offers.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">
            مفيش عروض مضافة لسه
          </p>
        )}
      </div>
    </div>
  );
}
