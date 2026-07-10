import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const glassPanelVariants = cva("glass-panel", {
  variants: {
    variant: {
      default: "",
      elevated: "glass-panel-elevated",
      active: "glass-active",
      critical: "glass-rim-danger",
      gold: "glass-rim-gold",
      cyan: "glass-rim-cyan",
      purple: "glass-rim-purple",
      emerald: "glass-rim-emerald",
      amber: "glass-rim-amber",
    },
    padding: {
      none: "",
      compact: "p-3.5",
      default: "p-5",
      spacious: "p-6 md:p-8",
    },
    interactive: {
      false: "",
      true: "glass-hover-lift",
    },
    shine: {
      false: "",
      true: "glass-shine",
    },
  },
  defaultVariants: {
    variant: "default",
    padding: "default",
    interactive: false,
    shine: false,
  },
});

export interface GlassPanelProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof glassPanelVariants> {}

/**
 * Liquid glass slab — the platform's core surface. Variants add coloured
 * rim light; `shine` parks a diagonal light streak that sweeps on hover.
 */
const GlassPanel = React.forwardRef<HTMLDivElement, GlassPanelProps>(
  ({ className, variant, padding, interactive, shine, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(glassPanelVariants({ variant, padding, interactive, shine }), className)}
      {...props}
    >
      {shine && <span className="shine-layer" aria-hidden />}
      {children}
    </div>
  )
);
GlassPanel.displayName = "GlassPanel";

/** Small nested glass strip for queue rows and list items. */
const GlassRow = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "glass-card glass-hover-lift relative rounded-xl",
        className
      )}
      {...props}
    />
  )
);
GlassRow.displayName = "GlassRow";

/** Circular glass bubble for icons — agent chips, icon buttons, mic shells. */
const GlassOrb = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("glass-orb grid place-items-center", className)}
      {...props}
    />
  )
);
GlassOrb.displayName = "GlassOrb";

export { GlassPanel, GlassRow, GlassOrb, glassPanelVariants };
