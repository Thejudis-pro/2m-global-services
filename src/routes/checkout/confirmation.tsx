import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2 } from "lucide-react";
import { formatCFA } from "@/lib/format";
import { loadLastOrder, type Order } from "@/lib/orders";
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

function ConfirmationPage() {
  const [order, setOrder] = useState<Order | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setOrder(loadLastOrder());
    setLoaded(true);
  }, []);

  if (loaded && !order) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center md:px-6">
        <h1 className="text-2xl font-bold text-foreground md:text-3xl">Aucune commande trouvée</h1>
        <p className="mt-4 text-sm text-muted-foreground">
          Nous n'avons pas trouvé de commande récente. Retournez au catalogue pour commander.
        </p>
        <Button asChild size="lg" className="mt-6">
          <a href="/produits">Voir nos produits</a>
        </Button>
      </div>
    );
  }

  if (!order) {
    return <div className="mx-auto max-w-2xl px-4 py-16 md:px-6" aria-hidden="true" />;
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 md:px-6">
      <div className="text-center">
        <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500" aria-hidden="true" />
        <h1 className="mt-4 text-2xl font-bold text-foreground md:text-3xl">
          Commande confirmée !
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Merci {order.customerName}, votre commande a bien été enregistrée.
        </p>
        <p className="mt-1 text-lg font-semibold text-primary">N° {order.orderNumber}</p>
      </div>

      <div className="mt-8 rounded-xl border border-border p-6">
        <h2 className="text-sm font-bold uppercase tracking-wide text-foreground">
          Récapitulatif de la commande
        </h2>
        <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
          {order.items.map((item) => (
            <li key={item.productId} className="flex justify-between gap-2">
              <span>
                {item.name} × {item.quantity}
              </span>
              <span className="shrink-0 text-foreground">
                {formatCFA(item.unitPrice * item.quantity)}
              </span>
            </li>
          ))}
        </ul>
        <dl className="mt-4 space-y-2 border-t border-border pt-4 text-sm">
          <div className="flex justify-between text-muted-foreground">
            <dt>Sous-total</dt>
            <dd>{formatCFA(order.subtotal)}</dd>
          </div>
          {order.discountTotal > 0 && (
            <div className="flex justify-between text-primary">
              <dt>Réduction</dt>
              <dd>-{formatCFA(order.discountTotal)}</dd>
            </div>
          )}
          <div className="flex justify-between text-muted-foreground">
            <dt>Livraison</dt>
            <dd>{order.deliveryFee > 0 ? formatCFA(order.deliveryFee) : "Gratuit"}</dd>
          </div>
          <div className="flex justify-between border-t border-border pt-2 text-base font-bold text-foreground">
            <dt>Total</dt>
            <dd>{formatCFA(order.total)}</dd>
          </div>
        </dl>
      </div>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Une confirmation vous sera envoyée par WhatsApp et par e-mail avec les détails de livraison.
      </p>

      <div className="mt-6 flex justify-center">
        <Button asChild size="lg">
          <a href="/produits">Continuer mes achats</a>
        </Button>
      </div>
    </div>
  );
}
