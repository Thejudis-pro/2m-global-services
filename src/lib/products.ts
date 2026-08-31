// Sentinel value meaning "no real photo yet" — components render a designed
// illustrated placeholder (see ProductImagePlaceholder) instead of an <img>
// when a product's image equals this. Swap in a real URL once photography
// is available and the placeholder disappears automatically.
export const PLACEHOLDER_IMAGE = "placeholder";

import bureauDirectionAcajouStudio from "@/assets/products/bureau-direction-acajou-studio.jpg";
import bureauDirectionCaissonBoisPhoto from "@/assets/products/bureau-direction-caisson-bois-photo.jpg";
import bureauDirectionGrisRender from "@/assets/products/bureau-direction-gris-render.jpg";
import bureauDirectionGrisPhoto from "@/assets/products/bureau-direction-gris-photo.jpg";
import bureauDirectionAnthraciteBlancPhoto from "@/assets/products/bureau-direction-anthracite-blanc-photo.jpg";
import bureauAgentCheneNoirStudio from "@/assets/products/bureau-agent-chene-noir-studio.jpg";
import bureauAgentNoyer3Tiroirs from "@/assets/products/bureau-agent-noyer-3tiroirs.jpg";
import armoireVestiaire4Casiers from "@/assets/products/armoire-vestiaire-4casiers.jpg";
import armoireMetalliqueBronzeBlanc from "@/assets/products/armoire-metallique-bronze-blanc.jpg";

import armoireMetallique2PortesBlanche from "@/assets/products/armoire-metallique-2portes-blanche.jpg";
import armoireMetallique2PortesBlancheAlt from "@/assets/products/armoire-metallique-2portes-blanche-alt.jpg";
import armoireMetallique2PortesBlanche2 from "@/assets/products/armoire-metallique-2portes-blanche-2.jpg";
import armoireMetalliqueGrise2Portes from "@/assets/products/armoire-metallique-grise-2portes.jpg";
import classeurMetallique5Tiroirs from "@/assets/products/classeur-metallique-5tiroirs.jpg";
import classeurMetallique5TiroirsAlt from "@/assets/products/classeur-metallique-5tiroirs-alt.jpg";
import classeurMetallique4Tiroirs from "@/assets/products/classeur-metallique-4tiroirs.jpg";
import classeurMetalliqueMultiTiroirs from "@/assets/products/classeur-metallique-multitiroirs.jpg";
import armoireVestiaire15Casiers from "@/assets/products/armoire-vestiaire-15casiers.jpg";
import armoireVestiaire15CasiersAlt from "@/assets/products/armoire-vestiaire-15casiers-alt.jpg";
import armoireVestiaire3Portes from "@/assets/products/armoire-vestiaire-3portes.jpg";
import armoireRideauMetallique from "@/assets/products/armoire-rideau-metallique.jpg";
import armoireVitreeBibliotheque from "@/assets/products/armoire-vitree-bibliotheque.jpg";
import etagereIndustrielleNoire from "@/assets/products/etagere-industrielle-noire.jpg";
import etagereIndustrielleNoireAngle from "@/assets/products/etagere-industrielle-noire-angle.jpg";
import etagereIndustrielleNoireAngle2 from "@/assets/products/etagere-industrielle-noire-angle-2.jpg";
import etagereRangementDuo from "@/assets/products/etagere-rangement-duo.jpg";
import armoireRangementEtageresOuverte from "@/assets/products/armoire-rangement-etageres-ouverte.jpg";
import caissonMetallique3TiroirsBlanc from "@/assets/products/caisson-metallique-3tiroirs-blanc.jpg";
import caisson3TiroirsBleu from "@/assets/products/caisson-3tiroirs-bleu.jpg";

import bureauDirectionPremiumLedShowroom from "@/assets/products/bureau-direction-premium-led-showroom.jpg";
import bureauDirectionShowroomEtageres from "@/assets/products/bureau-direction-showroom-etageres.jpg";
import bureauMetalliqueTankerBlanc from "@/assets/products/bureau-metallique-tanker-blanc.jpg";
import bureauDirectionLshapeAnthraciteLifestyle from "@/assets/products/bureau-direction-lshape-anthracite-lifestyle.jpg";
import bureauDirectionLshapeAnthraciteDetail from "@/assets/products/bureau-direction-lshape-anthracite-detail.jpg";
import bureauDirectionAnthraciteLifestyle1 from "@/assets/products/bureau-direction-anthracite-lifestyle-1.jpg";
import bureauDirectionAnthraciteLifestyleMarbre from "@/assets/products/bureau-direction-anthracite-lifestyle-marbre.jpg";

