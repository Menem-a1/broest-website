// =====================================================
// ملف: SettingsEditor.tsx
// الغرض: تعديل رقم التليفون، واتساب، العنوان، ساعات العمل
// =====================================================
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Loader2, Save, Check } from "lucide-react";

type Settings = {
  name_ar: string;
  phone_display: string;
  whatsapp_number: string;
  address_ar: string;
  hours_ar: string;
  avg_spend_ar: string;
};

export function SettingsEditor() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("restaurant_settings")
        .select("*")
        .eq("id", 1)
        .single();
      if (data) setSettings(data);
      setLoading(false);
    }
    load();
  }, []);

  async function handleSave() {
    if (!settings) return;
    setSaving(true);
    const { error } = await supabase
      .from("restaurant_settings")
      .update(settings)
      .eq("id", 1);
    setSaving(false);
    if (!error) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } else {
      alert("حصلت مشكلة في الحفظ، حاول تاني");
    }
  }

  if (loading || !settings) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-fire" />
      </div>
    );
  }

  const fields: { key: keyof Settings; label: string; hint?: string; dir?: string }[] = [
    { key: "name_ar", label: "اسم المطعم" },
    { key: "phone_display", label: "رقم التليفون (اللي بيظهر للعملاء)", hint: "مثال: 0120 259 4444" },
    {
      key: "whatsapp_number",
      label: "رقم الواتساب",
      hint: "بالصيغة الدولية من غير + أو مسافات، مثال: 201202594444",
      dir: "ltr",
    },
    { key: "address_ar", label: "العنوان" },
    { key: "hours_ar", label: "مواعيد العمل" },
    { key: "avg_spend_ar", label: "متوسط الإنفاق للفرد" },
  ];

  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-2xl font-bold text-forest-deep">إعدادات المطعم</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        الحقول دي بتظهر في كل الموقع (الهيدر، الفوتر، زرار الواتساب، إلخ)
      </p>

      <div className="mt-6 flex flex-col gap-4">
        {fields.map((field) => (
          <div key={field.key}>
            <label className="mb-1 block text-sm font-semibold text-forest-deep">
              {field.label}
            </label>
            <input
              value={settings[field.key]}
              onChange={(e) =>
                setSettings((prev) => (prev ? { ...prev, [field.key]: e.target.value } : prev))
              }
              className="w-full rounded-lg border border-forest/15 bg-white px-3 py-2.5 text-sm"
              dir={field.dir}
            />
            {field.hint && (
              <p className="mt-1 text-xs text-muted-foreground">{field.hint}</p>
            )}
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
