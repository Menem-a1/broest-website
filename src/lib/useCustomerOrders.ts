// =====================================================
// ملف: useCustomerOrders.ts
// الغرض: يجيب سجل الطلبات السابقة للعميل المسجل دخول بجوجل
// =====================================================
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { OrderStatus, FulfillmentType } from "@/lib/useOrders";
import type { PaymentMethod, PaymentStatus } from "@/lib/payment/types";

export type CustomerOrder = {
  id: string;
  displayNumber: number | null;
  createdAt: string;
  status: OrderStatus;
  items: { nameAr: string; size?: string; qty: number; unitPrice: number }[];
  totalPrice: number;
  fulfillmentType: FulfillmentType;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
};

export function useCustomerOrders(userId: string | undefined) {
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchOrders() {
    if (!userId) {
      setOrders([]);
      setLoading(false);
      return;
    }
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("customer_user_id", userId)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setOrders(
        data.map((o) => ({
          id: o.id,
          displayNumber: o.display_number ?? null,
          createdAt: o.created_at,
          status: o.status,
          items: Array.isArray(o.items) ? o.items : [],
          totalPrice: Number(o.total_price),
          fulfillmentType: (o.fulfillment_type || "delivery") as FulfillmentType,
          paymentMethod: (o.payment_method || "cash") as PaymentMethod,
          paymentStatus: (o.payment_status || "pending") as PaymentStatus,
        }))
      );
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  return { orders, loading, refetch: fetchOrders };
}
