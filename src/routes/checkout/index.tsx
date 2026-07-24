import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { CreditCard, Smartphone, Store, Truck, Wallet, Waves } from "lucide-react";
import { getSalePrice, type Product } from "@/lib/products";
import { useAllProducts } from "@/lib/product-store";
import { formatCFA } from "@/lib/format";
import { cartStore, useCartLines } from "@/lib/cart-store";
import { CONTACT } from "@/lib/categories";
import { SENEGAL_REGIONS, isValidSenegalPhone } from "@/lib/senegal";
import { generateOrderNumber, saveOrder, type Order } from "@/lib/orders";
import { useCurrentUser } from "@/lib/auth-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const DELIVERY_FEE = 2000;

const DELIVERY_OPTIONS = [
  {
    value: "pickup" as const,
    label: "Retrait en boutique (Dakar)",
    fee: 0,
    icon: Store,
    note: CONTACT.address,
  },
  {
    value: "delivery" as const,
    label: "Livraison à domicile",
    fee: DELIVERY_FEE,
    icon: Truck,
    note: `Frais de livraison estimés : ${formatCFA(DELIVERY_FEE)}`,
  },
];

const PAYMENT_METHODS = [
  {
    value: "wave" as const,
    label: "Wave",
    icon: Waves,
    accent: "text-sky-600 dark:text-sky-400",
    note: "Payez avec votre compte Wave. Confirmation instantanée par notification.",
  },
  {
    value: "orange-money" as const,
    label: "Orange Money",
    icon: Smartphone,
    accent: "text-orange-600 dark:text-orange-400",
    note: "Réglez avec Orange Money. Code de validation envoyé par SMS.",
  },
  {
    value: "free-money" as const,
    label: "Free Money",
    icon: Wallet,
    accent: "text-rose-600 dark:text-rose-400",
    note: "Paiement mobile Free Money, disponible dans toutes les régions.",
  },
  {
    value: "card" as const,
    label: "Carte bancaire",
    icon: CreditCard,
    accent: "text-slate-600 dark:text-slate-300",
    note: "Visa ou Mastercard, paiement sécurisé en ligne.",
  },
];

const checkoutSchema = z.object({
  fullName: z.string().trim().min(2, "Le nom complet est requis."),
  phone: z
    .string()
    .trim()
    .min(1, "Le numéro de téléphone est requis.")
    .refine(isValidSenegalPhone, "Numéro sénégalais invalide (ex : 77 123 45 67)."),
  email: z.union([z.literal(""), z.string().trim().email("Adresse e-mail invalide.")]),
  address: z.string().trim().min(5, "L'adresse de livraison est requise."),
  city: z.string().trim().min(2, "La ville est requise."),
  region: z.string().min(1, "Veuillez choisir une région."),
});

export const Route = createFileRoute("/checkout/")({
  head: () => ({
    meta: [
      { title: "Finaliser ma commande | Techno Office Sarl" },
      {
        name: "description",
        content:
          "Renseignez vos informations, choisissez la livraison et le paiement pour finaliser votre commande.",
      },
    ],
  }),
  component: CheckoutPage,
});

