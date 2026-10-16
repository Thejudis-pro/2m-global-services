import { toast } from "sonner";
import { DELIVERY_LABELS, ORDER_STATUS_LABELS, type Order } from "@/lib/orders";
import { QUOTE_SOURCE_LABELS, QUOTE_STATUS_LABELS, type QuoteRequest } from "@/lib/quote-requests";
import { getSalePrice, type Product } from "@/lib/products";
import type { Category } from "@/lib/categories";

type Cell = string | number | boolean | null | undefined;

const MAX_COLUMN_WIDTH = 60;

function toCell(value: Cell): string | number {
  if (value === null || value === undefined) return "";
  if (typeof value === "boolean") return value ? "Oui" : "Non";
  return value;
}

// Builds a one-sheet .xlsx and downloads it. SheetJS is loaded on demand so it
// stays out of the main bundle. Text is always written as a string cell, so
// customer-typed values starting with "=" are never evaluated as formulas.
async function downloadXlsx(filename: string, sheetName: string, header: string[], rows: Cell[][]) {
  try {
    const XLSX = await import("xlsx");
    const data = [header, ...rows.map((row) => row.map(toCell))];
    const sheet = XLSX.utils.aoa_to_sheet(data);
    sheet["!cols"] = header.map((title, col) => ({
      wch: Math.min(
        MAX_COLUMN_WIDTH,
        Math.max(title.length, ...rows.map((row) => String(toCell(row[col])).length)) + 2,
      ),
    }));
    const book = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(book, sheet, sheetName);
    XLSX.writeFile(book, filename);
  } catch (error) {
    console.error("Export Excel impossible :", error);
    toast.error("Impossible de générer le fichier Excel.");
  }
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

export function exportOrdersXlsx(orders: Order[]) {
  return downloadXlsx(
    `commandes-${today()}.xlsx`,
    "Commandes",
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
        o.items.map((i) => `${i.name} x${i.quantity}`).join(" | "),
        o.subtotal,
        o.discountTotal,
        o.deliveryFee,
        o.total,
      ];
    }),
  );
}

export function exportProductsXlsx(products: Product[], categories: Category[]) {
  const categoryLabel = (slug: string) => categories.find((c) => c.slug === slug)?.label ?? slug;
  const subcategoryLabel = (p: Product) =>
    categories
      .find((c) => c.slug === p.categorySlug)
      ?.subcategories?.find((s) => s.slug === p.subcategorySlug)?.label ?? "";

  return downloadXlsx(
    `produits-${today()}.xlsx`,
    "Produits",
    [
      "SKU",
      "Nom",
      "Catégorie",
      "Sous-catégorie",
      "Prix (CFA)",
      "Remise (%)",
      "Prix de vente (CFA)",
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

export function exportQuoteRequestsXlsx(quotes: QuoteRequest[]) {
  return downloadXlsx(
    `demandes-de-devis-${today()}.xlsx`,
    "Demandes de devis",
    ["Date", "Heure", "Nom", "Téléphone", "Email", "Produit(s)", "Message", "Origine", "Statut"],
    quotes.map((q) => {
      const date = new Date(q.createdAt);
      return [
        date.toLocaleDateString("fr-FR"),
        date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
        q.name,
        q.phone,
        q.email,
        q.products,
        q.message,
        QUOTE_SOURCE_LABELS[q.source],
        QUOTE_STATUS_LABELS[q.status],
      ];
    }),
  );
}
