// =====================================================
// ملف: OrdersView.tsx
// الغرض: تعرض كل الطلبات اللي بتيجي من الموقع لحظة بلحظة
// وتخليك تحدّث حالة كل طلب (جديد، قيد التحضير، تم)
// فيها فلتر تاريخ وتصدير CSV، متاحين للمطور بس
// =====================================================
import { useMemo, useState } from "react";
import { useOrders, statusLabel } from "@/lib/useOrders";
import type { OrderStatus, Order } from "@/lib/useOrders";
import { paymentMethodLabel, paymentStatusLabel } from "@/lib/payment/types";
import { useAuth } from "@/context/AuthContext";
import { useBranches } from "@/lib/useBranches";
import { useOrderCounterReset } from "@/lib/useOrderCounterReset";
import { cairoDateKey } from "@/lib/cairoTime";
import {
  Loader2,
  Clock,
  User,
  Phone,
  MapPin,
  Banknote,
  CreditCard,
  Check,
  Download,
  Hash,
  RotateCcw,
} from "lucide-react";

const STATUS_STYLES: Record<OrderStatus, { active: string; idle: string }> = {
  new: {
    active: "bg-fire text-white border-fire",
    idle: "bg-white text-fire border-fire/40",
  },
  preparing: {
    active: "bg-blue-600 text-white border-blue-600",
    idle: "bg-white text-blue-600 border-blue-300",
  },
  done: {
    active: "bg-emerald-600 text-white border-emerald-600",
    idle: "bg-white text-emerald-700 border-emerald-300",
  },
  cancelled: {
    active: "bg-chili text-white border-chili",
    idle: "bg-white text-chili border-chili/40",
  },
};

const STATUS_OPTIONS: OrderStatus[] = ["new", "preparing", "done", "cancelled"];

