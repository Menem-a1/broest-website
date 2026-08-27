import { useState, useMemo, useEffect } from "react";
import { useMenu } from "@/lib/useMenu";
import { MenuItemCard } from "@/components/MenuItemCard";
import { Loader2 } from "lucide-react";

export function Menu() {
  const { categories, menu, loading, error } = useMenu();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  // لما تجيلنا الأقسام من قاعدة البيانات، نختار أول واحد كافتراضي
  useEffect(() => {
    if (categories.length > 0 && !activeCategory) {
      setActiveCategory(categories[0].id);
    }
  }, [categories, activeCategory]);

  const items = useMemo(
    () => menu.filter((m) => m.category === activeCategory),
    [activeCategory, menu]
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:px-8">
      <div className="mb-8">
        <span className="font-display text-xs font-semibold uppercase tracking-widest text-fire">
          المنيو
        </span>
        <h1 className="mt-1 font-display text-4xl font-bold text-forest-deep">اطلب دلوقتي</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          اختار الصنف، حدد الحجم لو موجود، وضيفه للسلة
        </p>
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center gap-3 py-24 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin text-fire" />
          <p className="text-sm">بنجيب المنيو دلوقتي...</p>
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-chili/30 bg-chili/5 p-6 text-center text-chili">
          {error}
        </div>
      )}

      {!loading && !error && (
        <>
          {/* category tabs */}
          <div className="sticky top-[64px] z-30 -mx-4 mb-8 overflow-x-auto bg-background/95 px-4 py-3 backdrop-blur md:top-[73px]">
            <div className="flex gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`shrink-0 rounded-full px-4 py-2 font-display text-sm font-semibold transition-colors ${
                    activeCategory === cat.id
                      ? "bg-forest text-cream"
                      : "bg-muted text-muted-foreground hover:bg-forest/10"
                  }`}
                >
                  {cat.nameAr}
                </button>
              ))}
            </div>
          </div>

          {items.length === 0 ? (
            <p className="py-12 text-center text-sm text-muted-foreground">
              مفيش أصناف متاحة في القسم ده دلوقتي
            </p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((item) => (
                <MenuItemCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
