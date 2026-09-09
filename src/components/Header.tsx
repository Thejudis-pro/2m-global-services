import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Menu, X, ShoppingCart, Search } from "lucide-react";
import { useAllCategories } from "@/lib/category-store";
import { useCartCount } from "@/lib/cart-store";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose } from "@/components/ui/sheet";

const navLinkClass =
  "font-display text-[12px] font-bold uppercase tracking-[0.14em] text-foreground hover:text-accent transition-colors";

export function Header() {
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [mobileSearchValue, setMobileSearchValue] = useState("");
  const count = useCartCount();
  const categories = useAllCategories();
  const navigate = useNavigate();

  function submitSearch(value: string, closeMobile = false) {
    const query = value.trim();
    if (!query) return;
    navigate({ to: "/produits", search: { q: query } });
    setSearchOpen(false);
    if (closeMobile) setOpen(false);
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-md">
      <div className="mx-auto grid max-w-[1320px] grid-cols-[1fr_auto] items-center gap-4 px-[18px] py-[16px] md:grid-cols-[1fr_auto_1fr] md:px-[28px]">
        <nav
          className="hidden flex-wrap items-center gap-6 md:flex"
          aria-label="Navigation principale"
        >
          <Link to="/produits" className={navLinkClass}>
            Catalogue
          </Link>
          <a href="/a-propos" className={navLinkClass}>
            Maison
          </a>
          <a href="/contact" className={navLinkClass}>
            Contact
          </a>
          <a
            href="https://2mparfumeriedk.com"
            target="_blank"
            rel="noopener noreferrer"
            className={navLinkClass}
          >
            Parfumerie
          </a>
        </nav>

        <Link to="/" className="text-center" aria-label="2M Global Services — Accueil">
          <div className="font-display text-[20px] font-black uppercase leading-none tracking-[-0.01em] text-foreground md:text-[22px]">
            2M Global Services
          </div>
          <div className="mt-1 text-[9px] uppercase tracking-[0.32em] text-muted-foreground">
            Dakar · depuis 2011
          </div>
        </Link>

        <div className="hidden items-center justify-end gap-4 md:flex">
          {searchOpen ? (
            <form
              className="flex items-center gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                submitSearch(searchValue);
              }}
            >
              <input
                autoFocus
                type="search"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onBlur={() => {
                  if (!searchValue.trim()) setSearchOpen(false);
                }}
                placeholder="Rechercher un produit…"
                aria-label="Rechercher un produit"
                className="w-[200px] rounded-full border border-border bg-[var(--color-cream-light)] px-4 py-2 text-[13px] text-foreground outline-none focus:border-accent"
              />
              <button type="submit" className={navLinkClass} aria-label="Lancer la recherche">
                <Search className="h-4 w-4" aria-hidden="true" />
              </button>
            </form>
          ) : (
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className={navLinkClass}
              aria-label="Ouvrir la recherche"
            >
              <Search className="inline h-4 w-4" aria-hidden="true" />
            </button>
          )}
          <a
            href="/panier"
            className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-primary px-[18px] py-[11px] font-display text-[12px] font-bold uppercase tracking-[0.14em] text-primary-foreground transition-colors hover:bg-accent"
            aria-label={`Panier (${count} article${count === 1 ? "" : "s"})`}
          >
            <span>Panier</span>
            <span>({count})</span>
          </a>
        </div>

        <Sheet open={open} onOpenChange={setOpen}>
          <button
            type="button"
            className="ml-auto inline-flex h-9 w-9 items-center justify-center rounded-full border border-border md:hidden"
            onClick={() => setOpen(true)}
            aria-label="Ouvrir le menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <SheetContent
            side="right"
            className="w-[85%] max-w-sm border-l border-border bg-background p-0"
          >
            <SheetHeader className="flex flex-row items-center justify-between border-b border-border px-4 py-3">
              <SheetTitle className="font-display text-base uppercase tracking-[0.04em]">
                Menu
              </SheetTitle>
              <SheetClose asChild>
                <button
                  type="button"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border"
                  aria-label="Fermer le menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </SheetClose>
            </SheetHeader>
            <form
              className="flex items-center gap-2 border-b border-border px-4 py-3"
              onSubmit={(e) => {
                e.preventDefault();
                submitSearch(mobileSearchValue, true);
              }}
            >
              <input
                type="search"
                value={mobileSearchValue}
                onChange={(e) => setMobileSearchValue(e.target.value)}
                placeholder="Rechercher un produit…"
                aria-label="Rechercher un produit"
                className="w-full rounded-full border border-border bg-[var(--color-cream-light)] px-4 py-2 text-sm text-foreground outline-none focus:border-accent"
              />
              <button
                type="submit"
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border"
                aria-label="Lancer la recherche"
              >
                <Search className="h-4 w-4" aria-hidden="true" />
              </button>
            </form>
            <nav className="flex flex-col divide-y divide-border" aria-label="Navigation mobile">
              <a
                href="/"
                onClick={() => setOpen(false)}
                className="px-4 py-3 font-display text-base font-bold uppercase tracking-[0.02em]"
              >
                Accueil
              </a>
              <a
                href="/produits"
                onClick={() => setOpen(false)}
                className="px-4 py-3 font-display text-base font-bold uppercase tracking-[0.02em]"
              >
                Catalogue
              </a>
              {categories.map((c) => (
                <a
                  key={c.slug}
                  href={`/produits?category=${c.slug}`}
                  onClick={() => setOpen(false)}
                  className="px-6 py-2 text-sm text-muted-foreground hover:text-accent"
                >
                  {c.label}
                </a>
              ))}
              <a
                href="/a-propos"
                onClick={() => setOpen(false)}
                className="px-4 py-3 font-display text-base font-bold uppercase tracking-[0.02em]"
              >
                Maison
              </a>
              <a
                href="/contact"
                onClick={() => setOpen(false)}
                className="px-4 py-3 font-display text-base font-bold uppercase tracking-[0.02em]"
              >
                Contact
              </a>
              <a
                href="https://2mparfumeriedk.com"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setOpen(false)}
                className="px-4 py-3 font-display text-base font-bold uppercase tracking-[0.02em]"
              >
                Parfumerie
              </a>
              <a
                href="/panier"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 px-4 py-3 font-display text-base font-bold uppercase tracking-[0.02em]"
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
