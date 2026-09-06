import { useState, useMemo, useEffect } from "react";
import { useMenu } from "@/lib/useMenu";
import { useBranches, isBranchOpenNow } from "@/lib/useBranches";
import { useFavorites } from "@/lib/useFavorites";
import { useMenuDiscounts } from "@/lib/useMenuDiscounts";
import { useCustomerAuth } from "@/context/CustomerAuthContext";
import { MenuItemCard } from "@/components/MenuItemCard";
import { ClosedBanner } from "@/components/ClosedBanner";
import { Loader2 } from "lucide-react";

export function Menu() {
  const { categories, menu, loading, error } = useMenu();
  const { branches } = useBranches();
  const { session } = useCustomerAuth();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  // بنجيب المفضلة والخصومات مرة واحدة هنا فوق، وبنبعتهم لكل كارت كـ props،
  // بدل ما كل كارت في المنيو (ممكن يكونوا 60 صنف) ينادي نفس الاستعلامات
  // لوحده — ده كان بيعمل عشرات الاستعلامات المكررة لنفس البيانات بالظبط
  const { favoriteIds, toggleFavorite } = useFavorites(session?.user?.id);
  const { applyDiscount } = useMenuDiscounts();

  // بنعتبر المطعم مفتوح لو أي فرع فيهم مفتوح دلوقتي
  // (لو عندك فرع واحد بس، ده بيبقى نفس السلوك القديم بالظبط)
  const primaryBranch = branches[0];
  const isOpen = primaryBranch ? isBranchOpenNow(primaryBranch.opensAt, primaryBranch.closesAt) : true;

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
          {!isOpen && primaryBranch && (
            <ClosedBanner opensAt={primaryBranch.opensAt} closesAt={primaryBranch.closesAt} />
          )}

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
                <MenuItemCard
                  key={item.id}
                  item={item}
                  disabled={!isOpen}
                  favoriteIds={favoriteIds}
                  toggleFavorite={toggleFavorite}
                  applyDiscount={applyDiscount}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