function CheckoutPage() {
  const lines = useCartLines();
  const navigate = useNavigate();
  const currentUser = useCurrentUser();
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

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [region, setRegion] = useState("");
  const [deliveryMethod, setDeliveryMethod] = useState<"pickup" | "delivery">("delivery");
  const [paymentMethod, setPaymentMethod] = useState<
    "wave" | "orange-money" | "free-money" | "card"
  >("wave");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!currentUser) return;
    setFullName((v) => v || currentUser.name);
    setPhone((v) => v || currentUser.phone);
    setEmail((v) => v || currentUser.email);
    const primary = currentUser.addresses[0];
    if (primary) {
      setAddress((v) => v || primary.address);
      setCity((v) => v || primary.city);
      setRegion((v) => v || primary.region);
    }
  }, [currentUser]);

  const deliveryFee = deliveryMethod === "delivery" ? DELIVERY_FEE : 0;
  const grandTotal = total + deliveryFee;

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center md:px-6">
        <h1 className="text-2xl font-bold text-foreground md:text-3xl">Finaliser ma commande</h1>
        <p className="mt-4 text-sm text-muted-foreground">
          Votre panier est vide. Ajoutez des produits avant de passer à la caisse.
        </p>
        <Button asChild size="lg" className="mt-6">
          <a href="/produits">Voir nos produits</a>
        </Button>
      </div>
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = checkoutSchema.safeParse({ fullName, phone, email, address, city, region });
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

    // Payment integration placeholder — connect real gateway here (Wave / Orange Money /
    // Free Money / card). No real charge is made; this only records a mock order locally.
    window.setTimeout(() => {
      const order: Order = {
        orderNumber: generateOrderNumber(),
        createdAt: new Date().toISOString(),
        status: "nouvelle",
        customerId: currentUser?.id,
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
        customerName: parsed.data.fullName,
        phone: parsed.data.phone,
        email: parsed.data.email,
        address: parsed.data.address,
        city: parsed.data.city,
        region: parsed.data.region,
        deliveryMethod,
        paymentMethod,
      };
      saveOrder(order);
      cartStore.clear();
      setSubmitting(false);
      navigate({ to: "/checkout/confirmation" });
    }, 700);
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:px-6">
      <h1 className="text-2xl font-bold text-foreground md:text-3xl">Finaliser ma commande</h1>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_320px]">
        <form onSubmit={handleSubmit} noValidate className="space-y-10">
          <section aria-labelledby="section-customer">
            <h2 id="section-customer" className="text-lg font-bold text-foreground">
              1. Informations client
            </h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Label htmlFor="fullName">Nom complet</Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  aria-invalid={Boolean(errors.fullName)}
                  aria-describedby="fullName-error"
                />
                <p
                  id="fullName-error"
                  role="alert"
                  className="mt-1 min-h-[1rem] text-xs text-destructive"
                >
                  {errors.fullName}
                </p>
              </div>
              <div>
                <Label htmlFor="phone">Téléphone</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="77 123 45 67"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  aria-invalid={Boolean(errors.phone)}
                  aria-describedby="phone-error"
                />
                <p
                  id="phone-error"
                  role="alert"
                  className="mt-1 min-h-[1rem] text-xs text-destructive"
                >
                  {errors.phone}
                </p>
              </div>
              <div>
                <Label htmlFor="email">E-mail (optionnel)</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  aria-invalid={Boolean(errors.email)}
                  aria-describedby="email-error"
                />
                <p
                  id="email-error"
                  role="alert"
                  className="mt-1 min-h-[1rem] text-xs text-destructive"
                >
                  {errors.email}
                </p>
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="address">Adresse de livraison</Label>
                <Textarea
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  aria-invalid={Boolean(errors.address)}
                  aria-describedby="address-error"
                />
                <p
                  id="address-error"
                  role="alert"
                  className="mt-1 min-h-[1rem] text-xs text-destructive"
                >
                  {errors.address}
                </p>
              </div>
              <div>
                <Label htmlFor="city">Ville</Label>
                <Input
                  id="city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  aria-invalid={Boolean(errors.city)}
                  aria-describedby="city-error"
                />
                <p
                  id="city-error"
                  role="alert"
                  className="mt-1 min-h-[1rem] text-xs text-destructive"
                >
                  {errors.city}
                </p>
              </div>
              <div>
                <Label htmlFor="region">Région</Label>
                <Select value={region} onValueChange={setRegion}>
                  <SelectTrigger
                    id="region"
                    aria-invalid={Boolean(errors.region)}
                    aria-describedby="region-error"
                  >
                    <SelectValue placeholder="Choisir une région" />
                  </SelectTrigger>
                  <SelectContent>
                    {SENEGAL_REGIONS.map((r) => (
                      <SelectItem key={r} value={r}>
                        {r}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p
                  id="region-error"
                  role="alert"
                  className="mt-1 min-h-[1rem] text-xs text-destructive"
                >
                  {errors.region}
                </p>
              </div>
            </div>
          </section>

          <section aria-labelledby="section-delivery">
            <h2 id="section-delivery" className="text-lg font-bold text-foreground">
              2. Mode de livraison
            </h2>
            <RadioGroup
              value={deliveryMethod}
              onValueChange={(v) => setDeliveryMethod(v as "pickup" | "delivery")}
              className="mt-4 gap-3"
            >
              {DELIVERY_OPTIONS.map((opt) => (
                <label
                  key={opt.value}
                  className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 ${
                    deliveryMethod === opt.value ? "border-primary" : "border-border"
                  }`}
                >
                  <RadioGroupItem value={opt.value} className="mt-0.5" />
                  <opt.icon className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
                  <span>
                    <span className="block text-sm font-semibold text-foreground">
                      {opt.label} {opt.fee > 0 ? `— ${formatCFA(opt.fee)}` : "— Gratuit"}
                    </span>
                    <span className="block text-xs text-muted-foreground">{opt.note}</span>
                  </span>
                </label>
              ))}
            </RadioGroup>
          </section>

          <section aria-labelledby="section-payment">
            <h2 id="section-payment" className="text-lg font-bold text-foreground">
              3. Mode de paiement
            </h2>
            <RadioGroup
              value={paymentMethod}
              onValueChange={(v) =>
                setPaymentMethod(v as "wave" | "orange-money" | "free-money" | "card")
              }
              className="mt-4 grid gap-3 sm:grid-cols-2"
            >
              {PAYMENT_METHODS.map((method) => (
                <label
                  key={method.value}
                  className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 ${
                    paymentMethod === method.value ? "border-primary" : "border-border"
                  }`}
                >
                  <RadioGroupItem value={method.value} className="mt-0.5" />
                  <method.icon
                    className={`mt-0.5 h-5 w-5 shrink-0 ${method.accent}`}
                    aria-hidden="true"
                  />
                  <span>
                    <span className="block text-sm font-semibold text-foreground">
                      {method.label}
                    </span>
                    <span className="block text-xs text-muted-foreground">{method.note}</span>
                  </span>
                </label>
              ))}
            </RadioGroup>
          </section>

          <Button type="submit" size="lg" className="w-full" disabled={submitting}>
            {submitting
              ? "Validation en cours..."
              : `Confirmer ma commande — ${formatCFA(grandTotal)}`}
          </Button>
        </form>

        <div className="h-fit rounded-xl border border-border p-6">
          <h2 className="text-lg font-bold text-foreground">Récapitulatif</h2>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            {items.map(({ product, quantity }) => (
              <li key={product.id} className="flex justify-between gap-2">
                <span>
                  {product.name} × {quantity}
                </span>
                <span className="shrink-0 text-foreground">
                  {formatCFA(getSalePrice(product) * quantity)}
                </span>
              </li>
            ))}
          </ul>
          <dl className="mt-4 space-y-2 border-t border-border pt-4 text-sm">
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
              <dt>Livraison</dt>
              <dd>{deliveryFee > 0 ? formatCFA(deliveryFee) : "Gratuit"}</dd>
            </div>
            <div className="flex justify-between border-t border-border pt-2 text-base font-bold text-foreground">
              <dt>Total</dt>
              <dd>{formatCFA(grandTotal)}</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}
