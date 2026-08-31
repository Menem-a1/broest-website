// =====================================================
// ملف: ReviewsEditor.tsx
// الغرض: إضافة/تعديل/حذف/إخفاء المراجعات اللي بتظهر
// في صفحة "عن بروست"
// =====================================================
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Trash2, Plus, Save, Loader2, EyeOff, Eye, Check, Star } from "lucide-react";

type DbReview = {
  id: string;
  customer_name: string;
  stars: number;
  review_text: string;
  is_visible: boolean;
};

export function ReviewsEditor() {
  const [reviews, setReviews] = useState<DbReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);

  async function loadReviews() {
    setLoading(true);
    const { data } = await supabase
      .from("reviews")
      .select("id, customer_name, stars, review_text, is_visible")
      .order("sort_order");
    setReviews(data || []);
    setLoading(false);
  }

  useEffect(() => {
    loadReviews();
  }, []);

  function updateLocal(id: string, patch: Partial<DbReview>) {
    setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }

  async function saveReview(review: DbReview) {
    setSavingId(review.id);
    const { error } = await supabase
      .from("reviews")
      .update({
        customer_name: review.customer_name,
        stars: review.stars,
        review_text: review.review_text,
        is_visible: review.is_visible,
      })
      .eq("id", review.id);
    setSavingId(null);
    if (!error) {
      setSavedId(review.id);
      setTimeout(() => setSavedId(null), 1500);
    } else {
      console.error("خطأ في حفظ المراجعة:", error);
      alert(`حصلت مشكلة في الحفظ:\n${error.message}`);
    }
  }

  async function deleteReview(id: string) {
    if (!confirm("متأكد إنك عايز تحذف المراجعة دي؟")) return;
    const { error } = await supabase.from("reviews").delete().eq("id", id);
    if (!error) {
      setReviews((prev) => prev.filter((r) => r.id !== id));
    } else {
      console.error("خطأ في حذف المراجعة:", error);
      alert(`حصلت مشكلة في الحذف:\n${error.message}`);
    }
  }

  async function addReview() {
    const { error } = await supabase.from("reviews").insert({
      customer_name: "اسم العميل",
      stars: 5,
      review_text: "اكتب رأي العميل هنا",
      is_visible: true,
      sort_order: reviews.length,
    });
    if (!error) {
      loadReviews();
    } else {
      console.error("خطأ في إضافة المراجعة:", error);
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
          <h1 className="font-display text-2xl font-bold text-forest-deep">المراجعات</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            المراجعات اللي بتظهر في صفحة "عن بروست"
          </p>
        </div>
        <button
          onClick={addReview}
          className="flex items-center gap-1.5 rounded-full bg-forest px-4 py-2 text-sm font-semibold text-cream hover:bg-forest-deep"
        >
          <Plus className="h-4 w-4" /> مراجعة جديدة
        </button>
      </div>

      <div className="flex flex-col gap-3">
        {reviews.map((review) => (
          <div
            key={review.id}
            className={`rounded-xl border bg-white p-4 transition-opacity ${
              review.is_visible ? "border-forest/10" : "border-forest/10 opacity-50"
            }`}
          >
            <div className="grid gap-3 md:grid-cols-[1.5fr_auto_3fr_auto]">
              <div>
                <label className="mb-1 block text-xs font-semibold text-muted-foreground">
                  اسم العميل
                </label>
                <input
                  value={review.customer_name}
                  onChange={(e) => updateLocal(review.id, { customer_name: e.target.value })}
                  className="w-full rounded-lg border border-forest/15 px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-muted-foreground">
                  التقييم
                </label>
                <div className="flex gap-0.5 pt-2">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => updateLocal(review.id, { stars: n })}
                    >
                      <Star
                        className={`h-5 w-5 ${
                          n <= review.stars ? "fill-fire text-fire" : "fill-muted text-muted"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-muted-foreground">
                  نص المراجعة
                </label>
                <textarea
                  value={review.review_text}
                  onChange={(e) => updateLocal(review.id, { review_text: e.target.value })}
                  rows={2}
                  className="w-full resize-none rounded-lg border border-forest/15 px-3 py-2 text-sm"
                />
              </div>

              <div className="flex items-end gap-1.5">
                <button
                  onClick={() => saveReview(review)}
                  disabled={savingId === review.id}
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-fire text-forest-deep hover:opacity-90 disabled:opacity-50"
                  title="حفظ"
                >
                  {savingId === review.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : savedId === review.id ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                </button>
                <button
                  onClick={() => {
                    const updated = { ...review, is_visible: !review.is_visible };
                    updateLocal(review.id, { is_visible: updated.is_visible });
                    saveReview(updated);
                  }}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-forest/15 text-forest-deep hover:bg-forest/5"
                  title={review.is_visible ? "إخفاء" : "إظهار"}
                >
                  {review.is_visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </button>
                <button
                  onClick={() => deleteReview(review.id)}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-chili/30 text-chili hover:bg-chili/10"
                  title="حذف"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            {!review.is_visible && (
              <p className="mt-2 text-xs font-semibold text-chili">
                المراجعة دي مخفية دلوقتي، مش ظاهرة للعملاء
              </p>
            )}
          </div>
        ))}

        {reviews.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">مفيش مراجعات لسه</p>
        )}
      </div>
    </div>
  );
}
