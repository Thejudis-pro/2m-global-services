import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { Eye, EyeOff } from "lucide-react";
import { authStore } from "@/lib/auth-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const loginSchema = z.object({
  identifier: z.string().trim().min(1, "L'e-mail ou le téléphone est requis."),
  password: z.string().min(1, "Le mot de passe est requis."),
});

export const Route = createFileRoute("/admin/connexion")({
  head: () => ({
    meta: [{ title: "Connexion administrateur | 2M Global Services" }],
  }),
  component: AdminLoginPage,
});

function AdminLoginPage() {
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
      const user = authStore.login(parsed.data.identifier, parsed.data.password);
      if (user.role !== "admin") {
        setFormError("Ce compte n'a pas accès à l'espace gestion.");
        return;
      }
      navigate({ to: "/admin" });
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Une erreur est survenue.");
    }
  }

  return (
    <main className="mx-auto max-w-md px-[18px] py-16 md:px-[28px]">
      <div className="mb-3 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
        Espace gestion
      </div>
      <h1 className="mb-6 text-[30px]">Connexion administrateur</h1>

      <form
        onSubmit={handleSubmit}
        noValidate
        className="space-y-4 rounded-[22px] border border-border bg-[var(--color-cream-light)] p-6"
      >
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

        <Button type="submit" className="w-full rounded-full">
          Se connecter
        </Button>
      </form>
    </main>
  );
}
