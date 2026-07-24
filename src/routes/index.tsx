import { createFileRoute } from "@tanstack/react-router";
import { CATEGORIES } from "@/lib/categories";
import { Button } from "@/components/ui/button";
import { cartStore } from "@/lib/cart-store";

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
        content:
          "Mobilier de bureau et de maison à Dakar, Sénégal. La Qualité à moindre Coût.",
      },
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: Index,
});

function Index() {
  return (
    <>
      <section className="border-b border-border bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
        <div className="mx-auto max-w-7xl px-4 py-16 md:px-6 md:py-24">
          <p className="text-sm font-medium uppercase tracking-widest opacity-80">
            Techno Office Sarl
          </p>
          <h1 className="mt-3 text-4xl font-black leading-tight md:text-6xl">
            La Qualité à moindre Coût
          </h1>
          <p className="mt-5 max-w-2xl text-base opacity-90 md:text-lg">
            Mobilier de bureau et de maison, électroniques et coffres-forts —
            livrés à Dakar et partout au Sénégal.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg" variant="secondary">
              <a href="/produits/meubles-de-bureau">Découvrir nos produits</a>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white/40 bg-transparent text-primary-foreground hover:bg-white/10 hover:text-primary-foreground"
              onClick={() => cartStore.add(1)}
            >
              Tester le panier
            </Button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 md:px-6">
        <h2 className="text-2xl font-bold text-foreground md:text-3xl">Nos catégories</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Une sélection complète pour équiper vos bureaux et votre maison.
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CATEGORIES.map((c) => (
            <a
              key={c.slug}
              href={`/produits/${c.slug}`}
              className="group rounded-xl border border-border bg-card p-6 transition-all hover:-translate-y-0.5 hover:border-primary hover:shadow-md"
            >
              <div className="mb-3 h-1 w-10 rounded-full bg-primary transition-all group-hover:w-16" />
              <h3 className="text-lg font-semibold text-card-foreground">{c.label}</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Voir la sélection →
              </p>
            </a>
          ))}
        </div>
      </section>
    </>
  );
}
