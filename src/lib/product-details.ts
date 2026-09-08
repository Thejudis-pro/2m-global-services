import { CATEGORIES } from "@/lib/categories";
import { PLACEHOLDER_IMAGE, PRODUCTS, type Product } from "@/lib/products";

export type Dimensions = { height: number; width: number; depth: number };

// src is null when no real photo exists yet — the gallery renders a designed
// placeholder (see ProductImagePlaceholder) for that slot instead.
export type GalleryImage = { src: string | null; alt: string };

export type ProductDetails = {
  sku: string;
  weightKg: number;
  dimensions: Dimensions;
  description: string;
  inStock: boolean;
  images: GalleryImage[];
};

type CategorySpec = {
  skuPrefix: string;
  weightKg: number;
  dimensions: Dimensions;
  descriptionIntro: string;
};

const CATEGORY_SPECS: Record<string, CategorySpec> = {
  "meubles-de-bureau": {
    skuPrefix: "MDB",
    weightKg: 45,
    dimensions: { height: 75, width: 140, depth: 70 },
    descriptionIntro:
      "conçu pour les professionnels exigeants qui veulent allier confort de travail et présentation soignée du bureau",
  },
  "fauteuils-chaises": {
    skuPrefix: "FCH",
    weightKg: 12,
    dimensions: { height: 110, width: 65, depth: 65 },
    descriptionIntro:
      "pensé pour un maintien confortable durant de longues heures assises, au bureau comme en salle de réunion",
  },
  "salon-chambre": {
    skuPrefix: "SCH",
    weightKg: 55,
    dimensions: { height: 85, width: 180, depth: 90 },
    descriptionIntro:
      "idéal pour aménager un salon ou une chambre à coucher avec une touche à la fois pratique et élégante",
  },
  armoires: {
    skuPrefix: "ARM",
    weightKg: 65,
    dimensions: { height: 185, width: 90, depth: 45 },
    descriptionIntro:
      "pensé pour un rangement sécurisé et bien organisé des documents et effets professionnels",
  },
  electroniques: {
    skuPrefix: "ELE",
    weightKg: 15,
    dimensions: { height: 40, width: 45, depth: 35 },
    descriptionIntro:
      "sélectionné pour équiper efficacement votre bureau ou votre maison au quotidien",
  },
  "coffre-fort": {
    skuPrefix: "CFT",
    weightKg: 35,
    dimensions: { height: 45, width: 40, depth: 40 },
    descriptionIntro:
      "conçu pour protéger vos documents et objets de valeur contre le vol et l'incendie",
  },
};

const skuMap: Record<string, string> = {};
{
  PRODUCTS.forEach((product, index) => {
    skuMap[product.id] = `2M-${String(index + 1).padStart(3, "0")}`;
  });
}

function buildGallery(product: Product): GalleryImage[] {
  if (product.images && product.images.length > 0) {
    return product.images;
  }
  if (product.image === PLACEHOLDER_IMAGE) {
    return [
      { src: null, alt: product.alt },
      { src: null, alt: `${product.alt} — vue de côté` },
      { src: null, alt: `${product.alt} — vue de détail` },
    ];
  }
  return [{ src: product.image, alt: product.alt }];
}

export function getProductDetails(product: Product): ProductDetails {
  const spec = CATEGORY_SPECS[product.categorySlug] ?? CATEGORY_SPECS["meubles-de-bureau"];
  const categoryLabel = CATEGORIES.find((c) => c.slug === product.categorySlug)?.label ?? "";

  return {
    sku: product.sku ?? skuMap[product.id] ?? `2M-${product.id.slice(0, 3).toUpperCase()}`,
    weightKg: product.weightKg ?? spec.weightKg,
    dimensions: product.dimensions ?? spec.dimensions,
    description:
      product.description ??
      `${product.name} est ${spec.descriptionIntro}. Fabriqué avec des matériaux durables et un ` +
        `souci du détail, ce produit de la catégorie ${categoryLabel} s'intègre facilement dans votre ` +
        `espace de travail ou votre intérieur. 2M Global Services sélectionne chaque référence pour son ` +
        `rapport qualité-prix et sa robustesse à l'usage quotidien, avec un service après-vente disponible ` +
        `à Dakar et partout au Sénégal.`,
    inStock: product.stockQuantity > 0,
    images: buildGallery(product),
  };
}
