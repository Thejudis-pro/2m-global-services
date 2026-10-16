import { MapPin, MessageCircle, Phone } from "lucide-react";
import { DELIVERY_LABELS, type Order } from "@/lib/orders";
import { buildCustomerWhatsAppLink } from "@/lib/notifications";
import { formatCFA } from "@/lib/format";
import { OrderStatusSelect } from "@/components/OrderStatusSelect";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 text-sm text-foreground">{children}</dd>
    </div>
  );
}

// Everything the order list can't show: contact details, delivery address and
// the ordered articles, plus one-tap WhatsApp / call buttons to reach the client.
export function OrderDetailSheet({ order, onClose }: { order: Order | null; onClose: () => void }) {
  return (
    <Sheet open={order !== null} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-lg">
        {order && (
          <>
            <SheetHeader>
              <SheetTitle>Commande {order.orderNumber}</SheetTitle>
              <SheetDescription>
                Passée le{" "}
                {new Date(order.createdAt).toLocaleString("fr-FR", {
                  dateStyle: "long",
                  timeStyle: "short",
                })}
              </SheetDescription>
            </SheetHeader>

            <div className="mt-5">
              <OrderStatusSelect order={order} className="w-full" />
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <Button asChild size="sm" className="gap-2">
                <a
                  href={buildCustomerWhatsAppLink(order)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle className="h-4 w-4" aria-hidden="true" />
                  WhatsApp client
                </a>
              </Button>
              <Button asChild size="sm" variant="outline" className="gap-2">
                <a href={`tel:${order.phone.replace(/\s/g, "")}`}>
                  <Phone className="h-4 w-4" aria-hidden="true" />
                  Appeler
                </a>
              </Button>
            </div>

            <dl className="mt-6 grid grid-cols-2 gap-4 border-t border-border pt-5">
              <Field label="Client">{order.customerName}</Field>
              <Field label="Téléphone">{order.phone}</Field>
              {order.email && (
                <div className="col-span-2">
                  <Field label="Email">{order.email}</Field>
                </div>
              )}
              <div className="col-span-2">
                <Field label="Adresse">
                  <span className="inline-flex items-start gap-1.5">
                    <MapPin
                      className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground"
                      aria-hidden="true"
                    />
                    <span>
                      {order.address}
                      {order.city ? `, ${order.city}` : ""}
                    </span>
                  </span>
                </Field>
              </div>
              <Field label="Livraison">{DELIVERY_LABELS[order.deliveryMethod]}</Field>
            </dl>

            <div className="mt-6 border-t border-border pt-5">
              <h3 className="mb-3 text-sm font-semibold text-foreground">
                Articles ({order.items.reduce((sum, i) => sum + i.quantity, 0)})
              </h3>
              <ul className="flex flex-col gap-3">
                {order.items.map((item) => (
                  <li
                    key={item.productId}
                    className="flex items-start justify-between gap-3 text-sm"
                  >
                    <span className="text-foreground">
                      {item.name}
                      <span className="text-muted-foreground">
                        {" "}
                        × {item.quantity} · {formatCFA(item.unitPrice)}
                      </span>
                    </span>
                    <span className="shrink-0 font-medium text-foreground">
                      {formatCFA(item.unitPrice * item.quantity)}
                    </span>
                  </li>
                ))}
              </ul>

              <dl className="mt-4 space-y-1.5 border-t border-border pt-4 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <dt>Sous-total</dt>
                  <dd>{formatCFA(order.subtotal)}</dd>
                </div>
                {order.discountTotal > 0 && (
                  <div className="flex justify-between text-muted-foreground">
                    <dt>Remise</dt>
                    <dd>− {formatCFA(order.discountTotal)}</dd>
                  </div>
                )}
                <div className="flex justify-between text-muted-foreground">
                  <dt>Livraison</dt>
                  <dd>{order.deliveryFee > 0 ? formatCFA(order.deliveryFee) : "—"}</dd>
                </div>
                <div className="flex justify-between pt-1 text-base font-semibold text-foreground">
                  <dt>Total</dt>
                  <dd>{formatCFA(order.total)}</dd>
                </div>
              </dl>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
