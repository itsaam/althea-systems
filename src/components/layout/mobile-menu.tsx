"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useTranslations } from "next-intl";
import { LogOut, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import LanguageSwitcher from "@/components/layout/language-switcher";

const PUBLIC_LINKS = [
  { href: "/", key: "home" as const },
  { href: "/categories", key: "categories" as const },
  { href: "/about", key: "about" as const },
  { href: "/contact", key: "contact" as const },
  { href: "/cart", key: "cart" as const },
];

const ACCOUNT_LINKS = [
  { href: "/profile", key: "myProfile" as const },
  { href: "/orders", key: "myOrders" as const },
];

export default function MobileMenu() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const tCommon = useTranslations("common");
  const tFooter = useTranslations("footer");

  const isActive = (href: string) =>
    pathname === href ||
    (href !== "/" && pathname?.startsWith(`${href}/`));

  const close = () => setOpen(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild className="md:hidden">
        <Button
          variant="ghost"
          size="icon"
          aria-label={tCommon("openMainMenu")}
          aria-expanded={open}
        >
          <Menu className="h-6 w-6" aria-hidden="true" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72">
        <SheetTitle className="sr-only">{tCommon("mainMenu")}</SheetTitle>
        <nav
          className="mt-8 flex flex-col gap-1"
          aria-label={tCommon("mobileNavigation")}
        >
          {PUBLIC_LINKS.map((link) => {
            const active = isActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={close}
                aria-current={active ? "page" : undefined}
                className="rounded-md px-3 py-2.5 text-base font-medium transition-colors hover:bg-muted aria-[current=page]:bg-primary/10 aria-[current=page]:text-primary focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                {tCommon(link.key)}
              </Link>
            );
          })}
        </nav>

        <div className="mt-6 border-t pt-6">
          {status === "loading" ? (
            <div className="space-y-2" aria-hidden="true">
              <div className="h-9 w-full animate-pulse rounded-md bg-muted" />
              <div className="h-9 w-2/3 animate-pulse rounded-md bg-muted" />
            </div>
          ) : session?.user ? (
            <div className="flex flex-col gap-1">
              <div className="px-3 pb-3">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {tFooter("account")}
                </p>
                {session.user.name && (
                  <p className="mt-1 truncate text-sm font-semibold">
                    {session.user.name}
                  </p>
                )}
                {session.user.email && (
                  <p className="truncate text-xs text-muted-foreground">
                    {session.user.email}
                  </p>
                )}
              </div>
              {ACCOUNT_LINKS.map((link) => {
                const active = isActive(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={close}
                    aria-current={active ? "page" : undefined}
                    className="rounded-md px-3 py-2.5 text-sm font-medium transition-colors hover:bg-muted aria-[current=page]:bg-primary/10 aria-[current=page]:text-primary focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    {tCommon(link.key)}
                  </Link>
                );
              })}
              {session.user.role === "ADMIN" && (
                <Link
                  href="/admin"
                  onClick={close}
                  className="rounded-md px-3 py-2.5 text-sm font-medium transition-colors hover:bg-muted focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  {tCommon("administration")}
                </Link>
              )}
              <button
                type="button"
                onClick={() => {
                  close();
                  signOut({ callbackUrl: "/" });
                }}
                className="mt-1 flex items-center gap-2 rounded-md px-3 py-2.5 text-left text-sm font-medium text-destructive transition-colors hover:bg-destructive/10 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <LogOut className="h-4 w-4" aria-hidden="true" />
                {tCommon("logout")}
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <Button asChild size="lg">
                <Link href="/register" onClick={close}>
                  {tCommon("register")}
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/login" onClick={close}>
                  {tCommon("login")}
                </Link>
              </Button>
            </div>
          )}
        </div>

        <div className="mt-6 border-t pt-6">
          <p className="px-3 pb-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            {tCommon("language")}
          </p>
          <div className="px-3">
            <LanguageSwitcher variant="default" />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
