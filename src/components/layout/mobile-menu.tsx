"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export default function MobileMenu() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild className="md:hidden">
        <Button variant="ghost" size="icon">
          <span className="sr-only">Menu</span>
          <svg
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </Button>
      </SheetTrigger>
      <SheetContent side="left">
        <nav className="flex flex-col gap-4 mt-8">
          <Link
            href="/"
            onClick={() => setOpen(false)}
            className="text-lg font-medium"
          >
            Accueil
          </Link>
          <Link
            href="/categories"
            onClick={() => setOpen(false)}
            className="text-lg font-medium"
          >
            Catégories
          </Link>
          <Link
            href="/about"
            onClick={() => setOpen(false)}
            className="text-lg font-medium"
          >
            À propos
          </Link>
          <Link
            href="/contact"
            onClick={() => setOpen(false)}
            className="text-lg font-medium"
          >
            Contact
          </Link>
          <Link
            href="/cart"
            onClick={() => setOpen(false)}
            className="text-lg font-medium"
          >
            Panier
          </Link>
          <Link
            href="/login"
            onClick={() => setOpen(false)}
            className="text-lg font-medium"
          >
            Connexion
          </Link>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
