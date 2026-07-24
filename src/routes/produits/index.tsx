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
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
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
        title: "Nos Produits — Meubles de bureau, fauteuils, armoires et plus | Techno Office Sarl",
      },
      {
        name: "description",
        content:
          "Parcourez le catalogue Techno Office Sarl : meubles de bureau, fauteuils, salon et chambre, armoires, électroniques et coffres-forts. Filtrez par catégorie, prix et réduction.",
      },
      { property: "og:title", content: "Nos Produits | Techno Office Sarl" },
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
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const startIdx = (currentPage - 1) * PAGE_SIZE;
  const pageItems = filtered.slice(startIdx, startIdx + PAGE_SIZE);
  const rangeStart = total === 0 ? 0 : startIdx + 1;
  const rangeEnd = Math.min(startIdx + PAGE_SIZE, total);

  const hasActiveFilters =
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

  function goToPage(nextPage: number) {
    navigate({
      search: (prev: ProduitsSearch) => ({ ...prev, page: nextPage === 1 ? undefined : nextPage }),
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

  const filterPanel = (
    <div className="space-y-6">
      <div>
        <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-foreground">
          Catégories
        </h3>
        <div className="space-y-4">
          {categories.map((c) => (
            <div key={c.slug}>
              <label className="flex items-center gap-2 text-sm text-foreground">
                <Checkbox
                  checked={selectedCategories.includes(c.slug)}
                  onCheckedChange={() => toggleCategory(c.slug)}
                />
                {c.label}
              </label>
              {c.subcategories && c.subcategories.length > 0 && (
                <div className="ml-6 mt-2 space-y-2 border-l border-border pl-3">
                  {c.subcategories.map((s) => (
                    <label
                      key={s.slug}
                      className="flex items-center gap-2 text-sm text-muted-foreground"
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
        </div>
      </div>

      <div>
        <label className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <Checkbox
            checked={newArrivalOnly}
            onCheckedChange={(checked) => setNewArrival(checked === true)}
          />
          Nouvel Arrivage
        </label>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-foreground">Prix</h3>
        <Slider
          min={PRICE_BOUNDS.min}
          max={PRICE_BOUNDS.max}
          step={5000}
          value={[priceMin, priceMax]}
          onValueChange={setPriceRange}
          aria-label="Fourchette de prix"
        />
        <div className="mt-2 flex justify-between text-xs text-muted-foreground">
          <span>{formatCFA(priceMin)}</span>
          <span>{formatCFA(priceMax)}</span>
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-foreground">
          Réduction
        </h3>
        <RadioGroup value={String(minDiscount)} onValueChange={(v) => setDiscount(Number(v))}>
          {DISCOUNT_OPTIONS.map((opt) => (
            <label key={opt.value} className="flex items-center gap-2 text-sm text-foreground">
              <RadioGroupItem value={String(opt.value)} />
              {opt.label}
            </label>
          ))}
        </RadioGroup>
      </div>

      {hasActiveFilters && (
        <Button variant="outline" size="sm" className="w-full" onClick={clearFilters}>
          Réinitialiser les filtres
        </Button>
      )}
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
      <nav aria-label="Fil d'Ariane" className="mb-4 text-sm text-muted-foreground">
        <ol className="flex flex-wrap items-center gap-1">
          <li>
            <a href="/" className="hover:text-primary hover:underline">
              Accueil
            </a>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="font-medium text-foreground">
            Nos Produits
          </li>
        </ol>
      </nav>

      <h1 className="text-2xl font-bold text-foreground md:text-3xl">Nos Produits</h1>

      <div className="mt-6 grid gap-8 lg:grid-cols-[240px_1fr]">
        <aside className="hidden lg:block">{filterPanel}</aside>

        <div>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <Sheet>
              <SheetTrigger asChild className="lg:hidden">
                <Button variant="outline" size="sm">
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
                  <Button className="mt-6 w-full">Voir les résultats</Button>
                </SheetClose>
              </SheetContent>
            </Sheet>

            <p className="text-sm text-muted-foreground">
              {total > 0
                ? `Affichage de ${rangeStart}–${rangeEnd} sur ${total} résultat${total === 1 ? "" : "s"}`
                : "Affichage de 0 sur 0 résultat"}
            </p>

            <div className="flex items-center gap-2">
              <label htmlFor="sort-select" className="text-sm text-muted-foreground">
                Trier par
              </label>
              <Select value={sort} onValueChange={(v) => setSort(v as SortOption)}>
                <SelectTrigger id="sort-select" className="w-[200px]">
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

          {pageItems.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
              {pageItems.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4 rounded-xl border border-dashed border-border py-16 text-center">
              <p className="text-base font-semibold text-foreground">
                Aucun produit ne correspond à vos filtres.
              </p>
              <p className="max-w-sm text-sm text-muted-foreground">
                Essayez d'élargir votre sélection ou réinitialisez les filtres pour voir tout le
                catalogue.
              </p>
              {hasActiveFilters && (
                <Button variant="outline" onClick={clearFilters}>
                  Réinitialiser les filtres
                </Button>
              )}
            </div>
          )}

          {totalPages > 1 && (
            <nav aria-label="Pagination" className="mt-10 flex items-center justify-center gap-2">
              {currentPage > 1 ? (
                <Link
                  to="/produits"
                  search={(prev: ProduitsSearch) => ({
                    ...prev,
                    page: currentPage - 1 === 1 ? undefined : currentPage - 1,
                  })}
                  aria-label="Page précédente"
                  className="inline-flex h-9 items-center justify-center rounded-md border border-input px-4 text-sm font-medium hover:bg-accent"
                >
                  Précédent
                </Link>
              ) : (
                <span
                  aria-hidden="true"
                  className="inline-flex h-9 cursor-not-allowed items-center justify-center rounded-md border border-input px-4 text-sm font-medium text-muted-foreground opacity-50"
                >
                  Précédent
                </span>
              )}

              <span className="px-2 text-sm text-muted-foreground">
                Page {currentPage} sur {totalPages}
              </span>

              {currentPage < totalPages ? (
                <Link
                  to="/produits"
                  search={(prev: ProduitsSearch) => ({ ...prev, page: currentPage + 1 })}
                  aria-label="Page suivante"
                  className="inline-flex h-9 items-center justify-center rounded-md border border-input px-4 text-sm font-medium hover:bg-accent"
                >
                  Suivant
                </Link>
              ) : (
                <span
                  aria-hidden="true"
                  className="inline-flex h-9 cursor-not-allowed items-center justify-center rounded-md border border-input px-4 text-sm font-medium text-muted-foreground opacity-50"
                >
                  Suivant
                </span>
              )}
            </nav>
          )}
        </div>
      </div>
    </div>
  );
}
