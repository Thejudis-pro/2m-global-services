import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { getSalePrice, type Product } from "@/lib/products";
import { useAllProducts } from "@/lib/product-store";
import { formatCFA } from "@/lib/format";
import { cartStore, useCartLines } from "@/lib/cart-store";
import { isValidSenegalPhone } from "@/lib/senegal";
import { generateOrderNumber, saveOrder, type Order } from "@/lib/orders";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

const DELIVERY_FEE = 2000;

const DELIVERY_SLOTS = [
  {
    value: "demain-matin",
    label: "Demain · 9h–13h",
    note: "Montage inclus · offerte",
    deliveryMethod: "delivery" as const,
    fee: DELIVERY_FEE,
  },
  {
    value: "demain-apresmidi",
    label: "Demain · 15h–19h",
    note: "Montage inclus · offerte",
    deliveryMethod: "delivery" as const,
    fee: DELIVERY_FEE,
  },
  {
    value: "retrait",
    label: "Retrait showroom",
    note: "Front de Terre · dès 2h",
    deliveryMethod: "pickup" as const,
    fee: 0,
  },
];

const PAYMENT_METHODS = [
  {
    value: "cod" as const,
    label: "Paiement à la livraison",
    note: "Espèces, Wave ou Orange Money à la réception",
    badge: "Recommandé",
  },
  {
    value: "wave" as const,
    label: "Wave — Maintenant",
    note: "Vous recevez un lien de paiement par SMS",
  },
  {
    value: "bank-transfer" as const,
    label: "Virement bancaire",
    note: "Pour les commandes entreprise avec facture",
  },
  {
    value: "installments" as const,
    label: "Paiement en 3 fois",
    note: "Dès 250.000 CFA — sur dossier",
  },
];

const deliverySchema = z.object({
  firstName: z.string().trim().min(2, "Le prénom est requis."),
  lastName: z.string().trim().min(2, "Le nom est requis."),
  phone: z
    .string()
    .trim()
    .min(1, "Le numéro de téléphone est requis.")
    .refine(isValidSenegalPhone, "Numéro sénégalais invalide (ex : 77 123 45 67)."),
  quartier: z.string().trim().min(2, "Le quartier est requis."),
});