import tableReunionTriangulairePhoto from "@/assets/products/table-reunion-triangulaire-photo.jpg";
import tableReunionOvaleGrandePhoto from "@/assets/products/table-reunion-ovale-grande-photo.jpg";
import tableReunionOvalePhoto from "@/assets/products/table-reunion-ovale-photo.jpg";

import bancAttente3PlacesBleu from "@/assets/products/banc-attente-3places-bleu.jpg";
import bancAttente3PlacesNoir from "@/assets/products/banc-attente-3places-noir.jpg";

import chariotInformatiqueRoulettes from "@/assets/products/chariot-informatique-roulettes.jpg";

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
    image: bureauDirectionAcajouStudio,
    images: [
      { src: bureauDirectionAcajouStudio, alt: "Bureau de direction en acajou verni avec caissons latéraux" },
      { src: bureauDirectionCaissonBoisPhoto, alt: "Bureau de direction acajou avec caisson à tiroirs, vue en situation" },
    ],
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
    image: bureauDirectionGrisRender,
    images: [
      { src: bureauDirectionGrisRender, alt: "Grand bureau de direction gris anthracite avec plateau XL" },
      { src: bureauDirectionGrisPhoto, alt: "Bureau de direction gris anthracite, vue en situation" },
    ],
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
    alt: "Bureau secrétaire compact en bois de chêne clair avec caisson à tiroirs",
    image: bureauAgentCheneNoirStudio,
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
    alt: "Bureau agent en bois avec caisson à trois tiroirs, ligne épurée",
    image: bureauAgentNoyer3Tiroirs,
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
    image: PLACEHOLDER_IMAGE,
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
    image: PLACEHOLDER_IMAGE,
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
    image: PLACEHOLDER_IMAGE,
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
    image: PLACEHOLDER_IMAGE,
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
    image: PLACEHOLDER_IMAGE,
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
    image: PLACEHOLDER_IMAGE,
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
    image: PLACEHOLDER_IMAGE,
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
    image: PLACEHOLDER_IMAGE,
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
    image: PLACEHOLDER_IMAGE,
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
    image: PLACEHOLDER_IMAGE,
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
    image: PLACEHOLDER_IMAGE,
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
    image: PLACEHOLDER_IMAGE,
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
    image: PLACEHOLDER_IMAGE,
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
    image: PLACEHOLDER_IMAGE,
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
    alt: "Armoire vestiaire métallique à quatre casiers avec serrures individuelles",
    image: armoireVestiaire4Casiers,
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
    alt: "Armoire de bureau finition bronze avec deux portes blanches",
    image: armoireMetalliqueBronzeBlanc,
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
    image: PLACEHOLDER_IMAGE,
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
    image: PLACEHOLDER_IMAGE,
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
    image: PLACEHOLDER_IMAGE,
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
    image: PLACEHOLDER_IMAGE,
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
    image: PLACEHOLDER_IMAGE,
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
    image: PLACEHOLDER_IMAGE,
    categorySlug: "coffre-fort",
    originalPrice: 78000,
    discountPercent: 30,
    rating: 4.3,
    popularity: 59,
    isNew: true,
    createdAt: "2026-06-15",
    stockQuantity: 17,
  },
  {
    id: "bureau-direction-prestige-led",
    name: "Bureau de Direction Prestige LED",
    alt: "Bureau de direction avec éclairage LED intégré et bibliothèque assortie",
    image: bureauDirectionPremiumLedShowroom,
    images: [
      { src: bureauDirectionPremiumLedShowroom, alt: "Bureau de direction avec éclairage LED intégré et bibliothèque assortie" },
      { src: bureauDirectionShowroomEtageres, alt: "Bureau de direction en showroom avec bibliothèque murale" },
    ],
    categorySlug: "meubles-de-bureau",
    subcategorySlug: "bureau-direction",
    originalPrice: 520000,
    discountPercent: 15,
    rating: 4.7,
    popularity: 85,
    isNew: true,
    createdAt: "2026-08-20",
    stockQuantity: 6,
    featured: true,
  },
  {
    id: "bureau-direction-l-anthracite",
    name: "Bureau Direction L Anthracite Vitré",
    alt: "Bureau de direction en L anthracite avec caisson vitré",
    image: bureauDirectionLshapeAnthraciteLifestyle,
    images: [
      { src: bureauDirectionLshapeAnthraciteLifestyle, alt: "Bureau de direction en L anthracite en situation de bureau" },
      { src: bureauDirectionLshapeAnthraciteDetail, alt: "Bureau de direction en L anthracite, vue de détail" },
    ],
    categorySlug: "meubles-de-bureau",
    subcategorySlug: "bureau-direction",
    originalPrice: 340000,
    discountPercent: 0,
    rating: 4.2,
    popularity: 54,
    isNew: false,
    createdAt: "2025-09-02",
    stockQuantity: 11,
  },
  {
    id: "bureau-direction-anthracite-design",
    name: "Bureau Direction Anthracite Design",
    alt: "Bureau de direction anthracite avec liseré et rangement latéral",
    image: bureauDirectionAnthraciteLifestyle1,
    images: [
      { src: bureauDirectionAnthraciteLifestyle1, alt: "Bureau de direction anthracite avec liseré, en situation" },
      { src: bureauDirectionAnthraciteLifestyleMarbre, alt: "Bureau de direction anthracite dans un bureau avec mur en marbre" },
    ],
    categorySlug: "meubles-de-bureau",
    subcategorySlug: "bureau-direction",
    originalPrice: 365000,
    discountPercent: 10,
    rating: 4.4,
    popularity: 61,
    isNew: false,
    createdAt: "2025-10-28",
    stockQuantity: 9,
  },
  {
    id: "bureau-direction-gris-blanc",
    name: "Bureau Direction Gris & Blanc",
    alt: "Bureau de direction gris et blanc avec caisson de rangement",
    image: bureauDirectionAnthraciteBlancPhoto,
    categorySlug: "meubles-de-bureau",
    subcategorySlug: "bureau-direction",
    originalPrice: 310000,
    discountPercent: 0,
    rating: 4.0,
    popularity: 47,
    isNew: false,
    createdAt: "2025-06-19",
    stockQuantity: 13,
  },
  {
    id: "bureau-metallique-tanker-blanc",
    name: "Bureau Métallique Tanker Blanc",
    alt: "Bureau métallique blanc de style tanker avec six tiroirs",
    image: bureauMetalliqueTankerBlanc,
    categorySlug: "meubles-de-bureau",
    subcategorySlug: "bureau-secretaire-agent",
    originalPrice: 175000,
    discountPercent: 5,
    rating: 4.3,
    popularity: 56,
    isNew: false,
    createdAt: "2025-08-30",
    stockQuantity: 14,
  },
  {
    id: "table-reunion-triangulaire-xxl",
    name: "Table de Réunion Triangulaire XXL",
    alt: "Grande table de réunion triangulaire avec goulotte câble intégrée",
    image: tableReunionTriangulairePhoto,
    categorySlug: "meubles-de-bureau",
    subcategorySlug: "table-de-reunion",
    originalPrice: 980000,
    discountPercent: 10,
    rating: 4.6,
    popularity: 72,
    isNew: true,
    createdAt: "2026-08-10",
    stockQuantity: 3,
    featured: true,
  },
  {
    id: "table-reunion-ovale-xxl",
    name: "Table de Réunion Ovale XXL 20 Places",
    alt: "Table de réunion ovale en bois foncé pour vingt personnes avec chaises assorties",
    image: tableReunionOvaleGrandePhoto,
    categorySlug: "meubles-de-bureau",
    subcategorySlug: "table-de-reunion",
    originalPrice: 1250000,
    discountPercent: 0,
    rating: 4.8,
    popularity: 68,
    isNew: true,
    createdAt: "2026-08-05",
    stockQuantity: 2,
  },
  {
    id: "table-reunion-ovale-compacte",
    name: "Table de Réunion Ovale Compacte",
    alt: "Table de réunion ovale compacte bicolore avec huit chaises",
    image: tableReunionOvalePhoto,
    categorySlug: "meubles-de-bureau",
    subcategorySlug: "table-de-reunion",
    originalPrice: 420000,
    discountPercent: 15,
    rating: 4.1,
    popularity: 43,
    isNew: false,
    createdAt: "2025-07-14",
    stockQuantity: 7,
  },
  {
    id: "caisson-metallique-3-tiroirs",
    name: "Caisson de Rangement Métallique 3 Tiroirs Blanc",
    alt: "Caisson de rangement métallique blanc à trois tiroirs avec serrure et roulettes",
    image: caissonMetallique3TiroirsBlanc,
    categorySlug: "meubles-de-bureau",
    subcategorySlug: "meubles-de-rangement",
    originalPrice: 68000,
    discountPercent: 0,
    rating: 4.1,
    popularity: 46,
    isNew: false,
    createdAt: "2025-05-16",
    stockQuantity: 26,
  },
  {
    id: "caisson-mobile-3-tiroirs-bleu",
    name: "Caisson Mobile 3 Tiroirs",
    alt: "Caisson mobile blanc à trois tiroirs avec poignées bleues et roulettes",
    image: caisson3TiroirsBleu,
    categorySlug: "meubles-de-bureau",
    subcategorySlug: "meubles-de-rangement",
    originalPrice: 62000,
    discountPercent: 0,
    rating: 3.9,
    popularity: 38,
    isNew: false,
    createdAt: "2025-03-22",
    stockQuantity: 31,
  },
  {
    id: "chariot-informatique-mobile",
    name: "Chariot Informatique Mobile",
    alt: "Chariot informatique en bois sur roulettes avec support clavier et rangement",
    image: chariotInformatiqueRoulettes,
    categorySlug: "meubles-de-bureau",
    subcategorySlug: "meubles-de-rangement",
    originalPrice: 58000,
    discountPercent: 0,
    rating: 3.8,
    popularity: 34,
    isNew: false,
    createdAt: "2025-02-11",
    stockQuantity: 16,
  },
  {
    id: "banc-attente-3places-bleu",
    name: "Banc d'Attente 3 Places Bleu",
    alt: "Banc d'attente trois places en simili cuir bleu avec structure chromée",
    image: bancAttente3PlacesBleu,
    categorySlug: "fauteuils-chaises",
    subcategorySlug: "fauteuils-chaise-visiteur",
    originalPrice: 145000,
    discountPercent: 10,
    rating: 4.2,
    popularity: 50,
    isNew: false,
    createdAt: "2025-11-05",
    stockQuantity: 8,
  },
  {
    id: "banc-attente-3places-noir",
    name: "Banc d'Attente 3 Places Noir",
    alt: "Banc d'attente trois places noir avec structure chromée pour salle d'attente",
    image: bancAttente3PlacesNoir,
    categorySlug: "fauteuils-chaises",
    subcategorySlug: "fauteuils-chaise-visiteur",
    originalPrice: 140000,
    discountPercent: 0,
    rating: 4.0,
    popularity: 42,
    isNew: false,
    createdAt: "2025-09-24",
    stockQuantity: 10,
  },
  {
    id: "armoire-metallique-2-portes-blanche",
    name: "Armoire Métallique 2 Portes Blanche",
    alt: "Armoire métallique blanche à deux portes battantes avec serrure centrale",
    image: armoireMetallique2PortesBlanche,
    images: [
      { src: armoireMetallique2PortesBlanche, alt: "Armoire métallique blanche à deux portes battantes avec serrure centrale" },
      { src: armoireMetallique2PortesBlancheAlt, alt: "Armoire métallique blanche, vue de face" },
      { src: armoireMetallique2PortesBlanche2, alt: "Armoire métallique blanche, vue de détail de la serrure" },
    ],
    categorySlug: "armoires",
    originalPrice: 155000,
    discountPercent: 10,
    rating: 4.3,
    popularity: 58,
    isNew: false,
    createdAt: "2025-06-08",
    stockQuantity: 23,
  },
  {
    id: "armoire-metallique-grise-2-portes",
    name: "Armoire Métallique Grise 2 Portes",
    alt: "Armoire métallique grise à deux portes battantes avec serrure",
    image: armoireMetalliqueGrise2Portes,
    categorySlug: "armoires",
    originalPrice: 148000,
    discountPercent: 0,
    rating: 4.0,
    popularity: 41,
    isNew: false,
    createdAt: "2025-04-02",
    stockQuantity: 18,
  },
  {
    id: "classeur-metallique-5-tiroirs",
    name: "Classeur Métallique 5 Tiroirs",
    alt: "Classeur métallique blanc à cinq tiroirs suspendus avec serrure",
    image: classeurMetallique5Tiroirs,
    images: [
      { src: classeurMetallique5Tiroirs, alt: "Classeur métallique blanc à cinq tiroirs suspendus avec serrure" },
      { src: classeurMetallique5TiroirsAlt, alt: "Classeur métallique blanc à cinq tiroirs, vue de trois-quarts" },
    ],
    categorySlug: "armoires",
    originalPrice: 175000,
    discountPercent: 20,
    rating: 4.5,
    popularity: 64,
    isNew: false,
    createdAt: "2025-10-20",
    stockQuantity: 15,
    featured: true,
  },
  {
    id: "classeur-metallique-4-tiroirs",
    name: "Classeur Métallique 4 Tiroirs",
    alt: "Classeur métallique blanc à quatre tiroirs avec poignées noires",
    image: classeurMetallique4Tiroirs,
    categorySlug: "armoires",
    originalPrice: 152000,
    discountPercent: 0,
    rating: 4.1,
    popularity: 48,
    isNew: false,
    createdAt: "2025-05-27",
    stockQuantity: 20,
  },
  {
    id: "classeur-metallique-multi-tiroirs",
    name: "Classeur Métallique Multi-Tiroirs",
    alt: "Classeur métallique gris à dix petits tiroirs pour archivage de documents",
    image: classeurMetalliqueMultiTiroirs,
    categorySlug: "armoires",
    originalPrice: 195000,
    discountPercent: 0,
    rating: 3.9,
    popularity: 35,
    isNew: false,
    createdAt: "2025-01-30",
    stockQuantity: 9,
  },
  {
    id: "armoire-vestiaire-15-casiers",
    name: "Armoire Vestiaire 15 Casiers",
    alt: "Armoire vestiaire métallique à quinze casiers individuels verrouillables",
    image: armoireVestiaire15Casiers,
    images: [
      { src: armoireVestiaire15Casiers, alt: "Armoire vestiaire métallique à quinze casiers individuels verrouillables" },
      { src: armoireVestiaire15CasiersAlt, alt: "Armoire vestiaire à quinze casiers, vue de trois-quarts" },
    ],
    categorySlug: "armoires",
    originalPrice: 320000,
    discountPercent: 5,
    rating: 4.4,
    popularity: 53,
    isNew: false,
    createdAt: "2025-11-18",
    stockQuantity: 6,
  },
  {
    id: "armoire-vestiaire-3-portes",
    name: "Armoire Vestiaire 3 Portes",
    alt: "Armoire vestiaire métallique à trois portes avec serrures individuelles",
    image: armoireVestiaire3Portes,
    categorySlug: "armoires",
    originalPrice: 210000,
    discountPercent: 0,
    rating: 4.2,
    popularity: 49,
    isNew: false,
    createdAt: "2025-07-08",
    stockQuantity: 17,
  },
  {
    id: "armoire-rideau-metallique",
    name: "Armoire à Rideau Métallique",
    alt: "Armoire métallique blanche à rideau coulissant avec serrure",
    image: armoireRideauMetallique,
    categorySlug: "armoires",
    originalPrice: 168000,
    discountPercent: 0,
    rating: 4.0,
    popularity: 39,
    isNew: false,
    createdAt: "2025-04-19",
    stockQuantity: 12,
  },
  {
    id: "armoire-vitree-bibliotheque",
    name: "Armoire Vitrée Bibliothèque",
    alt: "Armoire bibliothèque avec portes vitrées en haut et portes pleines en bas",
    image: armoireVitreeBibliotheque,
    categorySlug: "armoires",
    originalPrice: 245000,
    discountPercent: 10,
    rating: 4.6,
    popularity: 67,
    isNew: true,
    createdAt: "2026-07-28",
    stockQuantity: 8,
  },
  {
    id: "etagere-industrielle-noire",
    name: "Étagère Industrielle Noire 4 Niveaux",
    alt: "Étagère de rangement industrielle noire à quatre niveaux robustes",
    image: etagereIndustrielleNoire,
    images: [
      { src: etagereIndustrielleNoire, alt: "Étagère de rangement industrielle noire à quatre niveaux robustes" },
      { src: etagereIndustrielleNoireAngle, alt: "Étagère industrielle noire, vue de trois-quarts" },
      { src: etagereIndustrielleNoireAngle2, alt: "Étagère industrielle noire, vue d'angle" },
    ],
    categorySlug: "armoires",
    originalPrice: 135000,
    discountPercent: 15,
    rating: 4.3,
    popularity: 51,
    isNew: false,
    createdAt: "2025-09-14",
    stockQuantity: 14,
  },
  {
    id: "etagere-rangement-modulable",
    name: "Étagère de Rangement Modulable",
    alt: "Étagère de rangement modulable à cinq niveaux, disponible en blanc ou noir",
    image: etagereRangementDuo,
    categorySlug: "armoires",
    originalPrice: 98000,
    discountPercent: 0,
    rating: 4.0,
    popularity: 40,
    isNew: false,
    createdAt: "2025-03-15",
    stockQuantity: 19,
  },
  {
    id: "armoire-rangement-etageres-ajustables",
    name: "Armoire de Rangement à Étagères Ajustables",
    alt: "Armoire de rangement métallique avec étagères intérieures ajustables, portes ouvertes ou fermées",
    image: armoireRangementEtageresOuverte,
    categorySlug: "armoires",
    originalPrice: 158000,
    discountPercent: 0,
    rating: 4.1,
    popularity: 44,
    isNew: false,
    createdAt: "2025-02-24",
    stockQuantity: 21,
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
