import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { Eye, EyeOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const loginSchema = z.object({
  email: z.string().trim().email("Adresse e-mail invalide."),
  password: z.string().min(1, "Le mot de passe est requis."),
});

const signupSchema = z
  .object({
    email: z.string().trim().email("Adresse e-mail invalide."),
    password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères."),
    confirmPassword: z.string(),
  })
  .refine((v) => v.password === v.confirmPassword, {
    path: ["confirmPassword"],
    message: "Les mots de passe ne correspondent pas.",
  });

type Mode = "login" | "signup";

export const Route = createFileRoute("/admin/connexion")({
  head: () => ({
    meta: [{ title: "Connexion administrateur | 2M Global Services" }],
  }),
  component: AdminLoginPage,
});

function AdminLoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [mode, setMode] = useState<Mode>("login");
  const [notice, setNotice] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function switchMode(next: Mode) {
    setMode(next);
    setErrors({});
    setFormError("");
    setNotice("");
    setPassword("");
    setConfirmPassword("");
  }

  async function handleSignup() {
    const parsed = signupSchema.safeParse({ email, password, confirmPassword });
    if (!parsed.success) {
      const nextErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        nextErrors[String(issue.path[0])] = issue.message;
      }
      setErrors(nextErrors);
      return;
    }
    setErrors({});
    setFormError("");
    setNotice("");
    setSubmitting(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: parsed.data.email,
        password: parsed.data.password,
        options: { emailRedirectTo: `${window.location.origin}/admin/connexion` },
      });
      if (error) {
        const message = error.message.toLowerCase();
        setFormError(
          message.includes("already")
            ? "Un compte existe déjà avec cette adresse e-mail."
            : message.includes("password")
              ? "Mot de passe trop faible. Choisissez-en un plus long."
              : "Création du compte impossible pour le moment. Réessayez.",
        );
        return;
      }
      // With e-mail confirmation on, an already-registered address comes back
      // as a user without identities instead of an error.
      if (data.user && data.user.identities?.length === 0) {
        setFormError("Un compte existe déjà avec cette adresse e-mail.");
        return;
      }
      // Auto-confirm projects return a live session — close it, the account
      // has no admin access anyway and the user signs in explicitly below.
      if (data.session) await supabase.auth.signOut();
      setMode("login");
      setPassword("");
      setConfirmPassword("");
      setNotice(
        data.session
          ? "Compte créé. Vous pouvez maintenant vous connecter."
          : "Compte créé. Vérifiez votre boîte mail pour confirmer votre adresse, puis connectez-vous.",
      );
    } catch (err) {
      console.error("[admin signup]", err);
      setFormError("Création du compte impossible pour le moment. Réessayez.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (mode === "signup") {
      await handleSignup();
      return;
    }
    setNotice("");
    const parsed = loginSchema.safeParse({ email, password });
    if (!parsed.success) {
      const nextErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        nextErrors[String(issue.path[0])] = issue.message;
      }
      setErrors(nextErrors);
      return;
    }
    setErrors({});
    setFormError("");
    setSubmitting(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword(parsed.data);
      if (error) {
        setFormError(
          error.message.toLowerCase().includes("confirm")
            ? "Adresse e-mail non confirmée."
            : "Identifiants incorrects.",
        );
        return;
      }
      if (data.user?.app_metadata?.role !== "admin") {
        setFormError("Ce compte n'a pas accès à l'espace gestion.");
        await supabase.auth.signOut();
        return;
      }
      await navigate({ to: "/admin" });
    } catch (err) {
      console.error("[admin login]", err);
      setFormError("Connexion impossible pour le moment. Réessayez.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="mx-auto max-w-md px-[18px] py-16 md:px-[28px]">
      <div className="mb-3 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
        Espace gestion
      </div>
      <h1 className="mb-6 text-[30px]">
        {mode === "signup" ? "Créer un compte" : "Connexion administrateur"}
      </h1>

      <form
        onSubmit={handleSubmit}
        noValidate
        className="space-y-4 rounded-[22px] border border-border bg-[var(--color-cream-light)] p-6"
      >
        <div>
          <Label htmlFor="email">E-mail</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
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
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
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

        {mode === "signup" && (
          <div>
            <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
            <Input
              id="confirmPassword"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              aria-invalid={Boolean(errors.confirmPassword)}
              aria-describedby="confirm-password-error"
            />
            <p
              id="confirm-password-error"
              role="alert"
              className="mt-1 min-h-[1rem] text-xs text-destructive"
            >
              {errors.confirmPassword}
            </p>
          </div>
        )}

        {notice && (
          <p role="status" className="text-sm text-primary">
            {notice}
          </p>
        )}

        <p role={formError ? "alert" : undefined} className="min-h-[1rem] text-sm text-destructive">
          {formError}
        </p>

        <Button type="submit" disabled={submitting} className="w-full rounded-full">
          {mode === "signup"
            ? submitting
              ? "Création..."
              : "Créer mon compte"
            : submitting
              ? "Connexion..."
              : "Se connecter"}
        </Button>
      </form>

      <p className="mt-4 text-center text-sm text-muted-foreground">
        {mode === "signup" ? "Vous avez déjà un compte ?" : "Pas encore de compte ?"}{" "}
        <button
          type="button"
          onClick={() => switchMode(mode === "signup" ? "login" : "signup")}
          className="font-medium text-primary underline underline-offset-4"
        >
          {mode === "signup" ? "Se connecter" : "Créer un compte"}
        </button>
      </p>
      {mode === "signup" && (
        <p className="mt-2 text-center text-xs text-muted-foreground">
          L'accès à l'espace gestion est attribué manuellement par un administrateur.
        </p>
      )}
    </main>
  );
}
