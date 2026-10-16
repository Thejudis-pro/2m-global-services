import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { z } from "zod";
import { getSalePrice, type Product } from "@/lib/products";
import { useAllProducts } from "@/lib/product-store";
import { formatCFA } from "@/lib/format";
import { cartStore, useCartLines } from "@/lib/cart-store";
import { isValidSenegalPhone } from "@/lib/senegal";
import { generateOrderNumber, saveOrder, type Order } from "@/lib/orders";
import { sendOrderNotifications } from "@/lib/notifications";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

// Delivery is agreed directly with the customer, so no fee is added to the order total.
const DELIVERY_FEE = 0;

const deliverySchema = z.object({
  firstName: z.string().trim().min(2, "Le prénom est requis."),
  lastName: z.string().trim().min(2, "Le nom est requis."),
  phone: z
    .string()
    .trim()
    .min(1, "Le numéro de téléphone est requis.")
    .refine(isValidSenegalPhone, "Numéro sénégalais invalide (ex : 77 123 45 67)."),
  email: z.string().trim().email("Adresse e-mail invalide."),
  quartier: z.string().trim().min(2, "Le quartier est requis."),
});

export const Route = createFileRoute("/checkout/")({
  head: () => ({
    meta: [
      { title: "Finaliser ma commande | 2M Global Services" },
      {
        name: "description",
        content: "Renseignez vos informations de livraison pour finaliser votre commande.",
      },
    ],
  }),
  component: CheckoutPage,
});

function StepPill({ index, label, active }: { index: number; label: string; active: boolean }) {
  return (
    <span
      className={`rounded-full px-4 py-2 font-display text-[12px] font-bold uppercase tracking-[0.1em] ${
        active
          ? "bg-[var(--color-ink)] text-primary-foreground"
          : "border border-input text-muted-foreground"
      }`}
    >
      {index} · {label}
    </span>
  );
}

