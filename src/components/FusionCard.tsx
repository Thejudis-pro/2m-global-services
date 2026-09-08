import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

/**
 * Fusion card — soft-rounded cream card with a hairline border, used for
 * product cards, category tiles and info panels throughout the site.
 */
export const FusionCard = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function FusionCard({ className, children, ...rest }, ref) {
    return (
      <div
        ref={ref}
        className={cn("rounded-2xl border border-border bg-[var(--color-cream-light)]", className)}
        {...rest}
      >
        {children}
      </div>
    );
  },
);
