import { DELIVERY_LABELS, ORDER_STATUS_LABELS, PAYMENT_LABELS, type Order } from "@/lib/orders";
import { getSalePrice, type Product } from "@/lib/products";
import type { Category } from "@/lib/categories";

type Cell = string | number | boolean | null | undefined;

// ";" is the separator French/Senegalese spreadsheet apps expect (a "," is the
// decimal mark there), and the BOM makes Excel read the file as UTF-8 so
// accents survive.
const SEPARATOR = ";";
const BOM = "﻿";

const PLAIN_NUMBER = /^[+-]?[\d\s().-]+$/;

function formatCell(value: Cell): string {
  if (value === null || value === undefined) return "";
  let text = typeof value === "boolean" ? (value ? "Oui" : "Non") : String(value);
  // Customer-typed text starting with = + - @ would run as a formula when the
  // CSV is opened in Excel/Sheets. Phone numbers ("+221 …") are left as is.
  if (typeof value === "string" && /^[=+\-@\t\r]/.test(text) && !PLAIN_NUMBER.test(text)) {
    text = `'${text}`;
  }
  return /[";\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export function downloadCsv(filename: string, header: string[], rows: Cell[][]) {
  const lines = [header, ...rows].map((row) => row.map(formatCell).join(SEPARATOR));
  const blob = new Blob([BOM + lines.join("\r\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

export function exportOrdersCsv(orders: Order[]) {
  downloadCsv(
    `commandes-${today()}.csv`,
    [
      "N° commande",
      "Date",
      "Heure",
      "Statut",
      "Client",
      "Téléphone",
      "Email",
      "Adresse",
      "Ville",
      "Région",
      "Mode de livraison",
      "Créneau",
      "Paiement",
      "Articles",
      "Sous-total (CFA)",
      "Remise (CFA)",
      "Frais de livraison (CFA)",
      "Total (CFA)",
    ],
    orders.map((o) => {
      const date = new Date(o.createdAt);
      return [
        o.orderNumber,
        date.toLocaleDateString("fr-FR"),
        date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
        ORDER_STATUS_LABELS[o.status],
        o.customerName,
        o.phone,
        o.email,
        o.address,
        o.city,
        o.region,
        DELIVERY_LABELS[o.deliveryMethod],
        o.deliverySlot,
        PAYMENT_LABELS[o.paymentMethod],
        o.items.map((i) => `${i.name} x${i.quantity}`).join(" | "),
        o.subtotal,
        o.discountTotal,
        o.deliveryFee,
        o.total,
      ];
    }),
  );
}

export function exportProductsCsv(products: Product[], categories: Category[]) {
  const categoryLabel = (slug: string) => categories.find((c) => c.slug === slug)?.label ?? slug;
  const subcategoryLabel = (p: Product) =>
    categories
      .find((c) => c.slug === p.categorySlug)
      ?.subcategories?.find((s) => s.slug === p.subcategorySlug)?.label ?? "";

  downloadCsv(
    `produits-${today()}.csv`,
    [
      "SKU",
      "Nom",
      "Catégorie",
      "Sous-catégorie",
      "Prix (CFA)",
      "Remise (%)",
      "Prix de vente (CFA)",
      "Stock",
      "Nouveauté",
      "Mis en avant",
      "Poids (kg)",
      "Hauteur (cm)",
      "Largeur (cm)",
      "Profondeur (cm)",
      "Description",
      "ID",
    ],
    products.map((p) => [
      p.sku,
      p.name,
      categoryLabel(p.categorySlug),
      subcategoryLabel(p),
      p.originalPrice,
      p.discountPercent,
      getSalePrice(p),
      p.stockQuantity,
      p.isNew,
      p.featured ?? false,
      p.weightKg,
      p.dimensions?.height,
      p.dimensions?.width,
      p.dimensions?.depth,
      p.description,
      p.id,
    ]),
  );
}
