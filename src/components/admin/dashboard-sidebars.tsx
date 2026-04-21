import Link from "next/link";
import { cn } from "@/lib/utils";
import { prisma } from "@/lib/prisma";

const STATUS_LABELS: Record<string, string> = {
  PENDING: "en attente",
  CONFIRMED: "confirmée",
  PROCESSING: "préparation",
  SHIPPED: "expédiée",
  DELIVERED: "livrée",
  CANCELLED: "annulée",
};

function formatCurrency(n: number): string {
  return n.toLocaleString("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  });
}

async function getTopProducts() {
  try {
    const grouped = await prisma.orderItem.groupBy({
      by: ["productId", "name"],
      _sum: { quantity: true, price: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 5,
    });

    return grouped.map((g) => {
      const sold = g._sum.quantity ?? 0;
      const unitPrice = Number(g._sum.price ?? 0);
      return {
        id: g.productId,
        name: g.name,
        sold,
        revenue: unitPrice * sold,
      };
    });
  } catch {
    return [];
  }
}

async function getRecentOrders() {
  try {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        user: { select: { firstName: true, lastName: true, email: true } },
      },
    });

    return orders.map((o) => {
      const fullName =
        [o.user.firstName, o.user.lastName].filter(Boolean).join(" ").trim() ||
        o.user.email;
      return {
        id: o.orderNumber,
        customer: fullName,
        status: o.status,
        total: Number(o.total),
      };
    });
  } catch {
    return [];
  }
}

export async function TopProductsBlock() {
  const items = await getTopProducts();

  return (
    <section className="border-t border-border/60 pt-6">
      <header className="mb-5 flex items-center justify-between">
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-foreground/50">
          <span className="mr-1.5 tabular-nums text-foreground/35">08</span>
          Top produits
        </p>
        <Link
          href="/admin/products"
          className="font-mono text-[10px] uppercase tracking-[0.18em] text-foreground/50 transition-colors hover:text-primary"
        >
          Tout voir
        </Link>
      </header>

      {items.length === 0 ? (
        <p className="py-6 font-mono text-[11px] uppercase tracking-[0.18em] text-foreground/40">
          — Aucune vente enregistrée
        </p>
      ) : (
        <ul className="divide-y divide-border/40">
          {items.map((item, idx) => (
            <li
              key={item.id}
              className="flex items-center justify-between py-3 first:pt-0"
            >
              <div className="flex items-baseline gap-3 min-w-0">
                <span className="font-mono text-[10px] tabular-nums text-foreground/35">
                  {(idx + 1).toString().padStart(2, "0")}
                </span>
                <span className="truncate text-[13px] text-foreground">
                  {item.name}
                </span>
              </div>
              <div className="flex items-baseline gap-4 shrink-0">
                <span className="font-mono text-[11px] tabular-nums text-foreground/50">
                  <span className="tabular-nums">{item.sold}</span>
                  <span className="ml-1 text-foreground/30">vendus</span>
                </span>
                <span className="font-mono text-[11px] tabular-nums text-foreground">
                  {formatCurrency(item.revenue)}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export async function RecentOrdersBlock() {
  const items = await getRecentOrders();

  return (
    <section className="border-t border-border/60 pt-6">
      <header className="mb-5 flex items-center justify-between">
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-foreground/50">
          <span className="mr-1.5 tabular-nums text-foreground/35">09</span>
          Commandes récentes
        </p>
        <Link
          href="/admin/orders"
          className="font-mono text-[10px] uppercase tracking-[0.18em] text-foreground/50 transition-colors hover:text-primary"
        >
          Tout voir
        </Link>
      </header>

      {items.length === 0 ? (
        <p className="py-6 font-mono text-[11px] uppercase tracking-[0.18em] text-foreground/40">
          — Aucune commande pour le moment
        </p>
      ) : (
        <ul className="divide-y divide-border/40">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex items-center justify-between py-3 first:pt-0"
            >
              <div className="flex items-baseline gap-3 min-w-0">
                <span className="font-mono text-[11px] tabular-nums text-foreground/55">
                  {item.id}
                </span>
                <span className="truncate text-[13px] text-foreground">
                  {item.customer}
                </span>
              </div>
              <div className="flex items-baseline gap-4 shrink-0">
                <span
                  className={cn(
                    "font-mono text-[10px] uppercase tracking-[0.18em]",
                    item.status === "DELIVERED"
                      ? "text-foreground/70"
                      : item.status === "PENDING"
                        ? "text-primary"
                        : "text-foreground/45"
                  )}
                >
                  {STATUS_LABELS[item.status] ?? item.status.toLowerCase()}
                </span>
                <span className="font-mono text-[11px] tabular-nums text-foreground">
                  {formatCurrency(item.total)}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
