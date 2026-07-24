import { useState } from "react";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const schema = z.string().trim().email({ message: "Adresse e-mail invalide" }).max(255);

export function Newsletter() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(email);
    if (!parsed.success) {
      setStatus("error");
      setMessage(parsed.error.issues[0]?.message ?? "Adresse e-mail invalide");
      return;
    }
    setStatus("success");
    setMessage("Merci ! Votre inscription a bien été enregistrée.");
    setEmail("");
  };

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-2">
      <label htmlFor="newsletter-email" className="block text-sm font-semibold text-foreground">
        Newsletter
      </label>
      <p className="text-xs text-muted-foreground">Recevez nos offres et nouveautés.</p>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Input
          id="newsletter-email"
          type="email"
          required
          maxLength={255}
          placeholder="votre@email.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (status !== "idle") setStatus("idle");
          }}
          aria-invalid={status === "error"}
          aria-describedby="newsletter-msg"
        />
        <Button type="submit" className="sm:w-auto">
          S'inscrire
        </Button>
      </div>
      <p
        id="newsletter-msg"
        role={status === "error" ? "alert" : "status"}
        className={`min-h-[1.25rem] text-xs ${
          status === "error"
            ? "text-destructive"
            : status === "success"
              ? "text-primary"
              : "text-muted-foreground"
        }`}
      >
        {message}
      </p>
    </form>
  );
}
