import { createFileRoute } from "@tanstack/react-router";
import { useAllCategories } from "@/lib/category-store";
import { Button } from "@/components/ui/button";
import { Newsletter } from "@/components/Newsletter";
import { ProductCard } from "@/components/ProductCard";
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
  { value: "15", label: "Années d'expérience" },
  { value: "228", label: "Produits en catalogue" },
  { value: "3 200+", label: "Clients satisfaits" },
  { value: "6", label: "Catégories de produits" },
];

function Index() {
  const featuredProducts = useAllProducts().filter((p) => p.featured);
  const categories = useAllCategories();

  return (
    <>
      <section className="relative h-[420px] w-full overflow-hidden border-b border-border md:h-[560px]">
        <img
          src="https://placehold.co/1920x800/1c3a5e/ffffff?text=Techno+Office+Sarl"
          alt="Espace de bureau moderne aménagé avec du mobilier Techno Office Sarl à Dakar"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/20" />
        <div className="relative mx-auto flex h-full max-w-7xl flex-col items-start justify-center px-4 md:px-6">
          <h1 className="text-4xl font-black leading-tight text-white md:text-6xl">
            Techno Office Sarl
          </h1>
          <p className="mt-3 max-w-xl text-lg text-white/90 md:text-2xl">
            La Qualité à moindre Coût
          </p>
          <Button asChild size="lg" className="mt-8">
            <a href="/produits">Explorer Maintenant</a>
          </Button>
        </div>
      </section>

      <section className="border-b border-border bg-secondary/30 py-12">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 text-center md:grid-cols-4 md:px-6">
          {STATS.map((stat) => (
            <div key={stat.label}>
              <p className="text-3xl font-black text-primary md:text-4xl">{stat.value}</p>
              <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

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

      <section className="border-y border-border bg-primary py-14 text-primary-foreground">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-4 text-center md:px-6">
          <h2 className="text-3xl font-black md:text-4xl">Économisez jusqu'à 70%</h2>
          <p className="max-w-xl text-sm opacity-90 md:text-base">
            Profitez de nos remises exceptionnelles sur le mobilier de bureau, les électroniques et
            bien plus encore, tant que les stocks durent.
          </p>
          <Button asChild size="lg" variant="secondary" className="mt-2">
            <a href="/produits">Voir les promotions</a>
          </Button>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 md:px-6">
        <h2 className="text-2xl font-bold text-foreground md:text-3xl">Nos catégories</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Une sélection complète pour équiper vos bureaux et votre maison.
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((c) => (
            <a
              key={c.slug}
              href={`/produits?category=${c.slug}`}
              className="group rounded-xl border border-border bg-card p-6 transition-all hover:-translate-y-0.5 hover:border-primary hover:shadow-md"
            >
              <div className="mb-3 h-1 w-10 rounded-full bg-primary transition-all group-hover:w-16" />
              <h3 className="text-lg font-semibold text-card-foreground">{c.label}</h3>
              <p className="mt-1 text-sm text-muted-foreground">Voir la sélection →</p>
            </a>
          ))}
        </div>
      </section>

      <section className="border-t border-border bg-secondary/30 py-14">
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
    </>
  );
}
