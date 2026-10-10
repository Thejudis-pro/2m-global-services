// Fire-and-forget analytics for the digital business card (table
// `card_events`, see supabase/migrations/20261010000000_card_events.sql).
// Uses a keepalive fetch instead of the Supabase client so a click is never
// delayed and the request still completes while the browser navigates away.

export type CardEvent = "view" | "click" | "save_contact" | "share" | "qr_open";

export function trackCardEvent(cardSlug: string, event: CardEvent, target?: string) {
  try {
    const url = import.meta.env["VITE_SUPABASE_URL"];
    const key = import.meta.env["VITE_SUPABASE_PUBLISHABLE_KEY"];
    if (!url || !key || typeof window === "undefined") return;

    void fetch(`${url}/rest/v1/card_events`, {
      method: "POST",
      keepalive: true,
      headers: {
        apikey: key,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify({
        card_slug: cardSlug,
        event,
        target: target ?? null,
        referrer: document.referrer ? document.referrer.slice(0, 500) : null,
        user_agent: navigator.userAgent.slice(0, 500),
      }),
    }).catch(() => {});
  } catch {
    // Tracking must never break the page.
  }
}
