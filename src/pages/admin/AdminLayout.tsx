// =====================================================
// ملف: AdminLayout.tsx
// الغرض: القالب المشترك لكل صفحات لوحة التحكم
// (فيه القائمة الجانبية وزرار تسجيل الخروج)
// =====================================================
import { NavLink, Outlet } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useOrders } from "@/lib/useOrders";
import { useOrderNotification } from "@/lib/useOrderNotification";
import { useTabTitleAlert } from "@/lib/useTabTitleAlert";
import { AdminErrorBoundary } from "@/pages/admin/AdminErrorBoundary";
import { LayoutGrid, UtensilsCrossed, Settings, LogOut, ExternalLink, ClipboardList, Image, MessageSquareText, Building2, Users, Truck, Percent, UserX, Menu, X, Tag, Heart } from "lucide-react";

const navItems = [
  { to: "/admin", label: "الرئيسية", icon: LayoutGrid, end: true, developerOnly: false },
  { to: "/admin/orders", label: "الطلبات", icon: ClipboardList, developerOnly: false },
  { to: "/admin/menu", label: "المنيو والأسعار", icon: UtensilsCrossed, developerOnly: true },
  { to: "/admin/discounts", label: "الخصومات", icon: Tag, developerOnly: true },
  { to: "/admin/curated-favorites", label: "مفضلة العملاء", icon: Heart, developerOnly: true },
  { to: "/admin/branches", label: "الفروع", icon: Building2, developerOnly: true },
  { to: "/admin/delivery-zones", label: "مناطق التوصيل", icon: Truck, developerOnly: true },
  { to: "/admin/offers", label: "العروض", icon: Percent, developerOnly: true },
  { to: "/admin/inactive-customers", label: "العملاء الغائبين", icon: UserX, developerOnly: true },
  { to: "/admin/home", label: "الصفحة الرئيسية", icon: Image, developerOnly: true },
  { to: "/admin/reviews", label: "المراجعات", icon: MessageSquareText, developerOnly: true },
  { to: "/admin/settings", label: "إعدادات المطعم", icon: Settings, developerOnly: true },
  { to: "/admin/users", label: "المستخدمين والصلاحيات", icon: Users, developerOnly: true },
];

export function AdminLayout() {
  const { signOut, role, roleLoading } = useAuth();
  const isDeveloper = role === "developer";
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  // لحد ما الدور يتحمل، منوريش أي عناصر مقصورة على developer
  // (أفضل من إظهارها لحظة واحدة ثم اختفائها)
  const visibleNavItems = navItems.filter((item) => !item.developerOnly || (isDeveloper && !roleLoading));
  // بنجيب الطلبات هنا بس عشان عداد الإشعارات في القائمة الجانبية.
  // لو حصل أي خطأ، بنتجاهله بهدوء (newOrdersCount = 0) بدل ما نكسر
  // القائمة الجانبية كلها وكل صفحات لوحة التحكم معاها
  const { orders, error: ordersError } = useOrders();
  const newOrdersCount = ordersError ? 0 : orders.filter((o) => o.status === "new").length;

  // بيشغّل صوت تنبيه تلقائيًا لما عدد الطلبات الجديدة يزيد
  useOrderNotification(newOrdersCount);
  // بيغيّر عنوان التبويب عشان يبان في المتصفح حتى لو مش فاتح التبويب ده
  useTabTitleAlert(newOrdersCount);

  return (
    <div className="flex min-h-screen bg-muted/30" dir="rtl">
      {/* شريط علوي يظهر على الموبايل بس، فيه زرار فتح القائمة */}
      <div className="fixed inset-x-0 top-0 z-30 flex items-center justify-between border-b border-forest/10 bg-forest px-4 py-3 text-cream md:hidden">
        <h1 className="font-display text-base font-bold">لوحة تحكم بروست</h1>
        <button onClick={() => setMobileNavOpen(true)} aria-label="فتح القائمة">
          <Menu className="h-6 w-6" />
        </button>
      </div>

      {/* خلفية معتمة تقفل القائمة لما تدوس عليها، تظهر على الموبايل بس لما القائمة مفتوحة */}
      {mobileNavOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setMobileNavOpen(false)}
        />
      )}

      {/* القائمة الجانبية: ثابتة دايمًا على الديسكتوب، منبثقة من اليمين على الموبايل */}
      <aside
        className={`fixed inset-y-0 right-0 z-50 flex w-64 shrink-0 flex-col border-l border-forest/10 bg-forest text-cream transition-transform md:static md:z-auto md:translate-x-0 ${
          mobileNavOpen ? "translate-x-0" : "translate-x-full md:translate-x-0"
        }`}
      >
        <div className="flex items-center justify-between border-b border-cream/10 px-5 py-5">
          <h1 className="font-display text-lg font-bold">لوحة تحكم بروست</h1>
          <button onClick={() => setMobileNavOpen(false)} className="md:hidden" aria-label="قفل القائمة">
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-3">
          {visibleNavItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setMobileNavOpen(false)}
              className={({ isActive }) =>
                `flex items-center justify-between gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive ? "bg-fire text-forest-deep" : "text-cream/80 hover:bg-cream/10"
                }`
              }
            >
              <span className="flex items-center gap-2.5">
                <item.icon className="h-4 w-4" />
                {item.label}
              </span>
              {item.to === "/admin/orders" && newOrdersCount > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-chili px-1.5 text-[11px] font-bold text-cream">
                  {newOrdersCount}
                </span>
              )}
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
      <main className="flex-1 overflow-y-auto p-4 pt-16 md:p-8 md:pt-8">
        <AdminErrorBoundary>
          {!roleLoading && !role ? (
            <div className="mx-auto mt-12 max-w-md rounded-xl border border-chili/30 bg-chili/5 p-6 text-center">
              <h2 className="font-display text-lg font-bold text-forest-deep">
                حسابك مش مفعّل لسه
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                إنت مسجل دخول بنجاح، لكن مفيش صلاحيات متحددة لحسابك دلوقتي.
                كلّم المطوّر بتاع الموقع عشان يفعّلك من صفحة "المستخدمين والصلاحيات".
              </p>
            </div>
          ) : (
            <Outlet />
          )}
        </AdminErrorBoundary>
      </main>
    </div>
  );
}
