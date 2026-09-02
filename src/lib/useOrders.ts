// =====================================================
// ملف: useOrders.ts
// الغرض: حفظ الطلبات الجديدة من الموقع، وجلبها في لوحة التحكم
// =====================================================
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { CartLine } from "@/context/CartContext";
import type { PaymentMethod, PaymentStatus } from "@/lib/payment/types";

export type OrderStatus = "new" | "preparing" | "done" | "cancelled";

export type FulfillmentType = "delivery" | "pickup";

export type Order = {
  id: string;
  displayNumber: number | null;
  createdAt: string;
  status: OrderStatus;
  items: { nameAr: string; size?: string; qty: number; unitPrice: number }[];
  totalPrice: number;
  orderChannel: string;
  customerName: string;
  customerPhone: string;
  customerPhone2: string;
  customerAddress: string;
  fulfillmentType: FulfillmentType;
  deliveryZoneId: string | null;
  deliveryPrice: number;
  pickupBranchId: string | null;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
};

export type CustomerInfo = {
  name: string;
  phone: string;
  phone2?: string;
  address: string;
};

export type FulfillmentInfo =
  | { type: "delivery"; zoneId: string; deliveryPrice: number }
  | { type: "pickup"; branchId: string };

// بتتنادى من صفحة السلة لما العميل يأكد الطلب
// بتسجل الطلب في قاعدة البيانات عشان يظهر في لوحة التحكم
export async function saveOrder(
  lines: CartLine[],
  totalPrice: number,
  customer: CustomerInfo,
  paymentMethod: PaymentMethod = "cash",
  fulfillment: FulfillmentInfo,
  extras?: { couponCode?: string; discountAmount?: number; customerUserId?: string }
) {
  const items = lines.map((l) => ({
    nameAr: l.nameAr,
    size: l.size,
    qty: l.qty,
    unitPrice: l.unitPrice,
  }));

  const deliveryPrice = fulfillment.type === "delivery" ? fulfillment.deliveryPrice : 0;
  const finalTotal = totalPrice + deliveryPrice - (extras?.discountAmount ?? 0);

  const { data, error } = await supabase
    .from("orders")
    .insert({
      items,
      total_price: finalTotal,
      order_channel: "website",
      status: "new",
      customer_name: customer.name,
      customer_phone: customer.phone,
      customer_phone_2: customer.phone2 || "",
      customer_address: customer.address,
      fulfillment_type: fulfillment.type,
      delivery_zone_id: fulfillment.type === "delivery" ? fulfillment.zoneId : null,
      delivery_price: deliveryPrice,
      pickup_branch_id: fulfillment.type === "pickup" ? fulfillment.branchId : null,
      payment_method: paymentMethod,
      applied_coupon_code: extras?.couponCode || null,
      discount_amount: extras?.discountAmount ?? 0,
      customer_user_id: extras?.customerUserId || null,
      // الكاش بيتحسب "لسه مدفوعش" لحد ما يوصل ويتحصّل، والدفع الإلكتروني
      // هيتحدّث لـ "paid" بعد نجاح المعاملة فعليًا من بوابة الدفع
      payment_status: "pending",
    })
    .select("id, display_number")
    .single();

  if (error) {
    // مش هنمنع العميل من إكمال الطلب لو فشل التسجيل، بس بنسجل الخطأ
    console.error("فشل حفظ الطلب في قاعدة البيانات:", error.message);
    return { success: false, orderId: null, displayNumber: null };
  }
  return { success: true, orderId: data?.id ?? null, displayNumber: data?.display_number ?? null };
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
  const [error, setError] = useState<string | null>(null);

  async function fetchOrders() {
    setError(null);
    const { data, error: fetchError } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (fetchError) {
      console.error("فشل جلب الطلبات:", fetchError.message);
      setError("حصلت مشكلة في تحميل الطلبات، جرب تحدّث الصفحة");
      setLoading(false);
      return;
    }

    if (data) {
      setOrders(
        data.map((o) => ({
          id: o.id,
          displayNumber: o.display_number ?? null,
          createdAt: o.created_at,
          status: o.status,
          items: Array.isArray(o.items) ? o.items : [],
          totalPrice: Number(o.total_price),
          orderChannel: o.order_channel,
          customerName: o.customer_name || "",
          customerPhone: o.customer_phone || "",
          customerPhone2: o.customer_phone_2 || "",
          customerAddress: o.customer_address || "",
          fulfillmentType: (o.fulfillment_type || "delivery") as FulfillmentType,
          deliveryZoneId: o.delivery_zone_id || null,
          deliveryPrice: Number(o.delivery_price || 0),
          pickupBranchId: o.pickup_branch_id || null,
          paymentMethod: (o.payment_method || "cash") as PaymentMethod,
          paymentStatus: (o.payment_status || "pending") as PaymentStatus,
        }))
      );
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchOrders();

    // نتابع أي طلب جديد لحظة بلحظة (Realtime) عشان يظهر فورًا من غير ما تحدّث الصفحة
    // بنستخدم اسم قناة فريد في كل مرة، عشان لو أكتر من صفحة في نفس الوقت
    // بتستخدم useOrders() (زي القائمة الجانبية وصفحة الطلبات مع بعض)،
    // كل واحدة تفتح اشتراكها الخاص من غير ما تتعارض مع التانية
    const channelName = `orders-changes-${Math.random().toString(36).slice(2)}`;
    const channel = supabase
      .channel(channelName)
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

  async function updatePaymentStatus(orderId: string, paymentStatus: PaymentStatus) {
    const { error } = await supabase
      .from("orders")
      .update({ payment_status: paymentStatus })
      .eq("id", orderId);
    if (!error) {
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, paymentStatus } : o))
      );
    }
  }

  return { orders, loading, error, updateStatus, updatePaymentStatus, refetch: fetchOrders };
}
