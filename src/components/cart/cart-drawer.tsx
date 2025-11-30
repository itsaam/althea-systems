"use client";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import CartItem from "@/components/cart/cart-item";
import CartSummary from "@/components/cart/cart-summary";

export default function CartDrawer() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon">
          <span className="sr-only">Panier</span>
          🛒
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Votre panier</SheetTitle>
        </SheetHeader>
        <div className="mt-8 flex flex-col h-full">
          <div className="flex-1 overflow-auto">
            {/* Cart items will be mapped here */}
          </div>
          <div className="mt-auto pt-4">
            <CartSummary subtotal={0} shipping={0} total={0} />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
