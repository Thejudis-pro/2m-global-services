export type Category = { slug: string; label: string };

export const CATEGORIES: Category[] = [
  { slug: "meubles-de-bureau", label: "Meubles de Bureau" },
  { slug: "fauteuils-chaises", label: "Fauteuils / Chaises" },
  { slug: "salon-chambre", label: "Salon et Chambre à coucher" },
  { slug: "armoires", label: "Armoires Métalliques & Bois" },
  { slug: "electroniques", label: "Électroniques" },
  { slug: "coffre-fort", label: "Coffre Fort" },
];

export const CONTACT = {
  address: "68, Route de Front de Terre, Dakar, Sénégal",
  phones: [
    { label: "33 833 33 64", tel: "+221338333364" },
    { label: "78 157 98 38", tel: "+221781579838" },
    { label: "76 462 77 77", tel: "+221764627777" },
  ],
  email: "commercial@technoofficesarl.com",
  whatsapp: "https://wa.me/c/221764627777",
  facebook: "https://facebook.com",
  tiktok: "https://tiktok.com",
};
