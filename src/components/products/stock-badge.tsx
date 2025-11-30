import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface StockBadgeProps {
  stock: number;
  className?: string;
}

export default function StockBadge({ stock, className }: StockBadgeProps) {
  if (stock === 0) {
    return (
      <Badge variant="destructive" className={cn(className)}>
        Rupture
      </Badge>
    );
  }

  if (stock < 5) {
    return (
      <Badge
        variant="secondary"
        className={cn("bg-orange-500 text-white", className)}
      >
        Stock faible
      </Badge>
    );
  }

  return (
    <Badge
      variant="secondary"
      className={cn("bg-green-500 text-white", className)}
    >
      En stock
    </Badge>
  );
}
