import { useState } from "react";
import { z } from "zod";

const schema = z.string().trim().email({ message: "Adresse e-mail invalide" }).max(255);

/**
 * Newsletter signup — pill input + pill button, matching the Fusion design.
 * `variant="dark"` is tuned for the dark-green/near-black footer and CTA
 * band; `variant="light"` (default) is for cream card backgrounds.
 */
export function Newsletter({
  compact = false,
  variant = "light",
}: {
  compact?: boolean;
  variant?: "light" | "dark";
}) {
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

  const inputClass =
    variant === "dark"
      ? "border-0 bg-primary-foreground/10 text-primary-foreground placeholder:text-primary-foreground/50"
      : "border border-input bg-[var(--color-cream-light)] text-foreground placeholder:text-muted-foreground";
  const buttonClass =
    variant === "dark"
      ? "bg-[var(--color-gold-light)] text-[var(--color-ink)] hover:bg-primary-foreground"
      : "bg-foreground text-background hover:bg-primary";

  return (
    <form onSubmit={onSubmit} noValidate className={compact ? "" : "space-y-2"}>
      <div className={`flex gap-2 ${compact ? "flex-wrap" : ""}`}>
        <input
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
          className={`min-w-[170px] flex-1 rounded-full px-[18px] py-[12px] text-[14px] outline-none ${inputClass}`}
        />
        <button
          type="submit"
          className={`inline-flex shrink-0 items-center rounded-full px-[20px] py-[12px] font-display text-[12px] font-bold uppercase tracking-[0.1em] transition-colors ${buttonClass}`}
        >
          {compact ? "OK" : "S'inscrire"}
        </button>
      </div>
      <p
        id="newsletter-msg"
        role={status === "error" ? "alert" : "status"}
        className={`min-h-[1rem] px-2 text-[12px] ${
          status === "error"
            ? "text-destructive"
            : status === "success"
              ? variant === "dark"
                ? "text-[var(--color-gold-light)]"
                : "text-primary"
              : "text-muted-foreground"
        }`}
      >
        {message}
      </p>
    </form>
  );
}
