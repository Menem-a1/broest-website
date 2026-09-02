// =====================================================
// ملف: Account.tsx
// الغرض: صفحة حساب العميل — تسجيل الدخول بجوجل، سجل الطلبات
// السابقة مع إعادة الطلب بضغطة واحدة، العناوين المحفوظة،
// والأصناف المفضلة.
// كل حاجة في الصفحة دي اختيارية بالكامل — العميل اللي مش
// عايز يسجل دخول يقدر يفضل يطلب كضيف عادي من المنيو.
// =====================================================
import { useEffect, useState } from "react";
import { useCustomerAuth } from "@/context/CustomerAuthContext";
import { useCustomerOrders } from "@/lib/useCustomerOrders";
import { useCustomerAddresses } from "@/lib/useCustomerAddresses";
import { useDeliveryZones } from "@/lib/useDeliveryZones";
import { useMenu } from "@/lib/useMenu";
import { useCart } from "@/context/CartContext";
import { statusLabel } from "@/lib/useOrders";
import { supabase } from "@/lib/supabase";
import {
  LogOut,
  Loader2,
  Heart,
  MapPin,
  Trash2,
  Plus,
  RotateCcw,
  Package,
  Star,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { submitOrderReview } from "@/lib/useOrderReview";

type Tab = "orders" | "favorites" | "addresses";

// ===== شاشة الدخول / التسجيل =====
function AuthGate() {
  const { signIn, signUp } = useCustomerAuth();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [signupDone, setSignupDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!email.trim() || !password.trim()) {
      setError("املأ الإيميل والباسورد");
      return;
    }
    setSubmitting(true);
    const result =
      mode === "login" ? await signIn(email.trim(), password) : await signUp(email.trim(), password);
    setSubmitting(false);
    if (result.error) {
      setError(result.error);
    } else if (mode === "signup") {
      setSignupDone(true);
    }
  }

  if (signupDone) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <h1 className="font-display text-2xl font-bold text-forest-deep">تم التسجيل بنجاح</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          افتح إيميلك ودوس على رابط التأكيد، وبعدها سجّل دخولك عادي
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-sm px-4 py-16">
      <h1 className="text-center font-display text-2xl font-bold text-forest-deep">حسابك</h1>
      <p className="mt-2 text-center text-sm text-muted-foreground">
        سجّل عشان تحفظ عناوينك وتشوف سجل طلباتك — اختياري تمامًا، تقدر تكمل تطلب كضيف
      </p>

      <div className="mt-6 flex rounded-full border border-forest/15 p-1">
        <button
          onClick={() => setMode("login")}
          className={`flex-1 rounded-full py-2 text-sm font-bold ${
            mode === "login" ? "bg-forest text-cream" : "text-muted-foreground"
          }`}
        >
          تسجيل دخول
        </button>
        <button
          onClick={() => setMode("signup")}
          className={`flex-1 rounded-full py-2 text-sm font-bold ${
            mode === "signup" ? "bg-forest text-cream" : "text-muted-foreground"
          }`}
        >
          حساب جديد
        </button>
      </div>

      <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-3">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="الإيميل"
          className="rounded-lg border border-forest/20 px-3 py-2.5 text-sm"
          dir="ltr"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="الباسورد"
          className="rounded-lg border border-forest/20 px-3 py-2.5 text-sm"
          dir="ltr"
        />
        {error && <p className="text-xs font-semibold text-chili">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="mt-1 rounded-full bg-fire py-3 font-display text-sm font-bold text-forest-deep disabled:opacity-50"
        >
          {submitting ? "..." : mode === "login" ? "تسجيل دخول" : "إنشاء حساب"}
        </button>
      </form>
    </div>
  );
}

