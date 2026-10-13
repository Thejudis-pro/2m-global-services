import { useState } from "react";
import { toast } from "sonner";
import {
  ORDER_STATUS_LABELS,
  isSaleStatus,
  updateOrderStatus,
  useInvalidateOrders,
  type Order,
  type OrderStatus,
} from "@/lib/orders";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

// Raised by Postgres when the order_status enum doesn't have the value yet,
// i.e. the 20261013000000_order_status_cancelled_return migration isn't applied.
const MISSING_ENUM_VALUE = /invalid input value for enum/i;

export function OrderStatusSelect({ order, className }: { order: Order; className?: string }) {
  const invalidate = useInvalidateOrders();
  const [pendingStatus, setPendingStatus] = useState<OrderStatus | null>(null);

  async function confirm() {
    if (pendingStatus) {
      try {
        await updateOrderStatus(order, pendingStatus);
        await invalidate();
        toast.success("Statut de la commande mis à jour.");
      } catch (err) {
        const message = err instanceof Error ? err.message : (err as { message?: string })?.message;
        toast.error(
          message && MISSING_ENUM_VALUE.test(message)
            ? "Ce statut n'existe pas encore dans la base : appliquez la migration « annulée / retour »."
            : "Impossible de mettre à jour le statut.",
        );
      }
    }
    setPendingStatus(null);
  }

  return (
    <AlertDialog
      open={pendingStatus !== null}
      onOpenChange={(open) => {
        if (!open) setPendingStatus(null);
      }}
    >
      <Select value={order.status} onValueChange={(v) => setPendingStatus(v as OrderStatus)}>
        <SelectTrigger
          className={className ?? "w-40"}
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
            {pendingStatus && !isSaleStatus(pendingStatus) && isSaleStatus(order.status)
              ? " Cette commande ne sera plus comptée dans le chiffre d'affaires."
              : ""}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => setPendingStatus(null)}>Annuler</AlertDialogCancel>
          <AlertDialogAction onClick={confirm}>Confirmer</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
