import { useEffect } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useOrdersQuery, type Order } from "@/lib/orders";
import { useQuoteRequestsQuery } from "@/lib/quote-requests";
import { formatCFA } from "@/lib/format";

const ADMIN_LINKS = [
  { to: "/admin", label: "Tableau de bord" },
  { to: "/admin/produits", label: "Produits" },
  { to: "/admin/categories", label: "Catégories" },
  { to: "/admin/commandes", label: "Commandes" },
  { to: "/admin/devis", label: "Demandes de devis" },
  { to: "/admin/avis", label: "Avis" },
];

// Order numbers already seen in this browser session. Lives at module level so
// moving between admin pages (which remounts AdminNav) doesn't re-announce
// orders. null until the first fetch, which is recorded silently.
let knownOrderNumbers: Set<string> | null = null;
const MAX_INDIVIDUAL_TOASTS = 3;

function useNewOrderAlerts(orders: Order[], loaded: boolean) {
  const navigate = useNavigate();

  useEffect(() => {
    if (!loaded) return;
    if (knownOrderNumbers === null) {
      knownOrderNumbers = new Set(orders.map((o) => o.orderNumber));
      return;
    }
    const fresh = orders.filter((o) => !knownOrderNumbers!.has(o.orderNumber));
    if (fresh.length === 0) return;
    fresh.forEach((o) => knownOrderNumbers!.add(o.orderNumber));

    const action = { label: "Voir", onClick: () => navigate({ to: "/admin/commandes" }) };
    if (fresh.length > MAX_INDIVIDUAL_TOASTS) {
      toast.info(`${fresh.length} nouvelles commandes`, { duration: Infinity, action });
      return;
    }
    for (const o of fresh) {
      toast.info(`Nouvelle commande ${o.orderNumber}`, {
        description: `${o.customerName} — ${formatCFA(o.total)}`,
        duration: Infinity,
        action,
      });
    }
  }, [orders, loaded, navigate]);
}

export function AdminNav() {
  const navigate = useNavigate();
  const { orders, loaded } = useOrdersQuery();
  useNewOrderAlerts(orders, loaded);
  const newOrdersCount = orders.filter((o) => o.status === "nouvelle").length;
  const { quotes } = useQuoteRequestsQuery();
  const newQuotesCount = quotes.filter((q) => q.status === "nouveau").length;

  return (
    <nav
      aria-label="Navigation admin"
      className="mb-8 flex flex-wrap items-center justify-between gap-2 border-b border-border pb-5"
    >
      <div className="flex flex-wrap gap-2">
        {ADMIN_LINKS.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            activeOptions={{ exact: link.to === "/admin" }}
            className="rounded-full px-4 py-2 font-display text-[12px] font-bold uppercase tracking-[0.08em] text-muted-foreground hover:bg-[var(--color-cream-alt)] hover:text-foreground"
            activeProps={{ className: "!bg-[var(--color-ink)] !text-primary-foreground" }}
          >
            {link.label}
            {link.to === "/admin/commandes" && newOrdersCount > 0 && (
              <span
                className="ml-2 rounded-full bg-destructive px-1.5 py-0.5 text-[10px] leading-none text-white"
                aria-label={`${newOrdersCount} nouvelle${newOrdersCount === 1 ? "" : "s"} commande${newOrdersCount === 1 ? "" : "s"}`}
              >
                {newOrdersCount}
              </span>
            )}
            {link.to === "/admin/devis" && newQuotesCount > 0 && (
              <span
                className="ml-2 rounded-full bg-destructive px-1.5 py-0.5 text-[10px] leading-none text-white"
                aria-label={`${newQuotesCount} nouvelle${newQuotesCount === 1 ? "" : "s"} demande${newQuotesCount === 1 ? "" : "s"} de devis`}
              >
                {newQuotesCount}
              </span>
            )}
          </Link>
        ))}
      </div>
      <button
        type="button"
        onClick={async () => {
          await supabase.auth.signOut();
          navigate({ to: "/admin/connexion" });
        }}
        className="rounded-full px-4 py-2 font-display text-[12px] font-bold uppercase tracking-[0.08em] text-muted-foreground hover:bg-[var(--color-cream-alt)] hover:text-foreground"
      >
        Se déconnecter
      </button>
    </nav>
  );
}
