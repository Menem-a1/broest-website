import { NavLink } from "react-router-dom";
import { ShoppingBag, Menu, X, Phone } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { useSettings } from "@/lib/useSettings";

const navItems = [
  { to: "/", label: "الرئيسية" },
  { to: "/menu", label: "المنيو" },
  { to: "/about", label: "عن بروست" },
  { to: "/contact", label: "تواصل معنا" },
];

export function SiteHeader() {
  const { totalCount, setCartOpen } = useCart();
  const { settings } = useSettings();
  const [mobileOpen, setMobileOpen] = useState(false);

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
