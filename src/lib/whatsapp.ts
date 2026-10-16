import { CONTACT } from "@/lib/categories";

// Single source of truth for every "Commander / Devis" WhatsApp link.
// To change the number, edit `whatsappNumber` in CONTACT (src/lib/categories.ts).
export function buildWhatsAppUrl(message?: string): string {
  const base = `https://wa.me/${CONTACT.whatsappNumber}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

export function productWhatsAppUrl(productName: string): string {
  return buildWhatsAppUrl(`Bonjour, je suis intéressé par ${productName}`);
}