function CheckoutPage() {
  const lines = useCartLines();
  const navigate = useNavigate();
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

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [quartier, setQuartier] = useState("");
  const [landmark, setLandmark] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const deliveryFee = DELIVERY_FEE;
  const grandTotal = total + deliveryFee;

  if (items.length === 0) {
    return (
      <main className="mx-auto max-w-[720px] px-[18px] py-16 text-center md:px-[28px]">
        <h1 className="text-[28px]">Finaliser ma commande</h1>
        <p className="mt-4 text-sm text-muted-foreground">
          Votre panier est vide. Ajoutez des produits avant de passer à la caisse.
        </p>
        <Button asChild size="lg" className="mt-6 rounded-full">
          <a href="/produits">Voir nos produits</a>
        </Button>
      </main>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!acceptTerms || submitting) return;
    const parsed = deliverySchema.safeParse({ firstName, lastName, phone, email, quartier });
    if (!parsed.success) {
      const nextErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        nextErrors[String(issue.path[0])] = issue.message;
      }
      setErrors(nextErrors);
      return;
    }
    setErrors({});
    setSubmitting(true);

    const order: Order = {
      orderNumber: generateOrderNumber(),
      createdAt: new Date().toISOString(),
      status: "nouvelle",
      items: items.map(({ product, quantity }) => ({
        productId: product.id,
        name: product.name,
        quantity,
        unitPrice: getSalePrice(product),
      })),
      subtotal,
      discountTotal,
      deliveryFee,
      total: grandTotal,
      customerName: `${firstName} ${lastName}`.trim(),
      phone,
      email,
      address: landmark ? `${quartier} — ${landmark}` : quartier,
      city: "Dakar",
      region: "Dakar",
      deliveryMethod: "delivery",
    };

    try {
      await saveOrder(order);
      cartStore.clear();
      void sendOrderNotifications(order);
      navigate({ to: "/checkout/confirmation" });
    } catch {
      toast.error("Impossible d'enregistrer la commande. Vérifiez votre connexion et réessayez.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="mx-auto max-w-[1320px] px-[18px] pb-[72px] pt-[30px] md:px-[28px]">
      <div className="mb-3 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
        Panier — Commande
      </div>
      <h1 className="mb-6 text-[30px] md:text-[46px]">Finaliser la commande</h1>

      <div className="mb-8 flex flex-wrap gap-2">
        <StepPill index={1} label="Livraison" active />
        <StepPill index={2} label="Confirmation" active={false} />
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[1fr_320px]">
        <form
          onSubmit={handleSubmit}
          noValidate
          className="rounded-[22px] border border-border bg-[var(--color-cream-light)] p-7"
        >
          <h2 className="m-0 mb-5 font-display text-[17px] font-black uppercase">
            Adresse de livraison
          </h2>
          <div className="flex flex-col gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="firstName">Prénom</Label>
                <Input
                  id="firstName"
                  className="rounded-xl"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  aria-invalid={Boolean(errors.firstName)}
                />
                <p className="mt-1 min-h-[1rem] text-xs text-destructive">{errors.firstName}</p>
              </div>
              <div>
                <Label htmlFor="lastName">Nom</Label>
                <Input
                  id="lastName"
                  className="rounded-xl"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  aria-invalid={Boolean(errors.lastName)}
                />
                <p className="mt-1 min-h-[1rem] text-xs text-destructive">{errors.lastName}</p>
              </div>
            </div>
            <div>
              <Label htmlFor="phone">Téléphone</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="77 000 00 00"
                className="rounded-xl"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                aria-invalid={Boolean(errors.phone)}
              />
              <p className="mt-1 min-h-[1rem] text-xs text-destructive">{errors.phone}</p>
            </div>
            <div>
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="vous@exemple.com"
                className="rounded-xl"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-invalid={Boolean(errors.email)}
              />
              <p className="mt-1 min-h-[1rem] text-xs text-destructive">{errors.email}</p>
            </div>
            <div>
              <Label htmlFor="quartier">Quartier</Label>
              <Input
                id="quartier"
                placeholder="Sacré-Cœur 3, Dakar"
                className="rounded-xl"
                value={quartier}
                onChange={(e) => setQuartier(e.target.value)}
                aria-invalid={Boolean(errors.quartier)}
              />
              <p className="mt-1 min-h-[1rem] text-xs text-destructive">{errors.quartier}</p>
            </div>
            <div>
              <Label htmlFor="landmark">Repère / Indications</Label>
              <Textarea
                id="landmark"
                rows={3}
                placeholder="En face de la pharmacie, 2e étage..."
                className="rounded-xl"
                value={landmark}
                onChange={(e) => setLandmark(e.target.value)}
              />
            </div>

            <label className="mt-2 flex items-start gap-2 border-t border-border pt-5 text-[14px] text-muted-foreground">
              <Checkbox
                checked={acceptTerms}
                onCheckedChange={(checked) => setAcceptTerms(checked === true)}
                className="mt-0.5"
              />
              J&apos;accepte les conditions de vente.
            </label>

            <Button
              type="submit"
              size="lg"
              className="mt-2 w-full rounded-full"
              disabled={!acceptTerms || submitting}
            >
              {submitting ? "Validation en cours..." : "Valider la commande"}
            </Button>
          </div>
        </form>
        <div className="rounded-[22px] border border-border bg-[var(--color-cream-light)] p-6">
          <div className="mb-4 text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
            Votre commande
          </div>
          <ul className="flex flex-col gap-3">
            {items.map(({ product, quantity }) => (
              <li key={product.id} className="flex items-center gap-3">
                <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-[var(--color-placeholder)]">
                  <img
                    src={product.image}
                    alt={product.alt}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[14px] font-semibold">{product.name}</div>
                  <div className="text-[12px] text-muted-foreground">Qté {quantity}</div>
                </div>
                <div className="shrink-0 font-display text-[14px] font-bold">
                  {formatCFA(getSalePrice(product) * quantity)}
                </div>
              </li>
            ))}
          </ul>
          <dl className="mt-4 flex flex-col gap-2 border-t border-border pt-4 text-[14px]">
            <div className="flex justify-between text-muted-foreground">
              <dt>Sous-total</dt>
              <dd>{formatCFA(subtotal)}</dd>
            </div>
            {discountTotal > 0 && (
              <div className="flex justify-between text-accent">
                <dt>Économies</dt>
                <dd>−{formatCFA(discountTotal)}</dd>
              </div>
            )}
            <div className="flex justify-between text-muted-foreground">
              <dt>Livraison</dt>
              <dd>{deliveryFee > 0 ? formatCFA(deliveryFee) : "À convenir"}</dd>
            </div>
            <div className="flex items-baseline justify-between border-t border-border pt-3 font-display text-[12px] font-extrabold uppercase tracking-[0.1em]">
              <dt>Total</dt>
              <dd className="text-[20px]">{formatCFA(grandTotal)}</dd>
            </div>
          </dl>
        </div>
      </div>
    </main>
  );
}
