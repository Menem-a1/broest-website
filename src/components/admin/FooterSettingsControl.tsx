import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Loader2, Save, Check } from "lucide-react";

type Data = {
  designer_name: string;
  designer_show_name: boolean;
  designer_show_contact: boolean;
  designer_contact_url: string;
  designer_font_size: number;
  designer_opacity: number;
  facebook_url: string;
  instagram_url: string;
  whatsapp_url: string;
};

export function FooterSettingsControl() {
  const [data, setData] = useState<Data | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    supabase
      .from("footer_settings")
      .select("*")
      .eq("id", 1)
      .single()
      .then(({ data }) => {
        if (data) setData(data);
        setLoading(false);
      });
  }, []);

  async function save() {
    if (!data) return;
    setSaving(true);
    const { error } = await supabase.from("footer_settings").update(data).eq("id", 1);
    setSaving(false);
    if (!error) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  }

  if (loading || !data) {
    return (
      <div className="flex justify-center py-6">
        <Loader2 className="h-5 w-5 animate-spin text-fire" />
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-forest/10 bg-white p-5">
      <h3 className="font-display text-base font-semibold text-forest-deep">
        روابط السوشيال ميديا
      </h3>
      <p className="mt-1 text-sm text-muted-foreground">
        سيب أي حقل فاضي عشان الأيقونة بتاعته متظهرش في الموقع
      </p>
      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        <input
          value={data.facebook_url}
          onChange={(e) => setData({ ...data, facebook_url: e.target.value })}
          placeholder="لينك فيسبوك"
          className="rounded-lg border border-forest/20 px-3 py-2 text-sm"
          dir="ltr"
        />
        <input
          value={data.instagram_url}
          onChange={(e) => setData({ ...data, instagram_url: e.target.value })}
          placeholder="لينك إنستجرام"
          className="rounded-lg border border-forest/20 px-3 py-2 text-sm"
          dir="ltr"
        />
        <input
          value={data.whatsapp_url}
          onChange={(e) => setData({ ...data, whatsapp_url: e.target.value })}
          placeholder="لينك واتساب (wa.me/...)"
          className="rounded-lg border border-forest/20 px-3 py-2 text-sm"
          dir="ltr"
        />
      </div>

      <div className="mt-6 border-t border-forest/5 pt-5">
        <h3 className="font-display text-base font-semibold text-forest-deep">
          توقيع أسفل الصفحة
        </h3>
        <div className="mt-3 flex flex-col gap-3">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={data.designer_show_name}
              onChange={(e) => setData({ ...data, designer_show_name: e.target.checked })}
            />
            إظهار التوقيع
          </label>

          {data.designer_show_name && (
            <>
              <input
                value={data.designer_name}
                onChange={(e) => setData({ ...data, designer_name: e.target.value })}
                placeholder="اسمك (مصمم الصفحة / ويب ديفلوبر)"
                className="rounded-lg border border-forest/20 px-3 py-2 text-sm"
              />

              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={data.designer_show_contact}
                  onChange={(e) => setData({ ...data, designer_show_contact: e.target.checked })}
                />
                إظهار كلمة "تواصل" جنب الاسم (تودي للينك اللي تحطه)
              </label>

              {data.designer_show_contact && (
                <input
                  value={data.designer_contact_url}
                  onChange={(e) => setData({ ...data, designer_contact_url: e.target.value })}
                  placeholder="اللينك اللي هتودي له كلمة تواصل"
                  className="rounded-lg border border-forest/20 px-3 py-2 text-sm"
                  dir="ltr"
                />
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-muted-foreground">
                    حجم الخط (px)
                  </label>
                  <input
                    type="number"
                    min="8"
                    max="20"
                    value={data.designer_font_size}
                    onChange={(e) =>
                      setData({ ...data, designer_font_size: parseInt(e.target.value) || 12 })
                    }
                    className="w-full rounded-lg border border-forest/20 px-3 py-2 text-sm"
                    dir="ltr"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-muted-foreground">
                    الشفافية (0.1 - 1)
                  </label>
                  <input
                    type="number"
                    min="0.1"
                    max="1"
                    step="0.1"
                    value={data.designer_opacity}
                    onChange={(e) =>
                      setData({ ...data, designer_opacity: parseFloat(e.target.value) || 0.6 })
                    }
                    className="w-full rounded-lg border border-forest/20 px-3 py-2 text-sm"
                    dir="ltr"
                  />
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <button
        onClick={save}
        disabled={saving}
        className="mt-4 flex items-center gap-1.5 rounded-full bg-fire px-4 py-2 text-sm font-bold text-forest-deep disabled:opacity-50"
      >
        {saving ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : saved ? (
          <Check className="h-4 w-4" />
        ) : (
          <Save className="h-4 w-4" />
        )}
        حفظ
      </button>
    </div>
  );
}