export function Account() {
  const { session, loading, signOut } = useCustomerAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("orders");

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-fire" />
      </div>
    );
  }

  // العميل مش مسجل دخول — نعرضله فورم دخول/تسجيل (اختياري تمامًا)
  if (!session) {
    return <AuthGate />;
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 md:px-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-forest-deep">حسابك</h1>
          <p className="text-sm text-muted-foreground">{session.user.email}</p>
        </div>
        <button
          onClick={() => signOut()}
          className="flex items-center gap-1.5 rounded-full border border-forest/20 px-4 py-2 text-sm font-semibold text-forest-deep hover:bg-forest/5"
        >
          <LogOut className="h-4 w-4" /> تسجيل خروج
        </button>
      </div>

      <div className="mb-6 flex gap-2 border-b border-forest/10">
        {[
          { id: "orders" as Tab, label: "طلباتي", icon: Package },
          { id: "favorites" as Tab, label: "المفضلة", icon: Heart },
          { id: "addresses" as Tab, label: "عناويني", icon: MapPin },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 border-b-2 px-3 py-2.5 text-sm font-semibold transition-colors ${
              tab === t.id
                ? "border-fire text-forest-deep"
                : "border-transparent text-muted-foreground hover:text-forest-deep"
            }`}
          >
            <t.icon className="h-4 w-4" /> {t.label}
          </button>
        ))}
      </div>

      {tab === "orders" && <OrdersTab userId={session.user.id} onReorder={() => navigate("/menu")} />}
      {tab === "favorites" && <FavoritesTab userId={session.user.id} />}
      {tab === "addresses" && <AddressesTab userId={session.user.id} />}
    </div>
  );
}

// ===== تاب: سجل الطلبات وإعادة الطلب =====
function OrdersTab({ userId, onReorder }: { userId: string; onReorder: () => void }) {
  const { orders, loading } = useCustomerOrders(userId);
  const { addRawLine, setCartOpen } = useCart();
  const [reviewedOrderIds, setReviewedOrderIds] = useState<Set<string>>(new Set());
  const [reviewingOrderId, setReviewingOrderId] = useState<string | null>(null);

  useEffect(() => {
    if (orders.length === 0) return;
    supabase
      .from("reviews")
      .select("order_id")
      .in(
        "order_id",
        orders.map((o) => o.id)
      )
      .then(({ data }) => {
        setReviewedOrderIds(new Set((data || []).map((r) => r.order_id).filter(Boolean)));
      });
  }, [orders]);

  function handleReorder(order: (typeof orders)[number]) {
    order.items.forEach((item) => {
      addRawLine({
        itemId: item.nameAr, // مفيش item_id متخزن في الطلب القديم، فبنستخدم الاسم كمفتاح فريد كافي هنا
        nameAr: item.nameAr,
        size: item.size,
        unitPrice: item.unitPrice,
        qty: item.qty,
      });
    });
    setCartOpen(true);
    onReorder();
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-fire" />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-muted-foreground">
        لسه مفيش طلبات سابقة، أول طلب هيظهر هنا
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {orders.map((order) => (
        <div key={order.id} className="rounded-xl border border-forest/10 bg-white p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="font-display text-sm font-semibold text-forest-deep">
              {order.displayNumber ? `طلب #${order.displayNumber}` : "طلب"}
            </span>
            <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">
              {statusLabel(order.status)}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            {new Date(order.createdAt).toLocaleDateString("ar-EG", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
          <ul className="mt-2 flex flex-col gap-0.5">
            {order.items.map((item, i) => (
              <li key={i} className="text-sm text-forest-deep/80">
                {item.qty}× {item.nameAr} {item.size && `(${item.size})`}
              </li>
            ))}
          </ul>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-forest/5 pt-3">
            <span className="font-price text-base font-bold text-fire">
              {order.totalPrice} ج.م
            </span>
            <div className="flex items-center gap-2">
              {order.status === "done" && !reviewedOrderIds.has(order.id) && (
                <button
                  onClick={() => setReviewingOrderId(order.id)}
                  className="flex items-center gap-1.5 rounded-full border border-forest/20 px-3 py-2 text-xs font-bold text-forest-deep hover:bg-forest/5"
                >
                  <Star className="h-3.5 w-3.5" /> قيّم الطلب
                </button>
              )}
              <button
                onClick={() => handleReorder(order)}
                className="flex items-center gap-1.5 rounded-full bg-fire px-4 py-2 text-xs font-bold text-forest-deep hover:opacity-90"
              >
                <RotateCcw className="h-3.5 w-3.5" /> اطلب تاني
              </button>
            </div>
          </div>

          {reviewingOrderId === order.id && (
            <ReviewForm
              orderId={order.id}
              onDone={() => {
                setReviewedOrderIds((prev) => new Set(prev).add(order.id));
                setReviewingOrderId(null);
              }}
              onCancel={() => setReviewingOrderId(null)}
            />
          )}
        </div>
      ))}
    </div>
  );
}

