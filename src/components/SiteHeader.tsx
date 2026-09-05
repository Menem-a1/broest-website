import { NavLink } from "react-router-dom";
import { ShoppingBag, Menu, X, Phone, User } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { useSettings } from "@/lib/useSettings";
import { useOffers } from "@/lib/useOffers";
// معطّلين مؤقتًا مع نظام تسجيل الدخول (هيترجعوا لما نظام الواتساب يجهز):
// import { useCustomerAuth } from "@/context/CustomerAuthContext";
// import { useFavorites } from "@/lib/useFavorites";
// import { Heart } from "lucide-react";

const baseNavItems = [
  { to: "/", label: "الرئيسية" },
  { to: "/menu", label: "المنيو" },
  { to: "/about", label: "عن بروست" },
  { to: "/contact", label: "تواصل معنا" },
];

export function SiteHeader() {
  const { totalCount, setCartOpen } = useCart();
  const { settings } = useSettings();
  const { pageEnabled: offersEnabled } = useOffers();
  // معطّلين مؤقتًا مع نظام تسجيل الدخول (هيترجعوا لما نظام الواتساب يجهز):
  // const { session } = useCustomerAuth();
  // const { favoriteIds } = useFavorites(session?.user?.id);
  const [mobileOpen, setMobileOpen] = useState(false);

  // رابط "العروض" بيظهر بس لو المطور فعّل صفحة العروض من لوحة التحكم
  const navItems = offersEnabled
    ? [
        baseNavItems[0],
        baseNavItems[1],
        { to: "/offers", label: "العروض" },
        baseNavItems[2],
        baseNavItems[3],
      ]
    : baseNavItems;

  return (
    <header className="sticky top-0 z-40 bg-forest text-cream shadow-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 md:px-8">
        <NavLink to="/" className="flex items-center gap-2">
          {settings.logoUrl ? (
            <img
              src={settings.logoUrl}
              alt={settings.nameAr}
              className="h-10 w-10 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-fire font-display text-lg font-bold text-forest-deep">
              بر
            </div>
          )}
          <span className="font-display text-2xl font-bold tracking-wide">
            {settings.nameAr}
          </span>
        </NavLink>

        <nav className="hidden items-center gap-8 md:flex">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `font-display text-sm font-medium uppercase tracking-wider transition-colors ${
                  isActive ? "text-fire-light" : "text-cream/80 hover:text-fire-light"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <a
            href={settings.phoneHref}
            className="hidden items-center gap-1.5 rounded-full border border-cream/25 px-3 py-1.5 text-sm text-cream/90 transition-colors hover:border-fire hover:text-fire-light md:flex"
          >
            <Phone className="h-3.5 w-3.5" />
            {settings.phoneDisplay}
          </a>
          {/* زرار "حسابي": نظام تسجيل الدخول الحالي (إيميل/باسورد) هيتستبدل
              بنظام رقم تليفون + كود واتساب، فمؤقتًا الزرار ظاهر بس مقفول
              وبيوري رسالة "قريبًا" بدل ما يودّي لصفحة تسجيل الدخول.
              الكود والصفحات (CustomerAuthContext, Account.tsx) لسه
              موجودين زي ما هم بالكامل، جاهزين يترجعوا شغالين تاني. */}
          <button
            type="button"
            onClick={() => alert("تسجيل الدخول وحفظ الحساب هيتوفر قريبًا. تقدر تكمل طلبك عادي من غير تسجيل.")}
            className="relative flex h-10 w-10 items-center justify-center rounded-full border border-cream/25 text-cream/50 transition-colors hover:border-fire hover:text-fire-light"
            aria-label="حسابي (قريبًا)"
          >
            <User className="h-4.5 w-4.5" />
          </button>
          <button
            onClick={() => setCartOpen(true)}
            className="relative flex h-10 w-10 items-center justify-center rounded-full bg-fire text-forest-deep transition-transform hover:scale-105"
            aria-label="السلة"
          >
            <ShoppingBag className="h-5 w-5" />
            {totalCount > 0 && (
              <span className="absolute -top-1 -left-1 flex h-5 w-5 items-center justify-center rounded-full bg-chili text-[11px] font-bold text-cream">
                {totalCount}
              </span>
            )}
          </button>
          <button
            className="flex h-10 w-10 items-center justify-center text-cream md:hidden"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="القائمة"
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav className="flex flex-col gap-1 border-t border-cream/10 bg-forest-deep px-4 py-3 md:hidden">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `rounded-md px-3 py-2 font-display text-sm uppercase tracking-wide ${
                  isActive ? "bg-fire/20 text-fire-light" : "text-cream/85"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
          <a
            href={settings.phoneHref}
            className="mt-1 flex items-center gap-2 rounded-md px-3 py-2 text-sm text-cream/85"
          >
            <Phone className="h-4 w-4" /> {settings.phoneDisplay}
          </a>
        </nav>
      )}
    </header>
  );
}
