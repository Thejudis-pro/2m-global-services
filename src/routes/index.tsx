import { createFileRoute } from "@tanstack/react-router";
import { useAllCategories } from "@/lib/category-store";
import { BlueprintCard } from "@/components/BlueprintCard";
import { Newsletter } from "@/components/Newsletter";
import { ProductCard } from "@/components/ProductCard";
import { Reveal } from "@/components/Reveal";
import { useAllProducts } from "@/lib/product-store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Accueil — Techno Office | Mobilier de bureau à Dakar" },
      {
        name: "description",
        content:
          "Techno Office à Dakar : mobilier de bureau, fauteuils, armoires, électroniques et coffres-forts. La Qualité à moindre Coût.",
      },
      { property: "og:title", content: "Accueil — Techno Office | Mobilier de bureau à Dakar" },
      {
        property: "og:description",
        content:
          "Techno Office à Dakar : mobilier de bureau, fauteuils, armoires, électroniques et coffres-forts. La Qualité à moindre Coût.",
      },
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: Index,
});

const STATS = [
  { value: "15", label: "Années d'expérience" },
  { value: "228", label: "Produits en catalogue" },
  { value: "3 200+", label: "Clients satisfaits" },
  { value: "6", label: "Catégories de produits" },
];

function Index() {
  const featuredProducts = useAllProducts().filter((p) => p.featured).slice(0, 4);
  const categories = useAllCategories();

  return (
    <div className="mx-auto max-w-[1280px]">
      {/* Hero */}
      <section className="px-[13.6px] pb-[20.4px] pt-[27.2px]">
        <span className="kicker mb-[6.8px]">Mobilier de bureau &amp; maison — Dakar</span>
        <hr className="rule-hr mb-[13.6px]" />
        <h1 className="max-w-[760px]">L'exigence du mobilier fait catalogue</h1>
        <p className="mt-[10.2px] max-w-[560px] text-[16px] leading-[1.6] text-[color:var(--muted-foreground)]">
          Quinze années à équiper les bureaux et foyers de Dakar — bureaux de direction, sièges,
          rangements, électroniques et coffres-forts, choisis pour leur tenue dans le temps.
        </p>
        <a
          href="/produits"
          className="mt-[13.6px] inline-flex items-center gap-1.5 border border-primary bg-primary px-[12.24px] py-[6.8px] font-display text-[14px] font-semibold text-primary-foreground hover:bg-[color:var(--color-steel-600)]"
        >
          Explorer le catalogue
        </a>
      </section>

      {/* Stats — blueprint fiche */}
      <section className="px-[13.6px] pb-[27.2px]">
        <BlueprintCard className="p-0">
          <div className="flex items-center border-b border-[color:var(--divider)]">
            <span className="flex-1 px-[13.6px] py-[10.2px] font-sans text-[13px] font-semibold uppercase tracking-[0.08em]">
              Techno Office — Fiche d'exploitation
            </span>
            <span className="border-l border-[color:var(--divider)] px-[13.6px] py-[10.2px] font-sans text-[13px] font-semibold uppercase tracking-[0.08em] opacity-70 whitespace-nowrap">
              Feuille 01
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4">
            {STATS.map((s, i) => (
              <div
                key={s.label}
                className={`p-[13.6px] ${i > 0 ? "md:border-l md:border-[color:var(--divider)]" : ""} ${
                  i % 2 === 1 ? "border-l border-[color:var(--divider)] md:border-l" : ""
                } ${i >= 2 ? "border-t border-[color:var(--divider)] md:border-t-0" : ""}`}
              >
                <div className="font-display text-[32px] font-semibold leading-none tracking-[0.02em] normal-case">
                  {s.value}
                </div>
                <div className="mt-[3.4px] text-[12px] uppercase tracking-[0.04em] text-[color:var(--muted-foreground)]">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </BlueprintCard>
      </section>

      {/* Latest offers */}
      <Reveal>
        <section className="px-[13.6px] pb-[27.2px]">
          <span className="kicker">02 · En ce moment</span>
          <hr className="rule-hr my-[13.6px]" />
          <h2 className="m-0">Nos dernières offres</h2>
          <div className="mt-[20.4px] grid grid-cols-1 gap-[17px] sm:grid-cols-2 lg:grid-cols-4">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      </Reveal>

      {/* Promo band */}
      <Reveal>
        <section className="mx-[13.6px] mb-[27.2px] flex flex-wrap items-center justify-between gap-[20.4px] bg-[color:var(--color-steel-800)] px-[27.2px] py-[27.2px] text-primary-foreground">
          <div>
            <h2 className="m-0 text-[28px]">Économisez jusqu'à 70%</h2>
            <p className="mt-[6.8px] max-w-[520px] text-[14px] opacity-90">
              Profitez de nos remises sur le mobilier de bureau, les électroniques et plus, tant
              que les stocks durent.
            </p>
          </div>
          <a
            href="/produits"
            className="inline-flex items-center border border-primary-foreground/30 px-[12.24px] py-[6.8px] font-display text-[14px] font-semibold uppercase tracking-[0.02em] text-primary-foreground hover:bg-primary-foreground/10"
          >
            Voir les promotions
          </a>
        </section>
      </Reveal>

      {/* Categories */}
      <Reveal>
        <section className="px-[13.6px] pb-[27.2px]">
          <span className="kicker">03 · Le catalogue</span>
          <hr className="rule-hr my-[13.6px]" />
          <h2 className="m-0">Nos catégories</h2>
          <div className="mt-[20.4px] grid grid-cols-1 gap-[17px] sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((c) => (
              <BlueprintCard key={c.slug} className="flex flex-col p-[13.6px]">
                <a
                  href={`/produits?category=${c.slug}`}
                  className="-mx-[13.6px] -mt-[13.6px] mb-[10.2px] block aspect-[2.4/1] stripe-placeholder"
                  aria-label={c.label}
                />
                <div className="font-display text-[17px] font-semibold leading-tight normal-case tracking-normal">
                  {c.label}
                </div>
                <a
                  href={`/produits?category=${c.slug}`}
                  className="mt-[3.4px] inline-flex font-display text-[14px] font-semibold text-primary hover:underline"
                >
                  Voir la sélection →
                </a>
              </BlueprintCard>
            ))}
          </div>
        </section>
      </Reveal>

      <hr className="rule-hr mx-[13.6px]" />

      {/* Newsletter inline */}
      <section className="flex flex-wrap items-center justify-between gap-[13.6px] px-[13.6px] py-[20.4px]">
        <div>
          <div className="font-display text-[16px] font-semibold uppercase tracking-[0.02em]">
            Ne manquez aucune offre
          </div>
          <div className="mt-[3.4px] text-[13px] text-[color:var(--muted-foreground)]">
            Recevez nos nouveautés et promotions par e-mail.
          </div>
        </div>
        <Newsletter compact />
      </section>
    </div>
  );
}
