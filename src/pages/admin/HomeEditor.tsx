// =====================================================
// ملف: HomeEditor.tsx
// الغرض: تعديل كل نصوص وصورة الصفحة الرئيسية من لوحة التحكم
// =====================================================
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { ImageUploadField } from "@/components/admin/ImageUploadField";
import { Loader2, Save, Check } from "lucide-react";

type HomeContentRow = {
  hero_badge_text: string;
  hero_title_line1: string;
  hero_title_line2: string;
  hero_description: string;
  hero_image_url: string | null;
  why_us_title_1: string;
  why_us_desc_1: string;
  why_us_title_2: string;
  why_us_desc_2: string;
  why_us_title_3: string;
  why_us_desc_3: string;
};

export function HomeEditor() {
  const [data, setData] = useState<HomeContentRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function load() {
      const { data: row } = await supabase.from("home_content").select("*").eq("id", 1).single();
      if (row) setData(row);
      setLoading(false);
    }
    load();
  }, []);

  async function handleSave() {
    if (!data) return;
    setSaving(true);
    const { error } = await supabase.from("home_content").update(data).eq("id", 1);
    setSaving(false);
    if (!error) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } else {
      alert("حصلت مشكلة في الحفظ، حاول تاني");
    }
  }

  function updateField<K extends keyof HomeContentRow>(key: K, value: HomeContentRow[K]) {
    setData((prev) => (prev ? { ...prev, [key]: value } : prev));
  }

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-fire" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-2xl font-bold text-forest-deep">الصفحة الرئيسية</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        عدّل النصوص والصورة اللي بتظهر أول ما حد يفتح الموقع
      </p>

      {/* قسم الـ Hero */}
      <div className="mt-6 rounded-xl border border-forest/10 bg-white p-5">
        <h2 className="mb-4 font-display text-lg font-semibold text-forest-deep">
          القسم العلوي (Hero)
        </h2>

        <div className="flex flex-col gap-4">
          <div>
            <label className="mb-1 block text-sm font-semibold text-forest-deep">
              صورة القسم العلوي
            </label>
            <ImageUploadField
              currentUrl={data.hero_image_url}
              folder="hero"
              onUploaded={(url) => updateField("hero_image_url", url)}
              onRemoved={() => updateField("hero_image_url", null)}
              size="lg"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              لو مفيش صورة، هيظهر الشكل الافتراضي (الدائرة البرتقالية)
            </p>
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-forest-deep">
              الشارة الصغيرة فوق العنوان
            </label>
            <input
              value={data.hero_badge_text}
              onChange={(e) => updateField("hero_badge_text", e.target.value)}
              className="w-full rounded-lg border border-forest/15 px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-forest-deep">
              العنوان الرئيسي — السطر الأول
            </label>
            <input
              value={data.hero_title_line1}
              onChange={(e) => updateField("hero_title_line1", e.target.value)}
              className="w-full rounded-lg border border-forest/15 px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-forest-deep">
              العنوان الرئيسي — السطر الثاني (بيظهر بلون برتقالي)
            </label>
            <input
              value={data.hero_title_line2}
              onChange={(e) => updateField("hero_title_line2", e.target.value)}
              className="w-full rounded-lg border border-forest/15 px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-forest-deep">
              الوصف اللي تحت العنوان
            </label>
            <textarea
              value={data.hero_description}
              onChange={(e) => updateField("hero_description", e.target.value)}
              rows={3}
              className="w-full resize-none rounded-lg border border-forest/15 px-3 py-2 text-sm"
            />
          </div>
        </div>
      </div>

      {/* قسم "ليه بروست" */}
      <div className="mt-6 rounded-xl border border-forest/10 bg-white p-5">
        <h2 className="mb-4 font-display text-lg font-semibold text-forest-deep">
          قسم "ليه بروست" (3 مربعات)
        </h2>

        {[1, 2, 3].map((num) => (
          <div key={num} className="mb-4 border-b border-forest/5 pb-4 last:mb-0 last:border-0 last:pb-0">
            <p className="mb-2 text-xs font-semibold text-fire">المربع {num}</p>
            <div className="flex flex-col gap-2">
              <input
                value={data[`why_us_title_${num}` as keyof HomeContentRow] as string}
                onChange={(e) =>
                  updateField(`why_us_title_${num}` as keyof HomeContentRow, e.target.value as never)
                }
                placeholder="العنوان"
                className="w-full rounded-lg border border-forest/15 px-3 py-2 text-sm"
              />
              <textarea
                value={data[`why_us_desc_${num}` as keyof HomeContentRow] as string}
                onChange={(e) =>
                  updateField(`why_us_desc_${num}` as keyof HomeContentRow, e.target.value as never)
                }
                placeholder="الوصف"
                rows={2}
                className="w-full resize-none rounded-lg border border-forest/15 px-3 py-2 text-sm"
              />
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="mt-6 flex items-center gap-2 rounded-full bg-fire px-6 py-3 font-display text-sm font-bold text-forest-deep transition-transform hover:scale-[1.02] active:scale-95 disabled:opacity-60"
      >
        {saving ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> بيحفظ...
          </>
        ) : saved ? (
          <>
            <Check className="h-4 w-4" /> اتحفظ
          </>
        ) : (
          <>
            <Save className="h-4 w-4" /> حفظ التغييرات
          </>
        )}
      </button>
    </div>
  );
}
