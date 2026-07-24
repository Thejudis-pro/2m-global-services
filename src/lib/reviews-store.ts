import { useSyncExternalStore } from "react";

export type Review = {
  id: string;
  productId: string;
  name: string;
  rating: number;
  comment: string;
  date: string;
  approved: boolean;
};

const SEED_REVIEWS: Review[] = [
  {
    id: "seed-1",
    productId: "fauteuil-direction-confort-plus",
    name: "Moussa Diop",
    rating: 5,
    comment:
      "Très confortable, parfait pour de longues journées au bureau. Livraison rapide à Dakar.",
    date: "2026-05-14",
    approved: true,
  },
  {
    id: "seed-2",
    productId: "fauteuil-direction-confort-plus",
    name: "Aissatou Ba",
    rating: 4,
    comment: "Bonne qualité de cuir, un peu ferme au début mais s'assouplit avec l'usage.",
    date: "2026-04-02",
    approved: true,
  },
  {
    id: "seed-3",
    productId: "fauteuil-direction-confort-plus",
    name: "Cheikh Fall",
    rating: 5,
    comment: "Exactement ce qu'il fallait pour mon bureau à domicile. Je recommande.",
    date: "2026-02-20",
    approved: true,
  },
  {
    id: "seed-4",
    productId: "armoire-metallique-4-portes",
    name: "Fatou Sarr",
    rating: 5,
    comment: "Très robuste, la serrure fonctionne parfaitement. Idéale pour nos archives.",
    date: "2026-06-01",
    approved: true,
  },
  {
    id: "seed-5",
    productId: "armoire-metallique-4-portes",
    name: "Ibrahima Ndiaye",
    rating: 4,
    comment: "Bon rapport qualité prix, montage simple.",
    date: "2026-01-10",
    approved: true,
  },
  {
    id: "seed-6",
    productId: "coffre-fort-ignifuge-50l",
    name: "Awa Diallo",
    rating: 5,
    comment: "Rassurant pour protéger nos documents importants. Serrure électronique fiable.",
    date: "2026-03-18",
    approved: true,
  },
  {
    id: "seed-7",
    productId: "chaise-direction-ergonomique-noire",
    name: "Ousmane Gueye",
    rating: 5,
    comment: "Excellent soutien lombaire, j'ai beaucoup moins mal au dos depuis que je l'utilise.",
    date: "2026-05-28",
    approved: true,
  },
  {
    id: "seed-8",
    productId: "chaise-direction-ergonomique-noire",
    name: "Mariama Sy",
    rating: 4,
    comment: "Bonne chaise mais l'assise pourrait être un peu plus large.",
    date: "2026-03-11",
    approved: true,
  },
];

const STORAGE_KEY = "techno-office-submitted-reviews";

function loadSubmitted(): Review[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? (parsed as Review[]) : [];
  } catch {
    return [];
  }
}

let submitted: Review[] = loadSubmitted();
const listeners = new Set<() => void>();

function persist() {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(submitted));
}

function emit() {
  persist();
  listeners.forEach((l) => l());
}

function getAllReviews(): Review[] {
  return [...submitted, ...SEED_REVIEWS];
}

export const reviewsStore = {
  submit(productId: string, input: { name: string; rating: number; comment: string }): Review {
    const review: Review = {
      id: `review-${Date.now()}`,
      productId,
      name: input.name,
      rating: input.rating,
      comment: input.comment,
      date: new Date().toISOString().slice(0, 10),
      approved: false,
    };
    submitted = [review, ...submitted];
    emit();
    return review;
  },
  approve(id: string) {
    submitted = submitted.map((r) => (r.id === id ? { ...r, approved: true } : r));
    emit();
  },
  reject(id: string) {
    submitted = submitted.filter((r) => r.id !== id);
    emit();
  },
  getAll: getAllReviews,
  getApprovedForProduct(productId: string): Review[] {
    return getAllReviews().filter((r) => r.productId === productId && r.approved);
  },
  getPending(): Review[] {
    return submitted.filter((r) => !r.approved);
  },
  subscribe(l: () => void) {
    listeners.add(l);
    return () => listeners.delete(l);
  },
};

const EMPTY_REVIEWS: Review[] = [];

// Cache snapshots so useSyncExternalStore sees a stable reference between
// renders (Object.is check). Invalidated whenever the store emits.
const approvedCache = new Map<string, Review[]>();
let pendingCache: Review[] = submitted.filter((r) => !r.approved);

function invalidateCaches() {
  approvedCache.clear();
  pendingCache = submitted.filter((r) => !r.approved);
}

function subscribeWithInvalidation(l: () => void) {
  return reviewsStore.subscribe(() => {
    invalidateCaches();
    l();
  });
}

function getApprovedSnapshot(productId: string): Review[] {
  const cached = approvedCache.get(productId);
  if (cached) return cached;
  const next = reviewsStore.getApprovedForProduct(productId);
  approvedCache.set(productId, next);
  return next;
}

export function useApprovedReviews(productId: string) {
  return useSyncExternalStore(
    subscribeWithInvalidation,
    () => getApprovedSnapshot(productId),
    () => SEED_REVIEWS.filter((r) => r.productId === productId && r.approved),
  );
}

export function usePendingReviews() {
  return useSyncExternalStore(
    subscribeWithInvalidation,
    () => pendingCache,
    () => EMPTY_REVIEWS,
  );
}

export function getReviewSummary(reviews: Review[]) {
  if (reviews.length === 0) {
    return { average: 0, count: 0 };
  }
  const average = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
  return { average, count: reviews.length };
}
