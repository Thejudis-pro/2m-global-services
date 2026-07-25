import { useState } from "react";
import { Loader2 } from "lucide-react";
import { BlueprintCard } from "@/components/BlueprintCard";
import { ProductImagePlaceholder } from "@/components/ProductImagePlaceholder";
import { formatCFA } from "@/lib/format";
import { cartStore } from "@/lib/cart-store";
import { getSalePrice, PLACEHOLDER_IMAGE, type Product } from "@/lib/products";

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
      className="mt-[10.2px] inline-flex w-full items-center justify-center gap-1.5 border border-border bg-transparent px-[12.24px] py-[6.8px] font-display text-[14px] font-semibold text-foreground transition-colors hover:bg-[color-mix(in_srgb,var(--foreground)_7%,transparent)] disabled:opacity-45"
    >
      {status === "loading" ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          Ajout…
        </>
      ) : status === "added" ? (
        "Ajouté !"
      ) : (
        "Ajouter au panier"
      )}
    </button>
  );
}

export function ProductCard({ product }: { product: Product }) {
  const salePrice = getSalePrice(product);
  const hasRealPhoto = product.image && product.image !== PLACEHOLDER_IMAGE;

  return (
    <BlueprintCard className="flex flex-col p-[13.6px]">
      <a
        href={`/produits/${product.id}`}
        className="relative -mx-[13.6px] -mt-[13.6px] block aspect-square overflow-hidden"
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

      <h3 className="mt-[10.2px] font-display text-[17px] font-semibold leading-tight normal-case tracking-normal text-foreground">
        <a href={`/produits/${product.id}`} className="hover:text-primary">
          {product.name}
        </a>
      </h3>

      <div className="mt-1 flex items-baseline gap-[6.8px]">
        {product.discountPercent > 0 ? (
          <>
            <span className="text-[12px] text-[color:var(--muted-foreground)] line-through">
              {formatCFA(product.originalPrice)}
            </span>
            <span className="font-display text-[15px] font-semibold text-[color:var(--color-steel-700)]">
              {formatCFA(salePrice)}
            </span>
          </>
        ) : (
          <span className="font-display text-[15px] font-semibold text-[color:var(--color-steel-700)]">
            {formatCFA(product.originalPrice)}
          </span>
        )}
      </div>

      <AddToCartButton productId={product.id} productName={product.name} />
    </BlueprintCard>
  );
}
