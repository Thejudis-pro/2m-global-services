import { useSyncExternalStore } from "react";

let count = 0;
const listeners = new Set<() => void>();

const emit = () => listeners.forEach((l) => l());

export const cartStore = {
  add: (n = 1) => {
    count += n;
    emit();
  },
  remove: (n = 1) => {
    count = Math.max(0, count - n);
    emit();
  },
  clear: () => {
    count = 0;
    emit();
  },
  get: () => count,
  subscribe: (l: () => void) => {
    listeners.add(l);
    return () => listeners.delete(l);
  },
};

export function useCartCount() {
  return useSyncExternalStore(
    cartStore.subscribe,
    cartStore.get,
    () => 0,
  );
}
