import { useState } from "react";
import { Loader2, ShoppingCart } from "lucide-react";
import { FusionCard } from "@/components/FusionCard";
import { ProductImagePlaceholder } from "@/components/ProductImagePlaceholder";
import { formatCFA } from "@/lib/format";
import { cartStore } from "@/lib/cart-store";
import { useAllCategories } from "@/lib/category-store";
import { getSalePrice, PLACEHOLDER_IMAGE, type Product } from "@/lib/products";
import { isVehicle, vehicleSummary, vehicleWhatsAppUrl } from "@/lib/vehicles";

function AddToCartButton({ productId, productName }: { productId: string; productName: string }) {
  const [status, setStatus] = useState<"idle" | "loading" | "added">("idle");

  const handleClick = () => {
    if (status === "loading") return;
    setStatus("loading");
    window.setTimeout(() => {
      cartStore.add(productId, 1);
      setStatus("added");
      window.setTimeout(() => setStatus("idle"), 1500);
    }, 400);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={status === "loading"}
      aria-label={`Ajouter ${productName} au panier`}
      className="mt-1.5 inline-flex w-full items-center justify-center gap-1.5 whitespace-nowrap rounded-full bg-[var(--color-ink)] px-[12px] py-[12px] font-display text-[12px] font-bold uppercase tracking-[0.12em] text-primary-foreground transition-colors hover:bg-primary disabled:opacity-45"
    >
      {status === "loading" ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          Ajout…
        </>
      ) : status === "added" ? (
        "Ajouté !"
      ) : (
        <>
          {/* Narrow cards (2-up on phones, 4-up beside the filters) get the short label. */}
          <ShoppingCart className="h-4 w-4 shrink-0 @[190px]:hidden" aria-hidden="true" />
          <span className="@[190px]:hidden">Ajouter</span>
          <span className="hidden @[190px]:inline">Ajouter au panier</span>
        </>
      )}
    </button>
  );
}

export function ProductCard({ product }: { product: Product }) {
  const salePrice = getSalePrice(product);
  const hasRealPhoto = product.image && product.image !== PLACEHOLDER_IMAGE;
  const categories = useAllCategories();
  const categoryLabel = categories.find((c) => c.slug === product.categorySlug)?.label ?? "";
  const vehicle = isVehicle(product);
  const summary = product.vehicle ? vehicleSummary(product.vehicle) : "";

  return (
    <FusionCard
      className="flex flex-col overflow-hidden transition-all hover:border-accent hover:shadow-[0_14px_32px_rgba(20,21,15,0.10)]"
      style={{ borderRadius: "20px" }}
    >
      <a
        href={`/produits/${product.id}`}
        className="relative block aspect-square overflow-hidden bg-[var(--color-placeholder)]"
      >
        {hasRealPhoto ? (
          <img
            src={product.image}
            alt={product.alt}
            loading="lazy"
            className="h-full w-full object-cover"
          />
        ) : (
          <>
            <ProductImagePlaceholder
              categorySlug={product.categorySlug}
              alt={product.alt}
              className="h-full w-full"
            />
            <span className="tag-accent pointer-events-none absolute bottom-2 left-2 opacity-80">
              Photo à venir
            </span>
          </>
        )}
        {product.discountPercent > 0 && (
          <span className="tag-accent absolute left-2 top-2">-{product.discountPercent}%</span>
        )}
        {product.isNew && product.discountPercent === 0 && (
          <span className="tag-accent absolute left-2 top-2">Nouveau</span>
        )}
      </a>

      <div className="@container flex flex-1 flex-col gap-2 p-[15px]">
        <div className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
          {categoryLabel}
        </div>
        <h3 className="font-display text-[15px] font-bold leading-tight normal-case tracking-normal text-foreground">
          <a href={`/produits/${product.id}`} className="hover:text-accent">
            {product.name}
          </a>
        </h3>
        {summary && <p className="text-[12px] leading-snug text-muted-foreground">{summary}</p>}

        <div className="flex flex-1 items-end">
          {product.originalPrice === 0 ? (
            <span className="font-display text-[16px] font-bold text-primary">
              Bientôt disponible
            </span>
          ) : (
            <div className="flex items-baseline gap-2">
              <span className="font-display text-[17px] font-black text-foreground">
                {formatCFA(salePrice)}
              </span>
              {product.discountPercent > 0 && (
                <span className="text-[12px] text-muted-foreground line-through">
                  {formatCFA(product.originalPrice)}
                </span>
              )}
            </div>
          )}
        </div>

        {vehicle ? (
          <a
            href={vehicleWhatsAppUrl(product)}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1.5 inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-[var(--color-ink)] px-[12px] py-[12px] font-display text-[12px] font-bold uppercase tracking-[0.12em] text-primary-foreground transition-colors hover:bg-primary"
          >
            Je suis intéressé
          </a>
        ) : (
          product.originalPrice > 0 && (
            <AddToCartButton productId={product.id} productName={product.name} />
          )
        )}
      </div>
    </FusionCard>
  );
}
