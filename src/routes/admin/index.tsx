import { useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useAllOrders } from "@/lib/orders";
import { formatCFA } from "@/lib/format";
import { useRequireAdmin } from "@/hooks/use-require-admin";
import { AdminNav } from "@/components/AdminNav";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [{ title: "Administration | 2M Global Services" }],
  }),
  component: AdminDashboard,
});

function AdminDashboard() {
  const { checked, user } = useRequireAdmin();
  const orders = useAllOrders();

  const stats = useMemo(() => {
    const now = new Date();
    const revenueThisMonth = orders
      .filter((o) => {
        const d = new Date(o.createdAt);
        return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
      })
      .reduce((sum, o) => sum + o.total, 0);

    const salesByProduct = new Map<string, { name: string; quantity: number }>();
    for (const order of orders) {
      for (const item of order.items) {
        const existing = salesByProduct.get(item.productId);
        if (existing) {
          existing.quantity += item.quantity;
        } else {
          salesByProduct.set(item.productId, { name: item.name, quantity: item.quantity });
        }
      }
    }
    const topProducts = [...salesByProduct.values()]
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    return { revenueThisMonth, topProducts };
  }, [orders]);

  if (!checked || !user) {
    return <div className="mx-auto max-w-6xl px-4 py-16 md:px-6" aria-hidden="true" />;
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:px-6">
      <h1 className="text-2xl font-bold text-foreground md:text-3xl">Administration</h1>
      <p className="mt-2 text-sm text-muted-foreground">Bienvenue, {user.name}.</p>

      <AdminNav />

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-border p-6">
          <p className="text-sm text-muted-foreground">Commandes totales</p>
          <p className="mt-1 text-3xl font-black text-primary">{orders.length}</p>
        </div>
        <div className="rounded-xl border border-border p-6">
          <p className="text-sm text-muted-foreground">Chiffre d'affaires ce mois-ci</p>
          <p className="mt-1 text-3xl font-black text-primary">
            {formatCFA(stats.revenueThisMonth)}
          </p>
        </div>
      </div>

      <section className="mt-10">
        <h2 className="text-lg font-bold text-foreground">Top 5 des produits les plus vendus</h2>
        {stats.topProducts.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">
            Aucune vente enregistrée pour le moment.
          </p>
        ) : (
          <Table className="mt-4">
            <TableHeader>
              <TableRow>
                <TableHead>Produit</TableHead>
                <TableHead className="text-right">Quantité vendue</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stats.topProducts.map((p) => (
                <TableRow key={p.name}>
                  <TableCell className="font-medium text-foreground">{p.name}</TableCell>
                  <TableCell className="text-right">{p.quantity}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </section>
    </div>
  );
}
