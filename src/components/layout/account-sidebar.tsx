"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
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
    label: "Compte",
    items: [
      { href: "/profile", label: "Profil" },
      { href: "/addresses", label: "Adresses" },
      { href: "/payments", label: "Paiement" },
    ],
  },
  {
    label: "Activité",
    items: [{ href: "/orders", label: "Commandes" }],
  },
];

function isActive(pathname: string | null, item: NavItem): boolean {
  if (!pathname) return false;
  if (item.match) return item.match(pathname);
  return pathname === item.href || pathname.startsWith(item.href + "/");
}

function getInitials(
  firstName?: string | null,
  lastName?: string | null,
  email?: string | null
) {
  const first = firstName?.trim()?.[0];
  const last = lastName?.trim()?.[0];
  if (first || last) return `${first ?? ""}${last ?? ""}`.toUpperCase();
  return email?.[0]?.toUpperCase() ?? "—";
}

interface AccountUser {
  firstName: string;
  lastName: string;
  email: string;
}

export default function AccountSidebar() {
  const pathname = usePathname();
  const [user, setUser] = useState<AccountUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetch("/api/profile")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!active) return;
        if (data?.user) {
          setUser({
            firstName: data.user.firstName ?? "",
            lastName: data.user.lastName ?? "",
            email: data.user.email ?? "",
          });
        }
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const fullName = user
    ? [user.firstName, user.lastName].filter(Boolean).join(" ").trim()
    : "";

  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-border/60 bg-background md:flex">
      <div className="border-b border-border/60 px-6 py-7">
        {isLoading ? (
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 animate-pulse rounded-full bg-foreground/5" />
            <div className="min-w-0 flex-1 space-y-2">
              <div className="h-4 w-28 animate-pulse rounded bg-foreground/5" />
              <div className="h-3 w-36 animate-pulse rounded bg-foreground/5" />
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-foreground/5 font-mono text-[14px] font-semibold tracking-wider text-foreground"
              aria-hidden="true"
            >
              {getInitials(user?.firstName, user?.lastName, user?.email)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-display text-[16px] font-semibold leading-tight text-foreground">
                {fullName || "Bienvenue"}
              </p>
              <p className="mt-1 truncate font-mono text-[11px] lowercase tracking-[0.08em] text-foreground/50">
                {user?.email ?? "—"}
              </p>
            </div>
          </div>
        )}
      </div>

      <nav
        className="flex-1 overflow-y-auto px-4 py-7"
        aria-label="Navigation de l'espace client"
      >
        {NAV_SECTIONS.map((section, idx) => (
          <div key={section.label} className={cn(idx > 0 && "mt-8")}>
            <p className="px-3 pb-3 font-mono text-[11px] uppercase tracking-[0.22em] text-foreground/45">
              <span className="mr-1.5 opacity-60">—</span>
              {section.label}
            </p>
            <ul className="space-y-1">
              {section.items.map((item) => {
                const active = isActive(pathname, item);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "group relative flex items-center rounded-sm px-3 py-2.5 font-mono text-[14px] lowercase tracking-[0.06em] transition-colors duration-200 ease-out",
                        active
                          ? "text-foreground"
                          : "text-foreground/55 hover:text-foreground"
                      )}
                    >
                      {active && (
                        <span
                          aria-hidden
                          className="absolute left-0 top-1/2 h-5 w-[2px] -translate-y-1/2 bg-electric-indigo-500"
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

      <div className="border-t border-border/60 px-6 py-5">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="font-mono text-[12px] uppercase tracking-[0.16em] text-foreground/55 transition-colors hover:text-foreground"
          >
            Retour
          </Link>
          <span className="text-foreground/20">·</span>
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/" })}
            className="font-mono text-[12px] uppercase tracking-[0.16em] text-foreground/55 transition-colors hover:text-foreground"
          >
            Déconnexion
          </button>
        </div>
      </div>
    </aside>
  );
}
