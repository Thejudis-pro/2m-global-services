import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { Loader2, Pencil, Plus, Trash2, X } from "lucide-react";
import type { Product } from "@/lib/products";
import { productStore, useAllProducts } from "@/lib/product-store";
import { useAllCategories } from "@/lib/category-store";
import type { Category } from "@/lib/categories";
import { formatCFA } from "@/lib/format";
import { compressImageFile } from "@/lib/image-compression";
import { useRequireAdmin } from "@/hooks/use-require-admin";
import { AdminNav } from "@/components/AdminNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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

export const Route = createFileRoute("/admin/produits")({
  head: () => ({
    meta: [{ title: "Administration — Produits | Techno Office Sarl" }],
  }),
  component: AdminProductsPage,
});

function AdminProductsPage() {
  const { checked, user } = useRequireAdmin();
  const products = useAllProducts();
  const categories = useAllCategories();

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [dialogState, setDialogState] = useState<
    { mode: "add" } | { mode: "edit"; product: Product } | null
  >(null);
  const [bulkDiscount, setBulkDiscount] = useState("");
  const [bulkCategory, setBulkCategory] = useState("");

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return products.filter((p) => {
      if (categoryFilter !== "all" && p.categorySlug !== categoryFilter) return false;
      if (!query) return true;
      return p.name.toLowerCase().includes(query) || (p.sku ?? "").toLowerCase().includes(query);
    });
  }, [products, search, categoryFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  if (!checked || !user) {
    return <div className="mx-auto max-w-6xl px-4 py-16 md:px-6" aria-hidden="true" />;
  }

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleSelectAllOnPage() {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      const allSelected = pageItems.every((p) => next.has(p.id));
      pageItems.forEach((p) => (allSelected ? next.delete(p.id) : next.add(p.id)));
      return next;
    });
  }

  function handleBulkDiscount() {
    const value = Number(bulkDiscount);
    if (Number.isNaN(value) || value < 0 || value > 100) {
      toast.error("Veuillez entrer un pourcentage valide (0-100).");
      return;
    }
    productStore.bulkUpdateDiscount([...selectedIds], value);
    toast.success(`Réduction de ${value}% appliquée à ${selectedIds.size} produit(s).`);
    setSelectedIds(new Set());
    setBulkDiscount("");
  }

  function handleBulkCategory() {
    if (!bulkCategory) {
      toast.error("Veuillez choisir une catégorie.");
      return;
    }
    productStore.bulkReassignCategory([...selectedIds], bulkCategory);
    toast.success(`Catégorie mise à jour pour ${selectedIds.size} produit(s).`);
    setSelectedIds(new Set());
    setBulkCategory("");
  }

  function handleDelete(product: Product) {
    productStore.deleteProduct(product.id);
    toast.success(`« ${product.name} » supprimé.`);
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.delete(product.id);
      return next;
    });
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:px-6">
      <h1 className="text-2xl font-bold text-foreground md:text-3xl">Produits</h1>
      <AdminNav />

      <div className="flex flex-wrap items-center gap-3">
        <Input
          placeholder="Rechercher par nom ou SKU"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="max-w-xs"
          aria-label="Rechercher un produit"
        />
        <Select
          value={categoryFilter}
          onValueChange={(v) => {
            setCategoryFilter(v);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-56">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les catégories</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c.slug} value={c.slug}>
                {c.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button className="ml-auto" onClick={() => setDialogState({ mode: "add" })}>
          <Plus className="h-4 w-4" aria-hidden="true" />
          Ajouter un produit
        </Button>
      </div>

      {selectedIds.size > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-3 rounded-lg border border-border bg-secondary/30 p-4">
          <span className="text-sm font-medium text-foreground">
            {selectedIds.size} sélectionné(s)
          </span>
          <Input
            type="number"
            min={0}
            max={100}
            placeholder="% réduction"
            value={bulkDiscount}
            onChange={(e) => setBulkDiscount(e.target.value)}
            className="w-32"
            aria-label="Pourcentage de réduction en masse"
          />
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm">
                Appliquer la réduction
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Appliquer une réduction en masse ?</AlertDialogTitle>
                <AlertDialogDescription>
                  Cette réduction remplacera la réduction actuelle de {selectedIds.size} produit(s)
                  sélectionné(s).
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Annuler</AlertDialogCancel>
                <AlertDialogAction onClick={handleBulkDiscount}>Confirmer</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <Select value={bulkCategory} onValueChange={setBulkCategory}>
            <SelectTrigger className="w-56">
              <SelectValue placeholder="Nouvelle catégorie" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((c) => (
                <SelectItem key={c.slug} value={c.slug}>
                  {c.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm">
                Réassigner la catégorie
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Réassigner la catégorie ?</AlertDialogTitle>
                <AlertDialogDescription>
                  {selectedIds.size} produit(s) seront déplacés vers cette catégorie.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Annuler</AlertDialogCancel>
                <AlertDialogAction onClick={handleBulkCategory}>Confirmer</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <Button variant="ghost" size="sm" onClick={() => setSelectedIds(new Set())}>
            Tout désélectionner
          </Button>
        </div>
      )}

      <div className="mt-4 overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">
                <Checkbox
                  checked={pageItems.length > 0 && pageItems.every((p) => selectedIds.has(p.id))}
                  onCheckedChange={toggleSelectAllOnPage}
                  aria-label="Sélectionner tous les produits de la page"
                />
              </TableHead>
              <TableHead>Nom</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Catégorie</TableHead>
              <TableHead>Prix</TableHead>
              <TableHead>Réduction</TableHead>
              <TableHead>Prix soldé</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageItems.map((product) => (
              <AdminProductRow
                key={product.id}
                product={product}
                categoryLabel={
                  categories.find((c) => c.slug === product.categorySlug)?.label ??
                  product.categorySlug
                }
                selected={selectedIds.has(product.id)}
                onToggleSelect={() => toggleSelect(product.id)}
                onEdit={() => setDialogState({ mode: "edit", product })}
                onDelete={() => handleDelete(product)}
              />
            ))}
          </TableBody>
        </Table>
        {pageItems.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Aucun produit ne correspond à votre recherche.
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

      {dialogState && (
        <ProductFormDialog
          mode={dialogState.mode}
          product={dialogState.mode === "edit" ? dialogState.product : undefined}
          categories={categories}
          onClose={() => setDialogState(null)}
        />
      )}
    </div>
  );
}

function AdminProductRow({
  product,
  categoryLabel,
  selected,
  onToggleSelect,
  onEdit,
  onDelete,
}: {
  product: Product;
  categoryLabel: string;
  selected: boolean;
  onToggleSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [price, setPrice] = useState(String(product.originalPrice));
  const [discount, setDiscount] = useState(String(product.discountPercent));
  const [stock, setStock] = useState(String(product.stockQuantity));

  useEffect(() => {
    setPrice(String(product.originalPrice));
    setDiscount(String(product.discountPercent));
    setStock(String(product.stockQuantity));
  }, [product.originalPrice, product.discountPercent, product.stockQuantity]);

  function handleSave() {
    const priceNum = Number(price);
    const discountNum = Number(discount);
    const stockNum = Number(stock);
    if (Number.isNaN(priceNum) || priceNum < 0) {
      toast.error("Prix invalide.");
      return;
    }
    if (Number.isNaN(discountNum) || discountNum < 0 || discountNum > 100) {
      toast.error("Réduction invalide (0-100).");
      return;
    }
    if (Number.isNaN(stockNum) || stockNum < 0) {
      toast.error("Stock invalide.");
      return;
    }
    productStore.updateProduct(product.id, {
      originalPrice: priceNum,
      discountPercent: discountNum,
      stockQuantity: stockNum,
    });
    toast.success(`« ${product.name} » mis à jour.`);
  }

  const priceNum = Number(price) || 0;
  const discountNum = Number(discount) || 0;
  const salePrice = Math.round(priceNum * (1 - discountNum / 100));

  return (
    <TableRow>
      <TableCell>
        <Checkbox
          checked={selected}
          onCheckedChange={onToggleSelect}
          aria-label={`Sélectionner ${product.name}`}
        />
      </TableCell>
      <TableCell className="max-w-[200px] truncate font-medium text-foreground">
        {product.name}
      </TableCell>
      <TableCell className="text-xs text-muted-foreground">{product.sku}</TableCell>
      <TableCell className="text-sm text-muted-foreground">{categoryLabel}</TableCell>
      <TableCell>
        <Input
          type="number"
          min={0}
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="w-24"
          aria-label={`Prix de ${product.name}`}
        />
      </TableCell>
      <TableCell>
        <Input
          type="number"
          min={0}
          max={100}
          value={discount}
          onChange={(e) => setDiscount(e.target.value)}
          className="w-20"
          aria-label={`Réduction de ${product.name}`}
        />
      </TableCell>
      <TableCell className="text-sm text-muted-foreground">{formatCFA(salePrice)}</TableCell>
      <TableCell>
        <Input
          type="number"
          min={0}
          value={stock}
          onChange={(e) => setStock(e.target.value)}
          className="w-20"
          aria-label={`Stock de ${product.name}`}
        />
      </TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-1">
          <Button variant="outline" size="sm" onClick={handleSave}>
            Enregistrer
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onEdit}
            aria-label={`Modifier ${product.name}`}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon" aria-label={`Supprimer ${product.name}`}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Supprimer ce produit ?</AlertDialogTitle>
                <AlertDialogDescription>
                  « {product.name} » sera définitivement supprimé du catalogue.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Annuler</AlertDialogCancel>
                <AlertDialogAction onClick={onDelete}>Supprimer</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </TableCell>
    </TableRow>
  );
}

function ProductFormDialog({
  mode,
  product,
  categories,
  onClose,
}: {
  mode: "add" | "edit";
  product?: Product;
  categories: Category[];
  onClose: () => void;
}) {
  const [name, setName] = useState(product?.name ?? "");
  const [categorySlug, setCategorySlug] = useState(
    product?.categorySlug ?? categories[0]?.slug ?? "",
  );
  const [subcategorySlug, setSubcategorySlug] = useState(product?.subcategorySlug ?? "");
  const [originalPrice, setOriginalPrice] = useState(String(product?.originalPrice ?? ""));
  const [discountPercent, setDiscountPercent] = useState(String(product?.discountPercent ?? 0));
  const [stockQuantity, setStockQuantity] = useState(String(product?.stockQuantity ?? ""));
  const [description, setDescription] = useState(product?.description ?? "");
  const [images, setImages] = useState<{ src: string; alt: string }[]>(product?.images ?? []);
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const selectedCategory = categories.find((c) => c.slug === categorySlug);

  async function handleFilesSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const compressed = await Promise.all(
        Array.from(files).map((file) => compressImageFile(file)),
      );
      setImages((prev) => [...prev, ...compressed.map((src) => ({ src, alt: "" }))]);
    } catch {
      toast.error("Une image n'a pas pu être traitée.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  function updateImageAlt(index: number, alt: string) {
    setImages((prev) => prev.map((img, i) => (i === index ? { ...img, alt } : img)));
  }

  function removeImage(index: number) {
    setImages((prev) => prev.filter((_, i) => i !== index));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const nextErrors: Record<string, string> = {};
    if (name.trim().length < 2) nextErrors.name = "Le nom du produit est requis.";
    if (!categorySlug) nextErrors.category = "Veuillez choisir une catégorie.";
    const priceNum = Number(originalPrice);
    if (Number.isNaN(priceNum) || priceNum <= 0) nextErrors.price = "Prix invalide.";
    const discountNum = Number(discountPercent);
    if (Number.isNaN(discountNum) || discountNum < 0 || discountNum > 100) {
      nextErrors.discount = "Réduction invalide (0-100).";
    }
    const stockNum = Number(stockQuantity);
    if (Number.isNaN(stockNum) || stockNum < 0) nextErrors.stock = "Stock invalide.";
    if (mode === "add" && images.length === 0) {
      nextErrors.images = "Ajoutez au moins une image.";
    } else if (images.some((img) => img.alt.trim().length === 0)) {
      nextErrors.images = "Chaque image doit avoir un texte alternatif.";
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }
    setErrors({});
    setSaving(true);

    if (mode === "add") {
      productStore.addProduct({
        name: name.trim(),
        alt: images[0].alt,
        image: images[0].src,
        images,
        categorySlug,
        subcategorySlug: subcategorySlug || undefined,
        originalPrice: priceNum,
        discountPercent: discountNum,
        stockQuantity: stockNum,
        description: description.trim() || undefined,
      });
      toast.success(`« ${name.trim()} » ajouté au catalogue.`);
    } else if (product) {
      productStore.updateProduct(product.id, {
        name: name.trim(),
        categorySlug,
        subcategorySlug: subcategorySlug || undefined,
        originalPrice: priceNum,
        discountPercent: discountNum,
        stockQuantity: stockNum,
        description: description.trim() || undefined,
        ...(images.length > 0 ? { images, image: images[0].src, alt: images[0].alt } : {}),
      });
      toast.success(`« ${name.trim()} » mis à jour.`);
    }
    setSaving(false);
    onClose();
  }

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === "add" ? "Ajouter un produit" : `Modifier « ${product?.name} »`}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div>
            <Label htmlFor="product-name">Nom</Label>
            <Input
              id="product-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              aria-invalid={Boolean(errors.name)}
              aria-describedby="product-name-error"
            />
            <p
              id="product-name-error"
              role="alert"
              className="mt-1 min-h-[1rem] text-xs text-destructive"
            >
              {errors.name}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="product-category">Catégorie</Label>
              <Select
                value={categorySlug}
                onValueChange={(v) => {
                  setCategorySlug(v);
                  setSubcategorySlug("");
                }}
              >
                <SelectTrigger id="product-category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.slug} value={c.slug}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p role="alert" className="mt-1 min-h-[1rem] text-xs text-destructive">
                {errors.category}
              </p>
            </div>
            <div>
              <Label htmlFor="product-subcategory">Sous-catégorie (optionnel)</Label>
              <Select
                value={subcategorySlug || "none"}
                onValueChange={(v) => setSubcategorySlug(v === "none" ? "" : v)}
              >
                <SelectTrigger id="product-subcategory">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Aucune</SelectItem>
                  {(selectedCategory?.subcategories ?? []).map((s) => (
                    <SelectItem key={s.slug} value={s.slug}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <Label htmlFor="product-price">Prix (CFA)</Label>
              <Input
                id="product-price"
                type="number"
                min={0}
                value={originalPrice}
                onChange={(e) => setOriginalPrice(e.target.value)}
                aria-invalid={Boolean(errors.price)}
                aria-describedby="product-price-error"
              />
              <p
                id="product-price-error"
                role="alert"
                className="mt-1 min-h-[1rem] text-xs text-destructive"
              >
                {errors.price}
              </p>
            </div>
            <div>
              <Label htmlFor="product-discount">Réduction (%)</Label>
              <Input
                id="product-discount"
                type="number"
                min={0}
                max={100}
                value={discountPercent}
                onChange={(e) => setDiscountPercent(e.target.value)}
                aria-invalid={Boolean(errors.discount)}
                aria-describedby="product-discount-error"
              />
              <p
                id="product-discount-error"
                role="alert"
                className="mt-1 min-h-[1rem] text-xs text-destructive"
              >
                {errors.discount}
              </p>
            </div>
            <div>
              <Label htmlFor="product-stock">Stock</Label>
              <Input
                id="product-stock"
                type="number"
                min={0}
                value={stockQuantity}
                onChange={(e) => setStockQuantity(e.target.value)}
                aria-invalid={Boolean(errors.stock)}
                aria-describedby="product-stock-error"
              />
              <p
                id="product-stock-error"
                role="alert"
                className="mt-1 min-h-[1rem] text-xs text-destructive"
              >
                {errors.stock}
              </p>
            </div>
          </div>

          <div>
            <Label htmlFor="product-description">Description (optionnel)</Label>
            <Textarea
              id="product-description"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="product-images">Images</Label>
            <input
              id="product-images"
              type="file"
              accept="image/*"
              multiple
              onChange={handleFilesSelected}
              className="mt-1 block w-full text-sm text-foreground"
            />
            {uploading && (
              <p className="mt-1 text-xs text-muted-foreground">Compression des images...</p>
            )}
            <p role="alert" className="mt-1 min-h-[1rem] text-xs text-destructive">
              {errors.images}
            </p>
            {images.length > 0 && (
              <ul className="mt-2 space-y-2">
                {images.map((img, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-2 rounded-md border border-border p-2"
                  >
                    <img
                      src={img.src}
                      alt={img.alt || "Aperçu de l'image téléversée"}
                      className="h-12 w-12 rounded object-cover"
                    />
                    <Input
                      value={img.alt}
                      onChange={(e) => updateImageAlt(i, e.target.value)}
                      placeholder="Texte alternatif (requis)"
                      aria-label={`Texte alternatif de l'image ${i + 1}`}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeImage(i)}
                      aria-label={`Retirer l'image ${i + 1}`}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" disabled={saving || uploading}>
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  Enregistrement...
                </>
              ) : (
                "Enregistrer"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
