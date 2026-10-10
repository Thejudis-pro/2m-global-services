import { createFileRoute } from "@tanstack/react-router";
import { MadiorCard } from "@/components/madior/MadiorCard";

const URL = "https://2mglobal.sn/madior";
const TITLE = "Madior Niang — Carte digitale";
const DESCRIPTION =
  "Retrouvez Madior Niang : 2M Global Services, 2M Parfumerie, Take Off Sénégal. Contact WhatsApp, site et réseaux.";
// TODO: swap for a dedicated 1200×630 /madior/og.png once it exists.
const OG_IMAGE = "https://2mglobal.sn/madior/madior_cutout.png";

export const Route = createFileRoute("/madior")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "profile" },
      { property: "og:url", content: URL },
      { property: "og:locale", content: "fr_SN" },
      { property: "og:image", content: OG_IMAGE },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESCRIPTION },
      { name: "twitter:image", content: OG_IMAGE },
    ],
    links: [
      { rel: "canonical", href: URL },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@600;700&family=Cormorant+Garamond:wght@600&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap",
      },
    ],
  }),
  component: MadiorCard,
});
