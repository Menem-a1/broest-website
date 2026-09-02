// =====================================================
// ملف: Offers.tsx
// الغرض: صفحة عامة تعرض للعميل كل العروض والكوبونات النشطة
// الصفحة دي بتتظهر أو تتخفي بالكامل من إعداد المطور
// (offers_page_settings.is_page_enabled)
// =====================================================
import { Loader2, Percent, Tag, Copy, Check } from "lucide-react";
import { useState } from "react";
import { useOffers } from "@/lib/useOffers";

export function Offers() {
  const { offers, loading } = useOffers();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  function copyCoupon(code: string) {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 1500);
  }

  return (
    <div>
      <section className="bg-forest px-4 py-16 text-center md:px-8">
        <span className="font-display text-xs font-semibold uppercase tracking-widest text-fire-light">
          عروضنا
        </span>
        <h1 className="mx-auto mt-2 max-w-2xl font-display text-4xl font-bold text-cream md:text-5xl">
          عروض وخصومات لعملائنا
        </h1>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 md:px-8">
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-fire" />
          </div>
        ) : offers.length === 0 ? (
          <div className="py-16 text-center">
            <Percent className="mx-auto h-10 w-10 text-muted-foreground" />
            <p className="mt-3 text-sm text-muted-foreground">
              مفيش عروض متاحة دلوقتي، تابعنا عشان توصلك أول ما نطلق عرض جديد
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {offers.map((offer) => (
              <div
                key={offer.id}
                className="flex flex-col overflow-hidden rounded-xl border border-forest/10 bg-white"
              >
                {offer.imageUrl && (
                  <img
                    src={offer.imageUrl}
                    alt={offer.titleAr}
                    className="h-48 w-full object-cover"
                  />
                )}
                <div className="flex flex-1 flex-col gap-3 p-5">
                  <div className="flex items-center gap-2">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-fire/10 text-fire">
                      <Percent className="h-4 w-4" />
                    </span>
                    <h3 className="font-display text-lg font-bold text-forest-deep">
                      {offer.titleAr}
                    </h3>
                  </div>

                  {offer.descriptionAr && (
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {offer.descriptionAr}
                    </p>
                  )}

                  <p className="font-price text-xl font-bold text-fire">
                    {offer.discountType === "percentage"
                      ? `خصم ${offer.discountValue}%`
                      : `خصم ${offer.discountValue} ج.م`}
                  </p>

                  {offer.couponCode && (
                    <button
                      onClick={() => copyCoupon(offer.couponCode!)}
                      className="mt-auto flex items-center justify-center gap-2 rounded-lg border-2 border-dashed border-forest/20 px-3 py-2.5 font-price text-sm font-bold text-forest-deep transition-colors hover:border-fire"
                      dir="ltr"
                    >
                      <Tag className="h-4 w-4" />
                      {offer.couponCode}
                      {copiedCode === offer.couponCode ? (
                        <Check className="h-4 w-4 text-emerald-600" />
                      ) : (
                        <Copy className="h-4 w-4 text-muted-foreground" />
                      )}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
