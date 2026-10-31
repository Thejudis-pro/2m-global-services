import { useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { getSalePrice } from "@/lib/products";
import { useAllProducts } from "@/lib/product-store";
import { useAllCategories } from "@/lib/category-store";
import { CATEGORIES } from "@/lib/categories";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { FUEL_OPTIONS, GEARBOX_OPTIONS, VEHICLE_CATEGORY_SLUG } from "@/lib/vehicles";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const SORTS = {
  recent: "Plus récents",
  "price-asc": "Prix croissant",
  "price-desc": "Prix décroissant",
  year: "Année (plus récente)",
  mileage: "Kilométrage (plus faible)",
} as const;
type VehicleSort = keyof typeof SORTS;

const searchSchema = z.object({
  type: z.string().optional(),
  marque: z.string().optional(),
  carburant: z.string().optional(),
  boite: z.string().optional(),
  tri: z.enum(Object.keys(SORTS) as [VehicleSort, ...VehicleSort[]]).optional(),
});
type VehiclesSearch = z.infer<typeof searchSchema>;

export const Route = createFileRoute("/vehicules")({
  head: () => ({
    meta: [
      { title: "Véhicules à vendre à Dakar | 2M Global Services" },
      {
        name: "description",
        content:
          "Voitures à vendre chez 2M Global Services à Dakar : berlines, SUV, 4x4, pick-up. Fiches détaillées (année, kilométrage, carburant) et contact direct sur WhatsApp.",
      },
      { property: "og:title", content: "Véhicules à vendre | 2M Global Services" },
      { property: "og:url", content: "/vehicules" },
    ],
    links: [{ rel: "canonical", href: "/vehicules" }],
  }),
  validateSearch: (search: Record<string, unknown>): VehiclesSearch => searchSchema.parse(search),
  component: VehiclesPage,
});

const pillBase =
  "rounded-full border px-4 py-2 font-display text-[11px] font-bold uppercase tracking-[0.12em] transition-colors";

function FilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value?: string;
  options: readonly string[];
  onChange: (value: string | undefined) => void;
}) {
  return (
    <Select value={value ?? "all"} onValueChange={(v) => onChange(v === "all" ? undefined : v)}>
      <SelectTrigger
        aria-label={label}
        className="w-auto min-w-[150px] rounded-full border-border bg-[var(--color-cream-light)] font-display text-[12px] font-bold uppercase tracking-[0.1em] text-foreground"
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">{label} : tous</SelectItem>
        {options.map((o) => (
          <SelectItem key={o} value={o}>
            {o}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function VehiclesPage() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const allProducts = useAllProducts();
  const categories = useAllCategories();

  const vehicles = useMemo(
    () => allProducts.filter((p) => p.categorySlug === VEHICLE_CATEGORY_SLUG),
    [allProducts],
  );

  const subcategories = useMemo(() => {
    const defs =
      categories.find((c) => c.slug === VEHICLE_CATEGORY_SLUG)?.subcategories ??
      CATEGORIES.find((c) => c.slug === VEHICLE_CATEGORY_SLUG)?.subcategories ??
      [];
    return defs.filter((s) => vehicles.some((v) => v.subcategorySlug === s.slug));
  }, [categories, vehicles]);

  const brands = useMemo(
    () =>
      [
        ...new Set(vehicles.map((v) => v.vehicle?.brand).filter((b): b is string => Boolean(b))),
      ].sort((a, b) => a.localeCompare(b, "fr")),
    [vehicles],
  );

  const sort: VehicleSort = search.tri ?? "recent";

  const results = useMemo(() => {
    const filtered = vehicles.filter((p) => {
      const v = p.vehicle;
      if (search.type && p.subcategorySlug !== search.type) return false;
      if (search.marque && v?.brand !== search.marque) return false;
      if (search.carburant && v?.fuel !== search.carburant) return false;
      if (search.boite && v?.gearbox !== search.boite) return false;
      return true;
    });
    return [...filtered].sort((a, b) => {
      switch (sort) {
        case "price-asc":
          return getSalePrice(a) - getSalePrice(b);
        case "price-desc":
          return getSalePrice(b) - getSalePrice(a);
        case "year":
          return (b.vehicle?.year ?? 0) - (a.vehicle?.year ?? 0);
        case "mileage":
          return (
            (a.vehicle?.mileageKm ?? Number.MAX_SAFE_INTEGER) -
            (b.vehicle?.mileageKm ?? Number.MAX_SAFE_INTEGER)
          );
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });
  }, [vehicles, search, sort]);

  const hasFilters = Boolean(search.type || search.marque || search.carburant || search.boite);

  function update(patch: Partial<VehiclesSearch>) {
    navigate({ search: (prev: VehiclesSearch) => ({ ...prev, ...patch }), replace: true });
  }

  const requestUrl = buildWhatsAppUrl(
    "Bonjour, je cherche un véhicule précis. Voici ce que je recherche : ",
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
        — Véhicules
      </nav>

      <div className="mb-7 flex flex-wrap items-end justify-between gap-5">
        <div>
          <div className="mb-2 text-[10px] font-bold uppercase tracking-[0.24em] text-accent">
            Showroom auto · Dakar
          </div>
          <h1 className="m-0 text-[30px] md:text-[54px]">Véhicules à vendre</h1>
          <p className="mt-3 max-w-[56ch] text-[15px] leading-[1.7] text-muted-foreground">
            Chaque véhicule est visible sur rendez-vous. Écrivez-nous sur WhatsApp pour plus de
            photos, l&apos;historique ou un essai.
          </p>
        </div>
        <span className="text-[14px] text-muted-foreground">
          {results.length} véhicule{results.length === 1 ? "" : "s"}
        </span>
      </div>

      {vehicles.length > 0 && (
        <div className="mb-8 flex flex-col gap-4">
          {subcategories.length > 0 && (
            <div className="flex flex-wrap gap-2" role="group" aria-label="Type de véhicule">
              <button
                type="button"
                onClick={() => update({ type: undefined })}
                aria-pressed={!search.type}
                className={`${pillBase} ${
                  !search.type
                    ? "border-[var(--color-ink)] bg-[var(--color-ink)] text-primary-foreground"
                    : "border-border hover:border-accent"
                }`}
              >
                Tous
              </button>
              {subcategories.map((s) => (
                <button
                  key={s.slug}
                  type="button"
                  onClick={() => update({ type: search.type === s.slug ? undefined : s.slug })}
                  aria-pressed={search.type === s.slug}
                  className={`${pillBase} ${
                    search.type === s.slug
                      ? "border-[var(--color-ink)] bg-[var(--color-ink)] text-primary-foreground"
                      : "border-border hover:border-accent"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          )}
          <div className="flex flex-wrap items-center gap-3">
            {brands.length > 1 && (
              <FilterSelect
                label="Marque"
                value={search.marque}
                options={brands}
                onChange={(v) => update({ marque: v })}
              />
            )}
            <FilterSelect
              label="Carburant"
              value={search.carburant}
              options={FUEL_OPTIONS}
              onChange={(v) => update({ carburant: v })}
            />
            <FilterSelect
              label="Boîte"
              value={search.boite}
              options={GEARBOX_OPTIONS}
              onChange={(v) => update({ boite: v })}
            />
            <Select value={sort} onValueChange={(v) => update({ tri: v as VehicleSort })}>
              <SelectTrigger
                aria-label="Trier"
                className="w-auto min-w-[170px] rounded-full border-border bg-[var(--color-cream-light)] font-display text-[12px] font-bold uppercase tracking-[0.1em] text-foreground"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(SORTS) as VehicleSort[]).map((k) => (
                  <SelectItem key={k} value={k}>
                    {SORTS[k]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {hasFilters && (
              <button
                type="button"
                onClick={() =>
                  update({
                    type: undefined,
                    marque: undefined,
                    carburant: undefined,
                    boite: undefined,
                  })
                }
                className="font-display text-[12px] font-bold uppercase tracking-[0.1em] text-accent hover:underline"
              >
                Réinitialiser
              </button>
            )}
          </div>
        </div>
      )}

      {results.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {results.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-border py-16 text-center">
          <p className="text-base font-semibold text-foreground">
            {vehicles.length === 0
              ? "Nos prochains véhicules arrivent bientôt."
              : "Aucun véhicule ne correspond à vos filtres."}
          </p>
          <p className="max-w-sm text-sm text-muted-foreground">
            Vous cherchez un modèle précis ? Dites-nous ce qu&apos;il vous faut, on vous prévient
            dès qu&apos;on l&apos;a.
          </p>
          <Button asChild className="rounded-full">
            <a href={requestUrl} target="_blank" rel="noopener noreferrer">
              Je cherche un véhicule
            </a>
          </Button>
        </div>
      )}

      {results.length > 0 && (
        <section className="mt-14 flex flex-wrap items-center justify-between gap-5 rounded-[22px] bg-[var(--color-ink)] p-7 text-primary-foreground md:p-10">
          <div>
            <h2 className="m-0 text-[22px] text-primary-foreground md:text-[30px]">
              Vous ne trouvez pas votre modèle ?
            </h2>
            <p className="mt-2 max-w-[52ch] text-[15px] opacity-80">
              Donnez-nous la marque, le budget et l&apos;année. On cherche pour vous.
            </p>
          </div>
          <a
            href={requestUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-accent px-6 py-4 font-display text-[12px] font-extrabold uppercase tracking-[0.14em] text-[var(--color-ink)] transition-opacity hover:opacity-90"
          >
            Écrire sur WhatsApp
          </a>
        </section>
      )}
    </main>
  );
}
