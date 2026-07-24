import { useEffect, useMemo, useState } from "react";
import { createFileRoute, notFound } from "@tanstack/react-router";
import { toast } from "sonner";
import { z } from "zod";
import { Loader2, Minus, Plus, ShoppingCart, Star } from "lucide-react";
import { CATEGORIES } from "@/lib/categories";
import { getSalePrice } from "@/lib/products";
import { productStore, useAllProducts } from "@/lib/product-store";
import { getProductDetails } from "@/lib/product-details";
import { getReviewSummary, reviewsStore, useApprovedReviews } from "@/lib/reviews-store";
import { formatCFA } from "@/lib/format";
import { cartStore } from "@/lib/cart-store";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
        { title: `${product.name} — ${categoryLabel} | Techno Office Sarl` },
        {
          name: "description",
          content: `${product.name} : ${categoryLabel.toLowerCase()} au meilleur prix chez Techno Office Sarl à Dakar, à partir de ${formatCFA(salePrice)}. Livraison à Dakar et partout au Sénégal.`,
        },
        { property: "og:title", content: product.name },
        {
          property: "og:description",
          content: `${categoryLabel} — ${product.name} disponible chez Techno Office Sarl.`,
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

function Gallery({ images }: { images: { src: string; alt: string }[] }) {
  const [selected, setSelected] = useState(0);
  const current = images[selected];

  return (
    <div>
      <Dialog>
        <DialogTrigger asChild>
          <button
            type="button"
            aria-label={`Agrandir l'image : ${current.alt}`}
            className="block w-full overflow-hidden rounded-xl border border-border bg-muted"
            style={{ touchAction: "pinch-zoom" }}
          >
            <img
              src={current.src}
              alt={current.alt}
              className="aspect-square w-full object-cover"
            />
          </button>
        </DialogTrigger>
        <DialogContent className="max-w-3xl border-none bg-transparent p-0 shadow-none">
          <img
            src={current.src}
            alt={current.alt}
            className="h-auto max-h-[85vh] w-full rounded-lg object-contain"
            style={{ touchAction: "pinch-zoom" }}
          />
        </DialogContent>
      </Dialog>
      <div className="mt-3 grid grid-cols-3 gap-3">
        {images.map((img, i) => (
          <button
            key={img.src}
            type="button"
            onClick={() => setSelected(i)}
            aria-label={`Voir : ${img.alt}`}
            aria-current={i === selected}
            className={`overflow-hidden rounded-lg border-2 ${
              i === selected ? "border-primary" : "border-transparent"
            }`}
          >
            <img src={img.src} alt={img.alt} className="aspect-square w-full object-cover" />
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
    image: details.images.map((img) => img.src),
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

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <nav aria-label="Fil d'Ariane" className="mb-4 text-sm text-muted-foreground">
        <ol className="flex flex-wrap items-center gap-1">
          <li>
            <a href="/" className="hover:text-primary hover:underline">
              Accueil
            </a>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <a href="/produits" className="hover:text-primary hover:underline">
              Nos Produits
            </a>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <a
              href={`/produits?category=${product.categorySlug}`}
              className="hover:text-primary hover:underline"
            >
              {categoryLabel}
            </a>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="font-medium text-foreground">
            {product.name}
          </li>
        </ol>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2">
        <Gallery images={details.images} />

        <div>
          <div className="mb-2 flex flex-wrap gap-2">
            <Badge variant="secondary">{categoryLabel}</Badge>
            {subcategoryLabel && <Badge variant="outline">{subcategoryLabel}</Badge>}
          </div>

          <h1 className="text-2xl font-bold text-foreground md:text-3xl">{product.name}</h1>

          <div className="mt-3 flex items-center gap-2">
            {details.inStock ? (
              <span className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-600 dark:text-emerald-400">
                <span className="h-2 w-2 rounded-full bg-emerald-500" aria-hidden="true" />
                En stock
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-sm font-medium text-destructive">
                <span className="h-2 w-2 rounded-full bg-destructive" aria-hidden="true" />
                Rupture de stock
              </span>
            )}
          </div>

          <div className="mt-4 flex items-baseline gap-3">
            {product.discountPercent > 0 && (
              <Badge variant="destructive">-{product.discountPercent}%</Badge>
            )}
            {product.discountPercent > 0 && (
              <span className="text-sm text-muted-foreground line-through">
                {formatCFA(product.originalPrice)}
              </span>
            )}
            <span className="text-2xl font-black text-primary">{formatCFA(salePrice)}</span>
          </div>

          <div className="mt-6">
            <span className="mb-2 block text-sm font-medium text-foreground" id="quantity-label">
              Quantité
            </span>
            <div className="flex items-center gap-2" role="group" aria-labelledby="quantity-label">
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => updateQuantity(quantity - 1)}
                aria-label="Diminuer la quantité"
              >
                <Minus className="h-4 w-4" />
              </Button>
              <Input
                type="number"
                inputMode="numeric"
                min={MIN_QTY}
                max={MAX_QTY}
                value={quantity}
                onChange={(e) => updateQuantity(Number(e.target.value))}
                className="w-16 text-center"
                aria-label="Quantité"
                aria-invalid={quantityError !== ""}
                aria-describedby="quantity-error"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => updateQuantity(quantity + 1)}
                aria-label="Augmenter la quantité"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <p
              id="quantity-error"
              role={quantityError ? "alert" : undefined}
              className="mt-1 min-h-[1rem] text-xs text-destructive"
            >
              {quantityError}
            </p>
          </div>

          <Button
            type="button"
            size="lg"
            className="mt-4 w-full sm:w-auto"
            disabled={!details.inStock || adding}
            onClick={handleAddToCart}
          >
            {adding ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                Ajout...
              </>
            ) : (
              <>
                <ShoppingCart className="h-4 w-4" aria-hidden="true" />
                Ajouter au panier
              </>
            )}
          </Button>

          <Table className="mt-8">
            <TableBody>
              <TableRow>
                <TableCell className="font-medium text-foreground">Référence (SKU)</TableCell>
                <TableCell>{details.sku}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium text-foreground">Poids</TableCell>
                <TableCell>{details.weightKg} kg</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium text-foreground">
                  Dimensions (H × L × P)
                </TableCell>
                <TableCell>
                  {details.dimensions.height} × {details.dimensions.width} ×{" "}
                  {details.dimensions.depth} cm
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>

      <Tabs defaultValue="description" className="mt-12">
        <TabsList>
          <TabsTrigger value="description">Description</TabsTrigger>
          <TabsTrigger value="avis">Avis ({count})</TabsTrigger>
          <TabsTrigger value="similaires">Produits similaires</TabsTrigger>
        </TabsList>

        <TabsContent
          value="description"
          className="max-w-3xl py-4 text-sm leading-relaxed text-foreground"
        >
          <p>{details.description}</p>
        </TabsContent>

        <TabsContent value="avis" className="max-w-2xl py-4">
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
                <li key={review.id} className="rounded-lg border border-border p-4">
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
            className="space-y-4 rounded-lg border border-border p-4"
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
                        value <= reviewRating
                          ? "fill-primary text-primary"
                          : "text-muted-foreground"
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
            <Button type="submit">Envoyer mon avis</Button>
          </form>
        </TabsContent>

        <TabsContent value="similaires" className="py-4">
          {similarProducts.length > 0 ? (
            <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2">
              {similarProducts.map((p) => (
                <div key={p.id} className="w-48 shrink-0 snap-start sm:w-56">
                  <ProductCard product={p} />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Aucun produit similaire disponible pour le moment.
            </p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
