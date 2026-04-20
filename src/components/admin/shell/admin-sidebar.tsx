"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
  match?: (pathname: string) => boolean;
};

type NavSection = {
  label: string;
  items: NavItem[];
};

const NAV_SECTIONS: NavSection[] = [
  {
    label: "Overview",
    items: [
      { href: "/admin", label: "Dashboard", match: (p) => p === "/admin" },
    ],
  },
  {
    label: "Catalogue",
    items: [
      { href: "/admin/products", label: "Produits" },
      { href: "/admin/categories", label: "Catégories" },
    ],
  },
  {
    label: "Commerce",
    items: [
      { href: "/admin/orders", label: "Commandes" },
      { href: "/admin/invoices", label: "Factures" },
      { href: "/admin/credits", label: "Avoirs" },
    ],
  },
  {
    label: "Audience",
    items: [
      { href: "/admin/users", label: "Utilisateurs" },
      { href: "/admin/messages", label: "Messages" },
    ],
  },
  {
    label: "Content",
    items: [
      { href: "/admin/homepage", label: "Page d'accueil" },
      { href: "/admin/homepage/carousel", label: "Carrousel" },
      { href: "/admin/homepage/featured-products", label: "Produits à la une" },
    ],
  },
  {
    label: "Settings",
    items: [
      { href: "/admin/settings/2fa", label: "Authentification 2FA" },
    ],
  },
];

function isActive(pathname: string, item: NavItem): boolean {
  if (item.match) return item.match(pathname);
  return pathname === item.href || pathname.startsWith(item.href + "/");
}

export function AdminSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const userName =
    session?.user?.name ?? session?.user?.email?.split("@")[0] ?? "Admin";
  const userEmail = session?.user?.email ?? "admin@althea.local";

  return (
    <aside className="sticky top-0 flex h-screen w-60 shrink-0 flex-col border-r border-border/60 bg-background">
      {/* Brand */}
      <div className="border-b border-border/60 px-5 py-5">
        <Link href="/admin" className="block">
          <p className="font-display text-[15px] font-semibold leading-tight tracking-tight text-foreground">
            Althea Systems
          </p>
          <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.22em] text-foreground/50">
            Admin Panel · DEV
          </p>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {NAV_SECTIONS.map((section, idx) => (
          <div key={section.label} className={cn(idx > 0 && "mt-6")}>
            <p className="px-3 pb-2 font-mono text-[9px] uppercase tracking-[0.22em] text-foreground/40">
              <span className="mr-1.5 opacity-60">—</span>
              {section.label}
            </p>
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const active = isActive(pathname, item);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "group relative flex items-center rounded-sm px-3 py-1.5 text-[13px] transition-colors duration-200 ease-out",
                        active
                          ? "text-foreground"
                          : "text-foreground/55 hover:text-foreground"
                      )}
                    >
                      {active && (
                        <span
                          aria-hidden
                          className="absolute left-0 top-1/2 h-4 w-[2px] -translate-y-1/2 bg-primary"
                        />
                      )}
                      <span className="truncate">{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* User footer */}
      <div className="border-t border-border/60 px-4 py-4">
        <div className="mb-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-foreground/50">
            Signed in as
          </p>
          <p className="mt-1 truncate text-[13px] font-medium text-foreground">
            {userName}
          </p>
          <p className="mt-0.5 truncate font-mono text-[11px] text-foreground/50">
            {userEmail}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="font-mono text-[10px] uppercase tracking-[0.18em] text-foreground/55 transition-colors hover:text-foreground"
          >
            Retour site
          </Link>
          <span className="text-foreground/20">·</span>
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/" })}
            className="font-mono text-[10px] uppercase tracking-[0.18em] text-foreground/55 transition-colors hover:text-foreground"
          >
            Déconnexion
          </button>
        </div>
      </div>
    </aside>
  );
}

export default AdminSidebar;
