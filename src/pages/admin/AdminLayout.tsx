// =====================================================
// ملف: AdminLayout.tsx
// الغرض: القالب المشترك لكل صفحات لوحة التحكم
// (فيه القائمة الجانبية وزرار تسجيل الخروج)
// =====================================================
import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { LayoutGrid, UtensilsCrossed, Settings, LogOut, ExternalLink, ClipboardList } from "lucide-react";

const navItems = [
  { to: "/admin", label: "الرئيسية", icon: LayoutGrid, end: true },
  { to: "/admin/orders", label: "الطلبات", icon: ClipboardList },
  { to: "/admin/menu", label: "المنيو والأسعار", icon: UtensilsCrossed },
  { to: "/admin/settings", label: "إعدادات المطعم", icon: Settings },
];

export function AdminLayout() {
  const { signOut } = useAuth();

  return (
    <div className="flex min-h-screen bg-muted/30" dir="rtl">
      {/* القائمة الجانبية */}
      <aside className="flex w-60 shrink-0 flex-col border-l border-forest/10 bg-forest text-cream">
        <div className="border-b border-cream/10 px-5 py-5">
          <h1 className="font-display text-lg font-bold">لوحة تحكم بروست</h1>
        </div>

        <nav className="flex flex-1 flex-col gap-1 p-3">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive ? "bg-fire text-forest-deep" : "text-cream/80 hover:bg-cream/10"
                }`
              }
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex flex-col gap-1 border-t border-cream/10 p-3">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-cream/80 hover:bg-cream/10"
          >
            <ExternalLink className="h-4 w-4" /> شوف الموقع
          </a>
          <button
            onClick={() => signOut()}
            className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-right text-sm text-cream/80 hover:bg-cream/10"
          >
            <LogOut className="h-4 w-4" /> تسجيل خروج
          </button>
        </div>
      </aside>

      {/* المحتوى */}
      <main className="flex-1 overflow-y-auto p-6 md:p-8">
        <Outlet />
      </main>
    </div>
  );
}
