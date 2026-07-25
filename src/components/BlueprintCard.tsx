import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

/**
 * Blueprint card — thin ink-16% border with 4 corner tick marks that sit
 * outside the box, matching the mockup's engineering-drawing aesthetic.
 * The corner ticks are absolutely positioned so the parent must remain
 * `position: relative` (blueprint-frame handles that).
 */
export const BlueprintCard = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function BlueprintCard({ className, children, ...rest }, ref) {
    return (
      <div ref={ref} className={cn("blueprint-frame", className)} {...rest}>
        <i aria-hidden="true" className="corner-tick" style={{ top: -6, left: -6 }} />
        <i aria-hidden="true" className="corner-tick" style={{ top: -6, right: -6 }} />
        <i aria-hidden="true" className="corner-tick" style={{ bottom: -6, left: -6 }} />
        <i aria-hidden="true" className="corner-tick" style={{ bottom: -6, right: -6 }} />
        {children}
      </div>
    );
  },
);
