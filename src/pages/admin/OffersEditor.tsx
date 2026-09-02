// =====================================================
// ملف: OffersEditor.tsx
// الغرض: بناء عروض على شكل باقات — اختار أصناف مدفوعة،
// أصناف مجانية (هدية)، وسعر إجمالي واحد للباقة كلها.
// الصفحة دي مقفولة على المطور بس.
// =====================================================
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useMenu } from "@/lib/useMenu";
import { Trash2, Plus, Loader2, EyeOff, Eye, Gift } from "lucide-react";

type DbOffer = {
  id: string;
  title_ar: string;
  description_ar: string;
  bundle_price: number;
  is_visible: boolean;
};

type OfferItem = { item_id: string; quantity: number };

export function OffersEditor() {
  const { categories, menu, loading: menuLoading } = useMenu();
  const [offers, setOffers] = useState<DbOffer[]>([]);
  const [offerPaidItems, setOfferPaidItems] = useState<Record<string, OfferItem[]>>({});
  const [offerFreeItems, setOfferFreeItems] = useState<Record<string, OfferItem[]>>({});
  const [pageEnabled, setPageEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [savingPageToggle, setSavingPageToggle] = useState(false);

  // فورم إنشاء عرض جديد
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [bundlePrice, setBundlePrice] = useState(0);
  const [paidSelection, setPaidSelection] = useState<Record<string, number>>({});
  const [freeSelection, setFreeSelection] = useState<Record<string, number>>({});
  const [saving, setSaving] = useState(false);

  async function loadData() {
    setLoading(true);
    const [offersRes, settingsRes] = await Promise.all([
      supabase.from("offers").select("*").order("sort_order"),
      supabase.from("offers_page_settings").select("*").eq("id", 1).single(),
    ]);
    const offersData = offersRes.data || [];
    setOffers(offersData);
    setPageEnabled(settingsRes.data?.is_page_enabled ?? false);

    if (offersData.length > 0) {
      const offerIds = offersData.map((o) => o.id);
      const [paidRes, freeRes] = await Promise.all([
        supabase.from("offer_paid_items").select("*").in("offer_id", offerIds),
        supabase.from("offer_free_items").select("*").in("offer_id", offerIds),
      ]);
      const paidMap: Record<string, OfferItem[]> = {};
      (paidRes.data || []).forEach((p) => {
        if (!paidMap[p.offer_id]) paidMap[p.offer_id] = [];
        paidMap[p.offer_id].push({ item_id: p.item_id, quantity: p.quantity });
      });
      const freeMap: Record<string, OfferItem[]> = {};
      (freeRes.data || []).forEach((f) => {
        if (!freeMap[f.offer_id]) freeMap[f.offer_id] = [];
        freeMap[f.offer_id].push({ item_id: f.item_id, quantity: f.quantity });
      });
      setOfferPaidItems(paidMap);
      setOfferFreeItems(freeMap);
    }
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
    if (!error) setPageEnabled(newValue);
  }

  async function toggleVisible(offer: DbOffer) {
    await supabase.from("offers").update({ is_visible: !offer.is_visible }).eq("id", offer.id);
    loadData();
  }

  async function deleteOffer(id: string) {
    if (!confirm("متأكد إنك عايز تحذف العرض ده؟")) return;
    await supabase.from("offers").delete().eq("id", id);
    loadData();
  }

  function nameOf(itemId: string) {
    return menu.find((m) => m.id === itemId)?.nameAr || "—";
  }

  async function createOffer() {
    const paidEntries = Object.entries(paidSelection).filter(([, qty]) => qty > 0);
    if (!title.trim() || paidEntries.length === 0 || bundlePrice <= 0) return;

    setSaving(true);
    const { data: newOffer, error } = await supabase
      .from("offers")
      .insert({
        title_ar: title.trim(),
        description_ar: description.trim(),
        bundle_price: bundlePrice,
        is_visible: true,
        sort_order: offers.length,
      })
      .select()
      .single();

    if (!error && newOffer) {
      const paidRows = paidEntries.map(([item_id, quantity]) => ({
        offer_id: newOffer.id,
        item_id,
        quantity,
      }));
      const freeEntries = Object.entries(freeSelection).filter(([, qty]) => qty > 0);
      const freeRows = freeEntries.map(([item_id, quantity]) => ({
        offer_id: newOffer.id,
        item_id,
        quantity,
      }));

      await Promise.all([
        paidRows.length > 0
          ? supabase.from("offer_paid_items").insert(paidRows)
          : Promise.resolve(),
        freeRows.length > 0
          ? supabase.from("offer_free_items").insert(freeRows)
          : Promise.resolve(),
      ]);
    }

    setSaving(false);
    setShowForm(false);
    setTitle("");
    setDescription("");
    setBundlePrice(0);
    setPaidSelection({});
    setFreeSelection({});
    loadData();
  }

  if (loading || menuLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-fire" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-forest-deep">العروض</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            اعمل عرض زي "اطلب X وY وهات Z مجاني" بسعر إجمالي واحد
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
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
            {pageEnabled ? "الصفحة ظاهرة دلوقتي للعملاء" : "الصفحة مخفية دلوقتي"}
          </p>
        </div>
        <button
          onClick={togglePageEnabled}
          disabled={savingPageToggle}
          className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold ${
            pageEnabled ? "bg-fire text-forest-deep" : "border border-forest/20 text-forest-deep"
          }`}
        >
          {pageEnabled ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
          {pageEnabled ? "ظاهرة" : "مخفية"}
        </button>
      </div>

      {/* نموذج إضافة عرض جديد */}
      {showForm && (
        <div className="mb-6 rounded-xl border border-forest/10 bg-white p-5">
          <div className="flex flex-col gap-3">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="اسم العرض (مثال: كومبو الاتنين)"
              className="rounded-lg border border-forest/20 px-3 py-2 text-sm"
            />
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="وصف قصير (اختياري)"
              className="resize-none rounded-lg border border-forest/20 px-3 py-2 text-sm"
            />

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-forest-deep">
                الأصناف اللي العميل بيدفع تمنها
              </label>
              <div className="max-h-56 overflow-y-auto rounded-lg border border-forest/15 p-2">
                {categories.map((c) => (
                  <div key={c.id} className="mb-2">
                    <p className="px-1 py-1 text-xs font-bold text-muted-foreground">{c.nameAr}</p>
                    {menu
                      .filter((m) => m.category === c.id)
                      .map((m) => (
                        <div key={m.id} className="flex items-center justify-between px-2 py-1">
                          <span className="text-sm">{m.nameAr}</span>
                          <input
                            type="number"
                            min="0"
                            value={paidSelection[m.id] || 0}
                            onChange={(e) =>
                              setPaidSelection({
                                ...paidSelection,
                                [m.id]: parseInt(e.target.value) || 0,
                              })
                            }
                            className="w-16 rounded border border-forest/20 px-2 py-1 text-sm"
                          />
                        </div>
                      ))}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-sm font-semibold text-forest-deep">
                <Gift className="h-4 w-4 text-fire" /> الأصناف اللي هتيجي هدية (اختياري)
              </label>
              <div className="max-h-56 overflow-y-auto rounded-lg border border-forest/15 p-2">
                {categories.map((c) => (
                  <div key={c.id} className="mb-2">
                    <p className="px-1 py-1 text-xs font-bold text-muted-foreground">{c.nameAr}</p>
                    {menu
                      .filter((m) => m.category === c.id)
                      .map((m) => (
                        <div key={m.id} className="flex items-center justify-between px-2 py-1">
                          <span className="text-sm">{m.nameAr}</span>
                          <input
                            type="number"
                            min="0"
                            value={freeSelection[m.id] || 0}
                            onChange={(e) =>
                              setFreeSelection({
                                ...freeSelection,
                                [m.id]: parseInt(e.target.value) || 0,
                              })
                            }
                            className="w-16 rounded border border-forest/20 px-2 py-1 text-sm"
                          />
                        </div>
                      ))}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-forest-deep">
                السعر الإجمالي للعرض (ج.م)
              </label>
              <input
                type="number"
                min="0"
                value={bundlePrice}
                onChange={(e) => setBundlePrice(parseFloat(e.target.value) || 0)}
                className="w-40 rounded-lg border border-forest/20 px-3 py-2 text-sm"
                dir="ltr"
              />
            </div>

            <button
              onClick={createOffer}
              disabled={saving}
              className="self-start rounded-full bg-fire px-5 py-2 text-sm font-bold text-forest-deep disabled:opacity-50"
            >
              {saving ? "بيحفظ..." : "احفظ العرض"}
            </button>
          </div>
        </div>
      )}

      {/* قائمة العروض الحالية */}
      <div className="flex flex-col gap-3">
        {offers.map((offer) => (
          <div
            key={offer.id}
            className={`rounded-xl border border-forest/10 bg-white p-4 ${
              offer.is_visible ? "" : "opacity-50"
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="font-display text-base font-bold text-forest-deep">
                  {offer.title_ar}
                </p>
                <p className="mt-1 text-sm text-fire">{offer.bundle_price} ج.م</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleVisible(offer)}
                  className="rounded-full border border-forest/20 px-3 py-1.5 text-xs font-semibold"
                >
                  {offer.is_visible ? "ظاهر" : "مخفي"}
                </button>
                <button
                  onClick={() => deleteOffer(offer.id)}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-chili hover:bg-chili/10"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            <ul className="mt-2 flex flex-col gap-0.5 text-sm text-muted-foreground">
              {(offerPaidItems[offer.id] || []).map((p, i) => (
                <li key={`p-${i}`}>
                  {p.quantity}× {nameOf(p.item_id)}
                </li>
              ))}
              {(offerFreeItems[offer.id] || []).map((f, i) => (
                <li key={`f-${i}`} className="flex items-center gap-1 font-semibold text-fire">
                  <Gift className="h-3 w-3" /> {f.quantity}× {nameOf(f.item_id)} هدية
                </li>
              ))}
            </ul>
          </div>
        ))}
        {offers.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">مفيش عروض مضافة</p>
        )}
      </div>
    </div>
  );
}
