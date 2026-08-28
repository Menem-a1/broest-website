// =====================================================
// ملف: BranchesEditor.tsx
// الغرض: إضافة/تعديل/حذف فروع المطعم — كل فرع بعنوانه،
// تليفونه، واتسابه، موقعه على الخريطة، ومواعيد عمله
// =====================================================
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Trash2, Plus, Save, Loader2, EyeOff, Eye, Check, MapPinned } from "lucide-react";

type DbBranch = {
  id: string;
  name_ar: string;
  address_ar: string;
  phone_display: string;
  whatsapp_number: string;
  latitude: number | null;
  longitude: number | null;
  google_maps_url: string;
  opens_at: string;
  closes_at: string;
  is_active: boolean;
};

const EMPTY_BRANCH = {
  name_ar: "فرع جديد",
  address_ar: "",
  phone_display: "",
  whatsapp_number: "",
  latitude: null,
  longitude: null,
  google_maps_url: "",
  opens_at: "10:00",
  closes_at: "02:00",
  is_active: true,
};

export function BranchesEditor() {
  const [branches, setBranches] = useState<DbBranch[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);

  async function loadBranches() {
    setLoading(true);
    const { data } = await supabase.from("branches").select("*").order("sort_order");
    setBranches(data || []);
    setLoading(false);
  }

  useEffect(() => {
    loadBranches();
  }, []);

  function updateLocal(id: string, patch: Partial<DbBranch>) {
    setBranches((prev) => prev.map((b) => (b.id === id ? { ...b, ...patch } : b)));
  }

  async function saveBranch(branch: DbBranch) {
    setSavingId(branch.id);
    const { error } = await supabase
      .from("branches")
      .update({
        name_ar: branch.name_ar,
        address_ar: branch.address_ar,
        phone_display: branch.phone_display,
        whatsapp_number: branch.whatsapp_number,
        latitude: branch.latitude,
        longitude: branch.longitude,
        google_maps_url: branch.google_maps_url,
        opens_at: branch.opens_at,
        closes_at: branch.closes_at,
        is_active: branch.is_active,
      })
      .eq("id", branch.id);
    setSavingId(null);
    if (!error) {
      setSavedId(branch.id);
      setTimeout(() => setSavedId(null), 1500);
    } else {
      alert("حصلت مشكلة في الحفظ، حاول تاني");
    }
  }

  async function deleteBranch(id: string) {
    if (!confirm("متأكد إنك عايز تحذف الفرع ده؟")) return;
    const { error } = await supabase.from("branches").delete().eq("id", id);
    if (!error) {
      setBranches((prev) => prev.filter((b) => b.id !== id));
    } else {
      alert("حصلت مشكلة في الحذف، حاول تاني");
    }
  }

  async function addBranch() {
    const { error } = await supabase
      .from("branches")
      .insert({ ...EMPTY_BRANCH, sort_order: branches.length });
    if (!error) {
      loadBranches();
    } else {
      alert("حصلت مشكلة في الإضافة، حاول تاني");
    }
  }

  // بتساعد تستخرج خط الطول والعرض من رابط جوجل ماب اللي بتنسخه من التطبيق
  function extractCoordsFromUrl(branch: DbBranch, url: string) {
    updateLocal(branch.id, { google_maps_url: url });
    const match = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (match) {
      updateLocal(branch.id, {
        google_maps_url: url,
        latitude: parseFloat(match[1]),
        longitude: parseFloat(match[2]),
      });
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
          <h1 className="font-display text-2xl font-bold text-forest-deep">الفروع</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            كل فرع بعنوانه ورقمه ومواعيده وموقعه على الخريطة
          </p>
        </div>
        <button
          onClick={addBranch}
          className="flex items-center gap-1.5 rounded-full bg-forest px-4 py-2 text-sm font-semibold text-cream hover:bg-forest-deep"
        >
          <Plus className="h-4 w-4" /> فرع جديد
        </button>
      </div>

      <div className="flex flex-col gap-4">
        {branches.map((branch) => (
          <div
            key={branch.id}
            className={`rounded-xl border bg-white p-5 transition-opacity ${
              branch.is_active ? "border-forest/10" : "border-forest/10 opacity-50"
            }`}
          >
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-semibold text-muted-foreground">
                  اسم الفرع
                </label>
                <input
                  value={branch.name_ar}
                  onChange={(e) => updateLocal(branch.id, { name_ar: e.target.value })}
                  className="w-full rounded-lg border border-forest/15 px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-muted-foreground">
                  العنوان
                </label>
                <input
                  value={branch.address_ar}
                  onChange={(e) => updateLocal(branch.id, { address_ar: e.target.value })}
                  className="w-full rounded-lg border border-forest/15 px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-muted-foreground">
                  رقم التليفون
                </label>
                <input
                  value={branch.phone_display}
                  onChange={(e) => updateLocal(branch.id, { phone_display: e.target.value })}
                  className="w-full rounded-lg border border-forest/15 px-3 py-2 text-sm"
                  dir="ltr"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-muted-foreground">
                  رقم الواتساب (بالصيغة الدولية)
                </label>
                <input
                  value={branch.whatsapp_number}
                  onChange={(e) => updateLocal(branch.id, { whatsapp_number: e.target.value })}
                  className="w-full rounded-lg border border-forest/15 px-3 py-2 text-sm"
                  dir="ltr"
                  placeholder="201xxxxxxxxx"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-muted-foreground">
                  وقت الفتح
                </label>
                <input
                  type="time"
                  value={branch.opens_at}
                  onChange={(e) => updateLocal(branch.id, { opens_at: e.target.value })}
                  className="w-full rounded-lg border border-forest/15 px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-muted-foreground">
                  وقت القفل
                </label>
                <input
                  type="time"
                  value={branch.closes_at}
                  onChange={(e) => updateLocal(branch.id, { closes_at: e.target.value })}
                  className="w-full rounded-lg border border-forest/15 px-3 py-2 text-sm"
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  لو بيقفل بعد نص الليل (زي 2 صباحًا)، اكتب 02:00 عادي
                </p>
              </div>

              <div className="md:col-span-2">
                <label className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                  <MapPinned className="h-3.5 w-3.5" /> رابط جوجل ماب
                </label>
                <input
                  value={branch.google_maps_url}
                  onChange={(e) => extractCoordsFromUrl(branch, e.target.value)}
                  className="w-full rounded-lg border border-forest/15 px-3 py-2 text-sm"
                  dir="ltr"
                  placeholder="افتح الفرع في تطبيق جوجل ماب، انسخ الرابط، والصقه هنا"
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  {branch.latitude && branch.longitude
                    ? `✅ الموقع متحدد (${branch.latitude.toFixed(4)}, ${branch.longitude.toFixed(4)})`
                    : "لسه محتاج تحط رابط جوجل ماب عشان الخريطة تظهر في الموقع"}
                </p>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2 border-t border-forest/5 pt-4">
              <button
                onClick={() => saveBranch(branch)}
                disabled={savingId === branch.id}
                className="flex items-center gap-1.5 rounded-full bg-fire px-4 py-2 text-sm font-semibold text-forest-deep hover:opacity-90 disabled:opacity-50"
              >
                {savingId === branch.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : savedId === branch.id ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                حفظ
              </button>
              <button
                onClick={() => {
                  const updated = { ...branch, is_active: !branch.is_active };
                  updateLocal(branch.id, { is_active: updated.is_active });
                  saveBranch(updated);
                }}
                className="flex items-center gap-1.5 rounded-full border border-forest/20 px-4 py-2 text-sm font-semibold text-forest-deep hover:bg-forest/5"
              >
                {branch.is_active ? (
                  <>
                    <Eye className="h-4 w-4" /> نشط
                  </>
                ) : (
                  <>
                    <EyeOff className="h-4 w-4" /> غير نشط
                  </>
                )}
              </button>
              <button
                onClick={() => deleteBranch(branch.id)}
                className="flex items-center gap-1.5 rounded-full border border-chili/30 px-4 py-2 text-sm font-semibold text-chili hover:bg-chili/10"
              >
                <Trash2 className="h-4 w-4" /> حذف
              </button>
            </div>
          </div>
        ))}

        {branches.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">مفيش فروع مضافة لسه</p>
        )}
      </div>
    </div>
  );
}