export const Route = createFileRoute("/checkout/")({
  head: () => ({
    meta: [
      { title: "Finaliser ma commande | 2M Global Services" },
      {
        name: "description",
        content:
          "Renseignez vos informations, choisissez la livraison et le paiement pour finaliser votre commande.",
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

  const [step, setStep] = useState<"livraison" | "paiement">("livraison");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [quartier, setQuartier] = useState("");
  const [landmark, setLandmark] = useState("");
  const [slot, setSlot] = useState(DELIVERY_SLOTS[0].value);
  const [paymentMethod, setPaymentMethod] = useState<
    "cod" | "wave" | "bank-transfer" | "installments"
  >("cod");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const selectedSlot = DELIVERY_SLOTS.find((s) => s.value === slot) ?? DELIVERY_SLOTS[0];
  const deliveryFee = selectedSlot.fee;
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

  function handleContinue(e: React.FormEvent) {
    e.preventDefault();
    const parsed = deliverySchema.safeParse({ firstName, lastName, phone, quartier });
    if (!parsed.success) {
      const nextErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        nextErrors[String(issue.path[0])] = issue.message;
      }
      setErrors(nextErrors);
      return;
    }
    setErrors({});
    setStep("paiement");
  }

  function handleSubmit() {
    if (!acceptTerms || submitting) return;
    setSubmitting(true);

    // Payment integration placeholder — connect a real gateway here (Wave / bank
    // transfer / installments). No real charge is made; this only records a
    // mock order locally.
    window.setTimeout(() => {
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
        email: "",
        address: landmark ? `${quartier} — ${landmark}` : quartier,
        city: "Dakar",
        region: "Dakar",
        deliveryMethod: selectedSlot.deliveryMethod,
        deliverySlot: `${selectedSlot.label} — ${selectedSlot.note}`,
        paymentMethod,
      };
      saveOrder(order);
      cartStore.clear();
      setSubmitting(false);
      navigate({ to: "/checkout/confirmation" });
    }, 700);
  }

  return (
    <main className="mx-auto max-w-[1320px] px-[18px] pb-[72px] pt-[30px] md:px-[28px]">
      <div className="mb-3 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
        Panier — Commande
      </div>
      <h1 className="mb-6 text-[30px] md:text-[46px]">Finaliser la commande</h1>

      <div className="mb-8 flex flex-wrap gap-2">
        <StepPill index={1} label="Livraison" active={step === "livraison"} />
        <StepPill index={2} label="Paiement" active={step === "paiement"} />
        <StepPill index={3} label="Confirmation" active={false} />
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[1fr_320px]">
        {step === "livraison" ? (
          <form
            onSubmit={handleContinue}
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

              <div className="mt-2 border-t border-border pt-5">
                <h3 className="mb-3 font-display text-[13px] font-bold uppercase tracking-[0.08em]">
                  Créneau de livraison
                </h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  {DELIVERY_SLOTS.map((s) => (
                    <button
                      key={s.value}
                      type="button"
                      onClick={() => setSlot(s.value)}
                      aria-pressed={slot === s.value}
                      className={`rounded-2xl border p-4 text-left transition-colors ${
                        slot === s.value
                          ? "border-[var(--color-ink)] bg-[var(--color-cream-alt)]"
                          : "border-border hover:border-accent"
                      }`}
                    >
                      <div className="font-display text-[13px] font-extrabold uppercase tracking-[0.02em]">
                        {s.label}
                      </div>
                      <div className="mt-1 text-[13px] text-muted-foreground">{s.note}</div>
                    </button>
                  ))}
                </div>
              </div>

              <Button type="submit" size="lg" className="mt-2 w-full rounded-full">
                Continuer vers le paiement
              </Button>
            </div>
          </form>
        ) : (
          <div className="rounded-[22px] border border-border bg-[var(--color-cream-light)] p-7">
            <h2 className="m-0 mb-5 font-display text-[17px] font-black uppercase">
              Mode de paiement
            </h2>
            <div className="flex flex-col gap-3">
              {PAYMENT_METHODS.map((method) => (
                <button
                  key={method.value}
                  type="button"
                  onClick={() => setPaymentMethod(method.value)}
                  aria-pressed={paymentMethod === method.value}
                  className={`flex items-center justify-between gap-3 rounded-2xl border p-4 text-left transition-colors ${
                    paymentMethod === method.value
                      ? "border-[var(--color-ink)] bg-[var(--color-cream-alt)]"
                      : "border-border hover:border-accent"
                  }`}
                >
                  <span>
                    <span className="block font-display text-[13px] font-extrabold uppercase tracking-[0.02em]">
                      {method.label}
                    </span>
                    <span className="mt-1 block text-[13px] text-muted-foreground">
                      {method.note}
                    </span>
                  </span>
                  {method.badge && (
                    <span className="shrink-0 font-display text-[10px] font-bold uppercase tracking-[0.1em] text-accent">
                      {method.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>

            <label className="mt-5 flex items-start gap-2 text-[14px] text-muted-foreground">
              <Checkbox
                checked={acceptTerms}
                onCheckedChange={(checked) => setAcceptTerms(checked === true)}
                className="mt-0.5"
              />
              J&apos;accepte les conditions de vente, l&apos;échange sous 7 jours et la garantie 2
              ans.
            </label>

            <div className="mt-5 flex gap-3">
              <Button
                type="button"
                variant="outline"
                className="rounded-full"
                onClick={() => setStep("livraison")}
              >
                Retour
              </Button>
              <Button
                type="button"
                className="flex-1 rounded-full"
                disabled={!acceptTerms || submitting}
                onClick={handleSubmit}
              >
                {submitting ? "Validation en cours..." : "Valider la commande"}
              </Button>
            </div>
          </div>
        )}

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
              <dt>Livraison &amp; montage</dt>
              <dd>{deliveryFee > 0 ? formatCFA(deliveryFee) : "Gratuite"}</dd>
            </div>
            <div className="flex items-baseline justify-between border-t border-border pt-3 font-display text-[12px] font-extrabold uppercase tracking-[0.1em]">
              <dt>Total</dt>
              <dd className="text-[20px]">{formatCFA(grandTotal)}</dd>
            </div>
          </dl>
          <p className="mt-4 rounded-xl bg-[var(--color-cream-alt)] p-3 text-[13px] text-[var(--color-muted-4)]">
            Échange sous 7 jours et garantie 2 ans sur tous les articles de cette commande.
          </p>
        </div>
      </div>
    </main>
  );
}
