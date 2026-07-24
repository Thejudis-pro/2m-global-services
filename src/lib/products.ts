export type Product = {
  id: string;
  name: string;
  alt: string;
  image: string;
  images?: { src: string; alt: string }[];
  categorySlug: string;
  subcategorySlug?: string;
  originalPrice: number;
  discountPercent: number;
  rating: number;
  popularity: number;
  isNew: boolean;
  createdAt: string;
  stockQuantity: number;
  featured?: boolean;
  sku?: string;
  weightKg?: number;
  dimensions?: { height: number; width: number; depth: number };
  description?: string;
};

export const PRODUCTS: Product[] = [
  {
    id: "bureau-direction-prestige-acajou",
    name: "Bureau de Direction Prestige Acajou",
    alt: "Bureau de direction en acajou verni avec caissons latéraux",
    image: "https://placehold.co/600x600/1e3a5f/ffffff?text=Bureau+Prestige",
    categorySlug: "meubles-de-bureau",
    subcategorySlug: "bureau-direction",
    originalPrice: 450000,
    discountPercent: 20,
    rating: 4.6,
    popularity: 82,
    isNew: false,
    createdAt: "2025-11-02",
    stockQuantity: 12,
    featured: true,
  },
  {
    id: "bureau-direction-manager-xl",
    name: "Bureau de Direction Manager XL",
    alt: "Grand bureau de direction gris anthracite avec plateau XL",
    image: "https://placehold.co/600x600/2b4a6f/ffffff?text=Bureau+Manager+XL",
    categorySlug: "meubles-de-bureau",
    subcategorySlug: "bureau-direction",
    originalPrice: 380000,
    discountPercent: 0,
    rating: 4.3,
    popularity: 70,
    isNew: true,
    createdAt: "2026-07-10",
    stockQuantity: 18,
  },
  {
    id: "bureau-secretaire-compact-chene",
    name: "Bureau Secrétaire Compact Chêne",
    alt: "Bureau secrétaire compact en bois de chêne clair",
    image: "https://placehold.co/600x600/3c5a80/ffffff?text=Bureau+Secretaire",
    categorySlug: "meubles-de-bureau",
    subcategorySlug: "bureau-secretaire-agent",
    originalPrice: 145000,
    discountPercent: 15,
    rating: 4.1,
    popularity: 65,
    isNew: false,
    createdAt: "2025-09-18",
    stockQuantity: 25,
  },
  {
    id: "bureau-agent-simple-ligne",
    name: "Bureau Agent Simple Ligne",
    alt: "Bureau agent blanc ligne épurée avec caisson à roulettes",
    image: "https://placehold.co/600x600/1e3a5f/ffffff?text=Bureau+Agent",
    categorySlug: "meubles-de-bureau",
    subcategorySlug: "bureau-secretaire-agent",
    originalPrice: 95000,
    discountPercent: 0,
    rating: 3.9,
    popularity: 48,
    isNew: false,
    createdAt: "2025-06-12",
    stockQuantity: 30,
  },
  {
    id: "caisson-rangement-3-tiroirs",
    name: "Caisson de Rangement 3 Tiroirs",
    alt: "Caisson de rangement gris à trois tiroirs sur roulettes",
    image: "https://placehold.co/600x600/2b4a6f/ffffff?text=Caisson+Rangement",
    categorySlug: "meubles-de-bureau",
    subcategorySlug: "meubles-de-rangement",
    originalPrice: 85000,
    discountPercent: 10,
    rating: 4.0,
    popularity: 55,
    isNew: false,
    createdAt: "2025-08-05",
    stockQuantity: 40,
  },
  {
    id: "bibliotheque-bois-5-etageres",
    name: "Bibliothèque Bois 5 Étagères",
    alt: "Bibliothèque en bois massif à cinq étagères ouvertes",
    image: "https://placehold.co/600x600/3c5a80/ffffff?text=Bibliotheque",
    categorySlug: "meubles-de-bureau",
    subcategorySlug: "meubles-de-rangement",
    originalPrice: 120000,
    discountPercent: 0,
    rating: 4.4,
    popularity: 60,
    isNew: true,
    createdAt: "2026-07-05",
    stockQuantity: 22,
  },
  {
    id: "chaise-direction-ergonomique-noire",
    name: "Chaise de Direction Ergonomique Noire",
    alt: "Chaise de direction noire ergonomique avec support lombaire",
    image: "https://placehold.co/600x600/1e3a5f/ffffff?text=Chaise+Ergonomique",
    categorySlug: "fauteuils-chaises",
    subcategorySlug: "chaises-de-direction",
    originalPrice: 98000,
    discountPercent: 25,
    rating: 4.7,
    popularity: 90,
    isNew: false,
    createdAt: "2025-12-01",
    stockQuantity: 35,
  },
  {
    id: "chaise-direction-cuir-marron",
    name: "Chaise de Direction Cuir Marron",
    alt: "Chaise de direction en cuir marron avec accoudoirs rembourrés",
    image: "https://placehold.co/600x600/2b4a6f/ffffff?text=Chaise+Cuir",
    categorySlug: "fauteuils-chaises",
    subcategorySlug: "chaises-de-direction",
    originalPrice: 135000,
    discountPercent: 0,
    rating: 4.2,
    popularity: 58,
    isNew: false,
    createdAt: "2025-05-20",
    stockQuantity: 20,
  },
  {
    id: "fauteuil-direction-confort-plus",
    name: "Fauteuil de Direction Confort Plus",
    alt: "Fauteuil de direction en cuir noir avec accoudoirs réglables",
    image: "https://placehold.co/600x600/1e3a5f/ffffff?text=Fauteuil+Direction",
    categorySlug: "fauteuils-chaises",
    subcategorySlug: "fauteuils-de-direction",
    originalPrice: 150000,
    discountPercent: 30,
    rating: 4.8,
    popularity: 95,
    isNew: false,
    createdAt: "2025-10-14",
    stockQuantity: 28,
    featured: true,
  },
  {
    id: "fauteuil-direction-matelasse",
    name: "Fauteuil de Direction Matelassé",
    alt: "Fauteuil de direction matelassé beige avec piètement chromé",
    image: "https://placehold.co/600x600/3c5a80/ffffff?text=Fauteuil+Matelasse",
    categorySlug: "fauteuils-chaises",
    subcategorySlug: "fauteuils-de-direction",
    originalPrice: 175000,
    discountPercent: 0,
    rating: 4.3,
    popularity: 62,
    isNew: false,
    createdAt: "2025-07-22",
    stockQuantity: 15,
  },
  {
    id: "fauteuil-visiteur-empilable",
    name: "Fauteuil Visiteur Empilable",
    alt: "Fauteuil visiteur empilable en tissu bleu avec structure métallique",
    image: "https://placehold.co/600x600/2b4a6f/ffffff?text=Fauteuil+Visiteur",
    categorySlug: "fauteuils-chaises",
    subcategorySlug: "fauteuils-chaise-visiteur",
    originalPrice: 45000,
    discountPercent: 20,
    rating: 3.8,
    popularity: 40,
    isNew: true,
    createdAt: "2026-07-15",
    stockQuantity: 50,
  },
  {
    id: "chaise-visiteur-accoudoirs-chrome",
    name: "Chaise Visiteur Accoudoirs Chrome",
    alt: "Chaise visiteur grise avec accoudoirs chromés",
    image: "https://placehold.co/600x600/1e3a5f/ffffff?text=Chaise+Visiteur",
    categorySlug: "fauteuils-chaises",
    subcategorySlug: "fauteuils-chaise-visiteur",
    originalPrice: 55000,
    discountPercent: 0,
    rating: 4.0,
    popularity: 45,
    isNew: false,
    createdAt: "2025-04-11",
    stockQuantity: 45,
  },
  {
    id: "canape-3-places-tissu-gris",
    name: "Canapé 3 Places Tissu Gris",
    alt: "Canapé trois places en tissu gris avec coussins moelleux",
    image: "https://placehold.co/600x600/2b4a6f/ffffff?text=Canape+3+Places",
    categorySlug: "salon-chambre",
    subcategorySlug: "salon",
    originalPrice: 275000,
    discountPercent: 15,
    rating: 4.5,
    popularity: 78,
    isNew: false,
    createdAt: "2025-11-28",
    stockQuantity: 10,
  },
  {
    id: "canape-angle-simili-cuir",
    name: "Canapé d'Angle Simili Cuir",
    alt: "Canapé d'angle en simili cuir noir avec repose-pieds intégré",
    image: "https://placehold.co/600x600/3c5a80/ffffff?text=Canape+Angle",
    categorySlug: "salon-chambre",
    subcategorySlug: "salon",
    originalPrice: 390000,
    discountPercent: 0,
    rating: 4.1,
    popularity: 52,
    isNew: false,
    createdAt: "2025-03-09",
    stockQuantity: 0,
  },
  {
    id: "lit-double-140x190-sommier",
    name: "Lit Double 140x190 avec Sommier",
    alt: "Lit double 140x190 en bois avec sommier à lattes inclus",
    image: "https://placehold.co/600x600/1e3a5f/ffffff?text=Lit+Double",
    categorySlug: "salon-chambre",
    subcategorySlug: "chambre-a-coucher",
    originalPrice: 210000,
    discountPercent: 10,
    rating: 4.4,
    popularity: 68,
    isNew: false,
    createdAt: "2025-09-30",
    stockQuantity: 14,
  },
  {
    id: "armoire-chambre-3-portes",
    name: "Armoire de Chambre 3 Portes",
    alt: "Armoire de chambre en bois à trois portes battantes",
    image: "https://placehold.co/600x600/2b4a6f/ffffff?text=Armoire+Chambre",
    categorySlug: "salon-chambre",
    subcategorySlug: "chambre-a-coucher",
    originalPrice: 165000,
    discountPercent: 0,
    rating: 3.9,
    popularity: 44,
    isNew: false,
    createdAt: "2025-02-17",
    stockQuantity: 0,
  },
  {
    id: "table-basse-verre-trempe",
    name: "Table Basse Verre Trempé",
    alt: "Table basse rectangulaire en verre trempé avec pieds métalliques",
    image: "https://placehold.co/600x600/3c5a80/ffffff?text=Table+Verre",
    categorySlug: "salon-chambre",
    subcategorySlug: "table-basse",
    originalPrice: 68000,
    discountPercent: 25,
    rating: 4.2,
    popularity: 57,
    isNew: true,
    createdAt: "2026-06-28",
    stockQuantity: 24,
  },
  {
    id: "table-basse-bois-rustique",
    name: "Table Basse Bois Rustique",
    alt: "Table basse ronde en bois massif de style rustique",
    image: "https://placehold.co/600x600/1e3a5f/ffffff?text=Table+Rustique",
    categorySlug: "salon-chambre",
    subcategorySlug: "table-basse",
    originalPrice: 52000,
    discountPercent: 0,
    rating: 4.0,
    popularity: 49,
    isNew: false,
    createdAt: "2025-01-25",
    stockQuantity: 33,
  },
  {
    id: "armoire-metallique-4-portes",
    name: "Armoire Métallique 4 Portes",
    alt: "Armoire métallique grise à quatre portes avec serrure",
    image: "https://placehold.co/600x600/3c5a80/ffffff?text=Armoire+Metallique",
    categorySlug: "armoires",
    originalPrice: 180000,
    discountPercent: 35,
    rating: 4.6,
    popularity: 88,
    isNew: false,
    createdAt: "2025-10-02",
    stockQuantity: 19,
    featured: true,
  },
  {
    id: "armoire-bureau-bois-2-portes",
    name: "Armoire de Bureau en Bois 2 Portes",
    alt: "Armoire de bureau en bois à deux portes avec étagères intérieures",
    image: "https://placehold.co/600x600/2b4a6f/ffffff?text=Armoire+Bois",
    categorySlug: "armoires",
    originalPrice: 130000,
    discountPercent: 0,
    rating: 4.1,
    popularity: 50,
    isNew: false,
    createdAt: "2024-12-14",
    stockQuantity: 27,
  },
  {
    id: "onduleur-1000va-bureau",
    name: "Onduleur 1000VA pour Bureau",
    alt: "Onduleur noir 1000VA avec plusieurs prises de sortie",
    image: "https://placehold.co/600x600/1e3a5f/ffffff?text=Onduleur",
    categorySlug: "electroniques",
    originalPrice: 65000,
    discountPercent: 10,
    rating: 4.3,
    popularity: 66,
    isNew: false,
    createdAt: "2025-08-19",
    stockQuantity: 60,
  },
  {
    id: "climatiseur-split-12000btu",
    name: "Climatiseur Split 12000 BTU",
    alt: "Climatiseur split blanc 12000 BTU avec unité murale",
    image: "https://placehold.co/600x600/2b4a6f/ffffff?text=Climatiseur",
    categorySlug: "electroniques",
    originalPrice: 285000,
    discountPercent: 15,
    rating: 4.5,
    popularity: 80,
    isNew: true,
    createdAt: "2026-07-01",
    stockQuantity: 9,
  },
  {
    id: "imprimante-multifonction-laser",
    name: "Imprimante Multifonction Laser",
    alt: "Imprimante multifonction laser noire avec bac à papier",
    image: "https://placehold.co/600x600/3c5a80/ffffff?text=Imprimante",
    categorySlug: "electroniques",
    originalPrice: 145000,
    discountPercent: 0,
    rating: 4.2,
    popularity: 63,
    isNew: false,
    createdAt: "2025-05-30",
    stockQuantity: 16,
  },
  {
    id: "coffre-fort-ignifuge-50l",
    name: "Coffre-Fort Ignifuge 50L",
    alt: "Coffre-fort ignifuge noir de 50 litres avec serrure électronique",
    image: "https://placehold.co/600x600/1e3a5f/ffffff?text=Coffre-Fort",
    categorySlug: "coffre-fort",
    originalPrice: 250000,
    discountPercent: 20,
    rating: 4.7,
    popularity: 84,
    isNew: false,
    createdAt: "2025-11-11",
    stockQuantity: 21,
    featured: true,
  },
  {
    id: "coffre-fort-electronique-compact",
    name: "Coffre-Fort Électronique Compact",
    alt: "Coffre-fort compact gris avec clavier électronique à code",
    image: "https://placehold.co/600x600/2b4a6f/ffffff?text=Coffre+Compact",
    categorySlug: "coffre-fort",
    originalPrice: 95000,
    discountPercent: 0,
    rating: 4.0,
    popularity: 46,
    isNew: false,
    createdAt: "2025-04-27",
    stockQuantity: 38,
  },
  {
    id: "coffre-fort-mural-securise-30l",
    name: "Coffre-Fort Mural Sécurisé 30L",
    alt: "Coffre-fort mural sécurisé de 30 litres avec double verrouillage",
    image: "https://placehold.co/600x600/3c5a80/ffffff?text=Coffre+Mural",
    categorySlug: "coffre-fort",
    originalPrice: 78000,
    discountPercent: 30,
    rating: 4.3,
    popularity: 59,
    isNew: true,
    createdAt: "2026-06-15",
    stockQuantity: 17,
  },
];

