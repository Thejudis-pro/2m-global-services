import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { authStore } from "@/lib/auth-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/compte/mot-de-passe-oublie")({
  head: () => ({
    meta: [
      { title: "Mot de passe oublié | 2M Global Services" },
      {
        name: "description",
        content: "Réinitialisez le mot de passe de votre compte 2M Global Services.",
      },
    ],
  }),
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const [identifier, setIdentifier] = useState("");
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!identifier.trim()) {
      setError("Veuillez indiquer votre e-mail ou votre téléphone.");
      return;
    }
    setError("");
    authStore.requestPasswordReset(identifier.trim());
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center md:px-6">
        <h1 className="text-2xl font-bold text-foreground md:text-3xl">
          Vérifiez votre boîte de réception
        </h1>
        <p className="mt-4 text-sm text-muted-foreground">
          Si un compte existe avec « {identifier} », un lien de réinitialisation du mot de passe
          vient de lui être envoyé.
        </p>
        <Button asChild className="mt-6">
          <a href="/compte/connexion">Retour à la connexion</a>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16 md:px-6">
      <h1 className="text-2xl font-bold text-foreground md:text-3xl">Mot de passe oublié</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Indiquez votre e-mail ou téléphone pour recevoir un lien de réinitialisation.
      </p>

      <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-4">
        <div>
          <Label htmlFor="identifier">E-mail ou téléphone</Label>
          <Input
            id="identifier"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            aria-invalid={Boolean(error)}
            aria-describedby="identifier-error"
          />
          <p
            id="identifier-error"
            role="alert"
            className="mt-1 min-h-[1rem] text-xs text-destructive"
          >
            {error}
          </p>
        </div>

        <Button type="submit" className="w-full">
          Envoyer le lien
        </Button>
      </form>

      <a
        href="/compte/connexion"
        className="mt-4 block text-center text-sm text-primary hover:underline"
      >
        Retour à la connexion
      </a>
    </div>
  );
}
