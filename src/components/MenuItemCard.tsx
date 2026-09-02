import { useState } from "react";
import type { MenuItem } from "@/lib/useMenu";
import { useCart } from "@/context/CartContext";
import { useCustomerAuth } from "@/context/CustomerAuthContext";
import { useFavorites } from "@/lib/useFavorites";
import { Plus, Check, Heart } from "lucide-react";

export function MenuItemCard({ item, disabled = false }: { item: MenuItem; disabled?: boolean }) {
  const { addItem } = useCart();
  const { session } = useCustomerAuth();
  const { favoriteIds, toggleFavorite } = useFavorites(session?.user?.id);
  const [selectedSize, setSelectedSize] = useState(item.sizes ? item.sizes[0] : undefined);
  const [justAdded, setJustAdded] = useState(false);

  const displayPrice = selectedSize ? selectedSize.price : item.price;
  const isFavorite = favoriteIds.has(item.id);

  const handleAdd = () => {
    addItem(item, selectedSize);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1200);
  };

  return (
    <div className="group flex flex-col justify-between rounded-xl border border-forest/10 bg-white p-4 transition-shadow hover:shadow-md">
      <div>
        {item.imageUrl && (
          <div className="relative mb-3 aspect-video w-full overflow-hidden rounded-lg bg-muted">
            <img
              src={item.imageUrl}
              alt={item.nameAr}
              className="h-full w-full object-cover"
              loading="lazy"
            />
            {session && (
              <button
                onClick={() => toggleFavorite(item.id)}
                className="absolute left-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-sm transition-transform active:scale-90"
                aria-label="أضف للمفضلة"
              >
                <Heart
                  className={`h-4 w-4 ${
                    isFavorite ? "fill-chili text-chili" : "text-muted-foreground"
                  }`}
                />
              </button>
            )}
          </div>
        )}
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-display text-base font-semibold text-forest-deep">
              {item.nameAr}
            </h3>
            <p className="text-xs text-muted-foreground">{item.nameEn}</p>
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            {!item.imageUrl && session && (
              <button
                onClick={() => toggleFavorite(item.id)}
                className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-muted"
                aria-label="أضف للمفضلة"
              >
                <Heart
                  className={`h-4 w-4 ${
                    isFavorite ? "fill-chili text-chili" : "text-muted-foreground"
                  }`}
                />
              </button>
            )}
            {item.badge && (
              <span className="rounded-full bg-chili px-2 py-0.5 text-[10px] font-bold text-cream">
                {item.badge}
              </span>
            )}
          </div>
        </div>
        {item.descAr && (
          <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{item.descAr}</p>
        )}
      </div>

      {item.sizes && (
        <div className="mt-3 flex gap-1 self-start rounded-full bg-muted p-0.5">
          {item.sizes.map((s) => (
            <button
              key={s.label}
              onClick={() => setSelectedSize(s)}
              className={`rounded-full px-2.5 py-1 text-xs font-semibold transition-colors ${
                selectedSize?.label === s.label
                  ? "bg-fire text-forest-deep"
                  : "text-muted-foreground hover:text-forest-deep"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      )}

      <div className="mt-3 flex items-center justify-between gap-2">
        <span className="font-price text-lg font-bold text-fire">{displayPrice} ج.م</span>

        <button
          onClick={handleAdd}
          disabled={disabled}
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-all active:scale-90 disabled:cursor-not-allowed disabled:opacity-40 ${
            justAdded ? "bg-emerald-600" : "bg-forest hover:bg-fire"
          } text-cream`}
          aria-label="أضف للسلة"
        >
          {justAdded ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}
