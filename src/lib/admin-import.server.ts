// Server-only one-time catalog import — triggered by the "Importer le
// catalogue initial" button on /admin, which only appears while the live
// `products` table is (still) empty. Uploads each of the bundled product
// photos to Supabase Storage, then upserts every product row and the 7
// reviews that reference real (still-existing) products. Safe to re-run: both
// the Storage upload and the product/review rows use upsert semantics, so an
// interrupted run can simply be retried.
import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { PRODUCTS } from "@/lib/products";

const SEED_REVIEWS = [
  {
    product_id: "fauteuil-direction-confort-plus",
    name: "Moussa Diop",
    rating: 5,
    comment:
      "Très confortable, parfait pour de longues journées au bureau. Livraison rapide à Dakar.",
    date: "2026-05-14",
  },
  {
    product_id: "fauteuil-direction-confort-plus",
    name: "Aissatou Ba",
    rating: 4,
    comment: "Bonne qualité de cuir, un peu ferme au début mais s'assouplit avec l'usage.",
    date: "2026-04-02",
  },
  {
    product_id: "fauteuil-direction-confort-plus",
    name: "Cheikh Fall",
    rating: 5,
    comment: "Exactement ce qu'il fallait pour mon bureau à domicile. Je recommande.",
    date: "2026-02-20",
  },
  {
    product_id: "armoire-metallique-4-portes",
    name: "Fatou Sarr",
    rating: 5,
    comment: "Très robuste, la serrure fonctionne parfaitement. Idéale pour nos archives.",
    date: "2026-06-01",
  },
  {
    product_id: "armoire-metallique-4-portes",
    name: "Ibrahima Ndiaye",
    rating: 4,
    comment: "Bon rapport qualité prix, montage simple.",
    date: "2026-01-10",
  },
  {
    product_id: "chaise-direction-ergonomique-noire",
    name: "Ousmane Gueye",
    rating: 5,
    comment: "Excellent soutien lombaire, j'ai beaucoup moins mal au dos depuis que je l'utilise.",
    date: "2026-05-28",
  },
  {
    product_id: "chaise-direction-ergonomique-noire",
    name: "Mariama Sy",
    rating: 4,
    comment: "Bonne chaise mais l'assise pourrait être un peu plus large.",
    date: "2026-03-11",
  },
];

async function fetchAndUpload(
  supabaseAdmin: Awaited<typeof import("@/integrations/supabase/client.server")>["supabaseAdmin"],
  origin: string,
  productId: string,
  index: number,
  imageUrl: string,
): Promise<string> {
  const absoluteUrl = imageUrl.startsWith("http") ? imageUrl : `${origin}${imageUrl}`;
  const response = await fetch(absoluteUrl);
  if (!response.ok) throw new Error(`Échec du téléchargement de ${absoluteUrl}`);
  const blob = await response.blob();
  const path = `${productId}/${index}.jpg`;
  const { error } = await supabaseAdmin.storage
    .from("product-images")
    .upload(path, blob, { contentType: "image/jpeg", upsert: true });
  if (error) throw error;
  const { data } = supabaseAdmin.storage.from("product-images").getPublicUrl(path);
  return data.publicUrl;
}

async function runWithConcurrency<T, R>(
  items: T[],
  limit: number,
  fn: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let next = 0;
  async function worker() {
    while (next < items.length) {
      const current = next++;
      results[current] = await fn(items[current], current);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
}

export const importInitialCatalog = createServerFn({ method: "POST" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const request = getRequest();
  const origin = new URL(request.url).origin;

  const errors: string[] = [];
  let imported = 0;

  await runWithConcurrency(PRODUCTS, 8, async (product) => {
    try {
      const sourceImages =
        product.images && product.images.length > 0
          ? product.images
          : [{ src: product.image, alt: product.alt }];

      const uploaded = await Promise.all(
        sourceImages.map(async (img, index) => ({
          src:
            img.src === "placeholder"
              ? img.src
              : await fetchAndUpload(supabaseAdmin, origin, product.id, index, img.src),
          alt: img.alt,
        })),
      );

      const { error } = await supabaseAdmin.from("products").upsert({
        id: product.id,
        name: product.name,
        alt: product.alt,
        image: uploaded[0].src,
        images: uploaded,
        category_slug: product.categorySlug,
        subcategory_slug: product.subcategorySlug ?? null,
        original_price: product.originalPrice,
        discount_percent: product.discountPercent,
        rating: product.rating,
        popularity: product.popularity,
        is_new: product.isNew,
        created_at: product.createdAt,
        stock_quantity: product.stockQuantity,
        featured: product.featured ?? false,
        sku: product.sku ?? null,
        weight_kg: product.weightKg ?? null,
        dimensions: product.dimensions ?? null,
        description: product.description ?? null,
      });
      if (error) throw error;
      imported += 1;
    } catch (err) {
      errors.push(`${product.id}: ${err instanceof Error ? err.message : String(err)}`);
    }
  });

  // Reviews have no natural dedup key (id is a DB-generated UUID) — only seed
  // them the first time this import runs, to avoid duplicating rows on retry.
  const { count: existingReviews } = await supabaseAdmin
    .from("reviews")
    .select("id", { count: "exact", head: true });
  if (!existingReviews) {
    const { error: reviewsError } = await supabaseAdmin
      .from("reviews")
      .insert(SEED_REVIEWS.map((r) => ({ ...r, approved: true })));
    if (reviewsError) errors.push(`reviews: ${reviewsError.message}`);
  }

  return { total: PRODUCTS.length, imported, errors };
});
