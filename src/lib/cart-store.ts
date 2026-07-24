import { useSyncExternalStore } from "react";

export type CartLine = { productId: string; quantity: number };

const STORAGE_KEY = "techno-office-cart";

function loadInitialLines(): CartLine[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (l): l is CartLine =>
        typeof l === "object" &&
        l !== null &&
        typeof (l as CartLine).productId === "string" &&
        typeof (l as CartLine).quantity === "number" &&
        (l as CartLine).quantity > 0,
    );
  } catch {
    return [];
  }
}

let lines: CartLine[] = loadInitialLines();
const listeners = new Set<() => void>();

function persist() {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
}

function emit() {
  persist();
  listeners.forEach((l) => l());
}

export const cartStore = {
  add: (productId: string, quantity = 1) => {
    const existing = lines.find((l) => l.productId === productId);
    lines = existing
      ? lines.map((l) =>
          l.productId === productId ? { ...l, quantity: l.quantity + quantity } : l,
        )
      : [...lines, { productId, quantity }];
    emit();
  },
  setQuantity: (productId: string, quantity: number) => {
    lines =
      quantity <= 0
        ? lines.filter((l) => l.productId !== productId)
        : lines.map((l) => (l.productId === productId ? { ...l, quantity } : l));
    emit();
  },
  remove: (productId: string) => {
    lines = lines.filter((l) => l.productId !== productId);
    emit();
  },
  clear: () => {
    lines = [];
    emit();
  },
  getLines: () => lines,
  getCount: () => lines.reduce((sum, l) => sum + l.quantity, 0),
  subscribe: (l: () => void) => {
    listeners.add(l);
    return () => listeners.delete(l);
  },
};

const EMPTY_LINES: CartLine[] = [];

export function useCartCount() {
  return useSyncExternalStore(cartStore.subscribe, cartStore.getCount, () => 0);
}

export function useCartLines() {
  return useSyncExternalStore(cartStore.subscribe, cartStore.getLines, () => EMPTY_LINES);
}
