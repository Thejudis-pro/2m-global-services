import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { Eye, EyeOff } from "lucide-react";
import { authStore } from "@/lib/auth-store";
import { isValidSenegalPhone } from "@/lib/senegal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const registerSchema = z.object({
  name: z.string().trim().min(2, "Le nom complet est requis."),
  phone: z
    .string()
    .trim()
    .min(1, "Le numéro de téléphone est requis.")
    .refine(isValidSenegalPhone, "Numéro sénégalais invalide (ex : 77 123 45 67)."),
  email: z.string().trim().email("Adresse e-mail invalide."),
  password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères."),
});

export const Route = createFileRoute("/compte/inscription")({
  head: () => ({
    meta: [
      { title: "Créer un compte | Techno Office Sarl" },
      {
        name: "description",
        content: "Créez votre compte Techno Office Sarl pour suivre vos commandes.",
      },
    ],
  }),
  component: RegisterPage,
});

function RegisterPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = registerSchema.safeParse({ name, phone, email, password });
    if (!parsed.success) {
      const nextErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        nextErrors[String(issue.path[0])] = issue.message;
      }
      setErrors(nextErrors);
      return;
    }
    setErrors({});
    try {
      authStore.register(parsed.data);
      navigate({ to: "/compte" });
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Une erreur est survenue.");
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16 md:px-6">
      <h1 className="text-2xl font-bold text-foreground md:text-3xl">Créer un compte</h1>

      <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-4">
        <div>
          <Label htmlFor="name">Nom complet</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            aria-invalid={Boolean(errors.name)}
            aria-describedby="name-error"
          />
          <p id="name-error" role="alert" className="mt-1 min-h-[1rem] text-xs text-destructive">
            {errors.name}
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
          <p id="phone-error" role="alert" className="mt-1 min-h-[1rem] text-xs text-destructive">
            {errors.phone}
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
          <p id="email-error" role="alert" className="mt-1 min-h-[1rem] text-xs text-destructive">
            {errors.email}
          </p>
        </div>

        <div>
          <Label htmlFor="password">Mot de passe</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              aria-invalid={Boolean(errors.password)}
              aria-describedby="password-error"
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground"
              aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <p
            id="password-error"
            role="alert"
            className="mt-1 min-h-[1rem] text-xs text-destructive"
          >
            {errors.password}
          </p>
        </div>

        <p role={formError ? "alert" : undefined} className="min-h-[1rem] text-sm text-destructive">
          {formError}
        </p>

        <Button type="submit" className="w-full">
          Créer mon compte
        </Button>
      </form>

      <p className="mt-4 text-center text-sm">
        Déjà un compte ?{" "}
        <a href="/compte/connexion" className="text-primary hover:underline">
          Se connecter
        </a>
      </p>
    </div>
  );
}
