import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";
import { categoryStore, useAllCategories } from "@/lib/category-store";
import { useAllProducts } from "@/lib/product-store";
import type { Category, Subcategory } from "@/lib/categories";
import { useRequireAdmin } from "@/hooks/use-require-admin";
import { AdminNav } from "@/components/AdminNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

export const Route = createFileRoute("/admin/categories")({
  head: () => ({
    meta: [{ title: "Administration — Catégories | Techno Office Sarl" }],
  }),
  component: AdminCategoriesPage,
});

function AdminCategoriesPage() {
  const { checked, user } = useRequireAdmin();
  const categories = useAllCategories();
  const products = useAllProducts();
  const [newCategoryName, setNewCategoryName] = useState("");

  if (!checked || !user) {
    return <div className="mx-auto max-w-4xl px-4 py-16 md:px-6" aria-hidden="true" />;
  }

  function handleAddCategory(e: React.FormEvent) {
    e.preventDefault();
    if (newCategoryName.trim().length < 2) {
      toast.error("Le nom de la catégorie est requis.");
      return;
    }
    categoryStore.addCategory(newCategoryName.trim());
    toast.success(`Catégorie « ${newCategoryName.trim()} » ajoutée.`);
    setNewCategoryName("");
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 md:px-6">
      <h1 className="text-2xl font-bold text-foreground md:text-3xl">Catégories</h1>
      <AdminNav />

      <form onSubmit={handleAddCategory} className="flex flex-wrap items-end gap-3">
        <div className="flex-1">
          <label htmlFor="new-category" className="mb-1 block text-sm font-medium text-foreground">
            Nouvelle catégorie
          </label>
          <Input
            id="new-category"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            placeholder="Ex : Literie"
          />
        </div>
        <Button type="submit">
          <Plus className="h-4 w-4" aria-hidden="true" />
          Ajouter
        </Button>
      </form>

      <div className="mt-8 space-y-6">
        {categories.map((category, index) => (
          <CategoryCard
            key={category.slug}
            category={category}
            productCount={products.filter((p) => p.categorySlug === category.slug).length}
            products={products}
            isFirst={index === 0}
            isLast={index === categories.length - 1}
          />
        ))}
      </div>
    </div>
  );
}

function CategoryCard({
  category,
  productCount,
  products,
  isFirst,
  isLast,
}: {
  category: Category;
  productCount: number;
  products: ReturnType<typeof useAllProducts>;
  isFirst: boolean;
  isLast: boolean;
}) {
  const [label, setLabel] = useState(category.label);
  const [newSubName, setNewSubName] = useState("");

  function handleRename() {
    if (label.trim().length < 2) {
      toast.error("Le nom de la catégorie est requis.");
      return;
    }
    categoryStore.renameCategory(category.slug, label.trim());
    toast.success("Catégorie renommée.");
  }

  function handleAddSub(e: React.FormEvent) {
    e.preventDefault();
    if (newSubName.trim().length < 2) {
      toast.error("Le nom de la sous-catégorie est requis.");
      return;
    }
    categoryStore.addSubcategory(category.slug, newSubName.trim());
    toast.success(`Sous-catégorie « ${newSubName.trim()} » ajoutée.`);
    setNewSubName("");
  }

  return (
    <div className="rounded-xl border border-border p-4">
      <div className="flex flex-wrap items-center gap-2">
        <Input value={label} onChange={(e) => setLabel(e.target.value)} className="max-w-xs" />
        <Button variant="outline" size="sm" onClick={handleRename}>
          Renommer
        </Button>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            disabled={isFirst}
            onClick={() => categoryStore.reorderCategory(category.slug, "up")}
            aria-label={`Monter ${category.label}`}
          >
            <ChevronUp className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            disabled={isLast}
            onClick={() => categoryStore.reorderCategory(category.slug, "down")}
            aria-label={`Descendre ${category.label}`}
          >
            <ChevronDown className="h-4 w-4" />
          </Button>
        </div>
        <span className="text-xs text-muted-foreground">{productCount} produit(s)</span>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="ml-auto"
              aria-label={`Supprimer ${category.label}`}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Supprimer « {category.label} » ?</AlertDialogTitle>
              <AlertDialogDescription>
                {productCount > 0
                  ? `Attention : ${productCount} produit(s) sont actuellement assignés à cette catégorie. Ils resteront dans le catalogue mais leur catégorie ne correspondra plus à une entrée existante.`
                  : "Aucun produit n'est assigné à cette catégorie."}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction onClick={() => categoryStore.deleteCategory(category.slug)}>
                Supprimer
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <div className="mt-4 space-y-2 border-l border-border pl-4">
        {(category.subcategories ?? []).map((sub, index) => (
          <SubcategoryRow
            key={sub.slug}
            category={category}
            subcategory={sub}
            productCount={
              products.filter(
                (p) => p.categorySlug === category.slug && p.subcategorySlug === sub.slug,
              ).length
            }
            isFirst={index === 0}
            isLast={index === (category.subcategories?.length ?? 0) - 1}
          />
        ))}

        <form onSubmit={handleAddSub} className="flex items-end gap-2 pt-2">
          <Input
            value={newSubName}
            onChange={(e) => setNewSubName(e.target.value)}
            placeholder="Nouvelle sous-catégorie"
            className="max-w-xs"
            aria-label={`Ajouter une sous-catégorie à ${category.label}`}
          />
          <Button type="submit" variant="outline" size="sm">
            <Plus className="h-4 w-4" aria-hidden="true" />
            Ajouter
          </Button>
        </form>
      </div>
    </div>
  );
}

function SubcategoryRow({
  category,
  subcategory,
  productCount,
  isFirst,
  isLast,
}: {
  category: Category;
  subcategory: Subcategory;
  productCount: number;
  isFirst: boolean;
  isLast: boolean;
}) {
  const [label, setLabel] = useState(subcategory.label);

  function handleRename() {
    if (label.trim().length < 2) {
      toast.error("Le nom de la sous-catégorie est requis.");
      return;
    }
    categoryStore.renameSubcategory(category.slug, subcategory.slug, label.trim());
    toast.success("Sous-catégorie renommée.");
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Input value={label} onChange={(e) => setLabel(e.target.value)} className="max-w-[200px]" />
      <Button variant="outline" size="sm" onClick={handleRename}>
        Renommer
      </Button>
      <div className="flex gap-1">
        <Button
          variant="ghost"
          size="icon"
          disabled={isFirst}
          onClick={() => categoryStore.reorderSubcategory(category.slug, subcategory.slug, "up")}
          aria-label={`Monter ${subcategory.label}`}
        >
          <ChevronUp className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          disabled={isLast}
          onClick={() => categoryStore.reorderSubcategory(category.slug, subcategory.slug, "down")}
          aria-label={`Descendre ${subcategory.label}`}
        >
          <ChevronDown className="h-4 w-4" />
        </Button>
      </div>
      <span className="text-xs text-muted-foreground">{productCount} produit(s)</span>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="ml-auto"
            aria-label={`Supprimer ${subcategory.label}`}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer « {subcategory.label} » ?</AlertDialogTitle>
            <AlertDialogDescription>
              {productCount > 0
                ? `Attention : ${productCount} produit(s) sont actuellement assignés à cette sous-catégorie.`
                : "Aucun produit n'est assigné à cette sous-catégorie."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => categoryStore.deleteSubcategory(category.slug, subcategory.slug)}
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
