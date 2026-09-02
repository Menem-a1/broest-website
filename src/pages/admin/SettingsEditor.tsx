// =====================================================
// ملف: SettingsEditor.tsx
// الغرض: تعديل رقم التليفون، واتساب، العنوان، ساعات العمل
// =====================================================
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { ImageUploadField } from "@/components/admin/ImageUploadField";
import { OrderingPauseControl } from "@/components/admin/OrderingPauseControl";
import { FooterSettingsControl } from "@/components/admin/FooterSettingsControl";
import { Loader2, Save, Check, CreditCard } from "lucide-react";

type Settings = {
  name_ar: string;
  phone_display: string;
  whatsapp_number: string;
  address_ar: string;
  hours_ar: string;
  avg_spend_ar: string;
  logo_url: string | null;
  favicon_url: string | null;
  payment_gateway_enabled: boolean;
  paymob_api_key: string;
  paymob_integration_id: string;
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

  // بتتنادى فورًا لما صورة جديدة تترفع (شعار أو أيقونة)، عشان تتحفظ على طول
  async function saveField(field: "logo_url" | "favicon_url", url: string | null) {
    setSettings((prev) => (prev ? { ...prev, [field]: url } : prev));
    await supabase
      .from("restaurant_settings")
      .update({ [field]: url })
      .eq("id", 1);
  }

  if (loading || !settings) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-fire" />
      </div>
    );
  }

  const fields: { key: keyof Omit<Settings, "logo_url" | "favicon_url" | "payment_gateway_enabled" | "paymob_api_key" | "paymob_integration_id">; label: string; hint?: string; dir?: string }[] = [
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

      <div className="mt-6">
        <OrderingPauseControl />
      </div>

      <div className="mt-6">
        <FooterSettingsControl />
      </div>

      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-forest-deep">
            شعار الموقع
          </label>
          <p className="mb-2 text-xs text-muted-foreground">
            بيظهر في أعلى كل صفحات الموقع (الهيدر)
          </p>
          <ImageUploadField
            currentUrl={settings.logo_url}
            folder="branding"
            onUploaded={(url) => saveField("logo_url", url)}
            onRemoved={() => saveField("logo_url", null)}
            shape="circle"
            size="md"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-semibold text-forest-deep">
            أيقونة التبويب (Favicon)
          </label>
          <p className="mb-2 text-xs text-muted-foreground">
            الأيقونة الصغيرة اللي بتظهر في تبويب المتصفح
          </p>
          <ImageUploadField
            currentUrl={settings.favicon_url}
            folder="branding"
            onUploaded={(url) => saveField("favicon_url", url)}
            onRemoved={() => saveField("favicon_url", null)}
            shape="square"
            size="sm"
          />
        </div>
      </div>

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

      {/* إعدادات الدفع الإلكتروني */}
      <div className="mt-8 rounded-xl border border-forest/10 bg-white p-5">
        <div className="mb-1 flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-fire" />
          <h2 className="font-display text-lg font-semibold text-forest-deep">
            الدفع الإلكتروني
          </h2>
        </div>
        <p className="mb-4 text-xs text-muted-foreground">
          الكاش عند الاستلام شغال دايمًا. الدفع الإلكتروني (فيزا) هيبان للعملاء
          كخيار بس لو فعّلته هنا وحطيت بيانات حسابك في Paymob.
        </p>

        <label className="mb-4 flex items-center gap-2.5">
          <input
            type="checkbox"
            checked={settings.payment_gateway_enabled}
            onChange={(e) =>
              setSettings((prev) =>
                prev ? { ...prev, payment_gateway_enabled: e.target.checked } : prev
              )
            }
            className="h-5 w-5 accent-fire"
          />
          <span className="text-sm font-semibold text-forest-deep">
            فعّل الدفع الإلكتروني للعملاء
          </span>
        </label>

        <div className="flex flex-col gap-4">
          <div>
            <label className="mb-1 block text-sm font-semibold text-forest-deep">
              Paymob API Key
            </label>
            <input
              type="password"
              value={settings.paymob_api_key}
              onChange={(e) =>
                setSettings((prev) => (prev ? { ...prev, paymob_api_key: e.target.value } : prev))
              }
              className="w-full rounded-lg border border-forest/15 bg-white px-3 py-2.5 text-sm"
              dir="ltr"
              placeholder="هتلاقيه في حسابك على Paymob بعد التسجيل"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-forest-deep">
              Integration ID
            </label>
            <input
              value={settings.paymob_integration_id}
              onChange={(e) =>
                setSettings((prev) =>
                  prev ? { ...prev, paymob_integration_id: e.target.value } : prev
                )
              }
              className="w-full rounded-lg border border-forest/15 bg-white px-3 py-2.5 text-sm"
              dir="ltr"
            />
          </div>
        </div>

        <p className="mt-3 text-xs text-muted-foreground">
          لسه معملتش حساب في Paymob؟ سيب الخيار ده مقفول لحد ما تعمل الحساب —
          الموقع هيفضل شغال عادي بالكاش عند الاستلام.
        </p>
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
