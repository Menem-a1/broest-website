import { useMemo, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useCart } from "@/context/CartContext";
import { useCustomerAuth } from "@/context/CustomerAuthContext";
import { useBranches, isBranchOpenNow } from "@/lib/useBranches";
import { useDeliveryZones } from "@/lib/useDeliveryZones";
import { usePaymentSettings } from "@/lib/payment/usePaymentSettings";
import {
  Minus,
  Plus,
  Trash2,
  CheckCircle2,
  Loader2,
  User,
  Phone,
  MapPin,
  Banknote,
  CreditCard,
  Truck,
  Store,
} from "lucide-react";
import { saveOrder } from "@/lib/useOrders";
import type { FulfillmentInfo } from "@/lib/useOrders";
import type { PaymentMethod } from "@/lib/payment/types";

type Step = "cart" | "checkout" | "success";
type FulfillmentChoice = "delivery" | "pickup";

export function CartDrawer() {
  const { lines, changeQty, removeLine, totalPrice, isCartOpen, setCartOpen, clearCart } =
    useCart();
  const { session } = useCustomerAuth();
  const { branches } = useBranches();
  const { zones } = useDeliveryZones();
  const { settings: paymentSettings } = usePaymentSettings();

  const [step, setStep] = useState<Step>("cart");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [phone2, setPhone2] = useState("");
  const [address, setAddress] = useState("");
  const [fulfillmentType, setFulfillmentType] = useState<FulfillmentChoice>("delivery");
  const [selectedZoneId, setSelectedZoneId] = useState<string>("");
  const [selectedPickupBranchId, setSelectedPickupBranchId] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [displayNumber, setDisplayNumber] = useState<number | null>(null);

  const primaryBranch = branches[0];
  const isOpen = primaryBranch ? isBranchOpenNow(primaryBranch.opensAt, primaryBranch.closesAt) : true;

  const selectedZone = useMemo(
    () => zones.find((z) => z.id === selectedZoneId) || null,
    [zones, selectedZoneId]
  );
  const deliveryPrice = fulfillmentType === "delivery" ? (selectedZone?.deliveryPrice ?? 0) : 0;
  const grandTotal = totalPrice + deliveryPrice;

  // لما المستخدم يقفل السلة، نرجّعها لأول خطوة استعدادًا للمرة الجاية
  function handleOpenChange(open: boolean) {
    setCartOpen(open);
    if (!open) {
      setTimeout(() => {
        setStep("cart");
        setFormError(null);
        setPaymentMethod("cash");
      }, 300);
    }
  }

  async function handleConfirmOrder(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    // فحص أخير قبل إرسال الطلب فعليًا، حتى لو العميل فتح السلة قبل وقت القفل
    if (!isOpen) {
      setFormError("المطعم مقفول دلوقتي، جرب تطلب في مواعيد العمل");
      return;
    }

    if (!name.trim() || !phone.trim()) {
      setFormError("من فضلك املأ الاسم ورقم التليفون");
      return;
    }

    if (fulfillmentType === "delivery") {
      if (!selectedZoneId) {
        setFormError("من فضلك اختار منطقتك");
        return;
      }
      if (!address.trim()) {
        setFormError("من فضلك اكتب عنوانك بالتفصيل");
        return;
      }
    } else if (fulfillmentType === "pickup" && !selectedPickupBranchId) {
      setFormError("من فضلك اختار الفرع اللي هتستلم منه");
      return;
    }

    const fulfillment: FulfillmentInfo =
      fulfillmentType === "delivery"
        ? { type: "delivery", zoneId: selectedZoneId, deliveryPrice }
        : { type: "pickup", branchId: selectedPickupBranchId };

    setSubmitting(true);
    const result = await saveOrder(
      lines,
      totalPrice,
      {
        name: name.trim(),
        phone: phone.trim(),
        phone2: phone2.trim(),
        address: fulfillmentType === "delivery" ? address.trim() : "",
      },
      paymentMethod,
      fulfillment,
      { customerUserId: session?.user?.id }
    );
    setSubmitting(false);

    if (result.success) {
      setDisplayNumber(result.displayNumber);
      setStep("success");
      clearCart();
    } else {
      setFormError("حصلت مشكلة في إرسال الطلب، حاول تاني");
    }
  }

  return (
    <Sheet open={isCartOpen} onOpenChange={handleOpenChange}>
      <SheetContent side="left" className="flex min-h-0 w-full flex-col gap-0 border-forest bg-paper p-0 sm:max-w-md">
        <SheetHeader className="border-b border-forest/10 bg-forest px-5 py-4">
          <SheetTitle className="font-display text-xl text-cream">
            {step === "cart" && "سلة الطلب"}
            {step === "checkout" && "بيانات التوصيل"}
            {step === "success" && "تم استلام طلبك"}
          </SheetTitle>
        </SheetHeader>

        {/* ===== خطوة 1: السلة ===== */}
        {step === "cart" && (
          <>
            {lines.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-2 px-6 text-center text-muted-foreground">
                <span className="text-4xl">🍗</span>
                <p className="font-display text-lg">السلة فاضية</p>
                <p className="text-sm">اختار وجبتك المفضلة من المنيو وابدأ الطلب</p>
              </div>
            ) : (
              <>
                <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
                  <ul className="flex flex-col gap-3">
                    {lines.map((line) => (
                      <li
                        key={line.key}
                        className="flex items-center justify-between gap-3 rounded-lg border border-forest/10 bg-white p-3"
                      >
                        <div className="flex-1">
                          <p className="font-display text-sm font-semibold text-forest-deep">
                            {line.nameAr}{" "}
                            {line.size && <span className="text-fire">({line.size})</span>}
                          </p>
                          <p className="font-price text-sm text-muted-foreground">
                            {line.unitPrice} ج.م × {line.qty}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => changeQty(line.key, -1)}
                            className="flex h-7 w-7 items-center justify-center rounded-full border border-forest/20 text-forest-deep hover:bg-forest/5"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="w-4 text-center font-price font-semibold">
                            {line.qty}
                          </span>
                          <button
                            onClick={() => changeQty(line.key, 1)}
                            className="flex h-7 w-7 items-center justify-center rounded-full border border-forest/20 text-forest-deep hover:bg-forest/5"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => removeLine(line.key)}
                            className="flex h-7 w-7 items-center justify-center rounded-full text-chili hover:bg-chili/10"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={clearCart}
                    className="mt-3 text-xs text-muted-foreground underline underline-offset-2 hover:text-chili"
                  >
                    إفراغ السلة
                  </button>
                </div>

                <div className="border-t border-forest/10 bg-white px-5 py-4">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="font-display text-base font-semibold text-forest-deep">
                      الإجمالي
                    </span>
                    <span className="font-price text-xl font-bold text-fire">
                      {totalPrice} ج.م
                    </span>
                  </div>
                  <p className="mb-2 text-center text-xs text-muted-foreground">
                    سعر التوصيل بيتحسب في الخطوة الجاية حسب منطقتك
                  </p>
                  {!isOpen && (
                    <p className="mb-2 text-center text-xs font-semibold text-chili">
                      المطعم مقفول دلوقتي، مينفعش تأكيد الطلب
                    </p>
                  )}
                  <button
                    onClick={() => setStep("checkout")}
                    disabled={!isOpen}
                    className="w-full rounded-full bg-fire py-3 font-display text-sm font-bold text-forest-deep transition-transform hover:scale-[1.02] active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100"
                  >
                    تأكيد الطلب
                  </button>
                </div>
              </>
            )}
          </>
        )}

        {/* ===== خطوة 2: فورم بيانات التوصيل ===== */}
        {step === "checkout" && (
          <form onSubmit={handleConfirmOrder} className="flex min-h-0 flex-1 flex-col">
            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
              <p className="mb-4 text-sm text-muted-foreground">
                محتاجين بياناتك عشان نوصلك الطلب
              </p>

              <div className="flex flex-col gap-4">
                <div>
                  <label className="mb-1 flex items-center gap-1.5 text-sm font-semibold text-forest-deep">
                    <User className="h-3.5 w-3.5" /> الاسم
                  </label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-lg border border-forest/20 bg-white px-3 py-2.5 text-sm"
                    placeholder="اسمك"
                  />
                </div>

                <div>
                  <label className="mb-1 flex items-center gap-1.5 text-sm font-semibold text-forest-deep">
                    <Phone className="h-3.5 w-3.5" /> رقم التليفون
                  </label>
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    type="tel"
                    className="w-full rounded-lg border border-forest/20 bg-white px-3 py-2.5 text-sm"
                    placeholder="01xxxxxxxxx"
                    dir="ltr"
                  />
                </div>

                <div>
                  <label className="mb-1 flex items-center gap-1.5 text-sm font-semibold text-forest-deep">
                    <Phone className="h-3.5 w-3.5" /> رقم تليفون تاني (اختياري)
                  </label>
                  <input
                    value={phone2}
                    onChange={(e) => setPhone2(e.target.value)}
                    type="tel"
                    className="w-full rounded-lg border border-forest/20 bg-white px-3 py-2.5 text-sm"
                    placeholder="01xxxxxxxxx (لو حابب تسيب رقم احتياطي)"
                    dir="ltr"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-forest-deep">
                    استلام الطلب
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setFulfillmentType("delivery")}
                      className={`flex flex-col items-center gap-1.5 rounded-lg border-2 px-3 py-3 text-sm font-semibold transition-colors ${
                        fulfillmentType === "delivery"
                          ? "border-fire bg-fire/5 text-forest-deep"
                          : "border-forest/15 text-muted-foreground hover:border-forest/30"
                      }`}
                    >
                      <Truck className="h-5 w-5" />
                      توصيل
                    </button>
                    <button
                      type="button"
                      onClick={() => setFulfillmentType("pickup")}
                      className={`flex flex-col items-center gap-1.5 rounded-lg border-2 px-3 py-3 text-sm font-semibold transition-colors ${
                        fulfillmentType === "pickup"
                          ? "border-fire bg-fire/5 text-forest-deep"
                          : "border-forest/15 text-muted-foreground hover:border-forest/30"
                      }`}
                    >
                      <Store className="h-5 w-5" />
                      استلام من الفرع
                    </button>
                  </div>
                </div>

                {fulfillmentType === "delivery" && (
                  <>
                    <div>
                      <label className="mb-1 flex items-center gap-1.5 text-sm font-semibold text-forest-deep">
                        <MapPin className="h-3.5 w-3.5" /> منطقتك
                      </label>
                      <select
                        value={selectedZoneId}
                        onChange={(e) => setSelectedZoneId(e.target.value)}
                        className="w-full rounded-lg border border-forest/20 bg-white px-3 py-2.5 text-sm"
                      >
                        <option value="">اختار المنطقة</option>
                        {zones.map((z) => (
                          <option key={z.id} value={z.id}>
                            {z.nameAr} — توصيل {z.deliveryPrice} ج.م
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="mb-1 flex items-center gap-1.5 text-sm font-semibold text-forest-deep">
                        <MapPin className="h-3.5 w-3.5" /> العنوان بالتفصيل
                      </label>
                      <textarea
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        rows={3}
                        className="w-full resize-none rounded-lg border border-forest/20 bg-white px-3 py-2.5 text-sm"
                        placeholder="الشارع، رقم العمارة والدور، وأي علامة مميزة تساعدنا نوصلك"
                      />
                    </div>
                  </>
                )}

                {fulfillmentType === "pickup" && (
                  <div>
                    <label className="mb-1 flex items-center gap-1.5 text-sm font-semibold text-forest-deep">
                      <Store className="h-3.5 w-3.5" /> الفرع
                    </label>
                    <select
                      value={selectedPickupBranchId}
                      onChange={(e) => setSelectedPickupBranchId(e.target.value)}
                      className="w-full rounded-lg border border-forest/20 bg-white px-3 py-2.5 text-sm"
                    >
                      <option value="">اختار الفرع</option>
                      {branches.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.nameAr}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="mb-2 block text-sm font-semibold text-forest-deep">
                    طريقة الدفع
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("cash")}
                      className={`flex flex-col items-center gap-1.5 rounded-lg border-2 px-3 py-3 text-sm font-semibold transition-colors ${
                        paymentMethod === "cash"
                          ? "border-fire bg-fire/5 text-forest-deep"
                          : "border-forest/15 text-muted-foreground hover:border-forest/30"
                      }`}
                    >
                      <Banknote className="h-5 w-5" />
                      كاش عند الاستلام
                    </button>
                    <button
                      type="button"
                      onClick={() => paymentSettings.gatewayEnabled && setPaymentMethod("card")}
                      disabled={!paymentSettings.gatewayEnabled}
                      className={`flex flex-col items-center gap-1.5 rounded-lg border-2 px-3 py-3 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                        paymentMethod === "card"
                          ? "border-fire bg-fire/5 text-forest-deep"
                          : "border-forest/15 text-muted-foreground hover:border-forest/30"
                      }`}
                    >
                      <CreditCard className="h-5 w-5" />
                      دفع إلكتروني
                    </button>
                  </div>
                  {!paymentSettings.gatewayEnabled && (
                    <p className="mt-1.5 text-xs text-muted-foreground">
                      الدفع الإلكتروني مش متاح دلوقتي، الكاش عند الاستلام متاح دايمًا
                    </p>
                  )}
                </div>

                {formError && (
                  <p className="rounded-lg bg-chili/10 px-3 py-2 text-sm text-chili">
                    {formError}
                  </p>
                )}
              </div>
            </div>

            <div className="border-t border-forest/10 bg-white px-5 py-4">
              <div className="mb-1 flex items-center justify-between text-sm text-muted-foreground">
                <span>سعر الأصناف</span>
                <span className="font-price">{totalPrice} ج.م</span>
              </div>
              {fulfillmentType === "delivery" && (
                <div className="mb-1 flex items-center justify-between text-sm text-muted-foreground">
                  <span>سعر التوصيل</span>
                  <span className="font-price">{deliveryPrice} ج.م</span>
                </div>
              )}
              <div className="mb-3 flex items-center justify-between">
                <span className="font-display text-base font-semibold text-forest-deep">
                  الإجمالي
                </span>
                <span className="font-price text-xl font-bold text-fire">{grandTotal} ج.م</span>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setStep("cart")}
                  className="rounded-full border border-forest/20 px-5 py-3 text-sm font-semibold text-forest-deep"
                >
                  رجوع
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex flex-1 items-center justify-center gap-2 rounded-full bg-fire py-3 font-display text-sm font-bold text-forest-deep transition-transform hover:scale-[1.02] active:scale-95 disabled:opacity-60"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> بيتبعت...
                    </>
                  ) : (
                    "إرسال الطلب"
                  )}
                </button>
              </div>
            </div>
          </form>
        )}

        {/* ===== خطوة 3: تأكيد النجاح ===== */}
        {step === "success" && (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
            <CheckCircle2 className="h-16 w-16 text-emerald-600" />
            <h3 className="font-display text-xl font-bold text-forest-deep">
              تم استلام طلبك بنجاح!
            </h3>
            {displayNumber && (
              <p className="font-price text-lg font-bold text-fire">
                رقم طلبك: #{displayNumber}
              </p>
            )}
            <p className="text-sm text-muted-foreground">
              {paymentMethod === "cash"
                ? "هنجهزه ونوصله لك في أقرب وقت، وتدفع كاش عند الاستلام."
                : "هنجهزه ونوصله لك في أقرب وقت."}
              {" "}لو احتجنا أي تفاصيل هنتواصل معاك على الرقم اللي كتبته.
            </p>
            <button
              onClick={() => handleOpenChange(false)}
              className="mt-2 rounded-full bg-forest px-6 py-2.5 text-sm font-semibold text-cream"
            >
              تمام
            </button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
