import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type OrderItem = {
  productId: string;
  name: string;
  quantity: number;
  unitPrice: number;
};

export type OrderStatus = "nouvelle" | "en_traitement" | "expédiée" | "terminée";

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  nouvelle: "Nouvelle",
  en_traitement: "En traitement",
  expédiée: "Expédiée",
  terminée: "Terminée",
};

export type Order = {
  orderNumber: string;
  createdAt: string;
  status: OrderStatus;
  items: OrderItem[];
  subtotal: number;
  discountTotal: number;
  deliveryFee: number;
  total: number;
  customerName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  region: string;
  deliveryMethod: "pickup" | "delivery";
  deliverySlot?: string;
  paymentMethod: "cod" | "wave" | "bank-transfer";
};

// Orders live in Supabase (table `orders`): publicly insertable (guest
// checkout, no accounts), but never publicly readable — only an authenticated
// admin session can read them back (see the migration's RLS policies). The
// checkout confirmation page therefore can't re-query its own just-placed
// order; instead saveOrder() stashes it in sessionStorage for
// loadLastOrder() to read directly.
const LAST_ORDER_KEY = "2m-global-services-last-order";

type OrderRow = {
  order_number: string;
  created_at: string;
  status: OrderStatus;
  items: OrderItem[];
  subtotal: string | number;
  discount_total: string | number;
  delivery_fee: string | number;
  total: string | number;
  customer_name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  region: string;
  delivery_method: "pickup" | "delivery";
  delivery_slot: string | null;
  payment_method: "cod" | "wave" | "bank-transfer";
};

function rowToOrder(row: OrderRow): Order {
  return {
    orderNumber: row.order_number,
    createdAt: row.created_at,
    status: row.status,
    items: row.items,
    subtotal: Number(row.subtotal),
    discountTotal: Number(row.discount_total),
    deliveryFee: Number(row.delivery_fee),
    total: Number(row.total),
    customerName: row.customer_name,
    phone: row.phone,
    email: row.email,
    address: row.address,
    city: row.city,
    region: row.region,
    deliveryMethod: row.delivery_method,
    deliverySlot: row.delivery_slot ?? undefined,
    paymentMethod: row.payment_method,
  };
}

function orderToRow(order: Order) {
  return {
    order_number: order.orderNumber,
    created_at: order.createdAt,
    status: order.status,
    items: order.items,
    subtotal: order.subtotal,
    discount_total: order.discountTotal,
    delivery_fee: order.deliveryFee,
    total: order.total,
    customer_name: order.customerName,
    phone: order.phone,
    email: order.email,
    address: order.address,
    city: order.city,
    region: order.region,
    delivery_method: order.deliveryMethod,
    delivery_slot: order.deliverySlot ?? null,
    payment_method: order.paymentMethod,
  };
}

export function generateOrderNumber() {
  const random = Math.floor(1000 + Math.random() * 9000);
  return `2M-${Date.now().toString().slice(-6)}${random}`;
}

export async function saveOrder(order: Order): Promise<void> {
  const { error } = await supabase.from("orders").insert(orderToRow(order));
  if (error) throw error;
  if (typeof window !== "undefined") {
    window.sessionStorage.setItem(LAST_ORDER_KEY, JSON.stringify(order));
  }
}

export function loadLastOrder(): Order | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(LAST_ORDER_KEY);
    return raw ? (JSON.parse(raw) as Order) : null;
  } catch {
    return null;
  }
}

const ORDERS_QUERY_KEY = ["orders"] as const;

async function fetchOrders(): Promise<Order[]> {
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data as OrderRow[] | null)?.map(rowToOrder) ?? [];
}

export function useAllOrders(): Order[] {
  const { data } = useQuery({ queryKey: ORDERS_QUERY_KEY, queryFn: fetchOrders });
  return data ?? [];
}

export function useInvalidateOrders() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: ORDERS_QUERY_KEY });
}

type StatusChangeListener = (order: Order, previousStatus: OrderStatus) => void;
const statusChangeListeners = new Set<StatusChangeListener>();

// Notification integration placeholder — hook a real WhatsApp/SMS/email sender
// here by subscribing via onOrderStatusChange(). No message is actually sent yet.
export function onOrderStatusChange(listener: StatusChangeListener) {
  statusChangeListeners.add(listener);
  return () => statusChangeListeners.delete(listener);
}

export async function updateOrderStatus(order: Order, status: OrderStatus): Promise<void> {
  if (order.status === status) return;
  const { error } = await supabase
    .from("orders")
    .update({ status })
    .eq("order_number", order.orderNumber);
  if (error) throw error;
  const previousStatus = order.status;
  statusChangeListeners.forEach((l) => l({ ...order, status }, previousStatus));
}
