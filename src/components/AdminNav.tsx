import { Link } from "@tanstack/react-router";

const ADMIN_LINKS = [
  { to: "/admin", label: "Tableau de bord" },
  { to: "/admin/produits", label: "Produits" },
  { to: "/admin/categories", label: "Catégories" },
  { to: "/admin/commandes", label: "Commandes" },
  { to: "/admin/avis", label: "Avis" },
];

export function AdminNav() {
  return (
    <nav
      aria-label="Navigation admin"
      className="mb-8 flex flex-wrap gap-2 border-b border-border pb-5"
    >
      {ADMIN_LINKS.map((link) => (
        <Link
          key={link.to}
          to={link.to}
          activeOptions={{ exact: link.to === "/admin" }}
          className="rounded-full px-4 py-2 font-display text-[12px] font-bold uppercase tracking-[0.08em] text-muted-foreground hover:bg-[var(--color-cream-alt)] hover:text-foreground"
          activeProps={{ className: "!bg-[var(--color-ink)] !text-primary-foreground" }}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
