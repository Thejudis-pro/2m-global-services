import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { authStore, type PublicUser } from "@/lib/auth-store";
import { loadOrdersForCustomer, ORDER_STATUS_LABELS, type Order } from "@/lib/orders";
import { formatCFA } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const Route = createFileRoute("/compte/")({
  head: () => ({
    meta: [
      { title: "Mon compte | Techno Office Sarl" },
      {
        name: "description",
        content: "Consultez vos commandes et gérez votre compte Techno Office Sarl.",
      },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const navigate = useNavigate();
  const [checked, setChecked] = useState(false);
  const [user, setUser] = useState<PublicUser | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const current = authStore.getCurrentUser();
    if (!current) {
      navigate({ to: "/compte/connexion", search: { redirect: "/compte" } });
      return;
    }
    setUser(current);
    setOrders(loadOrdersForCustomer(current.id));
    setChecked(true);
  }, [navigate]);

  if (!checked || !user) {
    return <div className="mx-auto max-w-5xl px-4 py-16 md:px-6" aria-hidden="true" />;
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 md:px-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-foreground md:text-3xl">Mon compte</h1>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <a href="/compte/profil">Mon profil</a>
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              authStore.logout();
              navigate({ to: "/" });
            }}
          >
            Se déconnecter
          </Button>
        </div>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">Bienvenue, {user.name}.</p>

      <section className="mt-8">
        <h2 className="text-lg font-bold text-foreground">Historique des commandes</h2>
        {orders.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">Vous n'avez pas encore de commande.</p>
        ) : (
          <Accordion type="single" collapsible className="mt-4">
            {orders.map((order) => (
              <AccordionItem key={order.orderNumber} value={order.orderNumber}>
                <AccordionTrigger>
                  <div className="flex w-full flex-wrap items-center justify-between gap-2 pr-4 text-left">
                    <span className="font-medium text-foreground">{order.orderNumber}</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(order.createdAt).toLocaleDateString("fr-FR")}
                    </span>
                    <Badge variant="secondary">{ORDER_STATUS_LABELS[order.status]}</Badge>
                    <span className="font-semibold text-foreground">{formatCFA(order.total)}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    {order.items.map((item) => (
                      <li key={item.productId} className="flex justify-between gap-2">
                        <span>
                          {item.name} × {item.quantity}
                        </span>
                        <span className="shrink-0">
                          {formatCFA(item.unitPrice * item.quantity)}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Livraison : {order.address}, {order.city} ({order.region})
                  </p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </section>
    </div>
  );
}
