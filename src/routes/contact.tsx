import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { CONTACT } from "@/lib/categories";
import { isValidSenegalPhone } from "@/lib/senegal";
import { submitContactForm } from "@/lib/contact";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const contactSchema = z.object({
  firstName: z.string().trim().min(2, "Le prénom est requis."),
  lastName: z.string().trim().min(2, "Le nom est requis."),
  email: z.string().trim().email("Adresse e-mail invalide."),
  phone: z
    .string()
    .trim()
    .min(1, "Le numéro de téléphone est requis.")
    .refine(isValidSenegalPhone, "Numéro sénégalais invalide (ex : 77 123 45 67)."),
  message: z.string().trim().min(10, "Le message doit contenir au moins 10 caractères."),
});

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact | 2M Global Services" },
      {
        name: "description",
        content:
          "Contactez 2M Global Services à Dakar : adresse, téléphone, e-mail et formulaire de contact.",
      },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = contactSchema.safeParse({ firstName, lastName, email, phone, message });
    if (!parsed.success) {
      const nextErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        nextErrors[String(issue.path[0])] = issue.message;
      }
      setErrors(nextErrors);
      setStatus("idle");
      return;
    }
    setErrors({});
    setStatus("loading");
    try {
      await submitContactForm(parsed.data);
      setStatus("success");
      setFirstName("");
      setLastName("");
      setEmail("");
      setPhone("");
      setMessage("");
    } catch {
      setStatus("error");
    }
  }

  return (
    <main className="mx-auto max-w-[1320px] px-[18px] pb-[72px] pt-[56px] md:px-[28px]">
      <h1 className="mb-[14px] text-[30px] md:text-[52px]">Contact &amp; devis</h1>
      <p className="mb-11 max-w-[52ch] text-[18px] leading-[1.7] text-[var(--color-muted-4)]">
        Showroom ouvert du lundi au samedi, 9h–19h. Devis pour aménagement complet sous 24 heures.
      </p>

      <div className="grid items-start gap-6 lg:grid-cols-2">
        <div className="flex flex-col gap-[14px]">
          <div className="rounded-[20px] bg-primary p-[26px] text-primary-foreground">
            <div className="mb-[14px] font-display text-[11px] font-bold uppercase tracking-[0.22em] text-[var(--color-gold-light)]">
              Appelez directement
            </div>
            <div className="font-display text-[24px] font-black leading-[1.4]">
              {CONTACT.phones.map((p) => (
                <a
                  key={p.tel}
                  href={`tel:${p.tel}`}
                  className="block hover:text-[var(--color-gold-light)]"
                >
                  {p.label}
                </a>
              ))}
            </div>
            <a
              href={CONTACT.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 block rounded-full bg-[var(--color-gold-light)] py-[13px] text-center font-display text-[12px] font-extrabold uppercase tracking-[0.14em] text-[var(--color-ink)]"
            >
              Ouvrir WhatsApp
            </a>
          </div>

          <div className="rounded-[20px] border border-border bg-[var(--color-cream-light)] p-6">
            <div className="mb-[10px] text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
              Showroom
            </div>
            <div className="font-display text-[17px] font-bold leading-[1.55]">
              {CONTACT.address}
            </div>
            <div className="mt-[10px] text-[14px] text-muted-foreground">
              Lundi – Samedi · 9h – 19h
            </div>
          </div>

          <div className="rounded-[20px] border border-border bg-[var(--color-cream-light)] p-6">
            <div className="mb-[10px] text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
              E-mail
            </div>
            <a
              href={`mailto:${CONTACT.email}`}
              className="font-display text-[16px] font-bold hover:text-accent"
            >
              {CONTACT.email}
            </a>
          </div>
        </div>

        <div className="rounded-[22px] border border-border bg-[var(--color-cream-light)] p-7">
          <div className="mb-5 font-display text-[19px] font-black uppercase">
            Demander un devis
          </div>
          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="firstName">Prénom</Label>
                <Input
                  id="firstName"
                  className="rounded-xl"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  aria-invalid={Boolean(errors.firstName)}
                  aria-describedby="firstName-error"
                />
                <p
                  id="firstName-error"
                  role="alert"
                  className="mt-1 min-h-[1rem] text-xs text-destructive"
                >
                  {errors.firstName}
                </p>
              </div>
              <div>
                <Label htmlFor="lastName">Nom</Label>
                <Input
                  id="lastName"
                  className="rounded-xl"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  aria-invalid={Boolean(errors.lastName)}
                  aria-describedby="lastName-error"
                />
                <p
                  id="lastName-error"
                  role="alert"
                  className="mt-1 min-h-[1rem] text-xs text-destructive"
                >
                  {errors.lastName}
                </p>
              </div>
              <div>
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  className="rounded-xl"
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
              <div>
                <Label htmlFor="phone">Téléphone</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="77 123 45 67"
                  className="rounded-xl"
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
            </div>
            <div>
              <Label htmlFor="message">Votre besoin</Label>
              <Textarea
                id="message"
                rows={5}
                className="rounded-xl"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                aria-invalid={Boolean(errors.message)}
                aria-describedby="message-error"
              />
              <p
                id="message-error"
                role="alert"
                className="mt-1 min-h-[1rem] text-xs text-destructive"
              >
                {errors.message}
              </p>
            </div>

            <Button
              type="submit"
              disabled={status === "loading"}
              className="rounded-full bg-[var(--color-ink)] py-6 font-display text-[13px] font-extrabold uppercase tracking-[0.14em] hover:bg-primary"
            >
              {status === "loading" ? "Envoi en cours..." : "Envoyer la demande"}
            </Button>

            <p
              role={status === "error" ? "alert" : "status"}
              className={`min-h-[1.25rem] text-center text-sm ${
                status === "error"
                  ? "text-destructive"
                  : status === "success"
                    ? "text-primary"
                    : "text-muted-foreground"
              }`}
            >
              {status === "success" &&
                "Merci ! Votre message a bien été envoyé, nous vous répondrons rapidement."}
              {status === "error" && "Une erreur est survenue lors de l'envoi. Veuillez réessayer."}
              {status === "idle" && "Réponse sous 24h ouvrées."}
            </p>
          </form>
        </div>
      </div>
    </main>
  );
}