// ===== نموذج التقييم (نجوم + تعليق) =====
function ReviewForm({
  orderId,
  onDone,
  onCancel,
}: {
  orderId: string;
  onDone: () => void;
  onCancel: () => void;
}) {
  const { session } = useCustomerAuth();
  const [stars, setStars] = useState(5);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    if (!text.trim()) {
      setError("اكتب تعليق قصير عن تجربتك");
      return;
    }
    setSubmitting(true);
    setError(null);
    const customerName =
      session?.user?.user_metadata?.full_name || session?.user?.email?.split("@")[0] || "عميل";
    const result = await submitOrderReview(orderId, customerName, stars, text.trim());
    setSubmitting(false);
    if (result.success) {
      onDone();
    } else {
      setError("حصلت مشكلة في إرسال التقييم، حاول تاني");
    }
  }

  return (
    <div className="mt-3 rounded-lg border border-forest/10 bg-cream/30 p-3">
      <div className="mb-2 flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} onClick={() => setStars(n)} aria-label={`${n} نجوم`}>
            <Star
              className={`h-6 w-6 ${
                n <= stars ? "fill-fire text-fire" : "text-muted-foreground"
              }`}
            />
          </button>
        ))}
      </div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={2}
        placeholder="عربيتك عن الطلب كانت إزاي؟"
        className="w-full resize-none rounded-lg border border-forest/20 bg-white px-3 py-2 text-sm"
      />
      {error && <p className="mt-1 text-xs text-chili">{error}</p>}
      <div className="mt-2 flex gap-2">
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="rounded-full bg-fire px-4 py-2 text-xs font-bold text-forest-deep disabled:opacity-50"
        >
          {submitting ? "بيتبعت..." : "إرسال التقييم"}
        </button>
        <button
          onClick={onCancel}
          className="rounded-full border border-forest/20 px-4 py-2 text-xs font-semibold text-forest-deep"
        >
          إلغاء
        </button>
      </div>
    </div>
  );
}

