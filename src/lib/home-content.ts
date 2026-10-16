// Editable content of the home page and À propos page.
// Placeholder images live in /public/placeholders — overwrite the file (same name)
// or point `image` to another file in /public.

export const HERO_IMAGE = "/placeholders/hero.svg";

// Shown on the home page and on À propos. Replace `value` with the real figure
// (e.g. "10+ ans") once it is confirmed.
export const EXPERIENCE_STAT = { value: "[À REMPLACER]", label: "Expérience" };

export type ShowcaseCard = { title: string; href: string; image: string };

export const SHOWCASE_CARDS: ShowcaseCard[] = [
  {
    title: "Nouvel arrivage",
    href: "/produits?newArrival=true",
    image: "/placeholders/nouvel-arrivage.svg",
  },
  {
    title: "Armoires",
    href: "/produits?category=armoires",
    image: "/placeholders/armoires.svg",
  },
  {
    title: "Rangement",
    href: "/produits?category=meubles-de-bureau&subcategory=meubles-de-rangement",
    image: "/placeholders/rangement.svg",
  },
];

// YouTube / Vimeo link or an .mp4 file (e.g. "/videos/presentation.mp4" in /public).
// Leave empty to show the "Vidéo à ajouter" placeholder.
export const HOME_VIDEO_SRC = "";
