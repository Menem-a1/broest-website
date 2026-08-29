import { Star, Loader2 } from "lucide-react";
import { useReviews } from "@/lib/useReviews";

// قيم التقييم — ثابتة هنا لأنها مش محتاجة تتعدل كل يوم
const RATING_VALUE = 4.2;
const RATING_COUNT = 930;

export function About() {
  const { reviews, loading } = useReviews();

  return (
    <div>
      <section className="bg-forest px-4 py-16 text-center md:px-8">
        <span className="font-display text-xs font-semibold uppercase tracking-widest text-fire-light">
          حكايتنا
        </span>
        <h1 className="mx-auto mt-2 max-w-2xl font-display text-4xl font-bold text-cream md:text-5xl">
          بدأنا بفكرة بسيطة: دجاج تندوري حقيقي
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-cream/70">
          مش مجرد بروست تاني. بروست بيقدملك وصفة تندوري مميزة، ومكونات طازة كل يوم،
          عشان كل قضمة تفرق.
        </p>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 md:px-8">
        <div className="grid gap-8 md:grid-cols-3">
          {[
            { num: "٥", label: "سنين خبرة في الدجاج المقرمش" },
            { num: "٩٣٠+", label: "تقييم من عملاء حقيقيين" },
            { num: "٤.٢", label: "تقييم متوسط من ٥" },
          ].map((s, i) => (
            <div key={i} className="rounded-xl border border-forest/10 bg-paper p-8 text-center">
              <div className="font-display text-4xl font-bold text-fire">{s.num}</div>
              <p className="mt-2 text-sm text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-paper px-4 py-16 md:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="font-display text-3xl font-bold text-forest-deep">آراء عملائنا</h2>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Star className="h-4 w-4 fill-fire text-fire" />
              <span className="font-semibold text-forest-deep">{RATING_VALUE}</span>
              <span>({RATING_COUNT} تقييم)</span>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-fire" />
            </div>
          ) : (
            <>
              <div className="grid gap-4 md:grid-cols-3">
                {reviews.map((r) => (
                  <div key={r.id} className="rounded-xl border border-forest/10 bg-white p-5">
                    <div className="mb-2 flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, s) => (
                        <Star
                          key={s}
                          className={`h-3.5 w-3.5 ${
                            s < r.stars ? "fill-fire text-fire" : "fill-muted text-muted"
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-sm leading-relaxed text-forest-deep/80">{r.reviewText}</p>
                    <p className="mt-3 font-display text-xs font-semibold text-muted-foreground">
                      — {r.customerName}
                    </p>
                  </div>
                ))}
              </div>
              {reviews.length === 0 && (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  لسه مفيش مراجعات معروضة
                </p>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
}
