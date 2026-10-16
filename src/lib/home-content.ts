import homeVideo from "@/assets/products/ec53ddaa-b7a6-476c-9193-60614fa295f8.mp4";

// Editable content of the home page and À propos page.
// Photos are taken from the product catalogue by product id — swap an id to change a photo.

export const EXPERIENCE_STAT = { value: "5+", label: "Années d'expérience" };

export const HERO_PRODUCT_ID = "bureau-direction-prestige-led";

// The two cards on the right of the hero.
export const HERO_CARD_PRODUCT_IDS = {
  electroniques: "smartphone-samsung-galaxy-s24-ultra",
  armoires: "armoire-bois-2portes-noyer",
};

export type ShowcaseCard = { title: string; href: string; productId: string };

export const SHOWCASE_CARDS: ShowcaseCard[] = [
  {
    title: "Nouvel arrivage",
    href: "/produits?newArrival=true",
    productId: "salon-cuir-marron-canape-fauteuils-table-basse",
  },
  {
    title: "Armoires",
    href: "/produits?category=armoires",
    productId: "ensemble-armoire-bois-2-portes-vitrine",
  },
  {
    title: "Rangement",
    href: "/produits?category=meubles-de-bureau&subcategory=meubles-de-rangement",
    productId: "armoire-rangement-etageres-ajustables",
  },
];

// A showroom clip from src/assets/products. Can also be a YouTube / Vimeo link
// or any .mp4 URL (see VideoEmbed).
export const HOME_VIDEO_SRC: string = homeVideo;
