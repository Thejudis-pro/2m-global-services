import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import {
  ORDER_STATUS_LABELS,
  updateOrderStatus,
  useAllOrders,
  type Order,
  type OrderStatus,
} from "@/lib/orders";
import { formatCFA } from "@/lib/format";
import { useRequireAdmin } from "@/hooks/use-require-admin";
import { AdminNav } from "@/components/AdminNav";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const PAGE_SIZE = 10;

export const Route = createFileRoute("/admin/commandes")({
  head: () => ({
    meta: [{ title: "Administration — Commandes | Techno Office Sarl" }],
  }),
  component: AdminOrdersPage,
});

function AdminOrdersPage() {
  const { checked, user } = useRequireAdmin();
  const orders = useAllOrders();
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");
  const [page, setPage] = useState(1);

  const filtered = useMemo(
    () => (statusFilter === "all" ? orders : orders.filter((o) => o.status === statusFilter)),
    [orders, statusFilter],
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  if (!checked || !user) {
    return <div className="mx-auto max-w-6xl px-4 py-16 md:px-6" aria-hidden="true" />;
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:px-6">
      <h1 className="text-2xl font-bold text-foreground md:text-3xl">Commandes</h1>
      <AdminNav />

      <Tabs
        value={statusFilter}
        onValueChange={(v) => {
          setStatusFilter(v as OrderStatus | "all");
          setPage(1);
        }}
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

      <div className="mt-4 overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>N° Commande</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Statut</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageItems.map((order) => (
              <AdminOrderRow key={order.orderNumber} order={order} />
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
    </div>
  );
}

function AdminOrderRow({ order }: { order: Order }) {
  const [pendingStatus, setPendingStatus] = useState<OrderStatus | null>(null);

  return (
    <TableRow>
      <TableCell className="font-medium text-foreground">{order.orderNumber}</TableCell>
      <TableCell className="text-sm text-muted-foreground">
        {new Date(order.createdAt).toLocaleDateString("fr-FR")}
      </TableCell>
      <TableCell className="text-sm text-muted-foreground">{order.customerName}</TableCell>
      <TableCell className="font-semibold text-foreground">{formatCFA(order.total)}</TableCell>
      <TableCell>
        <AlertDialog
          open={pendingStatus !== null}
          onOpenChange={(open) => {
            if (!open) setPendingStatus(null);
          }}
        >
          <Select value={order.status} onValueChange={(v) => setPendingStatus(v as OrderStatus)}>
            <SelectTrigger
              className="w-40"
              aria-label={`Statut de la commande ${order.orderNumber}`}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(ORDER_STATUS_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                Changer le statut de la commande {order.orderNumber} ?
              </AlertDialogTitle>
              <AlertDialogDescription>
                Le statut passera de « {ORDER_STATUS_LABELS[order.status]} » à «{" "}
                {pendingStatus ? ORDER_STATUS_LABELS[pendingStatus] : ""} ».
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setPendingStatus(null)}>Annuler</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  if (pendingStatus) {
                    updateOrderStatus(order.orderNumber, pendingStatus);
                    toast.success("Statut de la commande mis à jour.");
                  }
                  setPendingStatus(null);
                }}
              >
                Confirmer
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </TableCell>
    </TableRow>
  );
}
