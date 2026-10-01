import { supabase } from "@/integrations/supabase/client";

// Client-side image compression: resizes to a max dimension and re-encodes as
// JPEG so admin-uploaded product photos stay small before upload.
export function compressImageFile(file: File, maxDimension = 1280, quality = 0.8): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, maxDimension / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Canvas non supporté par ce navigateur."));
          return;
        }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("Échec de la compression de l'image."));
              return;
            }
            resolve(blob);
          },
          "image/jpeg",
          quality,
        );
      };
      img.onerror = () => reject(new Error("Impossible de charger l'image."));
      img.src = reader.result as string;
    };
    reader.onerror = () => reject(new Error("Impossible de lire le fichier."));
    reader.readAsDataURL(file);
  });
}

// Uploads a compressed image blob to the public `product-images` Storage
// bucket under `{productId}/{index}-{timestamp}.jpg` and returns its public URL.
export async function uploadProductImage(
  productId: string,
  index: number,
  blob: Blob,
): Promise<string> {
  const path = `${productId}/${index}-${Date.now()}.jpg`;
  const { error } = await supabase.storage.from("product-images").upload(path, blob, {
    contentType: "image/jpeg",
    upsert: true,
  });
  if (error) throw error;
  const { data } = supabase.storage.from("product-images").getPublicUrl(path);
  return data.publicUrl;
}
