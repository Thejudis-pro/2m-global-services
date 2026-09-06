import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { Mail, MapPin, Phone } from "lucide-react";
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
    <div className="mx-auto max-w-5xl px-4 py-8 md:px-6">
      <h1 className="text-2xl font-bold text-foreground md:text-3xl">Contact</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Une question, une demande de devis ? Contactez-nous par téléphone, e-mail ou via le
        formulaire ci-dessous.
      </p>

      <div className="mt-8 grid gap-10 lg:grid-cols-2">
        <div>
          <ul className="space-y-4 text-sm">
            <li className="flex gap-3">
              <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
              <span className="text-foreground">{CONTACT.address}</span>
            </li>
            <li className="flex gap-3">
              <Phone className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
              <span className="flex flex-wrap gap-x-2 text-foreground">
                {CONTACT.phones.map((p, i) => (
                  <span key={p.tel}>
                    <a href={`tel:${p.tel}`} className="hover:text-primary hover:underline">
                      {p.label}
                    </a>
                    {i < CONTACT.phones.length - 1 && <span aria-hidden="true"> /</span>}
                  </span>
                ))}
              </span>
            </li>
            <li className="flex gap-3">
              <Mail className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
              <a
                href={`mailto:${CONTACT.email}`}
                className="text-foreground hover:text-primary hover:underline"
              >
                {CONTACT.email}
              </a>
            </li>
          </ul>

          <div
            role="img"
            aria-label={`Emplacement 2M Global Services : ${CONTACT.address}`}
            className="mt-6 flex h-56 flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-secondary/30 text-center"
          >
            <MapPin className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
            <p className="px-4 text-sm text-muted-foreground">
              Carte à intégrer — {CONTACT.address}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="firstName">Prénom</Label>
              <Input
                id="firstName"
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
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              rows={5}
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

          <Button type="submit" size="lg" disabled={status === "loading"}>
            {status === "loading" ? "Envoi en cours..." : "Envoyer le message"}
          </Button>

          <p
            role={status === "error" ? "alert" : "status"}
            className={`min-h-[1.25rem] text-sm ${
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
          </p>
        </form>
      </div>
    </div>
  );
}
