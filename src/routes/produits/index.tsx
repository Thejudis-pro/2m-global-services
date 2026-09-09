import { useMemo } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { z } from "zod";
import { SlidersHorizontal } from "lucide-react";
import {
  PAGE_SIZE,
  PRICE_BOUNDS,
  SORT_OPTIONS,
  DISCOUNT_OPTIONS,
  filterAndSortProducts,
  type SortOption,
} from "@/lib/products";
import { useAllProducts } from "@/lib/product-store";
import { useAllCategories } from "@/lib/category-store";
import { formatCFA } from "@/lib/format";
import { CONTACT } from "@/lib/categories";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const SORT_VALUES = SORT_OPTIONS.map((o) => o.value) as [SortOption, ...SortOption[]];

const searchSchema = z.object({
  q: z.string().optional(),
  category: z.string().optional(),
  subcategory: z.string().optional(),
  priceMin: z.coerce.number().min(0).optional(),
  priceMax: z.coerce.number().min(0).optional(),
  discount: z.coerce.number().optional(),
  newArrival: z.coerce.boolean().optional(),
  sort: z.enum(SORT_VALUES).optional(),
  page: z.coerce.number().int().min(1).optional(),
});

type ProduitsSearch = z.infer<typeof searchSchema>;

export const Route = createFileRoute("/produits/")({
  head: () => ({
    meta: [
      {
        title: "Nos Produits — Meubles de bureau, fauteuils, armoires et plus | 2M Global Services",
      },
      {
        name: "description",
        content:
          "Parcourez le catalogue 2M Global Services : meubles de bureau, fauteuils, salon et chambre, armoires, électroniques et coffres-forts. Filtrez par catégorie, prix et réduction.",
      },
      { property: "og:title", content: "Nos Produits | 2M Global Services" },
      {
        property: "og:description",
        content: "Catalogue complet de mobilier de bureau et de maison à Dakar.",
      },
      { property: "og:url", content: "/produits" },
    ],
    links: [{ rel: "canonical", href: "/produits" }],
  }),
  validateSearch: (search: Record<string, unknown>): ProduitsSearch => searchSchema.parse(search),
  component: ProduitsPage,
});

function toggleInCsv(csv: string | undefined, value: string): string | undefined {
  const list = csv ? csv.split(",").filter(Boolean) : [];
  const idx = list.indexOf(value);
  if (idx >= 0) {
    list.splice(idx, 1);
  } else {
    list.push(value);
  }
  return list.length > 0 ? list.join(",") : undefined;
}

