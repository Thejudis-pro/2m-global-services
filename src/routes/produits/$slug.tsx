import { useEffect, useMemo, useState } from "react";
import { createFileRoute, notFound } from "@tanstack/react-router";
import { toast } from "sonner";
import { z } from "zod";
import { Loader2, Star } from "lucide-react";
import { CATEGORIES, CONTACT } from "@/lib/categories";
import { getSalePrice } from "@/lib/products";
import { productStore, useAllProducts } from "@/lib/product-store";
import { getProductDetails } from "@/lib/product-details";
import { getReviewSummary, reviewsStore, useApprovedReviews } from "@/lib/reviews-store";
import { formatCFA } from "@/lib/format";
import { cartStore } from "@/lib/cart-store";
import { ProductCard } from "@/components/ProductCard";
import { ProductImagePlaceholder } from "@/components/ProductImagePlaceholder";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

const MIN_QTY = 1;
const MAX_QTY = 10;

export const Route = createFileRoute("/produits/$slug")({
  loader: ({ params }) => {
    const product = productStore.getAll().find((p) => p.id === params.slug);
    if (!product) throw notFound();
    return { product };
  },
  head: ({ loaderData }) => {
    const product = loaderData?.product;
    if (!product) return {};
    const categoryLabel = CATEGORIES.find((c) => c.slug === product.categorySlug)?.label ?? "";
    const salePrice = getSalePrice(product);
    return {
      meta: [
        { title: `${product.name} — ${categoryLabel} | 2M Global Services` },
        {
          name: "description",
          content: `${product.name} : ${categoryLabel.toLowerCase()} au meilleur prix chez 2M Global Services à Dakar, à partir de ${formatCFA(salePrice)}. Livraison à Dakar et partout au Sénégal.`,
        },
        { property: "og:title", content: product.name },
        {
          property: "og:description",
          content: `${categoryLabel} — ${product.name} disponible chez 2M Global Services.`,
        },
        { property: "og:url", content: `/produits/${product.id}` },
      ],
      links: [{ rel: "canonical", href: `/produits/${product.id}` }],
    };
  },
  component: ProductDetailPage,
});

const reviewSchema = z.object({
  name: z.string().trim().min(2, "Le nom doit contenir au moins 2 caractères."),
  email: z.string().trim().email("Adresse e-mail invalide."),
  comment: z.string().trim().min(10, "Le commentaire doit contenir au moins 10 caractères."),
});

