import { Link } from "@tanstack/react-router";

const ADMIN_LINKS = [
  { to: "/admin", label: "Analytique" },
  { to: "/admin/produits", label: "Produits" },
  { to: "/admin/categories", label: "Catégories" },
  { to: "/admin/commandes", label: "Commandes" },
  { to: "/admin/avis", label: "Avis" },
];

export function AdminNav() {
  return (
    <nav
      aria-label="Navigation admin"
      className="mb-6 flex flex-wrap gap-2 border-b border-border pb-4"
    >
      {ADMIN_LINKS.map((link) => (
        <Link
          key={link.to}
          to={link.to}
          activeOptions={{ exact: link.to === "/admin" }}
          className="rounded-md px-3 py-1.5 text-sm font-medium text-foreground hover:bg-secondary"
          activeProps={{ className: "bg-secondary" }}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
