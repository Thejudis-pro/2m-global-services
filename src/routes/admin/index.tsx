import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useAllOrders, ORDER_STATUS_LABELS, type OrderStatus } from "@/lib/orders";
import { useAllProducts } from "@/lib/product-store";
import { useAllCategories } from "@/lib/category-store";
import { formatCFA } from "@/lib/format";
import { useRequireAdmin } from "@/hooks/use-require-admin";
import { AdminNav } from "@/components/AdminNav";

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [{ title: "Administration | 2M Global Services" }],
  }),
  component: AdminDashboard,
});

const DAY_LABELS = ["DIM", "LUN", "MAR", "MER", "JEU", "VEN", "SAM"];
const PERIOD_DAYS = 7;

const STATUS_PILL: Record<OrderStatus, string> = {
  nouvelle: "bg-[var(--color-cream-alt)] text-foreground",
  en_traitement: "bg-[var(--color-gold-light)] text-[var(--color-ink)]",
  expédiée: "bg-[var(--color-cream-alt)] text-foreground",
  terminée: "bg-[var(--color-ink)] text-primary-foreground",
};

function AdminDashboard() {
  const { checked, user } = useRequireAdmin();
  const orders = useAllOrders();
  const products = useAllProducts();
  const categories = useAllCategories();
  const [days] = useState(PERIOD_DAYS);

  const stats = useMemo(() => {
    const now = new Date();
    const periodStart = new Date(now);
    periodStart.setDate(now.getDate() - (days - 1));
    periodStart.setHours(0, 0, 0, 0);

    const periodOrders = orders.filter((o) => new Date(o.createdAt) >= periodStart);
    const revenue = periodOrders.reduce((sum, o) => sum + o.total, 0);
    const toPrepare = periodOrders.filter((o) => o.status === "nouvelle").length;
    const avgBasket = periodOrders.length > 0 ? Math.round(revenue / periodOrders.length) : 0;
    const outOfStock = products.filter((p) => p.stockQuantity === 0);

    const dailyTotals = Array.from({ length: days }, (_, i) => {
      const day = new Date(periodStart);
      day.setDate(periodStart.getDate() + i);
      const total = periodOrders
        .filter((o) => {
          const d = new Date(o.createdAt);
          return (
            d.getFullYear() === day.getFullYear() &&
            d.getMonth() === day.getMonth() &&
            d.getDate() === day.getDate()
          );
        })
        .reduce((sum, o) => sum + o.total, 0);
      return { label: DAY_LABELS[day.getDay()], total };
    });
    const maxDaily = Math.max(1, ...dailyTotals.map((d) => d.total));

    const productCategory = new Map(products.map((p) => [p.id, p.categorySlug]));
    const categoryRevenue = new Map<string, number>();
    let itemRevenueTotal = 0;
    for (const order of periodOrders) {
      for (const item of order.items) {
        const lineTotal = item.unitPrice * item.quantity;
        itemRevenueTotal += lineTotal;
        const slug = productCategory.get(item.productId);
        if (!slug) continue;
        categoryRevenue.set(slug, (categoryRevenue.get(slug) ?? 0) + lineTotal);
      }
    }
    const topCategories = [...categoryRevenue.entries()]
      .map(([slug, rev]) => ({
        slug,
        label: categories.find((c) => c.slug === slug)?.label ?? slug,
        percent: itemRevenueTotal > 0 ? Math.round((rev / itemRevenueTotal) * 100) : 0,
      }))
      .sort((a, b) => b.percent - a.percent)
      .slice(0, 4);

    const recentOrders = [...orders]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);

    const lowStock = [...products]
      .filter((p) => p.stockQuantity <= 5)
      .sort((a, b) => a.stockQuantity - b.stockQuantity)
      .slice(0, 4);

    return {
      revenue,
      ordersCount: periodOrders.length,
      toPrepare,
      avgBasket,
      outOfStock,
      dailyTotals,
      maxDaily,
      topCategories,
      recentOrders,
      lowStock,
    };
  }, [orders, products, categories, days]);

  if (!checked || !user) {
    return (
      <div className="mx-auto max-w-[1320px] px-[18px] py-16 md:px-[28px]" aria-hidden="true" />
    );
  }

  return (
    <main className="mx-auto max-w-[1320px] px-[18px] pb-[72px] pt-[30px] md:px-[28px]">
      <AdminNav />

      <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="mb-2 font-display text-[11px] font-bold uppercase tracking-[0.24em] text-accent">
            Espace gestion
          </div>
          <h1 className="m-0 text-[30px] md:text-[42px]">Tableau de bord</h1>
        </div>
        <div className="flex flex-wrap gap-3">
          <span className="rounded-full border border-border bg-[var(--color-cream-light)] px-[18px] py-[11px] font-display text-[12px] font-bold uppercase tracking-[0.08em]">
            {days} derniers jours
          </span>
          <Link
            to="/admin/produits"
            className="rounded-full bg-[var(--color-ink)] px-[18px] py-[11px] font-display text-[12px] font-bold uppercase tracking-[0.08em] text-primary-foreground hover:bg-primary"
          >
            + Nouveau produit
          </Link>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-[20px] bg-primary p-6 text-primary-foreground">
          <div className="text-[10px] uppercase tracking-[0.2em] text-primary-foreground/70">
            CA de la période
          </div>
          <div className="mt-2 font-display text-[30px] font-black text-[var(--color-gold-light)]">
            {formatCFA(stats.revenue)}
          </div>
          <div className="mt-1 text-[13px] text-primary-foreground/70">
            {stats.ordersCount} commande{stats.ordersCount === 1 ? "" : "s"}
          </div>
        </div>
        <div className="rounded-[20px] border border-border bg-[var(--color-cream-light)] p-6">
          <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            Commandes
          </div>
          <div className="mt-2 font-display text-[30px] font-black">{stats.ordersCount}</div>
          <div className="mt-1 text-[13px] text-muted-foreground">
            dont {stats.toPrepare} à préparer
          </div>
        </div>
        <div className="rounded-[20px] border border-border bg-[var(--color-cream-light)] p-6">
          <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            Panier moyen
          </div>
          <div className="mt-2 font-display text-[30px] font-black">
            {formatCFA(stats.avgBasket)}
          </div>
        </div>
        <div className="rounded-[20px] border border-border bg-[var(--color-cream-light)] p-6">
          <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            Ruptures
          </div>
          <div className="mt-2 font-display text-[30px] font-black text-destructive">
            {stats.outOfStock.length}
          </div>
          <div className="mt-1 text-[13px] text-muted-foreground">
            références à réapprovisionner
          </div>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-[1.4fr_1fr]">
        <div className="rounded-[20px] border border-border bg-[var(--color-cream-light)] p-6">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="m-0 text-[16px]">Ventes par jour</h2>
            <span className="text-[12px] text-muted-foreground">en milliers de CFA</span>
          </div>
          {stats.revenue > 0 ? (
            <div className="flex items-end justify-between gap-2 px-1" style={{ height: 180 }}>
              {stats.dailyTotals.map((d, i) => (
                <div key={i} className="flex flex-1 flex-col items-center gap-2">
                  <span className="text-[11px] text-muted-foreground">
                    {d.total > 0 ? Math.round(d.total / 1000) : ""}
                  </span>
                  <div
                    className={`w-full rounded-md ${
                      d.total === stats.maxDaily && d.total > 0
                        ? "bg-primary"
                        : "bg-[var(--color-taupe-200)]"
                    }`}
                    style={{ height: Math.max(4, (d.total / stats.maxDaily) * 130) }}
                  />
                  <span className="text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
                    {d.label}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="py-10 text-center text-sm text-muted-foreground">
              Aucune vente enregistrée sur cette période.
            </p>
          )}
        </div>

        <div className="rounded-[20px] border border-border bg-[var(--color-cream-light)] p-6">
          <h2 className="m-0 mb-5 text-[16px]">Top catégories</h2>
          {stats.topCategories.length > 0 ? (
            <div className="flex flex-col gap-4">
              {stats.topCategories.map((c) => (
                <div key={c.slug}>
                  <div className="mb-1.5 flex items-center justify-between text-[13px] font-medium">
                    <span>{c.label}</span>
                    <span>{c.percent}%</span>
                  </div>
                  <div className="h-[6px] overflow-hidden rounded-full bg-[var(--color-taupe-200)]">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${c.percent}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="py-10 text-center text-sm text-muted-foreground">
              Pas encore de ventes à répartir par catégorie.
            </p>
          )}
        </div>
      </div>

      <div className="mb-6 rounded-[20px] border border-border bg-[var(--color-cream-light)] p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="m-0 text-[16px]">Commandes récentes</h2>
          <Link
            to="/admin/commandes"
            className="font-display text-[11px] font-bold uppercase tracking-[0.1em] text-accent"
          >
            Tout voir
          </Link>
        </div>
        {stats.recentOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-[14px]">
              <thead>
                <tr className="border-b border-border text-left text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
                  <th className="pb-3 font-medium">Référence</th>
                  <th className="pb-3 font-medium">Client</th>
                  <th className="pb-3 font-medium">Articles</th>
                  <th className="pb-3 font-medium">Montant</th>
                  <th className="pb-3 font-medium">Statut</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentOrders.map((o) => (
                  <tr key={o.orderNumber} className="border-b border-border last:border-0">
                    <td className="py-3 font-display font-bold">#{o.orderNumber}</td>
                    <td className="py-3 text-accent">{o.customerName}</td>
                    <td className="py-3 text-muted-foreground">
                      {o.items.length} article{o.items.length === 1 ? "" : "s"}
                    </td>
                    <td className="py-3 font-display font-bold">{formatCFA(o.total)}</td>
                    <td className="py-3">
                      <span
                        className={`rounded-full px-3 py-1 font-display text-[11px] font-bold uppercase tracking-[0.06em] ${STATUS_PILL[o.status]}`}
                      >
                        {ORDER_STATUS_LABELS[o.status]}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Aucune commande enregistrée pour le moment.
          </p>
        )}
      </div>

      <div className="rounded-[20px] border border-border bg-[var(--color-cream-light)] p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="m-0 text-[16px]">Stock à surveiller</h2>
          <Link
            to="/admin/produits"
            className="font-display text-[11px] font-bold uppercase tracking-[0.1em] text-accent"
          >
            Gérer le catalogue
          </Link>
        </div>
        {stats.lowStock.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {stats.lowStock.map((p) => (
              <Link
                key={p.id}
                to="/admin/produits"
                className="flex items-center gap-3 rounded-2xl border border-border bg-background p-3 hover:border-accent"
              >
                <div className="h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-[var(--color-placeholder)]">
                  <img src={p.image} alt={p.alt} className="h-full w-full object-cover" />
                </div>
                <div className="min-w-0">
                  <div className="truncate text-[13px] font-semibold leading-tight">{p.name}</div>
                  <div
                    className={`text-[12px] ${p.stockQuantity === 0 ? "text-destructive" : "text-accent"}`}
                  >
                    {p.stockQuantity === 0
                      ? "Rupture — 0 en stock"
                      : `${p.stockQuantity} restant${p.stockQuantity === 1 ? "" : "s"}`}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Tous les produits sont bien approvisionnés.
          </p>
        )}
      </div>
    </main>
  );
}
