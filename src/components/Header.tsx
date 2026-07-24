import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Menu, X, ShoppingCart, User, ChevronDown } from "lucide-react";
import { CATEGORIES } from "@/lib/categories";
import { useCartCount } from "@/lib/cart-store";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";

function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2" aria-label="Techno Office Sarl - Accueil">
      <div
        role="img"
        aria-label="Logo Techno Office Sarl"
        className="flex h-10 w-10 items-center justify-center rounded-md bg-primary font-bold text-primary-foreground"
      >
        TO
      </div>
      <div className="hidden flex-col leading-tight sm:flex">
        <span className="text-sm font-bold text-foreground">Techno Office Sarl</span>
        <span className="text-[11px] text-muted-foreground">La Qualité à moindre Coût</span>
      </div>
    </Link>
  );
}

export function Header() {
  const [open, setOpen] = useState(false);
  const [mobileProductsOpen, setMobileProductsOpen] = useState(false);
  const count = useCartCount();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 md:px-6">
        <Logo />

        <nav className="hidden items-center gap-1 md:flex" aria-label="Navigation principale">
          <Link
            to="/"
            className="rounded-md px-3 py-2 text-sm font-medium text-foreground hover:bg-secondary"
          >
            Accueil
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger className="inline-flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium text-foreground hover:bg-secondary focus:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              Produits <ChevronDown className="h-4 w-4" aria-hidden="true" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-64">
              {CATEGORIES.map((c) => (
                <DropdownMenuItem key={c.slug} asChild>
                  <a href={`/produits/${c.slug}`}>{c.label}</a>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <a
            href="/contact"
            className="rounded-md px-3 py-2 text-sm font-medium text-foreground hover:bg-secondary"
          >
            Contact
          </a>
        </nav>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            asChild
            aria-label={`Panier (${count} article${count === 1 ? "" : "s"})`}
            className="relative"
          >
            <a href="/panier">
              <ShoppingCart className="h-5 w-5" />
              {count > 0 && (
                <span
                  aria-hidden="true"
                  className="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-primary px-1 text-[11px] font-bold text-primary-foreground"
                >
                  {count > 99 ? "99+" : count}
                </span>
              )}
            </a>
          </Button>
          <Button variant="ghost" size="icon" asChild aria-label="Mon compte">
            <a href="/compte">
              <User className="h-5 w-5" />
            </a>
          </Button>

          <Sheet open={open} onOpenChange={setOpen}>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setOpen(true)}
              aria-label="Ouvrir le menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <SheetContent side="right" className="w-[85%] max-w-sm p-0">
              <SheetHeader className="flex flex-row items-center justify-between border-b border-border px-4 py-3">
                <SheetTitle className="text-base">Menu</SheetTitle>
                <SheetClose asChild>
                  <Button variant="ghost" size="icon" aria-label="Fermer le menu">
                    <X className="h-5 w-5" />
                  </Button>
                </SheetClose>
              </SheetHeader>
              <nav className="flex flex-col p-2" aria-label="Navigation mobile">
                <a
                  href="/"
                  onClick={() => setOpen(false)}
                  className="rounded-md px-3 py-3 text-base font-medium hover:bg-secondary"
                >
                  Accueil
                </a>
                <Collapsible open={mobileProductsOpen} onOpenChange={setMobileProductsOpen}>
                  <CollapsibleTrigger className="flex w-full items-center justify-between rounded-md px-3 py-3 text-base font-medium hover:bg-secondary">
                    Produits
                    <ChevronDown
                      className={`h-4 w-4 transition-transform ${mobileProductsOpen ? "rotate-180" : ""}`}
                      aria-hidden="true"
                    />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="ml-3 flex flex-col border-l border-border pl-3">
                    {CATEGORIES.map((c) => (
                      <a
                        key={c.slug}
                        href={`/produits/${c.slug}`}
                        onClick={() => setOpen(false)}
                        className="rounded-md px-3 py-2 text-sm text-foreground hover:bg-secondary"
                      >
                        {c.label}
                      </a>
                    ))}
                  </CollapsibleContent>
                </Collapsible>
                <a
                  href="/contact"
                  onClick={() => setOpen(false)}
                  className="rounded-md px-3 py-3 text-base font-medium hover:bg-secondary"
                >
                  Contact
                </a>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
