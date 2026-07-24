import { useState } from "react";
import { Loader2, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
    }, 600);
  };

  return (
    <Button
      type="button"
      size="sm"
      className="mt-3 w-full"
      onClick={handleClick}
      disabled={status === "loading"}
      aria-label={`Ajouter ${productName} au panier`}
    >
      {status === "loading" ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          Ajout...
        </>
      ) : status === "added" ? (
        <>
          <ShoppingCart className="h-4 w-4" aria-hidden="true" />
          Ajouté !
        </>
      ) : (
        "Ajouter au panier"
      )}
    </Button>
  );
}

export function ProductCard({ product }: { product: Product }) {
  const salePrice = getSalePrice(product);

  return (
    <div className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:border-accent hover:shadow-[var(--shadow-warm)]">
      <a
        href={`/produits/${product.id}`}
        className="relative aspect-square w-full overflow-hidden bg-muted"
      >
        {product.image === PLACEHOLDER_IMAGE ? (
          <ProductImagePlaceholder
            categorySlug={product.categorySlug}
            alt={product.alt}
            className="h-full w-full transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <img
            src={product.image}
            alt={product.alt}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        )}
        {product.discountPercent > 0 && (
          <Badge variant="destructive" className="absolute left-2 top-2 shadow">
            -{product.discountPercent}%
          </Badge>
        )}
        {product.isNew && (
          <Badge className="absolute right-2 top-2 bg-accent text-accent-foreground shadow">
            Nouveau
          </Badge>
        )}
      </a>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-display text-sm font-semibold text-card-foreground">
          <a href={`/produits/${product.id}`} className="hover:underline">
            {product.name}
          </a>
        </h3>
        <div className="mt-2 flex items-baseline gap-2">
          {product.discountPercent > 0 ? (
            <>
              <span className="text-xs text-muted-foreground line-through">
                {formatCFA(product.originalPrice)}
              </span>
              <span className="text-base font-bold text-primary">{formatCFA(salePrice)}</span>
            </>
          ) : (
            <span className="text-base font-bold text-foreground">
              {formatCFA(product.originalPrice)}
            </span>
          )}
        </div>
        <div className="mt-auto">
          <AddToCartButton productId={product.id} productName={product.name} />
        </div>
      </div>
    </div>
  );
}
