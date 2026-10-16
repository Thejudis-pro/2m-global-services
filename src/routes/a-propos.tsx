import { createFileRoute } from "@tanstack/react-router";
import { useAllProducts } from "@/lib/product-store";
import { useStorefrontCategories } from "@/lib/category-store";
import { EXPERIENCE_STAT } from "@/lib/home-content";

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

function AboutPage() {
  const products = useAllProducts();
  const categories = useStorefrontCategories();
  const heroProduct = products.find((p) => p.featured) ?? products[0];

  const stats = [
    EXPERIENCE_STAT,
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
        La qualité à moindre coût, depuis 2021
      </h1>
      <p className="mb-11 max-w-[58ch] text-[19px] leading-[1.75] text-[var(--color-muted-4)]">
        2M Global Services équipe les foyers et les bureaux de Dakar : mobilier, armoires, rangement
        et électroniques, tout en stock et aux meilleurs prix.
      </p>

      {heroProduct && (
        // Fixed-ratio frame: the photo is never stretched and the crop is predictable.
        <div className="mb-12 aspect-[4/3] overflow-hidden rounded-[24px] bg-[var(--color-placeholder)] md:aspect-[16/9]">
          <img
            src={heroProduct.image}
            alt={heroProduct.alt}
            className="h-full w-full object-cover object-[center_40%]"
          />
        </div>
      )}

      <div className="grid grid-cols-2 gap-[14px] md:grid-cols-4">
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
    </main>
  );
}
