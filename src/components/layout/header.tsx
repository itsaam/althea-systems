"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useTranslations } from "next-intl";
import SearchBar from "@/components/shared/search-bar";
import MobileMenu from "@/components/layout/mobile-menu";
import LanguageSwitcher from "@/components/layout/language-switcher";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  User,
  ShoppingBag,
  LogOut,
  Settings,
  Package,
  Search,
} from "lucide-react";
import { useState } from "react";
import { useCart } from "@/hooks/use-cart";

const NAV_LINKS = [
  { href: "/categories", key: "categories" },
  { href: "/about", key: "about" },
  { href: "/contact", key: "contact" },
] as const;

export default function Header() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [searchOpen, setSearchOpen] = useState(false);
  const { itemCount } = useCart();
  const tCommon = useTranslations("common");
  const tNav = useTranslations("nav");

  const getInitials = (name?: string | null) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const isActive = (href: string) =>
    pathname === href || pathname?.startsWith(`${href}/`);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/85 backdrop-blur-xl">
      <div className="w-full px-4 sm:px-6 lg:px-10">
        <div className="grid h-14 grid-cols-[1fr_auto_1fr] items-center gap-4">
          <div className="flex items-center justify-start">
            <Link
              href="/"
              className="group inline-flex items-center gap-3"
              aria-label={tCommon("brandHome")}
            >
              <Image
                src="/images/logos/logo-full.png"
                alt="Althea Systems"
                width={471}
                height={183}
                priority
                className="h-9 w-auto"
              />
              <span className="hidden font-mono text-[9px] uppercase tracking-[0.22em] text-foreground/45 transition-colors duration-300 group-hover:text-foreground/65 md:inline-block">
                {tCommon("brandTagline")}
              </span>
            </Link>
          </div>

          <nav
            className="hidden md:flex items-center justify-center gap-8"
            aria-label={tCommon("mainNavigation")}
          >
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive(link.href) ? "page" : undefined}
                className="font-mono text-[11px] lowercase tracking-[0.14em] text-foreground/55 transition-colors duration-300 hover:text-foreground aria-[current=page]:text-foreground rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                {tNav(link.key)}
              </Link>
            ))}
          </nav>

          <div className="flex items-center justify-end gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="hidden md:flex h-9 w-9 text-foreground/70 hover:text-foreground"
              onClick={() => setSearchOpen((v) => !v)}
              aria-label={searchOpen ? tCommon("closeSearch") : tCommon("openSearch")}
              aria-expanded={searchOpen}
              aria-controls="site-search"
            >
              <Search className="h-[18px] w-[18px]" aria-hidden="true" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-foreground/70 hover:text-foreground relative"
              asChild
            >
              <Link
                href="/cart"
                aria-label={
                  itemCount > 0
                    ? tCommon("cartWithCount", { count: itemCount })
                    : tCommon("cartEmpty")
                }
              >
                <ShoppingBag className="h-[18px] w-[18px]" aria-hidden="true" />
                {itemCount > 0 ? (
                  <span
                    className="absolute -top-1 -right-1 min-w-4 h-4 rounded-full bg-primary text-primary-foreground text-[10px] px-1 flex items-center justify-center"
                    aria-hidden="true"
                  >
                    {itemCount > 99 ? "99+" : itemCount}
                  </span>
                ) : null}
              </Link>
            </Button>

            {status === "loading" ? (
              <div
                className="w-8 h-8 rounded-full bg-muted animate-pulse"
                role="status"
                aria-label={tCommon("loadingSession")}
              />
            ) : session?.user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-9 w-9 rounded-full p-0"
                    aria-label={
                      session.user.name
                        ? tCommon("userMenuNamed", { name: session.user.name })
                        : tCommon("userMenu")
                    }
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={session.user.image || ""}
                        alt=""
                      />
                      <AvatarFallback className="text-xs font-medium">
                        {getInitials(session.user.name)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-56 mt-2"
                  align="end"
                  forceMount
                >
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {session.user.name}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {session.user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link
                      href="/profile"
                      className="cursor-pointer flex items-center"
                    >
                      <User className="mr-2 h-4 w-4" aria-hidden="true" />
                      {tCommon("myProfile")}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      href="/orders"
                      className="cursor-pointer flex items-center"
                    >
                      <Package className="mr-2 h-4 w-4" aria-hidden="true" />
                      {tCommon("myOrders")}
                    </Link>
                  </DropdownMenuItem>
                  {session.user.role === "ADMIN" && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link
                          href="/admin"
                          className="cursor-pointer flex items-center"
                        >
                          <Settings className="mr-2 h-4 w-4" aria-hidden="true" />
                          {tCommon("administration")}
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="cursor-pointer text-destructive focus:text-destructive flex items-center"
                    onClick={() => signOut({ callbackUrl: "/" })}
                  >
                    <LogOut className="mr-2 h-4 w-4" aria-hidden="true" />
                    {tCommon("logout")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="hidden md:flex items-center gap-2 ml-2">
                <Link href="/login">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-foreground/70 hover:text-foreground"
                  >
                    {tCommon("login")}
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm" className="rounded-full px-4">
                    {tCommon("register")}
                  </Button>
                </Link>
              </div>
            )}

            <LanguageSwitcher variant="compact" />

            <MobileMenu />
          </div>
        </div>

        <div
          id="site-search"
          className={`overflow-hidden border-t border-border/40 transition-all duration-300 ease-out ${
            searchOpen ? "max-h-20 pt-3 pb-4" : "max-h-0 border-transparent"
          }`}
          inert={!searchOpen}
        >
          <SearchBar />
        </div>
      </div>
    </header>
  );
}
