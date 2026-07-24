import { createFileRoute } from "@tanstack/react-router";
import { Clock, LayoutGrid, Package, Users } from "lucide-react";
import { useAllCategories } from "@/lib/category-store";
import { getCategoryIcon } from "@/lib/category-icons";
import { Button } from "@/components/ui/button";
import { Newsletter } from "@/components/Newsletter";
import { ProductCard } from "@/components/ProductCard";
import { Reveal } from "@/components/Reveal";
import { useAllProducts } from "@/lib/product-store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Accueil — Techno Office Sarl | Mobilier de bureau à Dakar" },
      {
        name: "description",
        content:
          "Techno Office Sarl à Dakar : mobilier de bureau, fauteuils, armoires, électroniques et coffres-forts. La Qualité à moindre Coût.",
      },
      { property: "og:title", content: "Accueil — Techno Office Sarl" },
      {
        property: "og:description",
        content: "Mobilier de bureau et de maison à Dakar, Sénégal. La Qualité à moindre Coût.",
      },
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: Index,
});

const STATS = [
  { value: "15", label: "Années d'expérience", icon: Clock },
  { value: "228", label: "Produits en catalogue", icon: Package },
  { value: "3 200+", label: "Clients satisfaits", icon: Users },
  { value: "6", label: "Catégories de produits", icon: LayoutGrid },
];

function Index() {
  const featuredProducts = useAllProducts().filter((p) => p.featured);
  const categories = useAllCategories();

  return (
    <>
      <section className="relative h-[480px] w-full overflow-hidden border-b border-border bg-primary md:h-[600px]">
        {/* Decorative composition standing in for real lifestyle photography —
            swap for a photo of the Dakar showroom once one is available. */}
        <div
          role="img"
          aria-label="Espace de bureau moderne aménagé avec du mobilier Techno Office Sarl à Dakar"
          className="absolute inset-0"
        >
          <svg
            className="absolute inset-0 h-full w-full text-accent opacity-[0.14]"
            preserveAspectRatio="xMidYMid slice"
            aria-hidden="true"
          >
            <defs>
              <pattern
                id="herringbone"
                width="44"
                height="44"
                patternUnits="userSpaceOnUse"
                patternTransform="rotate(45)"
              >
                <rect width="20" height="8" x="0" y="0" fill="currentColor" />
                <rect width="20" height="8" x="22" y="22" fill="currentColor" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#herringbone)" />
          </svg>
          <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/85 to-primary/55" />
          <div className="absolute -right-32 -top-32 h-[26rem] w-[26rem] rounded-full bg-accent/25 blur-3xl" />
          <div className="absolute -bottom-40 left-1/3 h-80 w-80 rounded-full bg-accent/10 blur-3xl" />
        </div>
        <div className="relative mx-auto flex h-full max-w-7xl flex-col items-start justify-center px-4 md:px-6">
          <h1 className="text-4xl font-black leading-tight text-primary-foreground md:text-6xl">
            Techno Office Sarl
          </h1>
          <p className="mt-3 max-w-xl text-lg text-primary-foreground/90 md:text-2xl">
            La Qualité à moindre Coût
          </p>
          <Button
            asChild
            size="lg"
            className="mt-8 bg-accent text-accent-foreground hover:bg-accent/90"
          >
            <a href="/produits">Explorer Maintenant</a>
          </Button>
        </div>
      </section>

      <Reveal>
        <section className="border-b border-border bg-secondary/40 py-14">
          <div className="mx-auto grid max-w-7xl grid-cols-2 gap-4 px-4 md:grid-cols-4 md:gap-6 md:px-6">
            {STATS.map((stat) => (
              <div
                key={stat.label}
                className="flex flex-col items-center gap-3 rounded-xl border border-border bg-card p-6 text-center shadow-[var(--shadow-warm-sm)]"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/20 text-accent-foreground">
                  <stat.icon className="h-6 w-6 text-primary" aria-hidden="true" />
                </span>
                <p className="text-3xl font-black text-primary md:text-4xl">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>
      </Reveal>

      <Reveal>
        <section className="mx-auto max-w-7xl px-4 py-14 md:px-6">
          <h2 className="text-2xl font-bold text-foreground md:text-3xl">
            Consultez les dernières mises à jour
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Des promotions sur une sélection de nos produits phares.
          </p>
          <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      </Reveal>

      <Reveal>
        <section className="relative overflow-hidden border-y border-border bg-primary py-14 text-primary-foreground">
          <div
            className="absolute -left-24 top-1/2 h-72 w-72 -translate-y-1/2 rounded-full bg-accent/20 blur-3xl"
            aria-hidden="true"
          />
          <div className="relative mx-auto flex max-w-7xl flex-col items-center gap-4 px-4 text-center md:px-6">
            <h2 className="text-3xl font-black md:text-4xl">Économisez jusqu'à 70%</h2>
            <p className="max-w-xl text-sm opacity-90 md:text-base">
              Profitez de nos remises exceptionnelles sur le mobilier de bureau, les électroniques
              et bien plus encore, tant que les stocks durent.
            </p>
            <Button
              asChild
              size="lg"
              className="mt-2 bg-accent text-accent-foreground hover:bg-accent/90"
            >
              <a href="/produits">Voir les promotions</a>
            </Button>
          </div>
        </section>
      </Reveal>

      <Reveal>
        <section className="mx-auto max-w-7xl px-4 py-14 md:px-6">
          <h2 className="text-2xl font-bold text-foreground md:text-3xl">Nos catégories</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Une sélection complète pour équiper vos bureaux et votre maison.
          </p>
          <div className="mt-8 grid gap-4 lg:grid-cols-4">
            {categories.map((c, index) => {
              const Icon = getCategoryIcon(c.slug);
              const featured = index % 3 === 0;
              return (
                <a
                  key={c.slug}
                  href={`/produits?category=${c.slug}`}
                  className={`group flex min-h-[180px] flex-col justify-between rounded-xl border border-border bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:border-accent hover:shadow-[var(--shadow-warm)] ${
                    featured ? "lg:col-span-2" : "lg:col-span-1"
                  }`}
                >
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/20 transition-colors group-hover:bg-accent/30">
                    <Icon className="h-6 w-6 text-primary" aria-hidden="true" />
                  </span>
                  <div>
                    <h3 className="text-lg font-semibold text-card-foreground">{c.label}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">Voir la sélection →</p>
                  </div>
                </a>
              );
            })}
          </div>
        </section>
      </Reveal>

      <Reveal>
        <section className="border-t border-border bg-secondary/40 py-14">
          <div className="mx-auto max-w-xl px-4 text-center md:px-6">
            <h2 className="text-2xl font-bold text-foreground md:text-3xl">
              Ne manquez aucune offre
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Inscrivez-vous pour recevoir nos nouveautés et promotions par e-mail.
            </p>
            <div className="mt-6 text-left">
              <Newsletter />
            </div>
          </div>
        </section>
      </Reveal>
    </>
  );
}
