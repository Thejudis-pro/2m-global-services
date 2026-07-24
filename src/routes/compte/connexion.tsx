import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { Eye, EyeOff } from "lucide-react";
import { authStore } from "@/lib/auth-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const searchSchema = z.object({ redirect: z.string().optional() });

const loginSchema = z.object({
  identifier: z.string().trim().min(1, "L'e-mail ou le téléphone est requis."),
  password: z.string().min(1, "Le mot de passe est requis."),
});

export const Route = createFileRoute("/compte/connexion")({
  head: () => ({
    meta: [
      { title: "Connexion | Techno Office Sarl" },
      { name: "description", content: "Connectez-vous à votre compte Techno Office Sarl." },
    ],
  }),
  validateSearch: (search: Record<string, unknown>) => searchSchema.parse(search),
  component: LoginPage,
});

function LoginPage() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = loginSchema.safeParse({ identifier, password });
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
      authStore.login(parsed.data.identifier, parsed.data.password);
      navigate({ to: search.redirect ?? "/compte" });
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Une erreur est survenue.");
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16 md:px-6">
      <h1 className="text-2xl font-bold text-foreground md:text-3xl">Connexion</h1>

      {search.redirect && (
        <p className="mt-3 rounded-md bg-secondary p-3 text-sm text-secondary-foreground">
          Veuillez vous connecter pour accéder à cette page.
        </p>
      )}

      <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-4">
        <div>
          <Label htmlFor="identifier">E-mail ou téléphone</Label>
          <Input
            id="identifier"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            aria-invalid={Boolean(errors.identifier)}
            aria-describedby="identifier-error"
          />
          <p
            id="identifier-error"
            role="alert"
            className="mt-1 min-h-[1rem] text-xs text-destructive"
          >
            {errors.identifier}
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
          Se connecter
        </Button>
      </form>

      <div className="mt-4 flex justify-between text-sm">
        <a href="/compte/mot-de-passe-oublie" className="text-primary hover:underline">
          Mot de passe oublié ?
        </a>
        <a href="/compte/inscription" className="text-primary hover:underline">
          Créer un compte
        </a>
      </div>
    </div>
  );
}
