import { cn } from "@/lib/utils";

interface StockBadgeProps {
  stock: number;
  className?: string;
}

/**
 * Stock chip — style éditorial : bordure outline, typo mono caps,
 * dot de statut coloré. Aucun aplat primaire.
 */
export default function StockBadge({ stock, className }: StockBadgeProps) {
  if (stock === 0) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 rounded-none border border-destructive/70 bg-background/90 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.22em] text-destructive backdrop-blur",
          className
        )}
      >
        <span aria-hidden className="h-1 w-1 rounded-full bg-destructive" />
        Rupture
      </span>
    );
  }

  if (stock < 5) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 rounded-none border border-foreground/60 bg-background/90 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.22em] text-foreground/80 backdrop-blur",
          className
        )}
      >
        <span aria-hidden className="h-1 w-1 rounded-full bg-foreground/60" />
        Stock faible
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-none border border-border/60 bg-background/90 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.22em] text-foreground/70 backdrop-blur",
        className
      )}
    >
      <span aria-hidden className="h-1 w-1 rounded-full bg-foreground/40" />
      En stock
    </span>
  );
}