function formatTime(iso: string) {
  const date = new Date(iso);
  return date.toLocaleString("ar-EG", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// بتحول قايمة الطلبات لملف CSV وتنزّله على جهاز المطور
function exportOrdersToCsv(orders: Order[]) {
  const headers = [
    "رقم الطلب",
    "التاريخ",
    "الحالة",
    "اسم العميل",
    "تليفون",
    "تليفون تاني",
    "العنوان/الفرع",
    "طريقة الاستلام",
    "طريقة الدفع",
    "حالة الدفع",
    "الإجمالي",
  ];

  const rows = orders.map((o) => [
    o.displayNumber ?? "",
    new Date(o.createdAt).toLocaleString("ar-EG"),
    statusLabel(o.status),
    o.customerName,
    o.customerPhone,
    o.customerPhone2,
    o.customerAddress,
    o.fulfillmentType === "delivery" ? "توصيل" : "استلام من الفرع",
    paymentMethodLabel(o.paymentMethod),
    paymentStatusLabel(o.paymentStatus),
    o.totalPrice,
  ]);

  const csvContent =
    "\uFEFF" + // BOM عشان الإكسل يقرا العربي صح
    [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `طلبات-بروست-${cairoDateKey()}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export function OrdersView() {
  const { orders, loading, error, updateStatus, updatePaymentStatus } = useOrders();
  const { role } = useAuth();
  const isDeveloper = role === "developer";
  const { branches } = useBranches();
  const { autoResetEnabled, manualReset, toggleAutoReset } = useOrderCounterReset(
    branches[0]?.opensAt
  );
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // الطلبات المفلترة حسب التاريخ (لو المطور اختار مدى زمني)، مرتبة الأحدث الأول
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const orderDate = cairoDateKey(new Date(o.createdAt));
      if (dateFrom && orderDate < dateFrom) return false;
      if (dateTo && orderDate > dateTo) return false;
      return true;
    });
  }, [orders, dateFrom, dateTo]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-fire" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-chili/30 bg-chili/5 p-6 text-center text-chili">
        {error}
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-forest-deep">الطلبات</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            بتتحدّث تلقائيًا كل ما طلب جديد ييجي — مش محتاج تحدّث الصفحة
          </p>
        </div>

        {/* فلتر التاريخ وتصدير CSV — متاحين للمطور بس */}
        {isDeveloper && (
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="rounded-lg border border-forest/15 px-2.5 py-1.5 text-xs"
              aria-label="من تاريخ"
            />
            <span className="text-xs text-muted-foreground">إلى</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="rounded-lg border border-forest/15 px-2.5 py-1.5 text-xs"
              aria-label="إلى تاريخ"
            />
            <button
              onClick={() => exportOrdersToCsv(filteredOrders)}
              disabled={filteredOrders.length === 0}
              className="flex items-center gap-1.5 rounded-full bg-forest px-3 py-1.5 text-xs font-semibold text-cream hover:bg-forest-deep disabled:opacity-40"
            >
              <Download className="h-3.5 w-3.5" /> تصدير CSV
            </button>
          </div>
        )}
      </div>

      {/* تصفير عداد الطلبات — متاح للمطور بس */}
      {isDeveloper && (
        <div className="mt-3 flex flex-wrap items-center gap-2 rounded-lg bg-muted/40 px-3 py-2">
          <label className="flex items-center gap-1.5 text-xs font-semibold text-forest-deep">
            <input
              type="checkbox"
              checked={autoResetEnabled}
              onChange={(e) => toggleAutoReset(e.target.checked)}
            />
            تصفير العداد تلقائي وقت فتح المطعم
          </label>
          <button
            onClick={() => {
              if (confirm("متأكد إنك عايز تصفّر عداد الطلبات دلوقتي؟")) manualReset();
            }}
            className="flex items-center gap-1.5 rounded-full border border-forest/20 px-3 py-1.5 text-xs font-semibold text-forest-deep hover:bg-white"
          >
            <RotateCcw className="h-3.5 w-3.5" /> صفّر العداد دلوقتي
          </button>
        </div>
      )}

      {filteredOrders.length === 0 ? (
        <div className="mt-12 flex flex-col items-center gap-2 text-center text-muted-foreground">
          <span className="text-4xl">📋</span>
          <p>{orders.length === 0 ? "مفيش طلبات لسه" : "مفيش طلبات في المدة دي"}</p>
        </div>
      ) : (
        <div className="mt-6 flex flex-col gap-3">
          {filteredOrders.map((order) => (
            <div
              key={order.id}
              className="rounded-xl border border-forest/10 bg-white p-4"
            >
              <div className="flex flex-wrap items-center gap-2">
                {order.displayNumber && (
                  <span className="flex items-center gap-1 rounded-full bg-forest/10 px-2.5 py-1 text-xs font-bold text-forest-deep">
                    <Hash className="h-3 w-3" /> {order.displayNumber}
                  </span>
                )}
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" />
                  {formatTime(order.createdAt)}
                </div>
              </div>

              <div className="mt-2.5 flex items-center justify-between gap-2">
                <div className="flex flex-wrap gap-1.5">
                  {STATUS_OPTIONS.map((s) => {
                    const isActive = order.status === s;
                    return (
                      <button
                        key={s}
                        onClick={() => updateStatus(order.id, s)}
                        className={`rounded-full border-2 px-3 py-1.5 text-xs font-bold transition-colors ${
                          isActive ? STATUS_STYLES[s].active : STATUS_STYLES[s].idle
                        }`}
                      >
                        {statusLabel(s)}
                      </button>
                    );
                  })}
                </div>

                {order.paymentStatus !== "paid" ? (
                  <button
                    onClick={() => updatePaymentStatus(order.id, "paid")}
                    className="flex shrink-0 items-center gap-1 rounded-full border-2 border-emerald-500 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 hover:bg-emerald-100"
                  >
                    <Check className="h-3.5 w-3.5" /> اتحصّل
                  </button>
                ) : (
                  <span className="flex shrink-0 items-center gap-1 rounded-full bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white">
                    <Check className="h-3.5 w-3.5" /> اتحصّل
                  </span>
                )}
              </div>

              <div className="mt-3 flex flex-col gap-1.5 rounded-lg bg-muted/50 p-3 text-sm">
                <div className="flex items-center gap-2">
                  <User className="h-3.5 w-3.5 text-fire" />
                  <span className="font-semibold text-forest-deep">{order.customerName || "بدون اسم"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5 text-fire" />
                  <a href={`tel:${order.customerPhone}`} className="text-forest-deep hover:underline" dir="ltr">
                    {order.customerPhone || "—"}
                  </a>
                  {order.customerPhone2 && (
                    <a
                      href={`tel:${order.customerPhone2}`}
                      className="text-muted-foreground hover:underline"
                      dir="ltr"
                    >
                      / {order.customerPhone2}
                    </a>
                  )}
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-fire" />
                  <span className="text-forest-deep">
                    {order.fulfillmentType === "pickup"
                      ? "استلام من الفرع"
                      : order.customerAddress || "—"}
                  </span>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between border-t border-forest/10 pt-3">
                <div className="flex items-center gap-2 text-sm">
                  {order.paymentMethod === "cash" ? (
                    <Banknote className="h-4 w-4 text-fire" />
                  ) : (
                    <CreditCard className="h-4 w-4 text-fire" />
                  )}
                  <span className="text-muted-foreground">
                    {paymentMethodLabel(order.paymentMethod)}
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                      order.paymentStatus === "paid"
                        ? "bg-emerald-100 text-emerald-700"
                        : order.paymentStatus === "failed"
                        ? "bg-chili/15 text-chili"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {paymentStatusLabel(order.paymentStatus)}
                  </span>
                </div>
              </div>

              <ul className="mt-3 flex flex-col gap-1 border-t border-forest/10 pt-3">
                {order.items.length === 0 ? (
                  <li className="text-sm text-muted-foreground">مفيش تفاصيل أصناف لهذا الطلب</li>
                ) : (
                  order.items.map((item, i) => (
                    <li key={i} className="flex items-center justify-between text-sm">
                      <span>
                        {item.qty}× {item.nameAr}
                        {item.size && <span className="text-muted-foreground"> ({item.size})</span>}
                      </span>
                      <span className="font-price text-muted-foreground">
                        {item.unitPrice * item.qty} ج.م
                      </span>
                    </li>
                  ))
                )}
              </ul>

              <div className="mt-3 flex items-center justify-between border-t border-forest/10 pt-3">
                <span className="font-display text-sm font-semibold text-forest-deep">
                  الإجمالي
                </span>
                <span className="font-price text-lg font-bold text-fire">
                  {order.totalPrice} ج.م
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
