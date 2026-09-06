import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Menu, X, ShoppingCart, User, ChevronDown } from "lucide-react";
import { useAllCategories } from "@/lib/category-store";
import { useCartCount } from "@/lib/cart-store";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose } from "@/components/ui/sheet";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";

const linkBase =
  "inline-flex items-center gap-1 px-3 py-2 font-display text-[14px] font-semibold uppercase tracking-[0.02em] text-foreground hover:text-primary transition-colors";

export function Header() {
  const [open, setOpen] = useState(false);
  const [mobileProductsOpen, setMobileProductsOpen] = useState(false);
  const count = useCartCount();
  const categories = useAllCategories();

  return (
    <header className="w-full border-b border-border bg-background">
      <div className="mx-auto flex max-w-[1280px] items-center gap-[13.6px] px-[13.6px] py-[10.2px]">
        <Link
          to="/"
          className="mr-auto font-display text-[18px] font-semibold tracking-[0.02em] text-foreground"
          aria-label="Techno Office Sarl — Accueil"
        >
          TECHNO OFFICE
        </Link>

        <nav className="hidden items-center gap-[13.6px] md:flex" aria-label="Navigation principale">
          <Link to="/" className={linkBase} activeProps={{ style: { color: "var(--primary)" } }}>
            Accueil
          </Link>
          <div className="flex items-center">
            <Link
              to="/produits"
              className={linkBase}
              activeProps={{ style: { color: "var(--primary)" } }}
            >
              Produits
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger
                className="inline-flex h-8 w-8 items-center justify-center text-foreground hover:text-primary focus:outline-none"
                aria-label="Voir les catégories de produits"
              >
                <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-64 rounded-none border-border">
                <DropdownMenuItem asChild className="rounded-none font-semibold">
                  <a href="/produits">Tous les produits</a>
                </DropdownMenuItem>
                {categories.map((c) => (
                  <DropdownMenuItem key={c.slug} asChild className="rounded-none">
                    <a href={`/produits?category=${c.slug}`}>{c.label}</a>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <a href="/a-propos" className={linkBase}>
            À propos
          </a>
          <a href="/contact" className={linkBase}>
            Contact
          </a>
        </nav>

        <div className="ml-2 hidden items-center gap-[13.6px] md:flex">
          <a
            href="/compte"
            className="inline-flex items-center gap-1.5 font-display text-[13px] font-semibold uppercase tracking-[0.04em] text-foreground/80 hover:text-primary"
            aria-label="Mon compte"
          >
            <User className="h-4 w-4" aria-hidden="true" />
            Compte
          </a>
          <a
            href="/panier"
            className="relative inline-flex items-center gap-1.5 font-display text-[13px] font-semibold uppercase tracking-[0.04em] text-foreground/80 hover:text-primary"
            aria-label={`Panier (${count} article${count === 1 ? "" : "s"})`}
          >
            <ShoppingCart className="h-4 w-4" aria-hidden="true" />
            Panier ({count})
          </a>
        </div>

        <Sheet open={open} onOpenChange={setOpen}>
          <button
            type="button"
            className="ml-auto inline-flex h-9 w-9 items-center justify-center border border-border md:hidden"
            onClick={() => setOpen(true)}
            aria-label="Ouvrir le menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <SheetContent side="right" className="w-[85%] max-w-sm rounded-none border-l border-border bg-background p-0">
            <SheetHeader className="flex flex-row items-center justify-between border-b border-border px-4 py-3">
              <SheetTitle className="font-display text-base uppercase tracking-[0.04em]">
                Menu
              </SheetTitle>
              <SheetClose asChild>
                <button
                  type="button"
                  className="inline-flex h-9 w-9 items-center justify-center border border-border"
                  aria-label="Fermer le menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </SheetClose>
            </SheetHeader>
            <nav className="flex flex-col divide-y divide-border" aria-label="Navigation mobile">
              <a
                href="/"
                onClick={() => setOpen(false)}
                className="px-4 py-3 font-display text-base font-semibold uppercase tracking-[0.02em]"
              >
                Accueil
              </a>
              <Collapsible open={mobileProductsOpen} onOpenChange={setMobileProductsOpen}>
                <CollapsibleTrigger className="flex w-full items-center justify-between px-4 py-3 font-display text-base font-semibold uppercase tracking-[0.02em]">
                  Produits
                  <ChevronDown
                    className={`h-4 w-4 transition-transform ${mobileProductsOpen ? "rotate-180" : ""}`}
                    aria-hidden="true"
                  />
                </CollapsibleTrigger>
                <CollapsibleContent className="flex flex-col border-t border-border bg-secondary/40">
                  <a
                    href="/produits"
                    onClick={() => setOpen(false)}
                    className="px-6 py-2 text-sm font-semibold text-foreground hover:text-primary"
                  >
                    Tous les produits
                  </a>
                  {categories.map((c) => (
                    <a
                      key={c.slug}
                      href={`/produits?category=${c.slug}`}
                      onClick={() => setOpen(false)}
                      className="px-6 py-2 text-sm text-foreground/80 hover:text-primary"
                    >
                      {c.label}
                    </a>
                  ))}
                </CollapsibleContent>
              </Collapsible>
              <a
                href="/a-propos"
                onClick={() => setOpen(false)}
                className="px-4 py-3 font-display text-base font-semibold uppercase tracking-[0.02em]"
              >
                À propos
              </a>
              <a
                href="/contact"
                onClick={() => setOpen(false)}
                className="px-4 py-3 font-display text-base font-semibold uppercase tracking-[0.02em]"
              >
                Contact
              </a>
              <a
                href="/compte"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 px-4 py-3 font-display text-base font-semibold uppercase tracking-[0.02em]"
              >
                <User className="h-4 w-4" aria-hidden="true" /> Compte
              </a>
              <a
                href="/panier"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 px-4 py-3 font-display text-base font-semibold uppercase tracking-[0.02em]"
              >
                <ShoppingCart className="h-4 w-4" aria-hidden="true" /> Panier ({count})
              </a>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
