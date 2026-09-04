import { HashRouter, Routes, Route } from "react-router-dom";
import { Suspense, lazy } from "react";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";
import { CustomerAuthProvider } from "@/context/CustomerAuthContext";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { CartDrawer } from "@/components/CartDrawer";
import { StickyOrderBar } from "@/components/StickyOrderBar";
import { PublicErrorBoundary } from "@/components/PublicErrorBoundary";
import { useSettings } from "@/lib/useSettings";
import { useFavicon } from "@/lib/useFavicon";
import { Home } from "@/pages/Home";
import { Menu } from "@/pages/Menu";
import { Offers } from "@/pages/Offers";
import { Account } from "@/pages/Account";
import { About } from "@/pages/About";
import { Contact } from "@/pages/Contact";
import { Login } from "@/pages/admin/Login";
import { RequireAuth, RequireDeveloper } from "@/pages/admin/RequireAuth";
import { Loader2 } from "lucide-react";

// صفحات لوحة التحكم بتتحمّل بس لما حد يفتح /admin فعليًا،
// مش مع تحميل الموقع العام من الأول — بتقلل حجم أول تحميل
// للعميل العادي اللي مش هيفتح لوحة التحكم خالص
const AdminLayout = lazy(() =>
  import("@/pages/admin/AdminLayout").then((m) => ({ default: m.AdminLayout }))
);
const Dashboard = lazy(() =>
  import("@/pages/admin/Dashboard").then((m) => ({ default: m.Dashboard }))
);
const MenuEditor = lazy(() =>
  import("@/pages/admin/MenuEditor").then((m) => ({ default: m.MenuEditor }))
);
const SettingsEditor = lazy(() =>
  import("@/pages/admin/SettingsEditor").then((m) => ({ default: m.SettingsEditor }))
);
const OrdersView = lazy(() =>
  import("@/pages/admin/OrdersView").then((m) => ({ default: m.OrdersView }))
);
const HomeEditor = lazy(() =>
  import("@/pages/admin/HomeEditor").then((m) => ({ default: m.HomeEditor }))
);
const ReviewsEditor = lazy(() =>
  import("@/pages/admin/ReviewsEditor").then((m) => ({ default: m.ReviewsEditor }))
);
const BranchesEditor = lazy(() =>
  import("@/pages/admin/BranchesEditor").then((m) => ({ default: m.BranchesEditor }))
);
const DeliveryZonesEditor = lazy(() =>
  import("@/pages/admin/DeliveryZonesEditor").then((m) => ({ default: m.DeliveryZonesEditor }))
);
const OffersEditor = lazy(() =>
  import("@/pages/admin/OffersEditor").then((m) => ({ default: m.OffersEditor }))
);
const DiscountsEditor = lazy(() =>
  import("@/pages/admin/DiscountsEditor").then((m) => ({ default: m.DiscountsEditor }))
);
const CuratedFavoritesEditor = lazy(() =>
  import("@/pages/admin/CuratedFavoritesEditor").then((m) => ({ default: m.CuratedFavoritesEditor }))
);
const InactiveCustomers = lazy(() =>
  import("@/pages/admin/InactiveCustomers").then((m) => ({ default: m.InactiveCustomers }))
);
const UsersEditor = lazy(() =>
  import("@/pages/admin/UsersEditor").then((m) => ({ default: m.UsersEditor }))
);

// شاشة تحميل بسيطة تظهر لحظة تحميل أي صفحة أدمن لأول مرة
function AdminLoadingFallback() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-fire" />
    </div>
  );
}

