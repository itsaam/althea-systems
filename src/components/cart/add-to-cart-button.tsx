"use client";

import { Button } from "@/components/ui/button";

interface AddToCartButtonProps {
  productId: string;
  disabled?: boolean;
}

export default function AddToCartButton({
  productId,
  disabled,
}: AddToCartButtonProps) {
  const handleAddToCart = () => {
    // TODO: Add to cart logic
    // TODO: Implement add to cart logic
  };

  return (
    <Button onClick={handleAddToCart} disabled={disabled} className="w-full">
      Ajouter au panier
    </Button>
  );
}
