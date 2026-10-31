import { supabase } from "@/integrations/supabase/client";
import { CATEGORIES } from "@/lib/categories";
import { formatCFA } from "@/lib/format";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { getSalePrice, type Product } from "@/lib/products";

// Véhicules — cars sold through the site.
//
// A vehicle is a normal row of the `products` table with category_slug =
// "vehicules". Its car-specific fields (marque, année, kilométrage…) are kept
// in the existing `dimensions` JSONB column, wrapped as { vehicle: {...} }, so
// no database migration is needed. product-store.ts does the (un)wrapping:
// in the app, a vehicle simply has `product.vehicle` and no `dimensions`.

export const VEHICLE_CATEGORY_SLUG = "vehicules";

export const FUEL_OPTIONS = ["Essence", "Diesel", "Hybride", "Électrique"] as const;
export const GEARBOX_OPTIONS = ["Automatique", "Manuelle"] as const;
export const CONDITION_OPTIONS = ["Occasion", "Venant d'Europe", "Neuf"] as const;

export type VehicleSpecs = {
  brand: string;
  model: string;
  year?: number;
  mileageKm?: number;
  fuel?: string;
  gearbox?: string;
  color?: string;
  seats?: number;
  condition?: string;
  customsCleared?: boolean;
  location?: string;
};

export function isVehicle(product: Pick<Product, "categorySlug">): boolean {
  return product.categorySlug === VEHICLE_CATEGORY_SLUG;
}

// Reads the { vehicle: {...} } wrapper stored in the `dimensions` column.
export function readVehicleFromJson(value: unknown): VehicleSpecs | undefined {
  if (!value || typeof value !== "object") return undefined;
  const v = (value as { vehicle?: unknown }).vehicle;
  if (!v || typeof v !== "object") return undefined;
  const specs = v as Partial<VehicleSpecs>;
  if (typeof specs.brand !== "string" || typeof specs.model !== "string") return undefined;
  return specs as VehicleSpecs;
}

const nf = new Intl.NumberFormat("fr-FR");

export function formatMileage(km: number | undefined): string | undefined {
  return km === undefined ? undefined : `${nf.format(km).replace(/[\u202f\u00a0]/g, " ")} km`;
}

// "2018 · 85 000 km · Diesel · Automatique" — the short line on cards.
export function vehicleSummary(specs: VehicleSpecs): string {
  return [specs.year, formatMileage(specs.mileageKm), specs.fuel, specs.gearbox]
    .filter((x) => x !== undefined && x !== "")
    .join(" · ");
}

// Rows of the "Caractéristiques" table on the vehicle page.
export function vehicleSpecRows(specs: VehicleSpecs): { label: string; value: string }[] {
  const rows: { label: string; value: string | undefined }[] = [
    { label: "Marque", value: specs.brand },
    { label: "Modèle", value: specs.model },
    { label: "Année", value: specs.year?.toString() },
    { label: "Kilométrage", value: formatMileage(specs.mileageKm) },
    { label: "Carburant", value: specs.fuel },
    { label: "Boîte de vitesses", value: specs.gearbox },
    { label: "Couleur", value: specs.color },
    { label: "Places", value: specs.seats?.toString() },
    { label: "État", value: specs.condition },
    {
      label: "Dédouané",
      value: specs.customsCleared === undefined ? undefined : specs.customsCleared ? "Oui" : "Non",
    },
    { label: "Visible à", value: specs.location },
  ];
  return rows.filter((r): r is { label: string; value: string } => Boolean(r.value));
}

export function vehicleWhatsAppUrl(product: Product): string {
  const specs = product.vehicle;
  const title = specs
    ? [specs.brand, specs.model, specs.year].filter(Boolean).join(" ")
    : product.name;
  const price = product.originalPrice > 0 ? ` affiché à ${formatCFA(getSalePrice(product))}` : "";
  return buildWhatsAppUrl(
    `Bonjour, je suis intéressé par le véhicule ${title}${price} (réf. ${product.id}). Est-il toujours disponible ?`,
  );
}

export function vehicleTestDriveUrl(product: Product): string {
  const specs = product.vehicle;
  const title = specs
    ? [specs.brand, specs.model, specs.year].filter(Boolean).join(" ")
    : product.name;
  return buildWhatsAppUrl(
    `Bonjour, je souhaite voir / essayer le véhicule ${title} (réf. ${product.id}). Quand est-ce possible ?`,
  );
}

// Storefront link for a category: vehicles have their own showroom page.
export function categoryHref(slug: string): string {
  return slug === VEHICLE_CATEGORY_SLUG ? "/vehicules" : `/produits?category=${slug}`;
}

// The admin never has to create the category by hand: before a vehicle is
// saved, make sure the "Véhicules" category and the chosen subcategory exist
// in the database (products.category_slug / subcategory_slug are foreign keys).
export async function ensureVehicleCategory(subcategorySlug?: string): Promise<void> {
  const def = CATEGORIES.find((c) => c.slug === VEHICLE_CATEGORY_SLUG);
  if (!def) return;

  const { data: existing, error: readError } = await supabase
    .from("categories")
    .select("slug")
    .eq("slug", VEHICLE_CATEGORY_SLUG)
    .maybeSingle();
  if (readError) throw readError;

  if (!existing) {
    const { data: last } = await supabase
      .from("categories")
      .select("sort_order")
      .order("sort_order", { ascending: false })
      .limit(1);
    const sortOrder = ((last?.[0] as { sort_order: number } | undefined)?.sort_order ?? -1) + 1;
    const { error } = await supabase
      .from("categories")
      .insert({ slug: def.slug, label: def.label, sort_order: sortOrder });
    if (error) throw error;
  }

  if (!subcategorySlug) return;
  const { data: subRows, error: subError } = await supabase
    .from("subcategories")
    .select("slug, sort_order")
    .eq("category_slug", VEHICLE_CATEGORY_SLUG);
  if (subError) throw subError;
  const rows = (subRows ?? []) as { slug: string; sort_order: number }[];
  if (rows.some((r) => r.slug === subcategorySlug)) return;

  const sub = def.subcategories?.find((s) => s.slug === subcategorySlug);
  if (!sub) return;
  const sortOrder = rows.reduce((max, r) => Math.max(max, r.sort_order), -1) + 1;
  const { error } = await supabase.from("subcategories").insert({
    category_slug: VEHICLE_CATEGORY_SLUG,
    slug: sub.slug,
    label: sub.label,
    sort_order: sortOrder,
  });
  if (error) throw error;
}
