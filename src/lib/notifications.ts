import type { Order } from "@/lib/orders";
import { CONTACT } from "@/lib/categories";
import { formatCFA } from "@/lib/format";

// Order notification emails via EmailJS (https://www.emailjs.com) — a
// client-side email API, no backend needed. To activate:
//   1. Create a free EmailJS account and connect an email service (Gmail, etc.)
//   2. Create two email templates — one for the owner notification, one for
//      the customer confirmation — using the variables sent in
//      `templateParams` below (order_number, customer_name, items_summary, …)
//   3. Copy the service ID, both template IDs and the public key into `.env`
//      (see .env.example)
// Until configured, sendOrderNotifications() is a no-op that logs a warning.
const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
const EMAILJS_TEMPLATE_ADMIN_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ADMIN_ID;
const EMAILJS_TEMPLATE_CUSTOMER_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_CUSTOMER_ID;

const EMAILJS_ENDPOINT = "https://api.emailjs.com/api/v1.0/email/send";

function isEmailConfigured(): boolean {
  return Boolean(
    EMAILJS_SERVICE_ID &&
    EMAILJS_PUBLIC_KEY &&
    EMAILJS_TEMPLATE_ADMIN_ID &&
    EMAILJS_TEMPLATE_CUSTOMER_ID,
  );
}

function orderSummaryLines(order: Order): string {
  return order.items.map((item) => `${item.name} x${item.quantity}`).join("\n");
}

async function sendEmail(templateId: string, templateParams: Record<string, string>) {
  const response = await fetch(EMAILJS_ENDPOINT, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      service_id: EMAILJS_SERVICE_ID,
      template_id: templateId,
      user_id: EMAILJS_PUBLIC_KEY,
      template_params: templateParams,
    }),
  });
  if (!response.ok) {
    throw new Error(`EmailJS a répondu ${response.status}`);
  }
}

// Sends the "new order" email to the shop owner and the confirmation email to
// the customer. Failures are logged but never block the checkout flow — the
// order is already saved locally by the time this runs.
export async function sendOrderNotifications(order: Order): Promise<void> {
  if (!isEmailConfigured()) {
    console.warn(
      "Notifications de commande désactivées : configurez VITE_EMAILJS_* dans .env (voir .env.example).",
    );
    return;
  }

  const templateParams: Record<string, string> = {
    order_number: order.orderNumber,
    customer_name: order.customerName,
    customer_phone: order.phone,
    customer_email: order.email,
    delivery_address: order.address,
    delivery_slot: order.deliverySlot ?? "",
    payment_method: order.paymentMethod,
    items_summary: orderSummaryLines(order),
    subtotal: formatCFA(order.subtotal),
    discount_total: formatCFA(order.discountTotal),
    delivery_fee: formatCFA(order.deliveryFee),
    total: formatCFA(order.total),
    owner_email: CONTACT.email,
  };

  const results = await Promise.allSettled([
    sendEmail(EMAILJS_TEMPLATE_ADMIN_ID, { ...templateParams, to_email: CONTACT.email }),
    order.email
      ? sendEmail(EMAILJS_TEMPLATE_CUSTOMER_ID, { ...templateParams, to_email: order.email })
      : Promise.resolve(),
  ]);

  for (const result of results) {
    if (result.status === "rejected") {
      console.error("Échec d'envoi d'une notification de commande :", result.reason);
    }
  }
}

// Builds a wa.me "click to chat" link pre-filled with the order summary, so
// the customer can send order details straight to the shop's WhatsApp.
export function buildOrderWhatsAppLink(order: Order): string {
  const lines = [
    `Commande ${order.orderNumber}`,
    orderSummaryLines(order),
    `Total : ${formatCFA(order.total)}`,
    order.deliverySlot ? `Livraison : ${order.deliverySlot}` : "",
    `Client : ${order.customerName} — ${order.phone}`,
  ].filter(Boolean);
  return `https://wa.me/${CONTACT.whatsappNumber}?text=${encodeURIComponent(lines.join("\n"))}`;
}
