"use client";

import Link from "next/link";

const ACTIONS = [
  {
    href: "/admin/products/new",
    label: "Nouveau produit",
    index: "01",
    primary: true,
  },
  {
    href: "/admin/orders",
    label: "Voir les commandes",
    index: "02",
  },
  {
    href: "/admin/messages",
    label: "Consulter les messages",
    index: "03",
  },
];

export default function QuickActions() {
  return (
    <div className="grid gap-px bg-border/60 sm:grid-cols-3">
      {ACTIONS.map((action) => (
        <Link
          key={action.href}
          href={action.href}
          className="group flex items-center justify-between bg-background px-5 py-4 transition-colors hover:bg-foreground/[0.02]"
        >
          <div className="flex items-baseline gap-3">
            <span className="font-mono text-[10px] tabular-nums text-foreground/35">
              {action.index}
            </span>
            <span className="text-[13px] font-medium text-foreground">
              {action.label}
            </span>
          </div>
          <span
            aria-hidden
            className="font-mono text-[14px] text-foreground/30 transition-all duration-200 group-hover:translate-x-1 group-hover:text-primary"
          >
            →
          </span>
        </Link>
      ))}
    </div>
  );
}
