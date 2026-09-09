import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { formatCFA } from "@/lib/format";
import { loadLastOrder, type Order } from "@/lib/orders";
import { CONTACT } from "@/lib/categories";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/checkout/confirmation")({
  head: () => ({
    meta: [
      { title: "Commande confirmée | 2M Global Services" },
      { name: "description", content: "Confirmation de votre commande 2M Global Services." },
    ],
  }),
  component: ConfirmationPage,
});

const PAYMENT_LABELS: Record<Order["paymentMethod"], string> = {
  cod: "À la livraison",
  wave: "Wave",
  "bank-transfer": "Virement bancaire",
  installments: "En 3 fois",
};

function ConfirmationPage() {
  const [order, setOrder] = useState<Order | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setOrder(loadLastOrder());
    setLoaded(true);
  }, []);

  if (loaded && !order) {
    return (
      <main className="mx-auto max-w-[720px] px-[18px] py-16 text-center md:px-[28px]">
        <h1 className="text-[28px]">Aucune commande trouvée</h1>
        <p className="mt-4 text-sm text-muted-foreground">
          Nous n'avons pas trouvé de commande récente. Retournez au catalogue pour commander.
        </p>
        <Button asChild size="lg" className="mt-6 rounded-full">
          <a href="/produits">Voir nos produits</a>
        </Button>
      </main>
    );
  }

  if (!order) {
    return (
      <main className="mx-auto max-w-[1320px] px-[18px] py-16 md:px-[28px]" aria-hidden="true" />
    );
  }

  const firstName = order.customerName.split(" ")[0] || order.customerName;

  return (
    <main className="mx-auto max-w-[1320px] px-[18px] pb-[72px] pt-[30px] md:px-[28px]">
      <div className="mb-3 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
        Panier — Commande
      </div>
      <h1 className="mb-6 text-[30px] md:text-[46px]">Finaliser la commande</h1>

      <div className="mb-8 flex flex-wrap gap-2">
        <span className="rounded-full border border-input px-4 py-2 font-display text-[12px] font-bold uppercase tracking-[0.1em] text-muted-foreground">
          1 · Livraison
        </span>
        <span className="rounded-full border border-input px-4 py-2 font-display text-[12px] font-bold uppercase tracking-[0.1em] text-muted-foreground">
          2 · Paiement
        </span>
        <span className="rounded-full bg-[var(--color-ink)] px-4 py-2 font-display text-[12px] font-bold uppercase tracking-[0.1em] text-primary-foreground">
          3 · Confirmation
        </span>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[1fr_320px]">
        <div className="rounded-[22px] bg-primary p-7 text-primary-foreground">
          <div className="mb-3 font-display text-[11px] font-bold uppercase tracking-[0.22em] text-[var(--color-gold-light)]">
            Commande confirmée
          </div>
          <h2 className="mb-4 font-display text-[26px] font-black uppercase leading-[1.05] md:text-[32px]">
            Merci, {firstName} !
          </h2>
          <p className="mb-6 max-w-[52ch] text-[15px] leading-[1.7] text-primary-foreground/85">
            Votre commande #{order.orderNumber} est enregistrée.
            {order.paymentMethod === "cod"
              ? " Un conseiller vous appelle dans l'heure pour confirmer"
              : " Un conseiller vous contactera sous peu pour confirmer"}
            {order.deliverySlot
              ? ` le créneau de ${order.deliverySlot.split(" — ")[0].toLowerCase()}.`
              : "."}
          </p>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-2xl bg-primary-foreground/10 p-4">
              <div className="text-[12px] text-primary-foreground/70">Total à payer</div>
              <div className="mt-1 font-display text-[18px] font-black text-[var(--color-gold-light)]">
                {formatCFA(order.total)}
              </div>
            </div>
            <div className="rounded-2xl bg-primary-foreground/10 p-4">
              <div className="text-[12px] text-primary-foreground/70">Paiement</div>
              <div className="mt-1 font-display text-[15px] font-bold">
                {PAYMENT_LABELS[order.paymentMethod]}
              </div>
            </div>
            <div className="rounded-2xl bg-primary-foreground/10 p-4">
              <div className="text-[12px] text-primary-foreground/70">Livraison</div>
              <div className="mt-1 font-display text-[15px] font-bold">
                {order.deliverySlot ? order.deliverySlot.split(" — ")[0] : "Retrait showroom"}
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Button
              asChild
              className="rounded-full bg-background text-[var(--color-ink)] hover:bg-[var(--color-gold-light)]"
            >
              <a href={CONTACT.whatsapp} target="_blank" rel="noopener noreferrer">
                Suivre ma commande sur WhatsApp
              </a>
            </Button>
            <Button
              asChild
              variant="outline"
              className="rounded-full border-primary-foreground/50 bg-transparent text-primary-foreground hover:bg-primary-foreground/14"
            >
              <a href="/produits">Continuer mes achats</a>
            </Button>
          </div>
        </div>

        <div className="rounded-[22px] border border-border bg-[var(--color-cream-light)] p-6">
          <div className="mb-4 text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
            Votre commande
          </div>
          <ul className="flex flex-col gap-3">
            {order.items.map((item) => (
              <li
                key={item.productId}
                className="flex items-center justify-between gap-3 text-[14px]"
              >
                <span>
                  {item.name} × {item.quantity}
                </span>
                <span className="shrink-0 font-display font-bold">
                  {formatCFA(item.unitPrice * item.quantity)}
                </span>
              </li>
            ))}
          </ul>
          <dl className="mt-4 flex flex-col gap-2 border-t border-border pt-4 text-[14px]">
            <div className="flex justify-between text-muted-foreground">
              <dt>Sous-total</dt>
              <dd>{formatCFA(order.subtotal)}</dd>
            </div>
            {order.discountTotal > 0 && (
              <div className="flex justify-between text-accent">
                <dt>Économies</dt>
                <dd>−{formatCFA(order.discountTotal)}</dd>
              </div>
            )}
            <div className="flex justify-between text-muted-foreground">
              <dt>Livraison &amp; montage</dt>
              <dd>{order.deliveryFee > 0 ? formatCFA(order.deliveryFee) : "Gratuite"}</dd>
            </div>
            <div className="flex items-baseline justify-between border-t border-border pt-3 font-display text-[12px] font-extrabold uppercase tracking-[0.1em]">
              <dt>Total</dt>
              <dd className="text-[20px]">{formatCFA(order.total)}</dd>
            </div>
          </dl>
        </div>
      </div>
    </main>
  );
}
