import { createFileRoute } from "@tanstack/react-router";
import { ShoppingCart, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { getSalePrice, type Product } from "@/lib/products";
import { useAllProducts } from "@/lib/product-store";
import { useAllCategories } from "@/lib/category-store";
import { formatCFA } from "@/lib/format";
import { CONTACT } from "@/lib/categories";
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
      { title: "Mon Panier | 2M Global Services" },
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
  const categories = useAllCategories();
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
    <main className="mx-auto max-w-[1320px] px-[18px] pb-[72px] pt-[44px] md:px-[28px]">
      <h1 className="mb-[6px] text-[28px] md:text-[46px]">Votre panier</h1>
      <div className="mb-8 text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
        {items.length} article{items.length === 1 ? "" : "s"} · réservés 24 h
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-border py-16 text-center">
          <ShoppingCart className="h-10 w-10 text-muted-foreground" aria-hidden="true" />
          <p className="text-base font-semibold text-foreground">Votre panier est vide.</p>
          <p className="max-w-sm text-sm text-muted-foreground">
            Parcourez notre catalogue et ajoutez des produits pour les retrouver ici.
          </p>
          <Button asChild size="lg" className="rounded-full">
            <a href="/produits">Voir nos produits</a>
          </Button>
        </div>
      ) : (
        <div className="grid items-start gap-[26px] lg:grid-cols-[1fr_320px]">
          <div className="flex flex-col gap-3">
            {items.map(({ product, quantity }) => {
              const unitPrice = getSalePrice(product);
              const categoryLabel =
                categories.find((c) => c.slug === product.categorySlug)?.label ?? "";
              return (
                <div
                  key={product.id}
                  className="flex flex-wrap items-center gap-[15px] rounded-[18px] border border-border bg-[var(--color-cream-light)] p-[15px]"
                >
                  <a
                    href={`/produits/${product.id}`}
                    className="h-[90px] w-[90px] shrink-0 overflow-hidden rounded-xl bg-[var(--color-placeholder)]"
                  >
                    <img
                      src={product.image}
                      alt={product.alt}
                      className="h-full w-full object-cover"
                    />
                  </a>
                  <div className="min-w-[150px] flex-1">
                    <a
                      href={`/produits/${product.id}`}
                      className="font-display text-[16px] font-bold leading-tight hover:text-accent"
                    >
                      {product.name}
                    </a>
                    <div className="mt-[5px] text-[13px] text-muted-foreground">
                      {categoryLabel} · {product.stockQuantity > 0 ? "En stock" : "Sur commande"}
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <button
                          type="button"
                          className="mt-[9px] font-display text-[11px] font-bold uppercase tracking-[0.14em] text-accent"
                        >
                          Retirer
                        </button>
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
                            <Trash2 className="h-4 w-4" /> Retirer
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                  <div className="flex items-center rounded-full border border-input">
                    <button
                      type="button"
                      onClick={() => updateQuantity(product.id, quantity - 1)}
                      disabled={quantity <= MIN_QTY}
                      aria-label={`Diminuer la quantité de ${product.name}`}
                      className="px-[14px] py-[9px] disabled:opacity-40"
                    >
                      −
                    </button>
                    <span
                      className="min-w-[26px] px-1 py-[9px] text-center font-display font-extrabold"
                      aria-live="polite"
                    >
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(product.id, quantity + 1)}
                      disabled={quantity >= MAX_QTY}
                      aria-label={`Augmenter la quantité de ${product.name}`}
                      className="px-[14px] py-[9px] disabled:opacity-40"
                    >
                      +
                    </button>
                  </div>
                  <div className="min-w-[115px] text-right font-display text-[18px] font-black">
                    {formatCFA(unitPrice * quantity)}
                  </div>
                </div>
              );
            })}

            <div className="mt-1 flex flex-wrap gap-[10px]">
              <div className="min-w-[180px] flex-1 rounded-full border border-dashed border-input bg-[var(--color-cream-light)] px-5 py-[14px] text-[15px] text-muted-foreground">
                Code promo
              </div>
              <button
                type="button"
                onClick={() => toast("Les codes promo arrivent bientôt.")}
                className="rounded-full border-[1.5px] border-[var(--color-ink)] px-[26px] py-[15px] font-display text-[12px] font-extrabold uppercase tracking-[0.14em] transition-colors hover:bg-[var(--color-ink)] hover:text-primary-foreground"
              >
                Appliquer
              </button>
            </div>
          </div>

          <div className="rounded-[22px] bg-primary p-[26px] text-primary-foreground">
            <div className="mb-5 font-display text-[11px] font-bold uppercase tracking-[0.24em] text-[var(--color-gold-light)]">
              Récapitulatif
            </div>
            <dl className="flex flex-col gap-[13px] text-[15px]">
              <div className="flex justify-between">
                <dt className="text-primary-foreground/80">Sous-total</dt>
                <dd className="font-medium">{formatCFA(subtotal)}</dd>
              </div>
              {discountTotal > 0 && (
                <div className="flex justify-between">
                  <dt className="text-primary-foreground/80">Vos économies</dt>
                  <dd className="font-medium text-[var(--color-gold-light)]">
                    −{formatCFA(discountTotal)}
                  </dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-primary-foreground/80">Livraison &amp; montage</dt>
                <dd className="font-medium">{formatCFA(DELIVERY_ESTIMATE)}</dd>
              </div>
              <div className="flex items-baseline justify-between border-t border-primary-foreground/20 pt-4">
                <dt className="font-display text-[12px] font-extrabold uppercase tracking-[0.16em]">
                  Total
                </dt>
                <dd className="font-display text-[28px] font-black text-[var(--color-gold-light)]">
                  {formatCFA(grandTotal)}
                </dd>
              </div>
            </dl>
            <Button
              asChild
              className="mt-[22px] w-full rounded-full bg-background py-6 font-display text-[13px] font-extrabold uppercase tracking-[0.14em] text-[var(--color-ink)] hover:bg-[var(--color-gold-light)]"
            >
              <a href="/checkout">Commander</a>
            </Button>
            <a
              href={CONTACT.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-[10px] block rounded-full border border-primary-foreground/50 py-4 text-center font-display text-[13px] font-extrabold uppercase tracking-[0.14em] transition-colors hover:bg-primary-foreground/14"
            >
              Finaliser sur WhatsApp
            </a>
            <p className="mt-4 text-[13px] leading-[1.6] text-primary-foreground/72">
              Paiement à la livraison : Wave, Orange Money ou espèces.
            </p>
          </div>
        </div>
      )}
    </main>
  );
}
