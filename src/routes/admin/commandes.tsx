import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Download } from "lucide-react";
import { ORDER_STATUS_LABELS, useAllOrders, type Order, type OrderStatus } from "@/lib/orders";
import { exportOrdersCsv } from "@/lib/csv-export";
import { formatCFA } from "@/lib/format";
import { useRequireAdmin } from "@/hooks/use-require-admin";
import { AdminNav } from "@/components/AdminNav";
import { OrderDetailSheet } from "@/components/OrderDetailSheet";
import { OrderStatusSelect } from "@/components/OrderStatusSelect";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const PAGE_SIZE = 10;

export const Route = createFileRoute("/admin/commandes")({
  head: () => ({
    meta: [{ title: "Administration — Commandes | 2M Global Services" }],
  }),
  component: AdminOrdersPage,
});

function AdminOrdersPage() {
  const { checked, user } = useRequireAdmin();
  const orders = useAllOrders();
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");
  const [page, setPage] = useState(1);
  const [selectedOrderNumber, setSelectedOrderNumber] = useState<string | null>(null);

  const filtered = useMemo(
    () => (statusFilter === "all" ? orders : orders.filter((o) => o.status === statusFilter)),
    [orders, statusFilter],
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  // Looked up by number (not stored) so the open detail reflects status changes.
  const selectedOrder = orders.find((o) => o.orderNumber === selectedOrderNumber) ?? null;

  if (!checked || !user) {
    return <div className="mx-auto max-w-6xl px-4 py-16 md:px-6" aria-hidden="true" />;
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:px-6">
      <h1 className="text-2xl font-bold text-foreground md:text-3xl">Commandes</h1>
      <AdminNav />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Tabs
          value={statusFilter}
          onValueChange={(v) => {
            setStatusFilter(v as OrderStatus | "all");
            setPage(1);
          }}
          className="max-w-full overflow-x-auto"
        >
          <TabsList>
            <TabsTrigger value="all">Toutes</TabsTrigger>
            {Object.entries(ORDER_STATUS_LABELS).map(([value, label]) => (
              <TabsTrigger key={value} value={value}>
                {label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <Button
          variant="outline"
          size="sm"
          disabled={filtered.length === 0}
          onClick={() => exportOrdersCsv(filtered)}
        >
          <Download className="h-4 w-4" aria-hidden="true" />
          Exporter CSV ({filtered.length})
        </Button>
      </div>

      <div className="mt-4 overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>N° Commande</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Articles</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="text-right">Détail</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageItems.map((order) => (
              <AdminOrderRow
                key={order.orderNumber}
                order={order}
                onOpen={() => setSelectedOrderNumber(order.orderNumber)}
              />
            ))}
          </TableBody>
        </Table>
        {pageItems.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Aucune commande pour ce filtre.
          </p>
        )}
      </div>

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-center gap-3">
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage <= 1}
            onClick={() => setPage(currentPage - 1)}
          >
            Précédent
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {currentPage} sur {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage >= totalPages}
            onClick={() => setPage(currentPage + 1)}
          >
            Suivant
          </Button>
        </div>
      )}

      <OrderDetailSheet order={selectedOrder} onClose={() => setSelectedOrderNumber(null)} />
    </div>
  );
}

function AdminOrderRow({ order, onOpen }: { order: Order; onOpen: () => void }) {
  const itemCount = order.items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <TableRow className="cursor-pointer" onClick={onOpen}>
      <TableCell className="font-medium text-foreground">{order.orderNumber}</TableCell>
      <TableCell className="text-sm text-muted-foreground">
        {new Date(order.createdAt).toLocaleDateString("fr-FR")}
      </TableCell>
      <TableCell className="text-sm text-muted-foreground">
        <div className="text-foreground">{order.customerName}</div>
        <div>{order.phone}</div>
      </TableCell>
      <TableCell className="text-sm text-muted-foreground">
        {itemCount} article{itemCount === 1 ? "" : "s"}
      </TableCell>
      <TableCell className="font-semibold text-foreground">{formatCFA(order.total)}</TableCell>
      {/* Stops clicks (also the ones bubbling up from the confirmation dialog's
          portal) from opening the detail. */}
      <TableCell onClick={(e) => e.stopPropagation()}>
        <OrderStatusSelect order={order} />
      </TableCell>
      <TableCell className="text-right">
        <Button
          variant="ghost"
          size="sm"
          aria-label={`Voir le détail de la commande ${order.orderNumber}`}
          onClick={(e) => {
            e.stopPropagation();
            onOpen();
          }}
        >
          Voir
        </Button>
      </TableCell>
    </TableRow>
  );
}
