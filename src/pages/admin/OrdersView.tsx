// =====================================================
// ملف: OrdersView.tsx
// الغرض: تعرض كل الطلبات اللي بتيجي من الموقع لحظة بلحظة
// وتخليك تحدّث حالة كل طلب (جديد، قيد التحضير، تم)
// =====================================================
import { useOrders, statusLabel } from "@/lib/useOrders";
import type { OrderStatus } from "@/lib/useOrders";
import { Loader2, Clock, User, Phone, MapPin } from "lucide-react";

const STATUS_COLORS: Record<OrderStatus, string> = {
  new: "bg-fire/15 text-fire",
  preparing: "bg-blue-100 text-blue-700",
  done: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-chili/15 text-chili",
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

export function OrdersView() {
  const { orders, loading, updateStatus } = useOrders();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-fire" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-forest-deep">الطلبات</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        بتتحدّث تلقائيًا كل ما طلب جديد ييجي — مش محتاج تحدّث الصفحة
      </p>

      {orders.length === 0 ? (
        <div className="mt-12 flex flex-col items-center gap-2 text-center text-muted-foreground">
          <span className="text-4xl">📋</span>
          <p>مفيش طلبات لسه</p>
        </div>
      ) : (
        <div className="mt-6 flex flex-col gap-3">
          {orders.map((order) => (
            <div
              key={order.id}
              className="rounded-xl border border-forest/10 bg-white p-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" />
                  {formatTime(order.createdAt)}
                </div>

                <select
                  value={order.status}
                  onChange={(e) => updateStatus(order.id, e.target.value as OrderStatus)}
                  className={`rounded-full border-0 px-3 py-1 text-xs font-semibold ${STATUS_COLORS[order.status]}`}
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {statusLabel(s)}
                    </option>
                  ))}
                </select>
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
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-fire" />
                  <span className="text-forest-deep">{order.customerAddress || "—"}</span>
                </div>
              </div>

              <ul className="mt-3 flex flex-col gap-1 border-t border-forest/10 pt-3">
                {order.items.map((item, i) => (
                  <li key={i} className="flex items-center justify-between text-sm">
                    <span>
                      {item.qty}× {item.nameAr}
                      {item.size && <span className="text-muted-foreground"> ({item.size})</span>}
                    </span>
                    <span className="font-price text-muted-foreground">
                      {item.unitPrice * item.qty} ج.م
                    </span>
                  </li>
                ))}
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