function StarRating({ value, outOf = 5 }: { value: number; outOf?: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-hidden="true">
      {Array.from({ length: outOf }).map((_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${i < Math.round(value) ? "fill-primary text-primary" : "text-muted-foreground"}`}
        />
      ))}
    </div>
  );
}

function Gallery({
  images,
  categorySlug,
  discountPercent,
}: {
  images: { src: string | null; alt: string }[];
  categorySlug: string;
  discountPercent: number;
}) {
  const [selected, setSelected] = useState(0);
  const current = images[selected];

  return (
    <div>
      <Dialog>
        <DialogTrigger asChild>
          <button
            type="button"
            aria-label={`Agrandir l'image : ${current.alt}`}
            className="relative block w-full overflow-hidden rounded-[22px] bg-[var(--color-placeholder)]"
            style={{ touchAction: "pinch-zoom" }}
          >
            {current.src ? (
              <img
                src={current.src}
                alt={current.alt}
                className="h-[min(62vh,500px)] w-full object-cover"
              />
            ) : (
              <ProductImagePlaceholder
                categorySlug={categorySlug}
                alt={current.alt}
                variant={selected}
                className="h-[min(62vh,500px)] w-full"
              />
            )}
            {discountPercent > 0 && (
              <span className="tag-accent absolute left-4 top-4">-{discountPercent}%</span>
            )}
          </button>
        </DialogTrigger>
        <DialogContent className="max-w-3xl border-none bg-transparent p-0 shadow-none">
          {current.src ? (
            <img
              src={current.src}
              alt={current.alt}
              className="h-auto max-h-[85vh] w-full rounded-lg object-contain"
              style={{ touchAction: "pinch-zoom" }}
            />
          ) : (
            <ProductImagePlaceholder
              categorySlug={categorySlug}
              alt={current.alt}
              variant={selected}
              className="aspect-square w-full rounded-lg"
            />
          )}
        </DialogContent>
      </Dialog>
      <div className="mt-3 grid grid-cols-4 gap-[10px]">
        {images.map((img, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setSelected(i)}
            aria-label={`Voir : ${img.alt}`}
            aria-current={i === selected}
            className={`overflow-hidden rounded-xl border bg-[var(--color-placeholder)] ${
              i === selected ? "border-accent" : "border-border"
            }`}
          >
            {img.src ? (
              <img src={img.src} alt={img.alt} className="h-[84px] w-full object-cover" />
            ) : (
              <ProductImagePlaceholder
                categorySlug={categorySlug}
                alt={img.alt}
                variant={i}
                className="h-[84px] w-full"
              />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

function ProductDetailPage() {
  const { product } = Route.useLoaderData();
  const details = useMemo(() => getProductDetails(product), [product]);
  const categoryLabel = CATEGORIES.find((c) => c.slug === product.categorySlug)?.label ?? "";
  const subcategoryLabel = CATEGORIES.find(
    (c) => c.slug === product.categorySlug,
  )?.subcategories?.find((s) => s.slug === product.subcategorySlug)?.label;
  const salePrice = getSalePrice(product);

  const [quantity, setQuantity] = useState(1);
  const [quantityError, setQuantityError] = useState("");
  const [adding, setAdding] = useState(false);
  const reviews = useApprovedReviews(product.id);
  const [reviewName, setReviewName] = useState("");
  const [reviewEmail, setReviewEmail] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewErrors, setReviewErrors] = useState<Record<string, string>>({});
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  useEffect(() => {
    setQuantity(1);
    setQuantityError("");
    setReviewSubmitted(false);
  }, [product.id]);

  const { average, count } = getReviewSummary(reviews);

  const allProducts = useAllProducts();
  const similarProducts = allProducts
    .filter((p) => p.categorySlug === product.categorySlug && p.id !== product.id)
    .slice(0, 8);

  function updateQuantity(next: number) {
    if (Number.isNaN(next)) {
      setQuantityError("Veuillez entrer un nombre valide.");
      return;
    }
    if (next < MIN_QTY) {
      setQuantity(MIN_QTY);
      setQuantityError(`Quantité minimale : ${MIN_QTY}.`);
      return;
    }
    if (next > MAX_QTY) {
      setQuantity(MAX_QTY);
      setQuantityError(`Quantité maximale : ${MAX_QTY}.`);
      return;
    }
    setQuantity(next);
    setQuantityError("");
  }

  function handleAddToCart() {
    if (!details.inStock || adding) return;
    setAdding(true);
    window.setTimeout(() => {
      cartStore.add(product.id, quantity);
      setAdding(false);
      toast.success(`${product.name} ajouté au panier`, {
        description: `Quantité : ${quantity} — ${formatCFA(salePrice * quantity)}`,
      });
    }, 500);
  }

  function handleReviewSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = reviewSchema.safeParse({
      name: reviewName,
      email: reviewEmail,
      comment: reviewComment,
    });
    if (!parsed.success) {
      const errors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        errors[String(issue.path[0])] = issue.message;
      }
      setReviewErrors(errors);
      return;
    }
    setReviewErrors({});
    reviewsStore.submit(product.id, {
      name: parsed.data.name,
      rating: reviewRating,
      comment: parsed.data.comment,
    });
    setReviewName("");
    setReviewEmail("");
    setReviewRating(5);
    setReviewComment("");
    setReviewSubmitted(true);
    toast.success("Merci pour votre avis ! Il sera visible après validation.");
  }

  const jsonLd = {
    "@context": "https://schema.org/",
    "@type": "Product",
    name: product.name,
    image: details.images.map((img) => img.src).filter((src): src is string => src !== null),
    description: details.description,
    sku: details.sku,
    category: categoryLabel,
    offers: {
      "@type": "Offer",
      priceCurrency: "XOF",
      price: salePrice,
      availability: details.inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      url: `/produits/${product.id}`,
    },
    ...(count > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: average.toFixed(1),
            reviewCount: count,
          },
        }
      : {}),
  };

  const savings = product.originalPrice - salePrice;

  return (
    <main className="mx-auto max-w-[1320px] px-[18px] pb-[72px] pt-[30px] md:px-[28px]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <nav
        aria-label="Fil d'Ariane"
        className="mb-[22px] text-[11px] uppercase tracking-[0.2em] text-muted-foreground"
      >
        <a href="/" className="hover:text-accent">
          Accueil
        </a>{" "}
        —{" "}
        <a href="/produits" className="hover:text-accent">
          Catalogue
        </a>{" "}
        — {categoryLabel}
      </nav>

      <div className="grid items-start gap-11 lg:grid-cols-2">
        <Gallery
          images={details.images}
          categorySlug={product.categorySlug}
          discountPercent={product.discountPercent}
        />

        <div className="lg:sticky lg:top-[120px]">
          <div className="mb-[14px] text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
            {categoryLabel}
            {subcategoryLabel ? ` · ${subcategoryLabel}` : ""} · Réf. {details.sku}
          </div>

          <h1 className="mb-5 text-[26px] leading-[1.03] md:text-[42px]">{product.name}</h1>

          <div className="mb-3 flex flex-wrap items-baseline gap-[14px]">
            {product.originalPrice === 0 ? (
              <span className="font-display text-[28px] font-black text-primary">
                Bientôt disponible
              </span>
            ) : (
              <>
                <span className="font-display text-[34px] font-black text-primary">
                  {formatCFA(salePrice)}
                </span>
                {product.discountPercent > 0 && (
                  <span className="text-[17px] text-muted-foreground line-through">
                    {formatCFA(product.originalPrice)}
                  </span>
                )}
              </>
            )}
          </div>

          {product.discountPercent > 0 && (
            <div className="mb-6 inline-block rounded-full border border-accent px-[13px] py-[6px] font-display text-[11px] font-bold uppercase tracking-[0.14em] text-accent">
              Vous économisez {formatCFA(savings)}
            </div>
          )}

          <p className="mb-7 max-w-[48ch] text-[16px] leading-[1.8] text-[var(--color-muted-4)]">
            {details.description}
          </p>

          <div className="mb-3 flex items-center gap-2">
            {details.inStock ? (
              <span className="inline-flex items-center gap-1.5 text-sm font-medium text-primary">
                <span className="h-2 w-2 rounded-full bg-primary" aria-hidden="true" />
                En stock — showroom Dakar
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-sm font-medium text-destructive">
                <span className="h-2 w-2 rounded-full bg-destructive" aria-hidden="true" />
                Rupture de stock
              </span>
            )}
          </div>

          {product.originalPrice > 0 && (
            <>
              <div className="mb-3 flex flex-wrap gap-3">
                <div
                  className="flex items-center rounded-full border-[1.5px] border-[var(--color-ink)]"
                  role="group"
                  aria-labelledby="quantity-label"
                >
                  <span id="quantity-label" className="sr-only">
                    Quantité
                  </span>
                  <button
                    type="button"
                    onClick={() => updateQuantity(quantity - 1)}
                    aria-label="Diminuer la quantité"
                    className="px-[19px] py-[14px] text-[17px] font-medium"
                  >
                    −
                  </button>
                  <span className="min-w-[34px] px-1 py-[14px] text-center font-display font-extrabold">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => updateQuantity(quantity + 1)}
                    aria-label="Augmenter la quantité"
                    className="px-[19px] py-[14px] text-[17px] font-medium"
                  >
                    +
                  </button>
                </div>
                <button
                  type="button"
                  disabled={!details.inStock || adding}
                  onClick={handleAddToCart}
                  className="flex-1 min-w-[210px] rounded-full bg-[var(--color-ink)] px-[26px] py-[17px] text-center font-display text-[13px] font-extrabold uppercase tracking-[0.14em] text-primary-foreground transition-colors hover:bg-primary disabled:opacity-45"
                >
                  {adding ? (
                    <span className="inline-flex items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                      Ajout...
                    </span>
                  ) : (
                    "Ajouter au panier"
                  )}
                </button>
              </div>
              <p
                id="quantity-error"
                role={quantityError ? "alert" : undefined}
                className="mb-2 min-h-[1rem] text-xs text-destructive"
              >
                {quantityError}
              </p>
            </>
          )}

          <a
            href={CONTACT.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="mb-8 block rounded-full border-[1.5px] border-primary py-4 text-center font-display text-[13px] font-extrabold uppercase tracking-[0.14em] text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
          >
            Commander sur WhatsApp
          </a>

          <div className="border-t border-border text-[15px]">
            <div className="flex justify-between border-b border-border py-[15px]">
              <span className="text-muted-foreground">Dimensions</span>
              <span className="font-medium">
                {details.dimensions.height} × {details.dimensions.width} ×{" "}
                {details.dimensions.depth} cm
              </span>
            </div>
            <div className="flex justify-between border-b border-border py-[15px]">
              <span className="text-muted-foreground">Poids</span>
              <span className="font-medium">{details.weightKg} kg</span>
            </div>
            <div className="flex justify-between border-b border-border py-[15px]">
              <span className="text-muted-foreground">Disponibilité</span>
              <span className="font-medium text-primary">
                {details.inStock ? "En stock — showroom Dakar" : "Rupture de stock"}
              </span>
            </div>
            <div className="flex justify-between py-[15px]">
              <span className="text-muted-foreground">Livraison</span>
              <span className="font-medium">24–48h</span>
            </div>
          </div>
        </div>
      </div>

      {similarProducts.length > 0 && (
        <section className="mt-16">
          <h2 className="m-0 mb-[22px] border-b border-border pb-4 text-[26px]">
            Souvent achetés ensemble
          </h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {similarProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      <section className="mt-16 max-w-2xl">
        <h2 className="m-0 mb-[22px] border-b border-border pb-4 text-[22px]">Avis ({count})</h2>
        {count > 0 ? (
          <div className="mb-6 flex items-center gap-3">
            <StarRating value={average} />
            <p className="text-sm text-muted-foreground">
              {average.toFixed(1)} / 5 — {count} avis
            </p>
          </div>
        ) : (
          <p className="mb-6 text-sm text-muted-foreground">
            Aucun avis pour le moment — soyez le premier à donner votre avis.
          </p>
        )}

        {reviews.length > 0 && (
          <ul className="mb-8 space-y-4">
            {reviews.map((review) => (
              <li key={review.id} className="rounded-2xl border border-border p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-foreground">{review.name}</p>
                  <p className="text-xs text-muted-foreground">{review.date}</p>
                </div>
                <StarRating value={review.rating} />
                <p className="mt-2 text-sm text-muted-foreground">{review.comment}</p>
              </li>
            ))}
          </ul>
        )}

        <form
          onSubmit={handleReviewSubmit}
          noValidate
          className="space-y-4 rounded-2xl border border-border bg-[var(--color-cream-light)] p-5"
        >
          <h3 className="text-sm font-bold text-foreground">Laisser un avis</h3>
          {reviewSubmitted && (
            <p role="status" className="text-sm text-primary">
              Merci ! Votre avis a été soumis et sera visible après validation.
            </p>
          )}
          <div>
            <Label htmlFor="review-name">Nom</Label>
            <Input
              id="review-name"
              value={reviewName}
              onChange={(e) => setReviewName(e.target.value)}
              aria-invalid={Boolean(reviewErrors.name)}
              aria-describedby="review-name-error"
            />
            <p
              id="review-name-error"
              role="alert"
              className="mt-1 min-h-[1rem] text-xs text-destructive"
            >
              {reviewErrors.name}
            </p>
          </div>
          <div>
            <Label htmlFor="review-email">E-mail</Label>
            <Input
              id="review-email"
              type="email"
              value={reviewEmail}
              onChange={(e) => setReviewEmail(e.target.value)}
              aria-invalid={Boolean(reviewErrors.email)}
              aria-describedby="review-email-error"
            />
            <p
              id="review-email-error"
              role="alert"
              className="mt-1 min-h-[1rem] text-xs text-destructive"
            >
              {reviewErrors.email}
            </p>
          </div>
          <div>
            <span className="mb-1 block text-sm font-medium text-foreground">Note</span>
            <div className="flex gap-1" role="radiogroup" aria-label="Note">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  role="radio"
                  aria-checked={reviewRating === value}
                  aria-label={`${value} étoile${value > 1 ? "s" : ""}`}
                  onClick={() => setReviewRating(value)}
                >
                  <Star
                    className={`h-5 w-5 ${
                      value <= reviewRating ? "fill-primary text-primary" : "text-muted-foreground"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>
          <div>
            <Label htmlFor="review-comment">Commentaire</Label>
            <Textarea
              id="review-comment"
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              aria-invalid={Boolean(reviewErrors.comment)}
              aria-describedby="review-comment-error"
            />
            <p
              id="review-comment-error"
              role="alert"
              className="mt-1 min-h-[1rem] text-xs text-destructive"
            >
              {reviewErrors.comment}
            </p>
          </div>
          <Button type="submit" className="rounded-full">
            Envoyer mon avis
          </Button>
        </form>
      </section>
    </main>
  );
}
