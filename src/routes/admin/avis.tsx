import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { Check, Star, X } from "lucide-react";
import { reviewsStore, usePendingReviews } from "@/lib/reviews-store";
import { useAllProducts } from "@/lib/product-store";
import { useRequireAdmin } from "@/hooks/use-require-admin";
import { AdminNav } from "@/components/AdminNav";
import { Button } from "@/components/ui/button";
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const PAGE_SIZE = 10;

export const Route = createFileRoute("/admin/avis")({
  head: () => ({
    meta: [{ title: "Administration — Avis | Techno Office Sarl" }],
  }),
  component: AdminReviewsPage,
});

function AdminReviewsPage() {
  const { checked, user } = useRequireAdmin();
  const pending = usePendingReviews();
  const products = useAllProducts();
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(pending.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = pending.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  if (!checked || !user) {
    return <div className="mx-auto max-w-6xl px-4 py-16 md:px-6" aria-hidden="true" />;
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:px-6">
      <h1 className="text-2xl font-bold text-foreground md:text-3xl">Avis en attente</h1>
      <AdminNav />

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Produit</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Note</TableHead>
              <TableHead>Commentaire</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageItems.map((review) => {
              const productName =
                products.find((p) => p.id === review.productId)?.name ?? review.productId;
              return (
                <TableRow key={review.id}>
                  <TableCell className="max-w-[160px] truncate font-medium text-foreground">
                    {productName}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{review.name}</TableCell>
                  <TableCell>
                    <div
                      className="flex items-center gap-0.5"
                      aria-label={`${review.rating} sur 5`}
                    >
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-3.5 w-3.5 ${
                            i < review.rating
                              ? "fill-primary text-primary"
                              : "text-muted-foreground"
                          }`}
                        />
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-xs text-sm text-muted-foreground">
                    {review.comment}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{review.date}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="icon" aria-label="Approuver cet avis">
                            <Check className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Approuver cet avis ?</AlertDialogTitle>
                            <AlertDialogDescription>
                              L'avis de {review.name} sur « {productName} » deviendra visible
                              publiquement.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Annuler</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => {
                                reviewsStore.approve(review.id);
                                toast.success("Avis approuvé.");
                              }}
                            >
                              Approuver
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" aria-label="Rejeter cet avis">
                            <X className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Rejeter cet avis ?</AlertDialogTitle>
                            <AlertDialogDescription>
                              L'avis de {review.name} sur « {productName} » sera définitivement
                              supprimé.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Annuler</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => {
                                reviewsStore.reject(review.id);
                                toast.success("Avis rejeté.");
                              }}
                            >
                              Rejeter
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        {pageItems.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Aucun avis en attente de modération.
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
