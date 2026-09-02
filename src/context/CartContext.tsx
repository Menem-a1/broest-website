import { createContext, useContext, useState, useMemo } from "react";
import type { ReactNode } from "react";
import type { MenuItem } from "@/lib/useMenu";

export type CartLine = {
  key: string; // itemId + size
  itemId: string;
  nameAr: string;
  size?: string;
  unitPrice: number;
  qty: number;
};

type CartContextType = {
  lines: CartLine[];
  addItem: (item: MenuItem, size?: { label: string; price: number }, priceOverride?: number) => void;
  addRawLine: (line: { itemId: string; nameAr: string; size?: string; unitPrice: number; qty: number }) => void;
  removeLine: (key: string) => void;
  changeQty: (key: string, delta: number) => void;
  clearCart: () => void;
  totalCount: number;
  totalPrice: number;
  isCartOpen: boolean;
  setCartOpen: (open: boolean) => void;
};

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [isCartOpen, setCartOpen] = useState(false);

  const addItem = (
    item: MenuItem,
    size?: { label: string; price: number },
    priceOverride?: number
  ) => {
    const key = size ? `${item.id}-${size.label}` : item.id;
    const unitPrice = priceOverride ?? (size ? size.price : item.price);
    setLines((prev) => {
      const existing = prev.find((l) => l.key === key);
      if (existing) {
        return prev.map((l) => (l.key === key ? { ...l, qty: l.qty + 1 } : l));
      }
      return [
        ...prev,
        {
          key,
          itemId: item.id,
          nameAr: item.nameAr,
          size: size?.label,
          unitPrice,
          qty: 1,
        },
      ];
    });
  };

  // بتضيف صنف مباشرة من بيانات جاهزة (اسم، سعر وقت الطلب، كمية)
  // من غير ما تحتاج كائن MenuItem كامل — بتستخدم في "إعادة الطلب"
  // من سجل الطلبات السابقة، وبتحدّث الكمية لو الصنف موجود بالفعل
  const addRawLine = (line: {
    itemId: string;
    nameAr: string;
    size?: string;
    unitPrice: number;
    qty: number;
  }) => {
    const key = line.size ? `${line.itemId}-${line.size}` : line.itemId;
    setLines((prev) => {
      const existing = prev.find((l) => l.key === key);
      if (existing) {
        return prev.map((l) =>
          l.key === key ? { ...l, qty: l.qty + line.qty } : l
        );
      }
      return [...prev, { key, ...line }];
    });
  };

  const removeLine = (key: string) => {
    setLines((prev) => prev.filter((l) => l.key !== key));
  };

  const changeQty = (key: string, delta: number) => {
    setLines((prev) =>
      prev
        .map((l) => (l.key === key ? { ...l, qty: l.qty + delta } : l))
        .filter((l) => l.qty > 0)
    );
  };

  const clearCart = () => setLines([]);

  const totalCount = useMemo(() => lines.reduce((s, l) => s + l.qty, 0), [lines]);
  const totalPrice = useMemo(
    () => lines.reduce((s, l) => s + l.qty * l.unitPrice, 0),
    [lines]
  );

  return (
    <CartContext.Provider
      value={{
        lines,
        addItem,
        addRawLine,
        removeLine,
        changeQty,
        clearCart,
        totalCount,
        totalPrice,
        isCartOpen,
        setCartOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
