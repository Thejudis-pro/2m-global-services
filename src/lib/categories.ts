export type Subcategory = { slug: string; label: string };

export type Category = { slug: string; label: string; subcategories?: Subcategory[] };

export const CATEGORIES: Category[] = [
  {
    slug: "meubles-de-bureau",
    label: "Meubles de Bureau",
    subcategories: [
      { slug: "bureau-direction", label: "Bureau Direction" },
      { slug: "bureau-secretaire-agent", label: "Bureau Secrétaire/Agent" },
      { slug: "meubles-de-rangement", label: "Meubles de Rangement" },
      { slug: "table-de-reunion", label: "Table de Réunion" },
    ],
  },
  {
    slug: "fauteuils-chaises",
    label: "Fauteuils / Chaises",
    subcategories: [
      { slug: "chaises-de-direction", label: "Chaises de Direction" },
      { slug: "fauteuils-de-direction", label: "Fauteuils de Direction" },
      { slug: "fauteuils-chaise-visiteur", label: "Fauteuils/Chaise Visiteur" },
    ],
  },
  {
    slug: "salon-chambre",
    label: "Salon et Chambre à coucher",
    subcategories: [
      { slug: "salon", label: "Salon" },
      { slug: "chambre-a-coucher", label: "Chambre à Coucher" },
      { slug: "table-basse", label: "Table Basse" },
    ],
  },
  { slug: "armoires", label: "Armoires Métalliques & Bois" },
  { slug: "electroniques", label: "Électroniques" },
  { slug: "coffre-fort", label: "Coffre Fort" },
  { slug: "parfumerie", label: "Parfumerie" },
];

export const CONTACT = {
  address: "68, Route de Front de Terre, Dakar, Sénégal",
  phones: [
    { label: "76 192 34 41", tel: "+221761923441" },
    { label: "78 144 17 66", tel: "+221781441766" },
  ],
  email: "contact@2mglobalservices.com",
  whatsapp: "https://wa.me/221761923441",
  whatsappNumber: "221761923441",
  facebook: "https://facebook.com",
  tiktok: "https://tiktok.com",
};
