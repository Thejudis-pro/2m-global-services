import { createFileRoute } from "@tanstack/react-router";
import { useAllProducts } from "@/lib/product-store";
import { useAllCategories } from "@/lib/category-store";

export const Route = createFileRoute("/a-propos")({
  head: () => ({
    meta: [
      { title: "À propos | 2M Global Services" },
      {
        name: "description",
        content:
          "Découvrez 2M Global Services : notre histoire, notre mission et notre équipe à Dakar, Sénégal.",
      },
    ],
  }),
  component: AboutPage,
});

const VALUES = [
  {
    title: "Import direct",
    text: "Nous achetons à l'usine et stockons dans notre dépôt de Front de Terre. Aucun intermédiaire à payer.",
  },
  {
    title: "Tout est en stock",
    text: "Ce que vous voyez est disponible aujourd'hui, livré et monté sous 24 à 48 heures dans Dakar.",
  },
  {
    title: "On reste joignables",
    text: "Échange sous 7 jours, garantie 2 ans, et un WhatsApp qui répond en moins de 10 minutes.",
  },
];

function AboutPage() {
  const products = useAllProducts();
  const categories = useAllCategories();
  const heroProduct = products.find((p) => p.featured) ?? products[0];

  const stats = [
    { value: "15", label: "Années d'expérience" },
    { value: String(products.length), label: "Références en stock" },
    { value: "3 200+", label: "Clients satisfaits" },
    { value: String(categories.length), label: "Catégories" },
  ];

  return (
    <main className="mx-auto max-w-[1320px] px-[18px] pb-[72px] pt-[56px] md:px-[28px]">
      <div className="mb-[22px] font-display text-[11px] font-bold uppercase tracking-[0.26em] text-accent">
        Qui sommes-nous
      </div>
      <h1 className="mb-6 max-w-[24ch] text-[32px] leading-[1] md:text-[64px]">
        La qualité à moindre coût, depuis 2011
      </h1>
      <p className="mb-11 max-w-[58ch] text-[19px] leading-[1.75] text-[var(--color-muted-4)]">
        2M Global Services équipe les foyers et les bureaux de Dakar. Nous importons en direct, nous
        stockons sur place et nous montons nous-mêmes — c&apos;est tout le secret de nos prix.
      </p>

      {heroProduct && (
        <div className="mb-12 overflow-hidden rounded-[24px] bg-[var(--color-placeholder)]">
          <img
            src={heroProduct.image}
            alt="Showroom 2M Global Services"
            className="h-[min(52vh,460px)] w-full object-cover"
          />
        </div>
      )}

      <div className="mb-14 grid grid-cols-2 gap-[14px] md:grid-cols-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-[18px] border border-border bg-[var(--color-cream-light)] p-6"
          >
            <div className="font-display text-[38px] font-black leading-none tracking-[-0.03em] text-primary">
              {s.value}
            </div>
            <div className="mt-2 text-[14px] text-muted-foreground">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
        {VALUES.map((v) => (
          <div key={v.title}>
            <h3 className="mb-3 text-[19px] tracking-[0.02em]">{v.title}</h3>
            <p className="m-0 text-[15px] leading-[1.8] text-[var(--color-muted-4)]">{v.text}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
