import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useCart } from "@/context/CartContext";
import { Minus, Plus, Trash2, MessageCircle, Phone } from "lucide-react";
import { useSettings, buildWhatsAppLink } from "@/lib/useSettings";
import { saveOrder } from "@/lib/useOrders";

export function CartDrawer() {
  const { lines, changeQty, removeLine, totalPrice, isCartOpen, setCartOpen, clearCart } =
    useCart();
  const { settings } = useSettings();

  const orderSummary = () =>
    lines
      .map(
        (l) =>
          `${l.qty}x ${l.nameAr}${l.size ? ` (${l.size})` : ""} — ${l.unitPrice * l.qty} ج.م`
      )
      .join("\n");

  const whatsappMessage = `أهلاً بروست 👋\nعايز أطلب:\n\n${orderSummary()}\n\nالإجمالي: ${totalPrice} ج.م`;

  // بنسجل الطلب في قاعدة البيانات لما العميل يضغط واتساب أو اتصال
  // (مش بنمنعه من إكمال الطلب لو فشل التسجيل، السجل ده للمتابعة بس)
  function handleOrderClick(channel: "whatsapp" | "phone") {
    if (lines.length > 0) {
      saveOrder(lines, totalPrice, channel);
    }
  }

  return (
    <Sheet open={isCartOpen} onOpenChange={setCartOpen}>
      <SheetContent side="left" className="flex w-full flex-col gap-0 border-forest bg-paper p-0 sm:max-w-md">
        <SheetHeader className="border-b border-forest/10 bg-forest px-5 py-4">
          <SheetTitle className="font-display text-xl text-cream">سلة الطلب</SheetTitle>
        </SheetHeader>

        {lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 px-6 text-center text-muted-foreground">
            <span className="text-4xl">🍗</span>
            <p className="font-display text-lg">السلة فاضية</p>
            <p className="text-sm">اختار وجبتك المفضلة من المنيو وابدأ الطلب</p>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-5 py-4">
              <ul className="flex flex-col gap-3">
                {lines.map((line) => (
                  <li
                    key={line.key}
                    className="flex items-center justify-between gap-3 rounded-lg border border-forest/10 bg-white p-3"
                  >
                    <div className="flex-1">
                      <p className="font-display text-sm font-semibold text-forest-deep">
                        {line.nameAr} {line.size && <span className="text-fire">({line.size})</span>}
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
                      <span className="w-4 text-center font-price font-semibold">{line.qty}</span>
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
                <span className="font-price text-xl font-bold text-fire">{totalPrice} ج.م</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <a
                  href={buildWhatsAppLink(settings.whatsappNumber, whatsappMessage)}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => handleOrderClick("whatsapp")}
                  className="flex items-center justify-center gap-1.5 rounded-full bg-[#25D366] px-3 py-2.5 text-sm font-bold text-white transition-transform hover:scale-[1.02] active:scale-95"
                >
                  <MessageCircle className="h-4 w-4" /> واتساب
                </a>
                <a
                  href={settings.phoneHref}
                  onClick={() => handleOrderClick("phone")}
                  className="flex items-center justify-center gap-1.5 rounded-full bg-fire px-3 py-2.5 text-sm font-bold text-forest-deep transition-transform hover:scale-[1.02] active:scale-95"
                >
                  <Phone className="h-4 w-4" /> اتصال
                </a>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
