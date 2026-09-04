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
import { ImageUploadField } from "@/components/admin/ImageUploadField";
import { Trash2, Plus, Save, Loader2, EyeOff, Eye, Check, Ruler } from "lucide-react";

type DbMenuItem = {
  id: string;
  category_id: string;
  name_ar: string;
  name_en: string;
  description_ar: string;
  price: number;
  badge: string | null;
  is_available: boolean;
  image_url: string | null;
};

type DbItemSize = {
  id: string;
  item_id: string;
  label: string;
  price: number;
  sort_order: number;
};

type DbCategory = {
  id: string;
  name_ar: string;
  name_en: string;
};

export function MenuEditor() {
  const [categories, setCategories] = useState<DbCategory[]>([]);
  const [items, setItems] = useState<DbMenuItem[]>([]);
  const [sizes, setSizes] = useState<DbItemSize[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("");
  // بيتحط فيه id الصنف اللي فاتح دلوقتي قسم تعديل الأحجام بتاعه
  const [openSizesFor, setOpenSizesFor] = useState<string | null>(null);

  async function loadData() {
    setLoading(true);
    const { data: cats } = await supabase
      .from("categories")
      .select("id, name_ar, name_en")
      .order("sort_order");
    const { data: menuItems } = await supabase
      .from("menu_items")
      .select("id, category_id, name_ar, name_en, description_ar, price, badge, is_available, image_url")
      .order("sort_order");
    const { data: itemSizes } = await supabase
      .from("item_sizes")
      .select("id, item_id, label, price, sort_order")
      .order("sort_order");

    setCategories(cats || []);
    setItems(menuItems || []);
    setSizes(itemSizes || []);
    if (cats && cats.length > 0 && !activeCategory) {
      setActiveCategory(cats[0].id);
    }
    setLoading(false);
  }

  function sizesForItem(itemId: string) {
    return sizes.filter((s) => s.item_id === itemId);
  }

  // بتضيف صف حجم فاضي جاهز للتعديل المباشر (زي باقي الأحجام)،
  // بدل نافذة منبثقة منفصلة — العنصر بيتحفظ فعليًا أول ما تدوس
  // برّه الحقل (onBlur) في updateSize/saveSize
  async function addSize(itemId: string) {
    const { data, error } = await supabase
      .from("item_sizes")
      .insert({
        item_id: itemId,
        label: "حجم جديد",
        price: 0,
        sort_order: sizesForItem(itemId).length,
      })
      .select("id, item_id, label, price, sort_order")
      .single();
    if (!error && data) {
      setSizes((prev) => [...prev, data]);
    } else {
      console.error("خطأ في إضافة الحجم:", error);
      alert(`حصلت مشكلة في إضافة الحجم:\n${error?.message}`);
    }
  }

  async function updateSize(size: DbItemSize, patch: Partial<DbItemSize>) {
    const updated = { ...size, ...patch };
    setSizes((prev) => prev.map((s) => (s.id === size.id ? updated : s)));
  }

  async function saveSize(size: DbItemSize) {
    const { error } = await supabase
      .from("item_sizes")
      .update({ label: size.label, price: size.price })
      .eq("id", size.id);
    if (error) {
      console.error("خطأ في حفظ الحجم:", error);
      alert(`حصلت مشكلة في حفظ الحجم:\n${error.message}`);
    }
  }

  async function deleteSize(id: string) {
    if (!confirm("متأكد إنك عايز تحذف الحجم ده؟")) return;
    const { error } = await supabase.from("item_sizes").delete().eq("id", id);
    if (!error) {
      setSizes((prev) => prev.filter((s) => s.id !== id));
    } else {
      console.error("خطأ في حذف الحجم:", error);
      alert(`حصلت مشكلة في حذف الحجم:\n${error.message}`);
    }
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
        image_url: item.image_url,
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

  // بتتنادى فورًا لما صورة جديدة تترفع، عشان محتاجش تدوس حفظ منفصل للصورة
  async function handleImageUploaded(item: DbMenuItem, url: string) {
    updateLocalItem(item.id, { image_url: url });
    await saveItem({ ...item, image_url: url });
  }

  async function handleImageRemoved(item: DbMenuItem) {
    updateLocalItem(item.id, { image_url: null });
    await saveItem({ ...item, image_url: null });
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

    // نسأل الأول: الصنف ده بحجم واحد ولا أكتر من حجم؟
    const hasMultipleSizes = confirm(
      'الصنف ده هيكون له أكتر من حجم (زي وسط/كبير)؟\n\nدوس "OK" لو أيوه هيكون له أكتر من حجم.\nدوس "Cancel" لو حجم واحد بس زي باقي الأصناف.'
    );

    const id = `item-${Date.now()}`;

    if (!hasMultipleSizes) {
      // صنف بحجم واحد — زي ما كان الوضع قبل كده بالظبط
      const priceStr = prompt("السعر:");
      const price = Number(priceStr);
      if (!priceStr || isNaN(price)) {
        alert("السعر لازم يكون رقم");
        return;
      }
      const { error } = await supabase.from("menu_items").insert({
        id,
        category_id: activeCategory,
        name_ar: name,
        name_en: name,
        description_ar: "",
        price,
        is_available: true,
        image_url: null,
        sort_order: items.filter((i) => i.category_id === activeCategory).length,
      });
      if (!error) {
        loadData();
      } else {
        console.error("خطأ في إضافة الصنف:", error);
        alert(`حصلت مشكلة في الإضافة:\n${error.message}`);
      }
      return;
    }

    // صنف بأكتر من حجم — ناخد الأحجام واحد واحد لحد ما يدوس Cancel
    const enteredSizes: { label: string; price: number }[] = [];
    let keepAsking = true;
    while (keepAsking) {
      const label = prompt(
        `اسم الحجم رقم ${enteredSizes.length + 1} (مثال: وسط، كبير، XL):\n(دوس Cancel لو خلصت الأحجام)`
      );
      if (!label) {
        keepAsking = false;
        break;
      }
      const priceStr = prompt(`سعر حجم "${label}":`);
      const price = Number(priceStr);
      if (!priceStr || isNaN(price)) {
        alert("السعر لازم يكون رقم، الحجم ده مش هيتضاف");
        continue;
      }
      enteredSizes.push({ label, price });
    }

    if (enteredSizes.length === 0) {
      alert("لازم تدخل حجم واحد على الأقل");
      return;
    }

    // السعر الأساسي المخزّن في menu_items بيبقى سعر أول حجم (بيستخدم كسعر افتراضي فقط)
    const { error: itemError } = await supabase.from("menu_items").insert({
      id,
      category_id: activeCategory,
      name_ar: name,
      name_en: name,
      description_ar: "",
      price: enteredSizes[0].price,
      is_available: true,
      image_url: null,
      sort_order: items.filter((i) => i.category_id === activeCategory).length,
    });
    if (itemError) {
      console.error("خطأ في إضافة الصنف:", itemError);
      alert(`حصلت مشكلة في الإضافة:\n${itemError.message}`);
      return;
    }

    const { error: sizesError } = await supabase.from("item_sizes").insert(
      enteredSizes.map((s, i) => ({
        item_id: id,
        label: s.label,
        price: s.price,
        sort_order: i,
      }))
    );
    if (sizesError) {
      console.error("خطأ في إضافة الأحجام:", sizesError);
      alert(`الصنف اتضاف لكن حصلت مشكلة في إضافة الأحجام:\n${sizesError.message}`);
    }

    loadData();
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
            <div className="grid gap-3 md:grid-cols-[auto_2fr_3fr_1fr_auto]">
              <div>
                <label className="mb-1 block text-xs font-semibold text-muted-foreground">
                  الصورة
                </label>
                <ImageUploadField
                  currentUrl={item.image_url}
                  folder="items"
                  onUploaded={(url) => handleImageUploaded(item, url)}
                  onRemoved={() => handleImageRemoved(item)}
                  size="sm"
                />
              </div>
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

            {/* قسم إدارة الأحجام (لو الصنف عنده أكتر من حجم زي وسط/كبير) */}
            <div className="mt-3 border-t border-forest/5 pt-3">
              <button
                onClick={() => setOpenSizesFor(openSizesFor === item.id ? null : item.id)}
                className="flex items-center gap-1.5 text-xs font-semibold text-forest hover:text-forest-deep"
              >
                <Ruler className="h-3.5 w-3.5" />
                {sizesForItem(item.id).length > 0
                  ? `الأحجام (${sizesForItem(item.id).length})`
                  : "إضافة أحجام لهذا الصنف"}
              </button>

              {openSizesFor === item.id && (
                <div className="mt-2 flex flex-col gap-2 rounded-lg bg-forest/5 p-3">
                  {sizesForItem(item.id).length === 0 && (
                    <p className="text-xs text-muted-foreground">
                      الصنف ده حجم واحد بس دلوقتي (السعر اللي فوق). لو عايز تضيفله أحجام
                      زي وسط/كبير، دوس الزرار تحت.
                    </p>
                  )}
                  {sizesForItem(item.id).map((size) => (
                    <div key={size.id} className="flex items-center gap-2">
                      <input
                        value={size.label}
                        onChange={(e) => updateSize(size, { label: e.target.value })}
                        onBlur={() => saveSize(size)}
                        placeholder="اسم الحجم"
                        className="w-28 rounded-lg border border-forest/15 px-2 py-1.5 text-xs"
                      />
                      <input
                        type="number"
                        value={size.price}
                        onChange={(e) => updateSize(size, { price: Number(e.target.value) })}
                        onBlur={() => saveSize(size)}
                        placeholder="السعر"
                        className="w-24 rounded-lg border border-forest/15 px-2 py-1.5 text-xs font-price"
                      />
                      <button
                        onClick={() => deleteSize(size.id)}
                        className="flex h-7 w-7 items-center justify-center rounded-lg border border-chili/30 text-chili hover:bg-chili/10"
                        title="حذف الحجم"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => addSize(item.id)}
                    className="flex w-fit items-center gap-1 rounded-full border border-forest/20 px-3 py-1.5 text-xs font-semibold text-forest-deep hover:bg-forest/10"
                  >
                    <Plus className="h-3.5 w-3.5" /> حجم جديد
                  </button>
                </div>
              )}
            </div>
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
