import { createFileRoute } from "@tanstack/react-router";
import { Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";
import { getSalePrice, type Product } from "@/lib/products";
import { useAllProducts } from "@/lib/product-store";
import { formatCFA } from "@/lib/format";
import { cartStore, useCartLines } from "@/lib/cart-store";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const MIN_QTY = 1;
const MAX_QTY = 10;
const DELIVERY_ESTIMATE = 2000;

export const Route = createFileRoute("/panier")({
  head: () => ({
    meta: [
      { title: "Mon Panier | Techno Office Sarl" },
      {
        name: "description",
        content: "Consultez et modifiez les articles de votre panier avant de passer commande.",
      },
    ],
  }),
  component: PanierPage,
});

function PanierPage() {
  const lines = useCartLines();
  const allProducts = useAllProducts();
  const items = lines
    .map((line) => {
      const product = allProducts.find((p) => p.id === line.productId);
      return product ? { product, quantity: line.quantity } : null;
    })
    .filter((item): item is { product: Product; quantity: number } => item !== null);

  const subtotal = items.reduce(
    (sum, { product, quantity }) => sum + product.originalPrice * quantity,
    0,
  );
  const total = items.reduce(
    (sum, { product, quantity }) => sum + getSalePrice(product) * quantity,
    0,
  );
  const discountTotal = subtotal - total;
  const grandTotal = total + (items.length > 0 ? DELIVERY_ESTIMATE : 0);

  function updateQuantity(productId: string, next: number) {
    if (next < MIN_QTY) return;
    if (next > MAX_QTY) return;
    cartStore.setQuantity(productId, next);
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:px-6">
      <h1 className="text-2xl font-bold text-foreground md:text-3xl">Mon Panier</h1>

      {items.length === 0 ? (
        <div className="mt-10 flex flex-col items-center gap-4 rounded-xl border border-dashed border-border py-16 text-center">
          <ShoppingCart className="h-10 w-10 text-muted-foreground" aria-hidden="true" />
          <p className="text-base font-semibold text-foreground">Votre panier est vide.</p>
          <p className="max-w-sm text-sm text-muted-foreground">
            Parcourez notre catalogue et ajoutez des produits pour les retrouver ici.
          </p>
          <Button asChild size="lg">
            <a href="/produits">Voir nos produits</a>
          </Button>
        </div>
      ) : (
        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_320px]">
          <ul className="divide-y divide-border rounded-xl border border-border">
            {items.map(({ product, quantity }) => {
              const unitPrice = getSalePrice(product);
              return (
                <li key={product.id} className="flex gap-4 p-4">
                  <a
                    href={`/produits/${product.id}`}
                    className="h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-muted"
                  >
                    <img
                      src={product.image}
                      alt={product.alt}
                      className="h-full w-full object-cover"
                    />
                  </a>
                  <div className="flex flex-1 flex-col justify-between">
                    <div>
                      <a
                        href={`/produits/${product.id}`}
                        className="text-sm font-semibold text-foreground hover:underline"
                      >
                        {product.name}
                      </a>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {formatCFA(unitPrice)} / unité
                      </p>
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => updateQuantity(product.id, quantity - 1)}
                        disabled={quantity <= MIN_QTY}
                        aria-label={`Diminuer la quantité de ${product.name}`}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-8 text-center text-sm font-medium" aria-live="polite">
                        {quantity}
                      </span>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => updateQuantity(product.id, quantity + 1)}
                        disabled={quantity >= MAX_QTY}
                        aria-label={`Augmenter la quantité de ${product.name}`}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex flex-col items-end justify-between">
                    <p className="text-sm font-bold text-foreground">
                      {formatCFA(unitPrice * quantity)}
                    </p>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          aria-label={`Retirer ${product.name} du panier`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Retirer cet article ?</AlertDialogTitle>
                          <AlertDialogDescription>
                            « {product.name} » sera retiré de votre panier. Cette action est
                            irréversible.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Annuler</AlertDialogCancel>
                          <AlertDialogAction onClick={() => cartStore.remove(product.id)}>
                            Retirer
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </li>
              );
            })}
          </ul>

          <div className="h-fit rounded-xl border border-border p-6">
            <h2 className="text-lg font-bold text-foreground">Récapitulatif</h2>
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <dt>Sous-total</dt>
                <dd>{formatCFA(subtotal)}</dd>
              </div>
              {discountTotal > 0 && (
                <div className="flex justify-between text-primary">
                  <dt>Réduction</dt>
                  <dd>-{formatCFA(discountTotal)}</dd>
                </div>
              )}
              <div className="flex justify-between text-muted-foreground">
                <dt>Livraison (estimation)</dt>
                <dd>{formatCFA(DELIVERY_ESTIMATE)}</dd>
              </div>
              <div className="flex justify-between border-t border-border pt-2 text-base font-bold text-foreground">
                <dt>Total</dt>
                <dd>{formatCFA(grandTotal)}</dd>
              </div>
            </dl>
            <p className="mt-2 text-xs text-muted-foreground">
              Le montant de la livraison est une estimation ; il sera confirmé lors de la commande.
            </p>
            <Button asChild size="lg" className="mt-4 w-full">
              <a href="/checkout">Passer à la caisse</a>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
