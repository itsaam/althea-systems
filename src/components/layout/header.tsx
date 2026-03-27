"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import Logo from "@/components/shared/logo";
import SearchBar from "@/components/shared/search-bar";
import MobileMenu from "@/components/layout/mobile-menu";
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

export default function Header() {
  const { data: session, status } = useSession();
  const [searchOpen, setSearchOpen] = useState(false);
  const { itemCount } = useCart();

  const getInitials = (name?: string | null) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-xl border-b border-border/40">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo - Gauche */}
          <div className="flex-shrink-0">
            <Logo />
          </div>

          {/* Navigation - Centre */}
          <nav className="hidden md:flex items-center justify-center gap-1">
            <Link
              href="/categories"
              className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200"
            >
              Catégories
            </Link>
            <Link
              href="/about"
              className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200"
            >
              À propos
            </Link>
            <Link
              href="/contact"
              className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200"
            >
              Contact
            </Link>
          </nav>

          {/* Actions - Droite */}
          <div className="flex items-center gap-1">
            {/* Search Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="hidden md:flex h-9 w-9 text-muted-foreground hover:text-foreground"
              onClick={() => setSearchOpen(!searchOpen)}
            >
              <Search className="h-[18px] w-[18px]" />
            </Button>

            {/* Cart */}
            <Link href="/cart">
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 text-muted-foreground hover:text-foreground relative"
              >
                <ShoppingBag className="h-[18px] w-[18px]" />
                {itemCount > 0 ? (
                  <span className="absolute -top-1 -right-1 min-w-4 h-4 rounded-full bg-primary text-primary-foreground text-[10px] px-1 flex items-center justify-center">
                    {itemCount > 99 ? "99+" : itemCount}
                  </span>
                ) : null}
              </Button>
            </Link>

            {/* User Menu */}
            {status === "loading" ? (
              <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
            ) : session?.user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-9 w-9 rounded-full p-0"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={session.user.image || ""}
                        alt={session.user.name || ""}
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
                      <User className="mr-2 h-4 w-4" />
                      Mon profil
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      href="/orders"
                      className="cursor-pointer flex items-center"
                    >
                      <Package className="mr-2 h-4 w-4" />
                      Mes commandes
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
                          <Settings className="mr-2 h-4 w-4" />
                          Administration
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="cursor-pointer text-destructive focus:text-destructive flex items-center"
                    onClick={() => signOut({ callbackUrl: "/" })}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Déconnexion
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="hidden md:flex items-center gap-2 ml-2">
                <Link href="/login">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Connexion
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm" className="rounded-full px-4">
                    S&apos;inscrire
                  </Button>
                </Link>
              </div>
            )}

            <MobileMenu />
          </div>
        </div>

        {/* Barre de recherche extensible */}
        <div
          className={`overflow-hidden transition-all duration-300 ease-out ${
            searchOpen ? "max-h-16 pb-4" : "max-h-0"
          }`}
        >
          <SearchBar />
        </div>
      </div>
    </header>
  );
}
