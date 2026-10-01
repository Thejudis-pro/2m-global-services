import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Category } from "@/lib/categories";
import { slugify } from "@/lib/slugify";

// Categories/subcategories now live in Supabase (tables `categories` and
// `subcategories`, seeded by supabase/migrations/20261001000000_*.sql).
// Reordering is a sort_order swap between the two affected rows.

const CATEGORIES_QUERY_KEY = ["categories"] as const;

type CategoryRow = { slug: string; label: string; sort_order: number };
type SubcategoryRow = { category_slug: string; slug: string; label: string; sort_order: number };

async function fetchCategories(): Promise<Category[]> {
  const [{ data: categories, error: categoriesError }, { data: subcategories, error: subError }] =
    await Promise.all([
      supabase.from("categories").select("slug, label, sort_order").order("sort_order"),
      supabase
        .from("subcategories")
        .select("category_slug, slug, label, sort_order")
        .order("sort_order"),
    ]);

  if (categoriesError) throw categoriesError;
  if (subError) throw subError;

  const rows = (categories ?? []) as CategoryRow[];
  const subRows = (subcategories ?? []) as SubcategoryRow[];

  return rows.map((c) => ({
    slug: c.slug,
    label: c.label,
    subcategories: subRows
      .filter((s) => s.category_slug === c.slug)
      .map((s) => ({ slug: s.slug, label: s.label })),
  }));
}

export function useAllCategories(): Category[] {
  const { data } = useQuery({ queryKey: CATEGORIES_QUERY_KEY, queryFn: fetchCategories });
  return data ?? [];
}

export function useInvalidateCategories() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEY });
}

async function nextSortOrder(
  table: "categories" | "subcategories",
  filter?: Record<string, string>,
) {
  let query = supabase
    .from(table)
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1);
  if (filter) {
    for (const [key, value] of Object.entries(filter)) query = query.eq(key, value);
  }
  const { data, error } = await query;
  if (error) throw error;
  const max = (data?.[0] as { sort_order: number } | undefined)?.sort_order;
  return max === undefined ? 0 : max + 1;
}

async function swapSortOrder(
  table: "categories" | "subcategories",
  idColumn: string,
  rows: { id: string; sortOrder: number }[],
) {
  const [a, b] = rows;
  await Promise.all([
    supabase.from(table).update({ sort_order: b.sortOrder }).eq(idColumn, a.id),
    supabase.from(table).update({ sort_order: a.sortOrder }).eq(idColumn, b.id),
  ]);
}

export const categoryStore = {
  async addCategory(name: string): Promise<void> {
    const slug = slugify(name);
    const sortOrder = await nextSortOrder("categories");
    const { error } = await supabase
      .from("categories")
      .insert({ slug, label: name, sort_order: sortOrder });
    if (error) throw error;
  },
  async renameCategory(slug: string, name: string): Promise<void> {
    const { error } = await supabase.from("categories").update({ label: name }).eq("slug", slug);
    if (error) throw error;
  },
  async deleteCategory(slug: string): Promise<void> {
    const { error } = await supabase.from("categories").delete().eq("slug", slug);
    if (error) throw error;
  },
  async reorderCategory(slug: string, direction: "up" | "down"): Promise<void> {
    const { data, error } = await supabase
      .from("categories")
      .select("slug, sort_order")
      .order("sort_order");
    if (error) throw error;
    const rows = (data ?? []) as CategoryRow[];
    const index = rows.findIndex((r) => r.slug === slug);
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (index === -1 || targetIndex < 0 || targetIndex >= rows.length) return;
    await swapSortOrder("categories", "slug", [
      { id: rows[index].slug, sortOrder: rows[index].sort_order },
      { id: rows[targetIndex].slug, sortOrder: rows[targetIndex].sort_order },
    ]);
  },
  async addSubcategory(categorySlug: string, name: string): Promise<void> {
    const slug = slugify(name);
    const sortOrder = await nextSortOrder("subcategories", { category_slug: categorySlug });
    const { error } = await supabase
      .from("subcategories")
      .insert({ category_slug: categorySlug, slug, label: name, sort_order: sortOrder });
    if (error) throw error;
  },
  async renameSubcategory(categorySlug: string, subSlug: string, name: string): Promise<void> {
    const { error } = await supabase
      .from("subcategories")
      .update({ label: name })
      .eq("category_slug", categorySlug)
      .eq("slug", subSlug);
    if (error) throw error;
  },
  async deleteSubcategory(categorySlug: string, subSlug: string): Promise<void> {
    const { error } = await supabase
      .from("subcategories")
      .delete()
      .eq("category_slug", categorySlug)
      .eq("slug", subSlug);
    if (error) throw error;
  },
  async reorderSubcategory(
    categorySlug: string,
    subSlug: string,
    direction: "up" | "down",
  ): Promise<void> {
    const { data, error } = await supabase
      .from("subcategories")
      .select("slug, sort_order")
      .eq("category_slug", categorySlug)
      .order("sort_order");
    if (error) throw error;
    const rows = (data ?? []) as { slug: string; sort_order: number }[];
    const index = rows.findIndex((r) => r.slug === subSlug);
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (index === -1 || targetIndex < 0 || targetIndex >= rows.length) return;
    const [a, b] = [rows[index], rows[targetIndex]];
    await Promise.all([
      supabase
        .from("subcategories")
        .update({ sort_order: b.sort_order })
        .eq("category_slug", categorySlug)
        .eq("slug", a.slug),
      supabase
        .from("subcategories")
        .update({ sort_order: a.sort_order })
        .eq("category_slug", categorySlug)
        .eq("slug", b.slug),
    ]);
  },
};
