// =====================================================
// ملف: Offers.tsx
// الغرض: صفحة عامة تعرض العروض (الباقات) للعميل، زي أي صنف
// عادي في المنيو — سعر إجمالي واحد للباقة كلها
// =====================================================
import { Loader2, Percent, Gift, Plus, Check } from "lucide-react";
import { useState } from "react";
import { useOffers } from "@/lib/useOffers";
import { useCart } from "@/context/CartContext";

export function Offers() {
  const { offers, loading } = useOffers();
  const { addRawLine, setCartOpen } = useCart();
  const [addedId, setAddedId] = useState<string | null>(null);

  function addOfferToCart(offer: (typeof offers)[number]) {
    // بنضيف الأصناف المدفوعة بنسبة من سعر الباقة (موزّع بالتساوي)
    // والأصناف المجانية بسعر صفر — كله بيتحط في السلة كأصناف عادية
    // باسم واضح إنها جزء من عرض، عشان يبان في تفاصيل الطلب
    const paidCount = offer.paidItems.reduce((sum, i) => sum + i.quantity, 0) || 1;
    // floor مش round — عشان مجموع الوحدات عمره ما يعدّي سعر الباقة.
    // والـ 1e-9 بيحمي من أخطاء الفاصلة العائمة (زي 8.2 * 100 = 819.9999999999999)
    const pricePerPaidUnit = Math.floor((offer.bundlePrice / paidCount) * 100 + 1e-9) / 100;

    offer.paidItems.forEach((item) => {
      addRawLine({
        itemId: `offer-${offer.id}-${item.itemId}`,
        nameAr: `${item.nameAr} (عرض: ${offer.titleAr})`,
        unitPrice: pricePerPaidUnit,
        qty: item.quantity,
      });
    });

    offer.freeItems.forEach((item) => {
      addRawLine({
        itemId: `offer-${offer.id}-free-${item.itemId}`,
        nameAr: `${item.nameAr} (هدية مع عرض: ${offer.titleAr})`,
        unitPrice: 0,
        qty: item.quantity,
      });
    });

    setAddedId(offer.id);
    setTimeout(() => setAddedId(null), 1200);
    setCartOpen(true);
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
                  <h3 className="font-display text-lg font-bold text-forest-deep">
                    {offer.titleAr}
                  </h3>

                  {offer.descriptionAr && (
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {offer.descriptionAr}
                    </p>
                  )}

                  <ul className="flex flex-col gap-1 text-sm">
                    {offer.paidItems.map((item, i) => (
                      <li key={`paid-${i}`} className="text-forest-deep/80">
                        {item.quantity}× {item.nameAr}
                      </li>
                    ))}
                    {offer.freeItems.map((item, i) => (
                      <li key={`free-${i}`} className="flex items-center gap-1.5 font-bold text-fire">
                        <Gift className="h-3.5 w-3.5" />
                        {item.quantity}× {item.nameAr} — هدية
                      </li>
                    ))}
                  </ul>

                  <div className="mt-auto flex items-center justify-between gap-2 pt-2">
                    <span className="font-price text-xl font-bold text-fire">
                      {offer.bundlePrice} ج.م
                    </span>
                    <button
                      onClick={() => addOfferToCart(offer)}
                      className="flex items-center gap-1.5 rounded-full bg-forest px-4 py-2 text-sm font-bold text-cream hover:bg-forest-deep"
                    >
                      {addedId === offer.id ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Plus className="h-4 w-4" />
                      )}
                      اطلب العرض
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
