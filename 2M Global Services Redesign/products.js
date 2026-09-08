const B = "https://2m-global-services.vercel.app/assets/";

export const PRODUCTS = [
  { slug: "bureau-direction-prestige-acajou", name: "Bureau de Direction Prestige Acajou", cat: "Meubles de Bureau", price: "360.000", old: "450.000", off: "-20%", img: B + "bureau-direction-acajou-studio-D8a_kgFR.jpg", alt: "Bureau de direction en acajou verni avec caissons latéraux" },
  { slug: "fauteuil-direction-confort-plus", name: "Fauteuil de Direction Confort Plus", cat: "Fauteuils / Chaises", price: "105.000", old: "150.000", off: "-30%", img: B + "fauteuil-direction-confort-plus-BbFLA2Q5.jpg", alt: "Fauteuil de direction en cuir noir avec accoudoirs réglables" },
  { slug: "armoire-metallique-4-portes", name: "Armoire Métallique 4 Portes", cat: "Armoires", price: "117.000", old: "180.000", off: "-35%", img: B + "armoire-vestiaire-4casiers-DHhA27ff.jpg", alt: "Armoire vestiaire métallique à quatre casiers" },
  { slug: "bureau-direction-prestige-led", name: "Bureau de Direction Prestige LED", cat: "Meubles de Bureau", price: "442.000", old: "520.000", off: "-15%", img: B + "bureau-direction-premium-led-showroom-CmrXFh-b.jpg", alt: "Bureau de direction avec éclairage LED intégré" },
  { slug: "bureau-direction-manager-xl", name: "Bureau de Direction Manager XL", cat: "Meubles de Bureau", price: "380.000", old: "", off: "Nouveau", img: B + "bureau-direction-gris-render-YCEaSeCF.jpg", alt: "Grand bureau de direction gris anthracite" },
  { slug: "bureau-secretaire-compact-chene", name: "Bureau Secrétaire Compact Chêne", cat: "Meubles de Bureau", price: "123.250", old: "145.000", off: "-15%", img: B + "bureau-agent-chene-noir-studio-B-xJ1_aJ.jpg", alt: "Bureau secrétaire compact en chêne clair" },
  { slug: "bureau-agent-simple-ligne", name: "Bureau Agent Simple Ligne", cat: "Meubles de Bureau", price: "95.000", old: "", off: "", img: B + "bureau-agent-noyer-3tiroirs-BpJ4APiU.jpg", alt: "Bureau agent en bois avec caisson trois tiroirs" },
  { slug: "caisson-rangement-3-tiroirs", name: "Caisson de Rangement 3 Tiroirs", cat: "Meubles de Bureau", price: "76.500", old: "85.000", off: "-10%", img: B + "caisson-mobile-3tiroirs-blanc-BWqpKdMQ.jpg", alt: "Caisson de rangement gris à trois tiroirs sur roulettes" },
  { slug: "chaise-direction-ergonomique-noire", name: "Chaise de Direction Ergonomique", cat: "Fauteuils / Chaises", price: "73.500", old: "98.000", off: "-25%", img: B + "chaise-direction-ergonomique-noire-DMS2MVJi.jpg", alt: "Chaise de direction noire ergonomique" },
  { slug: "chaise-direction-cuir-marron", name: "Chaise de Direction Cuir Marron", cat: "Fauteuils / Chaises", price: "135.000", old: "", off: "", img: B + "chaise-direction-cuir-marron-BR_HsHx8.jpg", alt: "Chaise de direction en cuir marron" },
  { slug: "chaise-visiteur-accoudoirs-chrome", name: "Chaise Visiteur Accoudoirs Chrome", cat: "Fauteuils / Chaises", price: "55.000", old: "", off: "", img: B + "chaise-visiteur-accoudoirs-chrome-Cja2sE2T.jpg", alt: "Chaise visiteur grise avec accoudoirs chromés" },
  { slug: "armoire-bureau-bois-2-portes", name: "Armoire de Bureau Bois 2 Portes", cat: "Armoires", price: "130.000", old: "", off: "", img: B + "armoire-metallique-bronze-blanc-C1S84AFX.jpg", alt: "Armoire de bureau finition bronze deux portes" },
  { slug: "smartphone-samsung-galaxy-s24-ultra", name: "Samsung Galaxy S24 Ultra", cat: "Électroniques", price: "Bientôt", old: "", off: "Nouveau", img: B + "electro-samsung-galaxy-s24-ultra-xLvtHJvX.jpg", alt: "Smartphones Samsung Galaxy S24 Ultra" }
];

export const CATEGORIES = [
  { name: "Meubles de Bureau", count: 38, img: PRODUCTS[0].img },
  { name: "Fauteuils / Chaises", count: 26, img: PRODUCTS[1].img },
  { name: "Salon & Chambre", count: 14, img: PRODUCTS[6].img },
  { name: "Armoires Métal & Bois", count: 12, img: PRODUCTS[2].img },
  { name: "Électroniques", count: 9, img: PRODUCTS[12].img },
  { name: "Coffres-Forts", count: 5, img: PRODUCTS[11].img }
];

export const CART = [
  { slug: PRODUCTS[1].slug, name: PRODUCTS[1].name, img: PRODUCTS[1].img, unit: "105.000", qty: 2, line: "210.000", note: "Cuir noir · Livraison 48h" },
  { slug: PRODUCTS[7].slug, name: PRODUCTS[7].name, img: PRODUCTS[7].img, unit: "76.500", qty: 1, line: "76.500", note: "Gris · En stock Dakar" },
  { slug: PRODUCTS[2].slug, name: PRODUCTS[2].name, img: PRODUCTS[2].img, unit: "117.000", qty: 1, line: "117.000", note: "4 casiers · Montage inclus" }
];

export const TOTALS = { sub: "403.500", saved: "153.500", ship: "Offerte à Dakar", total: "403.500" };
