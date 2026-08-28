import { HashRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { CartDrawer } from "@/components/CartDrawer";
import { StickyOrderBar } from "@/components/StickyOrderBar";
import { useSettings } from "@/lib/useSettings";
import { useFavicon } from "@/lib/useFavicon";
import { Home } from "@/pages/Home";
import { Menu } from "@/pages/Menu";
import { About } from "@/pages/About";
import { Contact } from "@/pages/Contact";
import { Login } from "@/pages/admin/Login";
import { RequireAuth } from "@/pages/admin/RequireAuth";
import { AdminLayout } from "@/pages/admin/AdminLayout";
import { Dashboard } from "@/pages/admin/Dashboard";
import { MenuEditor } from "@/pages/admin/MenuEditor";
import { SettingsEditor } from "@/pages/admin/SettingsEditor";
import { OrdersView } from "@/pages/admin/OrdersView";
import { HomeEditor } from "@/pages/admin/HomeEditor";
import { ReviewsEditor } from "@/pages/admin/ReviewsEditor";
import { BranchesEditor } from "@/pages/admin/BranchesEditor";

// الموقع العام (اللي بيشوفه العملاء): هيدر + فوتر + سلة + شريط الطلب
function PublicSite() {
  const { settings } = useSettings();
  useFavicon(settings.faviconUrl);

  return (
    <div className="flex min-h-screen flex-col" dir="rtl">
      <SiteHeader />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/menu" element={<Menu />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </main>
      <SiteFooter />
      <CartDrawer />
      <StickyOrderBar />
    </div>
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
              <Route path="menu" element={<MenuEditor />} />
              <Route path="home" element={<HomeEditor />} />
              <Route path="reviews" element={<ReviewsEditor />} />
              <Route path="branches" element={<BranchesEditor />} />
              <Route path="settings" element={<SettingsEditor />} />
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
