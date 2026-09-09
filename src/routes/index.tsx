import { createFileRoute } from "@tanstack/react-router";
import { useAllCategories } from "@/lib/category-store";
import { Newsletter } from "@/components/Newsletter";
import { ProductCard } from "@/components/ProductCard";
import { useAllProducts } from "@/lib/product-store";
import { getSalePrice } from "@/lib/products";
import { formatCFA } from "@/lib/format";
import { CONTACT } from "@/lib/categories";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Accueil — 2M Global Services | Mobilier de bureau à Dakar" },
      {
        name: "description",
        content:
          "2M Global Services à Dakar : mobilier de bureau, fauteuils, armoires, électroniques et coffres-forts. La Qualité à moindre Coût.",
      },
      {
        property: "og:title",
        content: "Accueil — 2M Global Services | Mobilier de bureau à Dakar",
      },
      {
        property: "og:description",
        content:
          "2M Global Services à Dakar : mobilier de bureau, fauteuils, armoires, électroniques et coffres-forts. La Qualité à moindre Coût.",
      },
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: Index,
});

const FEATURES = [
  { title: "Livraison 24h", detail: "Partout dans Dakar" },
  { title: "Payez à la réception", detail: "Wave, Orange Money, espèces" },
  { title: "Échange 7 jours", detail: "Sans justification" },
  { title: "Montage inclus", detail: "Par nos équipes" },
];

