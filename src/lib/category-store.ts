import { useSyncExternalStore } from "react";
import { CATEGORIES as SEED_CATEGORIES, type Category } from "@/lib/categories";
import { slugify } from "@/lib/slugify";

// Reactive overlay on top of the static category tree — lets the admin panel
// add/rename/reorder/delete categories without a backend. Replace with real
// Supabase queries once the backend is connected.

const STORAGE_KEY = "2m-global-services-admin-categories";

function loadTree(): Category[] {
  if (typeof window === "undefined") return SEED_CATEGORIES;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return SEED_CATEGORIES;
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Category[]) : SEED_CATEGORIES;
  } catch {
    return SEED_CATEGORIES;
  }
}

let tree: Category[] = loadTree();
const listeners = new Set<() => void>();

function commit(next: Category[]) {
  tree = next;
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tree));
  }
  listeners.forEach((l) => l());
}

function moveItem<T>(list: T[], index: number, direction: "up" | "down"): T[] {
  const target = direction === "up" ? index - 1 : index + 1;
  if (target < 0 || target >= list.length) return list;
  const next = [...list];
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}

export const categoryStore = {
  getAll(): Category[] {
    return tree;
  },
  addCategory(name: string) {
    const slug = slugify(name);
    commit([...tree, { slug, label: name, subcategories: [] }]);
  },
  renameCategory(slug: string, name: string) {
    commit(tree.map((c) => (c.slug === slug ? { ...c, label: name } : c)));
  },
  deleteCategory(slug: string) {
    commit(tree.filter((c) => c.slug !== slug));
  },
  reorderCategory(slug: string, direction: "up" | "down") {
    const index = tree.findIndex((c) => c.slug === slug);
    if (index === -1) return;
    commit(moveItem(tree, index, direction));
  },
  addSubcategory(categorySlug: string, name: string) {
    const slug = slugify(name);
    commit(
      tree.map((c) =>
        c.slug === categorySlug
          ? { ...c, subcategories: [...(c.subcategories ?? []), { slug, label: name }] }
          : c,
      ),
    );
  },
  renameSubcategory(categorySlug: string, subSlug: string, name: string) {
    commit(
      tree.map((c) =>
        c.slug === categorySlug
          ? {
              ...c,
              subcategories: (c.subcategories ?? []).map((s) =>
                s.slug === subSlug ? { ...s, label: name } : s,
              ),
            }
          : c,
      ),
    );
  },
  deleteSubcategory(categorySlug: string, subSlug: string) {
    commit(
      tree.map((c) =>
        c.slug === categorySlug
          ? { ...c, subcategories: (c.subcategories ?? []).filter((s) => s.slug !== subSlug) }
          : c,
      ),
    );
  },
  reorderSubcategory(categorySlug: string, subSlug: string, direction: "up" | "down") {
    commit(
      tree.map((c) => {
        if (c.slug !== categorySlug) return c;
        const subs = c.subcategories ?? [];
        const index = subs.findIndex((s) => s.slug === subSlug);
        if (index === -1) return c;
        return { ...c, subcategories: moveItem(subs, index, direction) };
      }),
    );
  },
  subscribe(l: () => void) {
    listeners.add(l);
    return () => listeners.delete(l);
  },
};

export function useAllCategories() {
  return useSyncExternalStore(categoryStore.subscribe, categoryStore.getAll, categoryStore.getAll);
}
