import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Loader2, Save, Check, Ban, Play } from "lucide-react";

export function OrderingPauseControl() {
  const [isPaused, setIsPaused] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("ordering_status")
        .select("*")
        .eq("id", 1)
        .single();
      setIsPaused(data?.is_ordering_paused ?? false);
      setMessage(data?.paused_message ?? "");
      setLoading(false);
    }
    load();
  }, []);

  async function toggle() {
    const newValue = !isPaused;
    setIsPaused(newValue);
    await supabase.from("ordering_status").update({ is_ordering_paused: newValue }).eq("id", 1);
  }

  async function saveMessage() {
    setSaving(true);
    const { error } = await supabase
      .from("ordering_status")
      .update({ paused_message: message })
      .eq("id", 1);
    setSaving(false);
    if (!error) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-6">
        <Loader2 className="h-5 w-5 animate-spin text-fire" />
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-forest/10 bg-white p-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-display text-base font-semibold text-forest-deep">
            استقبال الطلبات
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {isPaused
              ? "الموقع شغال، بس الطلبات متوقفة دلوقتي"
              : "الموقع بيستقبل طلبات عادي"}
          </p>
        </div>
        <button
          onClick={toggle}
          className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-bold transition-colors ${
            isPaused
              ? "bg-emerald-600 text-white hover:bg-emerald-700"
              : "bg-chili text-white hover:opacity-90"
          }`}
        >
          {isPaused ? <Play className="h-4 w-4" /> : <Ban className="h-4 w-4" />}
          {isPaused ? "فعّل الاستقبال" : "أوقف الاستقبال"}
        </button>
      </div>

      {isPaused && (
        <div className="mt-4 border-t border-forest/5 pt-4">
          <label className="mb-1.5 block text-sm font-semibold text-forest-deep">
            الرسالة اللي هتظهر للعميل
          </label>
          <div className="flex gap-2">
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="flex-1 rounded-lg border border-forest/20 px-3 py-2 text-sm"
            />
            <button
              onClick={saveMessage}
              disabled={saving}
              className="flex items-center gap-1.5 rounded-full bg-fire px-4 py-2 text-sm font-bold text-forest-deep disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : saved ? (
                <Check className="h-4 w-4" />
              ) : (
                <Save className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
