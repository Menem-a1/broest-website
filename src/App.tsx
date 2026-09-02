import { HashRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";
import { CustomerAuthProvider } from "@/context/CustomerAuthContext";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { CartDrawer } from "@/components/CartDrawer";
import { StickyOrderBar } from "@/components/StickyOrderBar";
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
import { AdminLayout } from "@/pages/admin/AdminLayout";
import { Dashboard } from "@/pages/admin/Dashboard";
import { MenuEditor } from "@/pages/admin/MenuEditor";
import { SettingsEditor } from "@/pages/admin/SettingsEditor";
import { OrdersView } from "@/pages/admin/OrdersView";
import { HomeEditor } from "@/pages/admin/HomeEditor";
import { ReviewsEditor } from "@/pages/admin/ReviewsEditor";
import { BranchesEditor } from "@/pages/admin/BranchesEditor";
import { DeliveryZonesEditor } from "@/pages/admin/DeliveryZonesEditor";
import { OffersEditor } from "@/pages/admin/OffersEditor";
import { DiscountsEditor } from "@/pages/admin/DiscountsEditor";
import { CuratedFavoritesEditor } from "@/pages/admin/CuratedFavoritesEditor";
import { InactiveCustomers } from "@/pages/admin/InactiveCustomers";
import { UsersEditor } from "@/pages/admin/UsersEditor";

// الموقع العام (اللي بيشوفه العملاء): هيدر + فوتر + سلة + شريط الطلب
// CustomerAuthProvider بيلف الموقع العام بس، عشان دخول العميل بجوجل
// يفضل منفصل تمامًا عن دخول الأدمن (AuthProvider) اللي بيغطي /admin بس
function PublicSite() {
  const { settings } = useSettings();
  useFavicon(settings.faviconUrl);

  return (
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
                  <AdminLayout />
                </RequireAuth>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="orders" element={<OrdersView />} />
              <Route
                path="menu"
                element={
                  <RequireDeveloper>
                    <MenuEditor />
                  </RequireDeveloper>
                }
              />
              <Route
                path="home"
                element={
                  <RequireDeveloper>
                    <HomeEditor />
                  </RequireDeveloper>
                }
              />
              <Route
                path="reviews"
                element={
                  <RequireDeveloper>
                    <ReviewsEditor />
                  </RequireDeveloper>
                }
              />
              <Route
                path="branches"
                element={
                  <RequireDeveloper>
                    <BranchesEditor />
                  </RequireDeveloper>
                }
              />
              <Route
                path="delivery-zones"
                element={
                  <RequireDeveloper>
                    <DeliveryZonesEditor />
                  </RequireDeveloper>
                }
              />
              <Route
                path="offers"
                element={
                  <RequireDeveloper>
                    <OffersEditor />
                  </RequireDeveloper>
                }
              />
              <Route
                path="discounts"
                element={
                  <RequireDeveloper>
                    <DiscountsEditor />
                  </RequireDeveloper>
                }
              />
              <Route
                path="curated-favorites"
                element={
                  <RequireDeveloper>
                    <CuratedFavoritesEditor />
                  </RequireDeveloper>
                }
              />
              <Route
                path="inactive-customers"
                element={
                  <RequireDeveloper>
                    <InactiveCustomers />
                  </RequireDeveloper>
                }
              />
              <Route
                path="settings"
                element={
                  <RequireDeveloper>
                    <SettingsEditor />
                  </RequireDeveloper>
                }
              />
              <Route
                path="users"
                element={
                  <RequireDeveloper>
                    <UsersEditor />
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
