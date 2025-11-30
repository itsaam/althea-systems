"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: "📊" },
  { href: "/admin/products", label: "Produits", icon: "📦" },
  { href: "/admin/categories", label: "Catégories", icon: "📁" },
  { href: "/admin/orders", label: "Commandes", icon: "🛒" },
  { href: "/admin/users", label: "Utilisateurs", icon: "👥" },
  { href: "/admin/invoices", label: "Factures", icon: "📄" },
  { href: "/admin/credits", label: "Avoirs", icon: "💰" },
  { href: "/admin/homepage", label: "Page accueil", icon: "🏠" },
  { href: "/admin/messages", label: "Messages", icon: "💬" },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 min-h-screen border-r bg-muted/30">
      <div className="p-6">
        <h2 className="text-xl font-bold">Admin</h2>
      </div>
      <nav className="px-4">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg mb-1 text-sm transition-colors",
              pathname === item.href
                ? "bg-primary text-primary-foreground"
                : "hover:bg-muted"
            )}
          >
            <span>{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