function ProduitsPage() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const allProducts = useAllProducts();
  const categories = useAllCategories();

  const selectedCategories = useMemo(
    () => (search.category ? search.category.split(",").filter(Boolean) : []),
    [search.category],
  );
  const selectedSubcategories = useMemo(
    () => (search.subcategory ? search.subcategory.split(",").filter(Boolean) : []),
    [search.subcategory],
  );
  const minDiscount = search.discount ?? 0;
  const newArrivalOnly = search.newArrival ?? false;
  const sort: SortOption = search.sort ?? "default";
  const priceMin = search.priceMin ?? PRICE_BOUNDS.min;
  const priceMax = search.priceMax ?? PRICE_BOUNDS.max;
  const page = search.page ?? 1;

  const filtered = useMemo(
    () =>
      filterAndSortProducts(allProducts, {
        query: search.q,
        categories: selectedCategories,
        subcategories: selectedSubcategories,
        priceMin: search.priceMin,
        priceMax: search.priceMax,
        minDiscount,
        newArrivalOnly,
        sort,
      }),
    [
      allProducts,
      search.q,
      selectedCategories,
      selectedSubcategories,
      search.priceMin,
      search.priceMax,
      minDiscount,
      newArrivalOnly,
      sort,
    ],
  );

  const total = filtered.length;
  const withDiscount = filtered.filter((p) => p.discountPercent > 0).length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const startIdx = (currentPage - 1) * PAGE_SIZE;
  const pageItems = filtered.slice(startIdx, startIdx + PAGE_SIZE);

  const pageNumbers = useMemo(() => {
    const nums = new Set<number>([1, totalPages, currentPage, currentPage - 1, currentPage + 1]);
    return Array.from(nums)
      .filter((n) => n >= 1 && n <= totalPages)
      .sort((a, b) => a - b);
  }, [currentPage, totalPages]);

  const hasActiveFilters =
    Boolean(search.q) ||
    selectedCategories.length > 0 ||
    selectedSubcategories.length > 0 ||
    minDiscount > 0 ||
    newArrivalOnly ||
    search.priceMin !== undefined ||
    search.priceMax !== undefined;

  function applyFilterChange(patch: Partial<ProduitsSearch>) {
    navigate({
      search: (prev: ProduitsSearch) => ({ ...prev, ...patch, page: undefined }),
      replace: true,
    });
  }

  function toggleCategory(slug: string) {
    applyFilterChange({ category: toggleInCsv(search.category, slug) });
  }

  function toggleSubcategory(slug: string) {
    applyFilterChange({ subcategory: toggleInCsv(search.subcategory, slug) });
  }

  function setDiscount(value: number) {
    applyFilterChange({ discount: value === 0 ? undefined : value });
  }

  function setNewArrival(checked: boolean) {
    applyFilterChange({ newArrival: checked ? true : undefined });
  }

  function setSort(value: SortOption) {
    applyFilterChange({ sort: value === "default" ? undefined : value });
  }

  function setPriceRange(values: number[]) {
    const [min, max] = values;
    applyFilterChange({
      priceMin: min <= PRICE_BOUNDS.min ? undefined : min,
      priceMax: max >= PRICE_BOUNDS.max ? undefined : max,
    });
  }

  function clearFilters() {
    navigate({ search: {}, replace: true });
  }

  const pillLabel = "font-display text-[12px] font-bold uppercase tracking-[0.1em]";

  const filterPanel = (
    <div className="flex flex-col gap-[14px]">
      <div className="rounded-[18px] border border-border bg-[var(--color-cream-light)] p-5">
        <div className={pillLabel + " mb-4 tracking-[0.14em]"}>Catégories</div>
        <div className="flex flex-col gap-[11px] text-[15px]">
          {categories.map((c) => (
            <div key={c.slug}>
              <label className="flex cursor-pointer items-center justify-between gap-2 text-[var(--color-muted-4)] hover:text-accent">
                <span className="flex items-center gap-2">
                  <Checkbox
                    checked={selectedCategories.includes(c.slug)}
                    onCheckedChange={() => toggleCategory(c.slug)}
                  />
                  {c.label}
                </span>
                <span className="text-muted-foreground">
                  {allProducts.filter((p) => p.categorySlug === c.slug).length}
                </span>
              </label>
              {c.subcategories && c.subcategories.length > 0 && (
                <div className="ml-6 mt-2 space-y-2 border-l border-border pl-3">
                  {c.subcategories.map((s) => (
                    <label
                      key={s.slug}
                      className="flex items-center gap-2 text-sm text-muted-foreground hover:text-accent"
                    >
                      <Checkbox
                        checked={selectedSubcategories.includes(s.slug)}
                        onCheckedChange={() => toggleSubcategory(s.slug)}
                      />
                      {s.label}
                    </label>
                  ))}
                </div>
              )}
            </div>
          ))}
          <label className="mt-1 flex items-center gap-2 border-t border-border pt-3 font-semibold text-foreground">
            <Checkbox
              checked={newArrivalOnly}
              onCheckedChange={(checked) => setNewArrival(checked === true)}
            />
            Nouvel Arrivage
          </label>
        </div>
      </div>

      <div className="rounded-[18px] border border-border bg-[var(--color-cream-light)] p-5">
        <div className={pillLabel + " mb-[18px] tracking-[0.14em]"}>Budget</div>
        <Slider
          min={PRICE_BOUNDS.min}
          max={PRICE_BOUNDS.max}
          step={5000}
          value={[priceMin, priceMax]}
          onValueChange={setPriceRange}
          aria-label="Fourchette de prix"
        />
        <div className="mt-3 flex justify-between text-[13px] text-muted-foreground">
          <span>{formatCFA(priceMin)}</span>
          <span>{formatCFA(priceMax)}</span>
        </div>
      </div>

      <div className="rounded-[18px] border border-border bg-[var(--color-cream-light)] p-5">
        <div className={pillLabel + " mb-4 tracking-[0.14em]"}>Réduction</div>
        <div className="flex flex-wrap gap-2">
          {DISCOUNT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setDiscount(minDiscount === opt.value ? 0 : opt.value)}
              className={`rounded-full px-[14px] py-2 font-display text-[12px] font-bold ${
                minDiscount === opt.value
                  ? "bg-primary text-primary-foreground"
                  : "border border-input text-foreground hover:border-accent hover:text-accent"
              }`}
            >
              {opt.value === 0 ? "Toutes" : `${opt.value}%+`}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-[18px] bg-primary p-5 text-primary-foreground">
        <div className="mb-2 font-display text-[15px] font-black uppercase">
          Besoin d&apos;aide ?
        </div>
        <p className="mb-4 text-[14px] leading-[1.6] text-primary-foreground/82">
          On vous conseille sur WhatsApp en moins de 10 minutes.
        </p>
        <a
          href={CONTACT.whatsapp}
          target="_blank"
          rel="noopener noreferrer"
          className="block rounded-full bg-[var(--color-gold-light)] px-3 py-3 text-center font-display text-[12px] font-extrabold uppercase tracking-[0.12em] text-[var(--color-ink)]"
        >
          Écrire maintenant
        </a>
      </div>

      {hasActiveFilters && (
        <Button variant="outline" size="sm" className="rounded-full" onClick={clearFilters}>
          Réinitialiser les filtres
        </Button>
      )}
    </div>
  );

  return (
    <main className="mx-auto max-w-[1320px] px-[18px] pb-[72px] pt-[30px] md:px-[28px]">
      <nav
        aria-label="Fil d'Ariane"
        className="mb-[18px] text-[11px] uppercase tracking-[0.2em] text-muted-foreground"
      >
        <a href="/" className="hover:text-accent">
          Accueil
        </a>{" "}
        — Catalogue
      </nav>

      <div className="mb-7 flex flex-wrap items-end justify-between gap-5">
        <div>
          <h1 className="m-0 text-[30px] md:text-[54px]">
            {search.q ? `Résultats pour « ${search.q} »` : "Tout le catalogue"}
          </h1>
          {search.q && (
            <button
              type="button"
              onClick={() => applyFilterChange({ q: undefined })}
              className="mt-2 font-display text-[12px] font-bold uppercase tracking-[0.1em] text-accent hover:underline"
            >
              Réinitialiser la recherche
            </button>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-3 text-[14px] text-muted-foreground">
          <span>
            {total} résultat{total === 1 ? "" : "s"} · {withDiscount} en promotion
          </span>
          <Select value={sort} onValueChange={(v) => setSort(v as SortOption)}>
            <SelectTrigger className="rounded-full border-border bg-[var(--color-cream-light)] font-display text-[12px] font-bold uppercase tracking-[0.1em] text-foreground">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-7 lg:grid-cols-[250px_1fr]">
        <aside className="hidden lg:block">{filterPanel}</aside>

        <div className="min-w-0">
          <Sheet>
            <SheetTrigger asChild className="mb-4 lg:hidden">
              <Button variant="outline" size="sm" className="rounded-full">
                <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
                Filtrer
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[85%] max-w-sm overflow-y-auto">
              <SheetHeader className="mb-4">
                <SheetTitle>Filtrer</SheetTitle>
              </SheetHeader>
              {filterPanel}
              <SheetClose asChild>
                <Button className="mt-6 w-full rounded-full">Voir les résultats</Button>
              </SheetClose>
            </SheetContent>
          </Sheet>

          {pageItems.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
              {pageItems.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-border py-16 text-center">
              <p className="text-base font-semibold text-foreground">
                Aucun produit ne correspond à vos filtres.
              </p>
              <p className="max-w-sm text-sm text-muted-foreground">
                Essayez d'élargir votre sélection ou réinitialisez les filtres pour voir tout le
                catalogue.
              </p>
              {hasActiveFilters && (
                <Button variant="outline" className="rounded-full" onClick={clearFilters}>
                  Réinitialiser les filtres
                </Button>
              )}
            </div>
          )}

          {totalPages > 1 && (
            <nav
              aria-label="Pagination"
              className="mt-9 flex flex-wrap items-center justify-center gap-[10px] font-display text-[13px] font-bold"
            >
              {currentPage > 1 ? (
                <Link
                  to="/produits"
                  search={(prev: ProduitsSearch) => ({
                    ...prev,
                    page: currentPage - 1 === 1 ? undefined : currentPage - 1,
                  })}
                  aria-label="Page précédente"
                  className="rounded-full border border-border px-4 py-[10px] hover:border-accent hover:text-accent"
                >
                  Précédent
                </Link>
              ) : (
                <span
                  aria-hidden="true"
                  className="cursor-not-allowed rounded-full border border-border px-4 py-[10px] text-muted-foreground opacity-50"
                >
                  Précédent
                </span>
              )}

              {pageNumbers.map((n, i) => (
                <span key={n} className="flex items-center gap-[10px]">
                  {i > 0 && n - pageNumbers[i - 1] > 1 && (
                    <span className="text-muted-foreground">…</span>
                  )}
                  {n === currentPage ? (
                    <span className="rounded-full bg-[var(--color-ink)] px-4 py-[10px] text-primary-foreground">
                      {n}
                    </span>
                  ) : (
                    <Link
                      to="/produits"
                      search={(prev: ProduitsSearch) => ({
                        ...prev,
                        page: n === 1 ? undefined : n,
                      })}
                      className="rounded-full border border-border px-4 py-[10px] hover:border-accent hover:text-accent"
                    >
                      {n}
                    </Link>
                  )}
                </span>
              ))}

              {currentPage < totalPages ? (
                <Link
                  to="/produits"
                  search={(prev: ProduitsSearch) => ({ ...prev, page: currentPage + 1 })}
                  aria-label="Page suivante"
                  className="rounded-full border border-[var(--color-ink)] px-4 py-[10px] hover:bg-[var(--color-ink)] hover:text-primary-foreground"
                >
                  Suivant
                </Link>
              ) : (
                <span
                  aria-hidden="true"
                  className="cursor-not-allowed rounded-full border border-border px-4 py-[10px] text-muted-foreground opacity-50"
                >
                  Suivant
                </span>
              )}
            </nav>
          )}
        </div>
      </div>
    </main>
  );
}
