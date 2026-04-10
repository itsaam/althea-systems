"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LogOut,
  MapPin,
  Package,
  ShieldCheck,
  User,
  Wallet,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

const navItems = [
  {
    href: "/profile",
    label: "Mon profil",
    description: "Informations personnelles",
    icon: User,
  },
  {
    href: "/orders",
    label: "Mes commandes",
    description: "Historique et suivi",
    icon: Package,
  },
  {
    href: "/addresses",
    label: "Mes adresses",
    description: "Livraison et facturation",
    icon: MapPin,
  },
  {
    href: "/payments",
    label: "Paiement",
    description: "Moyens de paiement",
    icon: Wallet,
  },
];

function getInitials(firstName?: string | null, lastName?: string | null, email?: string | null) {
  const first = firstName?.trim()?.[0];
  const last = lastName?.trim()?.[0];
  if (first || last) return `${first ?? ""}${last ?? ""}`.toUpperCase();
  return email?.[0]?.toUpperCase() ?? "?";
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
      .finally(() => active && setIsLoading(false));
    return () => {
      active = false;
    };
  }, []);

  const fullName = user
    ? [user.firstName, user.lastName].filter(Boolean).join(" ").trim()
    : "";

  return (
    <aside className="w-full md:w-72 md:shrink-0">
      <div className="rounded-2xl border bg-card p-5">
        {isLoading ? (
          <div className="flex items-center gap-3">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-3 w-32" />
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-base font-semibold text-primary"
              aria-hidden="true"
            >
              {getInitials(user?.firstName, user?.lastName, user?.email)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">
                {fullName || "Bienvenue"}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {user?.email ?? ""}
              </p>
            </div>
          </div>
        )}
      </div>

      <nav className="mt-4 space-y-1" aria-label="Navigation du compte">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "group flex items-start gap-3 rounded-xl border border-transparent px-3 py-3 text-sm transition-all",
                "hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                isActive
                  ? "border-primary/20 bg-primary/5"
                  : "text-foreground/80 hover:text-foreground"
              )}
            >
              <Icon
                className={cn(
                  "mt-0.5 h-4 w-4 shrink-0 transition-colors",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground group-hover:text-foreground"
                )}
                aria-hidden="true"
              />
              <div className="min-w-0 flex-1">
                <span
                  className={cn(
                    "block font-medium leading-tight",
                    isActive && "text-primary"
                  )}
                >
                  {item.label}
                </span>
                <span className="text-xs text-muted-foreground">
                  {item.description}
                </span>
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="mt-6 border-t pt-4">
        <div className="mb-3 flex items-center gap-2 px-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          <ShieldCheck className="h-3 w-3" aria-hidden="true" />
          Session active
        </div>
        <Button
          variant="ghost"
          className="h-10 w-full justify-start gap-2 text-sm text-muted-foreground hover:text-destructive"
          onClick={() => signOut({ callbackUrl: "/" })}
        >
          <LogOut className="h-4 w-4" aria-hidden="true" />
          Se déconnecter
        </Button>
      </div>
    </aside>
  );
}
