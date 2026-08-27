// =====================================================
// ملف: useOrders.ts
// الغرض: حفظ الطلبات الجديدة من الموقع، وجلبها في لوحة التحكم
// =====================================================
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { CartLine } from "@/context/CartContext";

export type OrderStatus = "new" | "preparing" | "done" | "cancelled";

export type Order = {
  id: string;
  createdAt: string;
  status: OrderStatus;
  items: { nameAr: string; size?: string; qty: number; unitPrice: number }[];
  totalPrice: number;
  orderChannel: string;
};

// بتتنادى من صفحة السلة لما العميل يضغط "واتساب" أو "اتصال"
// بتسجل الطلب في قاعدة البيانات عشان يظهر في لوحة التحكم
export async function saveOrder(lines: CartLine[], totalPrice: number, channel: "whatsapp" | "phone") {
  const items = lines.map((l) => ({
    nameAr: l.nameAr,
    size: l.size,
    qty: l.qty,
    unitPrice: l.unitPrice,
  }));

  const { error } = await supabase.from("orders").insert({
    items,
    total_price: totalPrice,
    order_channel: channel,
    status: "new",
  });

  if (error) {
    // مش هنمنع العميل من إكمال الطلب لو فشل التسجيل، بس بنسجل الخطأ
    console.error("فشل حفظ الطلب في قاعدة البيانات:", error.message);
  }
}

const STATUS_LABELS: Record<OrderStatus, string> = {
  new: "جديد",
  preparing: "قيد التحضير",
  done: "تم التسليم",
  cancelled: "ملغي",
};

export function statusLabel(status: OrderStatus) {
  return STATUS_LABELS[status] || status;
}

// بتتستخدم في لوحة التحكم لعرض كل الطلبات وتحديثها لحظة بلحظة
export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchOrders() {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setOrders(
        data.map((o) => ({
          id: o.id,
          createdAt: o.created_at,
          status: o.status,
          items: o.items,
          totalPrice: Number(o.total_price),
          orderChannel: o.order_channel,
        }))
      );
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchOrders();

    // نتابع أي طلب جديد لحظة بلحظة (Realtime) عشان يظهر فورًا من غير ما تحدّث الصفحة
    const channel = supabase
      .channel("orders-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        () => {
          fetchOrders();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function updateStatus(orderId: string, status: OrderStatus) {
    const { error } = await supabase.from("orders").update({ status }).eq("id", orderId);
    if (!error) {
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status } : o)));
    }
  }

  return { orders, loading, updateStatus, refetch: fetchOrders };
}