// الموقع العام (اللي بيشوفه العملاء): هيدر + فوتر + سلة + شريط الطلب
// CustomerAuthProvider بيلف الموقع العام بس، عشان دخول العميل بجوجل
// يفضل منفصل تمامًا عن دخول الأدمن (AuthProvider) اللي بيغطي /admin بس
function PublicSite() {
  const { settings } = useSettings();
  useFavicon(settings.faviconUrl);

  return (
    <PublicErrorBoundary>
      <CustomerAuthProvider>
        <div className="flex min-h-screen flex-col" dir="rtl">
          <SiteHeader />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/menu" element={<Menu />} />
              <Route path="/offers" element={<Offers />} />
              <Route path="/account" element={<Account />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
            </Routes>
          </main>
          <SiteFooter />
          <CartDrawer />
          <StickyOrderBar />
        </div>
      </CustomerAuthProvider>
    </PublicErrorBoundary>
  );
}

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <HashRouter>
          <Routes>
            {/* تسجيل الدخول للوحة التحكم */}
            <Route path="/admin/login" element={<Login />} />

            {/* لوحة التحكم — محمية بتسجيل الدخول */}
            <Route
              path="/admin"
              element={
                <RequireAuth>
                  <Suspense fallback={<AdminLoadingFallback />}>
                    <AdminLayout />
                  </Suspense>
                </RequireAuth>
              }
            >
              <Route index element={<Suspense fallback={<AdminLoadingFallback />}><Dashboard /></Suspense>} />
              <Route path="orders" element={<Suspense fallback={<AdminLoadingFallback />}><OrdersView /></Suspense>} />
              <Route
                path="menu"
                element={
                  <RequireDeveloper>
                    <Suspense fallback={<AdminLoadingFallback />}>
                      <MenuEditor />
                    </Suspense>
                  </RequireDeveloper>
                }
              />
              <Route
                path="home"
                element={
                  <RequireDeveloper>
                    <Suspense fallback={<AdminLoadingFallback />}>
                      <HomeEditor />
                    </Suspense>
                  </RequireDeveloper>
                }
              />
              <Route
                path="reviews"
                element={
                  <RequireDeveloper>
                    <Suspense fallback={<AdminLoadingFallback />}>
                      <ReviewsEditor />
                    </Suspense>
                  </RequireDeveloper>
                }
              />
              <Route
                path="branches"
                element={
                  <RequireDeveloper>
                    <Suspense fallback={<AdminLoadingFallback />}>
                      <BranchesEditor />
                    </Suspense>
                  </RequireDeveloper>
                }
              />
              <Route
                path="delivery-zones"
                element={
                  <RequireDeveloper>
                    <Suspense fallback={<AdminLoadingFallback />}>
                      <DeliveryZonesEditor />
                    </Suspense>
                  </RequireDeveloper>
                }
              />
              <Route
                path="offers"
                element={
                  <RequireDeveloper>
                    <Suspense fallback={<AdminLoadingFallback />}>
                      <OffersEditor />
                    </Suspense>
                  </RequireDeveloper>
                }
              />
              <Route
                path="discounts"
                element={
                  <RequireDeveloper>
                    <Suspense fallback={<AdminLoadingFallback />}>
                      <DiscountsEditor />
                    </Suspense>
                  </RequireDeveloper>
                }
              />
              <Route
                path="curated-favorites"
                element={
                  <RequireDeveloper>
                    <Suspense fallback={<AdminLoadingFallback />}>
                      <CuratedFavoritesEditor />
                    </Suspense>
                  </RequireDeveloper>
                }
              />
              <Route
                path="inactive-customers"
                element={
                  <RequireDeveloper>
                    <Suspense fallback={<AdminLoadingFallback />}>
                      <InactiveCustomers />
                    </Suspense>
                  </RequireDeveloper>
                }
              />
              <Route
                path="settings"
                element={
                  <RequireDeveloper>
                    <Suspense fallback={<AdminLoadingFallback />}>
                      <SettingsEditor />
                    </Suspense>
                  </RequireDeveloper>
                }
              />
              <Route
                path="users"
                element={
                  <RequireDeveloper>
                    <Suspense fallback={<AdminLoadingFallback />}>
                      <UsersEditor />
                    </Suspense>
                  </RequireDeveloper>
                }
              />
            </Route>

            {/* الموقع العام لكل العملاء */}
            <Route path="/*" element={<PublicSite />} />
          </Routes>
        </HashRouter>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
