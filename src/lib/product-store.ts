import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { PRODUCTS as SEED_PRODUCTS, type Product } from "@/lib/products";
import { slugify } from "@/lib/slugify";

// Products now live in Supabase (table `products`, RLS: public read, admin
// write). Until the one-time catalog import has run (see the "Importer le
// catalogue initial" button on /admin), the table is empty — fall back to the
// bundled PRODUCTS seed in that case so the storefront is never empty.

const PRODUCTS_QUERY_KEY = ["products"] as const;

type ProductRow = {
  id: string;
  name: string;
  alt: string;
  image: string;
  images: { src: string; alt: string }[] | null;
  category_slug: string;
  subcategory_slug: string | null;
  original_price: string | number;
  discount_percent: number;
  rating: string | number;
  popularity: number;
  is_new: boolean;
  created_at: string;
  stock_quantity: number;
  featured: boolean;
  sku: string | null;
  weight_kg: string | number | null;
  dimensions: { height: number; width: number; depth: number } | null;
  description: string | null;
};

function rowToProduct(row: ProductRow): Product {
  return {
    id: row.id,
    name: row.name,
    alt: row.alt,
    image: row.image,
    images: row.images ?? undefined,
    categorySlug: row.category_slug,
    subcategorySlug: row.subcategory_slug ?? undefined,
    originalPrice: Number(row.original_price),
    discountPercent: row.discount_percent,
    rating: Number(row.rating),
    popularity: row.popularity,
    isNew: row.is_new,
    createdAt: row.created_at,
    stockQuantity: row.stock_quantity,
    featured: row.featured,
    sku: row.sku ?? undefined,
    weightKg: row.weight_kg === null ? undefined : Number(row.weight_kg),
    dimensions: row.dimensions ?? undefined,
    description: row.description ?? undefined,
  };
}

function productToRow(product: Product) {
  return {
    id: product.id,
    name: product.name,
    alt: product.alt,
    image: product.image,
    images: product.images ?? [],
    category_slug: product.categorySlug,
    subcategory_slug: product.subcategorySlug ?? null,
    original_price: product.originalPrice,
    discount_percent: product.discountPercent,
    rating: product.rating,
    popularity: product.popularity,
    is_new: product.isNew,
    created_at: product.createdAt,
    stock_quantity: product.stockQuantity,
    featured: product.featured ?? false,
    sku: product.sku ?? null,
    weight_kg: product.weightKg ?? null,
    dimensions: product.dimensions ?? null,
    description: product.description ?? null,
  };
}

async function fetchProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) {
    console.error("[products] falling back to bundled catalog:", error.message);
    return SEED_PRODUCTS;
  }
  if (!data || data.length === 0) return SEED_PRODUCTS;
  return (data as ProductRow[]).map(rowToProduct);
}

export function useAllProducts(): Product[] {
  const { data } = useQuery({ queryKey: PRODUCTS_QUERY_KEY, queryFn: fetchProducts });
  return data ?? [];
}

// For route loaders, which run outside the component tree and can't use
// query hooks — a direct one-off fetch with the same empty-table fallback.
export async function fetchProductById(id: string): Promise<Product | undefined> {
  const { data, error } = await supabase.from("products").select("*").eq("id", id).maybeSingle();
  if (!error && data) return rowToProduct(data as ProductRow);
  return SEED_PRODUCTS.find((p) => p.id === id);
}

export function useInvalidateProducts() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: PRODUCTS_QUERY_KEY });
}

export type NewProductInput = Omit<Product, "id" | "rating" | "popularity" | "createdAt" | "isNew">;

export const productStore = {
  generateId(name: string): string {
    return `${slugify(name)}-${Date.now().toString().slice(-5)}`;
  },
  async addProduct(input: NewProductInput & { id?: string }): Promise<Product> {
    const id = input.id ?? productStore.generateId(input.name);
    const product: Product = {
      ...input,
      id,
      rating: 0,
      popularity: 0,
      isNew: true,
      createdAt: new Date().toISOString().slice(0, 10),
      sku: input.sku ?? `2M-ADM-${Date.now().toString().slice(-6)}`,
    };
    const { error } = await supabase.from("products").insert(productToRow(product));
    if (error) throw error;
    return product;
  },
  async updateProduct(id: string, patch: Partial<Product>): Promise<void> {
    const row: Database["public"]["Tables"]["products"]["Update"] = {};
    if (patch.name !== undefined) row.name = patch.name;
    if (patch.alt !== undefined) row.alt = patch.alt;
    if (patch.image !== undefined) row.image = patch.image;
    if (patch.images !== undefined) row.images = patch.images;
    if (patch.categorySlug !== undefined) row.category_slug = patch.categorySlug;
    if (patch.subcategorySlug !== undefined) row.subcategory_slug = patch.subcategorySlug ?? null;
    if (patch.originalPrice !== undefined) row.original_price = patch.originalPrice;
    if (patch.discountPercent !== undefined) row.discount_percent = patch.discountPercent;
    if (patch.rating !== undefined) row.rating = patch.rating;
    if (patch.popularity !== undefined) row.popularity = patch.popularity;
    if (patch.isNew !== undefined) row.is_new = patch.isNew;
    if (patch.stockQuantity !== undefined) row.stock_quantity = patch.stockQuantity;
    if (patch.featured !== undefined) row.featured = patch.featured;
    if (patch.sku !== undefined) row.sku = patch.sku;
    if (patch.weightKg !== undefined) row.weight_kg = patch.weightKg ?? null;
    if (patch.dimensions !== undefined) row.dimensions = patch.dimensions ?? null;
    if (patch.description !== undefined) row.description = patch.description ?? null;
    const { error } = await supabase.from("products").update(row).eq("id", id);
    if (error) throw error;
  },
  async bulkUpdateDiscount(ids: string[], discountPercent: number): Promise<void> {
    const { error } = await supabase
      .from("products")
      .update({ discount_percent: discountPercent })
      .in("id", ids);
    if (error) throw error;
  },
  async bulkReassignCategory(
    ids: string[],
    categorySlug: string,
    subcategorySlug?: string,
  ): Promise<void> {
    const { error } = await supabase
      .from("products")
      .update({ category_slug: categorySlug, subcategory_slug: subcategorySlug ?? null })
      .in("id", ids);
    if (error) throw error;
  },
  async deleteProduct(id: string): Promise<void> {
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) throw error;
  },
};
