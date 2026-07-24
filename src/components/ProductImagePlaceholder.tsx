import { getCategoryIcon } from "@/lib/category-icons";

// Real product photography has not been supplied yet. Once photos exist,
// stop using PLACEHOLDER_IMAGE in the product data and render a plain
// <img src={product.image} /> instead of this component.
export function ProductImagePlaceholder({
  categorySlug,
  alt,
  variant = 0,
  className = "",
}: {
  categorySlug: string;
  alt: string;
  variant?: number;
  className?: string;
}) {
  const Icon = getCategoryIcon(categorySlug);
  const rotation = [0, -8, 8][variant % 3];

  return (
    <div
      role="img"
      aria-label={alt}
      className={`relative flex items-center justify-center overflow-hidden bg-gradient-to-br from-secondary via-muted to-accent/40 ${className}`}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_28%_22%,oklch(1_0_0/35%),transparent_60%)]" />
      <Icon
        className="h-2/5 w-2/5 text-primary/25"
        style={{ transform: `rotate(${rotation}deg)` }}
        strokeWidth={1.25}
        aria-hidden="true"
      />
    </div>
  );
}
