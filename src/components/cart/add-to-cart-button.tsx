"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useCart } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
import { Plus, Minus } from "lucide-react";

interface AddToCartButtonProps {
  productId: string;
  productName: string;
  price: number;
  image?: string;
  disabled?: boolean;
}

export default function AddToCartButton({
  productId,
  productName,
  price,
  image,
  disabled,
}: AddToCartButtonProps) {
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);

  const handleAddToCart = () => {
    addItem(
      {
        id: productId,
        name: productName,
        price,
        image,
      },
      quantity
    );

    toast.success(`${quantity} produit${quantity > 1 ? "s" : ""} ajouté${quantity > 1 ? "s" : ""} au panier`);
    setQuantity(1); // Reset après ajout
  };

  const handleIncrease = () => {
    setQuantity((prev) => prev + 1);
  };

  const handleDecrease = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Quantity Selector */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={handleDecrease}
          disabled={quantity <= 1 || disabled}
        >
          <Minus className="h-4 w-4" />
        </Button>
        <span className="w-12 text-center font-semibold">{quantity}</span>
        <Button
          variant="outline"
          size="icon"
          onClick={handleIncrease}
          disabled={disabled}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Add to Cart Button */}
      <Button onClick={handleAddToCart} disabled={disabled} className="w-full">
        Ajouter au panier
      </Button>
    </div>
  );
}