// ===== تاب: المفضلة =====
function FavoritesTab({ userId }: { userId: string }) {
  const { menu, loading: menuLoading } = useMenu();
  const { addItem } = useCart();
  const [favIds, setFavIds] = useState<Set<string>>(new Set());
  const [loadingFavs, setLoadingFavs] = useState(true);

  // بنجيب المفضلة هنا مباشرة (نفس الهوك المستخدم في MenuItemCard)
  // لأن الصفحة دي محتاجة تفاصيل الصنف الكاملة (السعر، الأحجام) مش الـ id بس
  useEffect(() => {
    let isMounted = true;
    supabase
      .from("customer_favorites")
      .select("item_id")
      .eq("user_id", userId)
      .then(({ data }) => {
        if (!isMounted) return;
        setFavIds(new Set((data || []).map((f) => f.item_id)));
        setLoadingFavs(false);
      });
    return () => {
      isMounted = false;
    };
  }, [userId]);

  if (menuLoading || loadingFavs) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-fire" />
      </div>
    );
  }

  const favoriteItems = menu.filter((item) => favIds.has(item.id));

  if (favoriteItems.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-muted-foreground">
        لسه مفيش أصناف مفضلة، دوس على علامة القلب في أي صنف من المنيو عشان تضيفه هنا
      </p>
    );
  }

  return (
    <div className="grid gap-3 md:grid-cols-2">
      {favoriteItems.map((item) => (
        <div
          key={item.id}
          className="flex items-center justify-between gap-3 rounded-xl border border-forest/10 bg-white p-4"
        >
          <div>
            <p className="font-display text-sm font-semibold text-forest-deep">{item.nameAr}</p>
            <p className="font-price text-sm text-fire">{item.price} ج.م</p>
          </div>
          <button
            onClick={() => addItem(item)}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-forest text-cream hover:bg-fire"
            aria-label="أضف للسلة"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}

// ===== تاب: العناوين المحفوظة =====
function AddressesTab({ userId }: { userId: string }) {
  const { addresses, loading, addAddress, deleteAddress } = useCustomerAddresses(userId);
  const { zones } = useDeliveryZones();
  const [showForm, setShowForm] = useState(false);
  const [label, setLabel] = useState("البيت");
  const [zoneId, setZoneId] = useState("");
  const [detail, setDetail] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleAdd() {
    if (!zoneId || !detail.trim()) return;
    setSaving(true);
    const result = await addAddress({ label, deliveryZoneId: zoneId, addressDetail: detail.trim() });
    setSaving(false);
    if (result.success) {
      setShowForm(false);
      setLabel("البيت");
      setZoneId("");
      setDetail("");
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-fire" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col gap-3">
        {addresses.map((addr) => (
          <div
            key={addr.id}
            className="flex items-center justify-between gap-3 rounded-xl border border-forest/10 bg-white p-4"
          >
            <div>
              <p className="font-display text-sm font-semibold text-forest-deep">{addr.label}</p>
              <p className="text-sm text-muted-foreground">{addr.addressDetail}</p>
            </div>
            <button
              onClick={() => deleteAddress(addr.id)}
              className="flex h-8 w-8 items-center justify-center rounded-full text-chili hover:bg-chili/10"
              aria-label="حذف العنوان"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}

        {addresses.length === 0 && !showForm && (
          <p className="py-6 text-center text-sm text-muted-foreground">
            لسه مفيش عناوين محفوظة
          </p>
        )}
      </div>

      {showForm ? (
        <div className="mt-4 rounded-xl border border-forest/10 bg-white p-4">
          <div className="flex flex-col gap-3">
            <input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="اسم العنوان (البيت، الشغل...)"
              className="w-full rounded-lg border border-forest/20 px-3 py-2 text-sm"
            />
            <select
              value={zoneId}
              onChange={(e) => setZoneId(e.target.value)}
              className="w-full rounded-lg border border-forest/20 px-3 py-2 text-sm"
            >
              <option value="">اختار المنطقة</option>
              {zones.map((z) => (
                <option key={z.id} value={z.id}>
                  {z.nameAr}
                </option>
              ))}
            </select>
            <textarea
              value={detail}
              onChange={(e) => setDetail(e.target.value)}
              rows={2}
              placeholder="العنوان بالتفصيل"
              className="w-full resize-none rounded-lg border border-forest/20 px-3 py-2 text-sm"
            />
            <div className="flex gap-2">
              <button
                onClick={handleAdd}
                disabled={saving}
                className="rounded-full bg-fire px-4 py-2 text-sm font-semibold text-forest-deep disabled:opacity-50"
              >
                {saving ? "بيحفظ..." : "حفظ العنوان"}
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="rounded-full border border-forest/20 px-4 py-2 text-sm font-semibold text-forest-deep"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="mt-4 flex items-center gap-1.5 rounded-full border border-forest/20 px-4 py-2 text-sm font-semibold text-forest-deep hover:bg-forest/5"
        >
          <Plus className="h-4 w-4" /> إضافة عنوان جديد
        </button>
      )}
    </div>
  );
}
