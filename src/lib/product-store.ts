import { useSyncExternalStore } from "react";
import { PRODUCTS as SEED_PRODUCTS, type Product } from "@/lib/products";
import { slugify } from "@/lib/slugify";

// Reactive overlay on top of the static seed catalog — lets the admin panel
// edit/add/delete products without a backend. Replace with real Supabase
// queries once the backend is connected.

const STORAGE_KEY = "techno-office-admin-products";

type AdminProductsData = {
  overrides: Record<string, Partial<Product>>;
  added: Product[];
  deletedIds: string[];
};

function loadData(): AdminProductsData {
  if (typeof window === "undefined") return { overrides: {}, added: [], deletedIds: [] };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { overrides: {}, added: [], deletedIds: [] };
    const parsed = JSON.parse(raw) as Partial<AdminProductsData>;
    return {
      overrides: parsed.overrides ?? {},
      added: Array.isArray(parsed.added) ? parsed.added : [],
      deletedIds: Array.isArray(parsed.deletedIds) ? parsed.deletedIds : [],
    };
  } catch {
    return { overrides: {}, added: [], deletedIds: [] };
  }
}

function persist(data: AdminProductsData) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function computeAll(data: AdminProductsData): Product[] {
  const deleted = new Set(data.deletedIds);
  const merged = SEED_PRODUCTS.filter((p) => !deleted.has(p.id)).map((p) => ({
    ...p,
    ...(data.overrides[p.id] ?? {}),
  }));
  const extra = data.added.filter((p) => !deleted.has(p.id));
  return [...merged, ...extra];
}

let data = loadData();
let cache = computeAll(data);
const listeners = new Set<() => void>();

function commit(next: AdminProductsData) {
  data = next;
  persist(data);
  cache = computeAll(data);
  listeners.forEach((l) => l());
}

function applyPatch(
  target: AdminProductsData,
  id: string,
  patch: Partial<Product>,
): AdminProductsData {
  if (SEED_PRODUCTS.some((p) => p.id === id)) {
    return {
      ...target,
      overrides: { ...target.overrides, [id]: { ...target.overrides[id], ...patch } },
    };
  }
  return {
    ...target,
    added: target.added.map((p) => (p.id === id ? { ...p, ...patch } : p)),
  };
}

export type NewProductInput = Omit<Product, "id" | "rating" | "popularity" | "createdAt" | "isNew">;

export const productStore = {
  getAll(): Product[] {
    return cache;
  },
  updateProduct(id: string, patch: Partial<Product>) {
    commit(applyPatch(data, id, patch));
  },
  bulkUpdateDiscount(ids: string[], discountPercent: number) {
    let next = data;
    for (const id of ids) next = applyPatch(next, id, { discountPercent });
    commit(next);
  },
  bulkReassignCategory(ids: string[], categorySlug: string, subcategorySlug?: string) {
    let next = data;
    for (const id of ids) next = applyPatch(next, id, { categorySlug, subcategorySlug });
    commit(next);
  },
  addProduct(input: NewProductInput): Product {
    const id = `${slugify(input.name)}-${Date.now().toString().slice(-5)}`;
    const product: Product = {
      ...input,
      id,
      rating: 0,
      popularity: 0,
      isNew: true,
      createdAt: new Date().toISOString().slice(0, 10),
      sku: input.sku ?? `TOS-ADM-${Date.now().toString().slice(-6)}`,
    };
    commit({ ...data, added: [product, ...data.added] });
    return product;
  },
  deleteProduct(id: string) {
    commit({ ...data, deletedIds: [...data.deletedIds, id] });
  },
  subscribe(l: () => void) {
    listeners.add(l);
    return () => listeners.delete(l);
  },
};

export function useAllProducts() {
  return useSyncExternalStore(productStore.subscribe, productStore.getAll, productStore.getAll);
}
