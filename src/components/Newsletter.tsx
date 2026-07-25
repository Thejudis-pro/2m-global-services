import { useState } from "react";
import { z } from "zod";

const schema = z.string().trim().email({ message: "Adresse e-mail invalide" }).max(255);

/**
 * Newsletter form — blueprint aesthetic (sharp borders, Barlow Condensed
 * submit). `compact` renders the inline single-row variant used at the
 * bottom of the home page; default is the block form used in the footer /
 * sidebar sections.
 */
export function Newsletter({
  compact = false,
  variant: _variant,
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

  return (
    <form onSubmit={onSubmit} noValidate className={compact ? "" : "space-y-2"}>
      {!compact && (
        <label
          htmlFor="newsletter-email"
          className="block font-display text-[14px] font-semibold uppercase tracking-[0.04em]"
        >
          Newsletter
        </label>
      )}
      <div className="flex gap-[6.8px]">
        <input
          id="newsletter-email"
          type="email"
          required
          maxLength={255}
          placeholder="Votre e-mail"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (status !== "idle") setStatus("idle");
          }}
          aria-invalid={status === "error"}
          aria-describedby="newsletter-msg"
          className="w-full min-w-[200px] flex-1 border border-border bg-secondary px-[10px] py-[6px] text-[14px] text-foreground caret-primary outline-none focus:border-primary sm:w-[240px] sm:flex-none"
        />
        <button
          type="submit"
          className="inline-flex items-center border border-primary bg-primary px-[12.24px] py-[6.8px] font-display text-[14px] font-semibold text-primary-foreground hover:bg-[color:var(--color-steel-600)]"
        >
          S'inscrire
        </button>
      </div>
      <p
        id="newsletter-msg"
        role={status === "error" ? "alert" : "status"}
        className={`min-h-[1rem] text-[12px] ${
          status === "error"
            ? "text-destructive"
            : status === "success"
              ? "text-primary"
              : "text-[color:var(--muted-foreground)]"
        }`}
      >
        {message}
      </p>
    </form>
  );
}
