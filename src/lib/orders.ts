import { useSyncExternalStore } from "react";

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
  customerId?: string;
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
  paymentMethod: "wave" | "orange-money" | "free-money" | "card";
};

const ORDERS_STORAGE_KEY = "techno-office-orders";

function readOrders(): Order[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(ORDERS_STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? (parsed as Order[]) : [];
  } catch {
    return [];
  }
}

let cache: Order[] = readOrders();
const listeners = new Set<() => void>();

type StatusChangeListener = (order: Order, previousStatus: OrderStatus) => void;
const statusChangeListeners = new Set<StatusChangeListener>();

function persistAndNotify(next: Order[]) {
  cache = next;
  if (typeof window !== "undefined") {
    window.localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(cache));
  }
  listeners.forEach((l) => l());
}

export function generateOrderNumber() {
  const random = Math.floor(1000 + Math.random() * 9000);
  return `TOS-${Date.now().toString().slice(-6)}${random}`;
}

export function loadOrders(): Order[] {
  return cache;
}

export function saveOrder(order: Order) {
  persistAndNotify([order, ...cache]);
}

export function loadLastOrder(): Order | null {
  return cache[0] ?? null;
}

export function loadOrdersForCustomer(customerId: string): Order[] {
  return cache.filter((o) => o.customerId === customerId);
}

// Notification integration placeholder — hook a real WhatsApp/SMS/email sender
// here by subscribing via onOrderStatusChange(). No message is actually sent yet.
export function onOrderStatusChange(listener: StatusChangeListener) {
  statusChangeListeners.add(listener);
  return () => statusChangeListeners.delete(listener);
}

export function updateOrderStatus(orderNumber: string, status: OrderStatus) {
  const target = cache.find((o) => o.orderNumber === orderNumber);
  if (!target || target.status === status) return;
  const previousStatus = target.status;
  const next = cache.map((o) => (o.orderNumber === orderNumber ? { ...o, status } : o));
  persistAndNotify(next);
  const updated = next.find((o) => o.orderNumber === orderNumber)!;
  statusChangeListeners.forEach((l) => l(updated, previousStatus));
}

export function subscribeOrders(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function useAllOrders() {
  return useSyncExternalStore(subscribeOrders, loadOrders, loadOrders);
}
