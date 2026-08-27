import { useCart } from "@/context/CartContext";
import { ShoppingBag } from "lucide-react";

export function StickyOrderBar() {
  const { totalCount, totalPrice, setCartOpen } = useCart();

  if (totalCount === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-fire/30 bg-forest-deep px-4 py-3 shadow-[0_-4px_20px_rgba(0,0,0,0.25)] animate-in slide-in-from-bottom duration-300">
      <button
        onClick={() => setCartOpen(true)}
        className="mx-auto flex w-full max-w-lg items-center justify-between rounded-full bg-fire px-5 py-3 text-forest-deep transition-transform active:scale-[0.98]"
      >
        <span className="flex items-center gap-2 font-display text-sm font-bold">
          <ShoppingBag className="h-4 w-4" />
          {totalCount} {totalCount === 1 ? "صنف" : "أصناف"} في السلة
        </span>
        <span className="font-price text-base font-bold">عرض السلة · {totalPrice} ج.م</span>
      </button>
    </div>
  );
}