function Index() {
  const allProducts = useAllProducts();
  const categories = useAllCategories().filter((c) =>
    allProducts.some((p) => p.categorySlug === c.slug),
  );
  const featuredProducts = allProducts.filter((p) => p.featured);

  const total = allProducts.length;
  const maxDiscount = Math.max(0, ...allProducts.map((p) => p.discountPercent));

  const deals = allProducts
    .filter((p) => p.discountPercent > 0 && p.originalPrice > 0)
    .sort((a, b) => b.discountPercent - a.discountPercent)
    .slice(0, 8);

  const heroProduct = featuredProducts[3] ?? featuredProducts[0] ?? allProducts[0];

  const armoires = allProducts.filter((p) => p.categorySlug === "armoires" && p.originalPrice > 0);
  const minArmoirePrice = armoires.length
    ? Math.min(...armoires.map((p) => getSalePrice(p)))
    : undefined;

  return (
    <main className="mx-auto max-w-[1320px] px-[18px] pb-[72px] pt-[22px] md:px-[28px]">
      {/* Hero */}
      <section className="mb-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="relative min-h-[400px] overflow-hidden rounded-[20px] bg-[var(--color-ink)] lg:col-span-2">
          {heroProduct && (
            <img
              src={heroProduct.image}
              alt={heroProduct.alt}
              className="absolute inset-0 h-full w-full object-cover opacity-55"
            />
          )}
          <div className="relative max-w-[580px] p-[26px] text-primary-foreground md:p-[48px]">
            <div className="mb-[22px] inline-flex items-center whitespace-nowrap rounded-full border border-[var(--color-gold-light)] px-[15px] py-2 font-display text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--color-gold-light)]">
              Déstockage showroom
            </div>
            <h1 className="mb-[18px] text-[34px] leading-[0.96] md:text-[64px]">
              Jusqu&apos;à <span className="text-[var(--color-gold-light)]">−{maxDiscount}%</span>
              <br />
              sur le mobilier
            </h1>
            <p className="mb-[28px] max-w-[42ch] text-[17px] leading-[1.7] text-primary-foreground/90">
              {total} références en stock à Dakar — bureaux, sièges, armoires, électroniques et
              coffres-forts. Livrées et montées chez vous en 24h.
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                href="/produits"
                className="whitespace-nowrap rounded-full bg-background px-[28px] py-[16px] font-display text-[13px] font-extrabold uppercase tracking-[0.12em] text-[var(--color-ink)] transition-colors hover:bg-[var(--color-gold-light)]"
              >
                Voir les offres
              </a>
              <a
                href={CONTACT.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="whitespace-nowrap rounded-full border border-primary-foreground/55 px-[28px] py-[16px] font-display text-[13px] font-bold uppercase tracking-[0.12em] text-primary-foreground transition-colors hover:bg-primary-foreground/14"
              >
                Commander sur WhatsApp
              </a>
            </div>
          </div>
        </div>

        <div className="grid gap-4">
          <a
            href="/produits?category=electroniques"
            className="flex min-h-[190px] flex-col justify-between rounded-[20px] bg-primary p-[26px] text-primary-foreground"
          >
            <div>
              <div className="mb-3 font-display text-[10px] font-bold uppercase tracking-[0.24em] text-[var(--color-gold-light)]">
                Nouvel arrivage
              </div>
              <div className="font-display text-[26px] font-black leading-[1.05]">
                Électroniques
                <br />
                &amp; smartphones
              </div>
            </div>
            <div className="mt-[18px] font-display text-[12px] font-bold uppercase tracking-[0.14em] text-[var(--color-gold-light)]">
              Découvrir →
            </div>
          </a>
          <a
            href="/produits?category=armoires"
            className="flex min-h-[190px] flex-col justify-between rounded-[20px] border border-border bg-[var(--color-cream-alt)] p-[26px]"
          >
            <div>
              <div className="mb-3 font-display text-[10px] font-bold uppercase tracking-[0.24em] text-accent">
                Armoires &amp; rangement
              </div>
              <div className="font-display text-[26px] font-black leading-[1.05]">
                {minArmoirePrice !== undefined ? (
                  <>
                    À partir de
                    <br />
                    {formatCFA(minArmoirePrice)}
                  </>
                ) : (
                  "Voir la sélection"
                )}
              </div>
            </div>
            <div className="mt-[18px] font-display text-[12px] font-bold uppercase tracking-[0.14em] text-primary">
              Voir les modèles →
            </div>
          </a>
        </div>
      </section>

      {/* Feature strip */}
      <section className="mb-11 grid grid-cols-2 gap-3 md:grid-cols-4">
        {FEATURES.map((f) => (
          <div
            key={f.title}
            className="rounded-2xl border border-border bg-[var(--color-cream-light)] p-[18px]"
          >
            <div className="mb-1 font-display text-[14px] font-extrabold uppercase tracking-[0.04em]">
              {f.title}
            </div>
            <div className="text-[14px] text-muted-foreground">{f.detail}</div>
          </div>
        ))}
      </section>

      {/* Deals */}
      {deals.length > 0 && (
        <section className="mb-[52px]">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-5 border-b border-border pb-4">
            <h2 className="m-0 text-[24px] md:text-[38px]">Les affaires du moment</h2>
            <a
              href="/produits"
              className="border-b border-foreground pb-[3px] font-display text-[12px] font-bold uppercase tracking-[0.14em]"
            >
              Les {total} produits
            </a>
          </div>
          <div className="grid grid-cols-1 gap-[18px] sm:grid-cols-2 lg:grid-cols-4">
            {deals.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* Categories */}
      <section className="mb-[52px]">
        <h2 className="m-0 mb-6 border-b border-border pb-4 text-[22px] md:text-[32px]">
          Nos univers
        </h2>
        <div className="grid grid-cols-2 gap-[14px] sm:grid-cols-3 lg:grid-cols-5">
          {categories.map((c) => {
            const productsInCategory = allProducts.filter((p) => p.categorySlug === c.slug);
            const cover = productsInCategory[0];
            return (
              <a
                key={c.slug}
                href={`/produits?category=${c.slug}`}
                className="rounded-[18px] border border-border bg-[var(--color-cream-light)] p-4 transition-all hover:-translate-y-[3px] hover:border-accent"
              >
                <div className="mb-[14px] h-[110px] w-full overflow-hidden rounded-xl bg-[var(--color-placeholder)]">
                  {cover && (
                    <img src={cover.image} alt={c.label} className="h-full w-full object-cover" />
                  )}
                </div>
                <div className="font-display text-[14px] font-extrabold uppercase leading-[1.25] tracking-[0.02em]">
                  {c.label}
                </div>
                <div className="mt-[5px] text-[13px] text-muted-foreground">
                  {productsInCategory.length} produits
                </div>
              </a>
            );
          })}
        </div>
      </section>

      {/* Perfume sibling brand */}
      <section className="mb-[52px] grid grid-cols-1 items-center gap-6 rounded-[24px] border border-[var(--color-gold-light)] bg-[var(--color-cream-light)] p-[26px] md:grid-cols-[1fr_auto] md:p-[40px]">
        <div>
          <div className="mb-3 font-display text-[11px] font-bold uppercase tracking-[0.24em] text-accent">
            Autre boutique du groupe
          </div>
          <h3 className="m-0 mb-2 text-[24px] md:text-[32px]">Découvrez 2M Parfumerie</h3>
          <p className="m-0 max-w-[52ch] text-[15px] text-muted-foreground">
            Parfums et cosmétiques, notre autre boutique à Dakar — sur 2mparfumeriedk.com.
          </p>
        </div>
        <a
          href="https://2mparfumeriedk.com"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block whitespace-nowrap justify-self-start rounded-full bg-primary px-[28px] py-[16px] font-display text-[12px] font-extrabold uppercase tracking-[0.14em] text-primary-foreground transition-colors hover:bg-accent md:justify-self-end"
        >
          Visiter le site →
        </a>
      </section>

      {/* Dark CTA banner */}
      <section className="mb-[52px] grid grid-cols-1 items-center gap-8 rounded-[24px] bg-primary p-[28px] text-primary-foreground md:grid-cols-2 md:p-[52px]">
        <div>
          <div className="mb-4 font-display text-[11px] font-bold uppercase tracking-[0.24em] text-[var(--color-gold-light)]">
            Équipez votre bureau
          </div>
          <h3 className="mb-4 text-[26px] leading-[1.02] md:text-[44px]">
            Devis gratuit dès 5 postes
          </h3>
          <p className="mb-[26px] max-w-[44ch] text-[16px] leading-[1.75] text-primary-foreground/86">
            Bureaux, sièges, armoires et coffres : nous chiffrons tout sous 24 heures et nous
            installons.
          </p>
          <a
            href="/contact"
            className="inline-block rounded-full bg-[var(--color-gold-light)] px-[28px] py-[16px] font-display text-[12px] font-extrabold uppercase tracking-[0.14em] text-[var(--color-ink)] transition-colors hover:bg-background"
          >
            Demander un devis
          </a>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { value: "15", label: "Années à Dakar" },
            { value: String(total), label: "Références" },
            { value: "3 200+", label: "Clients" },
            { value: "48h", label: "Livraison" },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl bg-primary-foreground/10 p-5">
              <div className="font-display text-[28px] font-black text-[var(--color-gold-light)]">
                {s.value}
              </div>
              <div className="text-[13px] text-primary-foreground/80">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Newsletter */}
      <section className="grid grid-cols-1 items-center gap-6 rounded-[24px] border border-border bg-[var(--color-cream-alt)] p-[24px] md:grid-cols-2 md:p-[40px]">
        <div>
          <h3 className="m-0 mb-2 text-[26px]">Ne manquez aucune offre</h3>
          <p className="m-0 text-[16px] text-[var(--color-muted-4)]">
            Nouveautés et promotions, une fois par semaine.
          </p>
        </div>
        <Newsletter />
      </section>
    </main>
  );
}