export const FEATURED_PRODUCTS = PRODUCTS.filter((p) => p.featured);

export const PAGE_SIZE = 12;

export const PRICE_BOUNDS = {
  min: 0,
  max: Math.ceil(Math.max(...PRODUCTS.map((p) => p.originalPrice)) / 10000) * 10000,
};

export type SortOption =
  "default" | "popularity" | "rating" | "newest" | "price-asc" | "price-desc";

export const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "default", label: "Par défaut" },
  { value: "popularity", label: "Popularité" },
  { value: "rating", label: "Notes moyennes" },
  { value: "newest", label: "Plus récent" },
  { value: "price-asc", label: "Prix croissant" },
  { value: "price-desc", label: "Prix décroissant" },
];

export const DISCOUNT_OPTIONS = [
  { value: 0, label: "Toutes les réductions" },
  { value: 10, label: "10% et plus" },
  { value: 20, label: "20% et plus" },
  { value: 30, label: "30% et plus" },
  { value: 50, label: "50% et plus" },
];

export function getSalePrice(product: Product) {
  return Math.round(product.originalPrice * (1 - product.discountPercent / 100));
}

export type ProductFilters = {
  categories: string[];
  subcategories: string[];
  priceMin?: number;
  priceMax?: number;
  minDiscount: number;
  newArrivalOnly: boolean;
  sort: SortOption;
};

export function filterAndSortProducts(products: Product[], filters: ProductFilters) {
  const filtered = products.filter((p) => {
    if (filters.categories.length > 0 && !filters.categories.includes(p.categorySlug)) {
      return false;
    }
    if (
      filters.subcategories.length > 0 &&
      (!p.subcategorySlug || !filters.subcategories.includes(p.subcategorySlug))
    ) {
      return false;
    }
    const salePrice = getSalePrice(p);
    if (filters.priceMin !== undefined && salePrice < filters.priceMin) return false;
    if (filters.priceMax !== undefined && salePrice > filters.priceMax) return false;
    if (filters.minDiscount > 0 && p.discountPercent < filters.minDiscount) return false;
    if (filters.newArrivalOnly && !p.isNew) return false;
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    switch (filters.sort) {
      case "popularity":
        return b.popularity - a.popularity;
      case "rating":
        return b.rating - a.rating;
      case "newest":
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case "price-asc":
        return getSalePrice(a) - getSalePrice(b);
      case "price-desc":
        return getSalePrice(b) - getSalePrice(a);
      default:
        return 0;
    }
  });

  return sorted;
}
