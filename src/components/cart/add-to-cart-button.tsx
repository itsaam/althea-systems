"use client";

import { Button } from "@/components/ui/button";

interface AddToCartButtonProps {
  productId: string;
  disabled?: boolean;
}

export default function AddToCartButton({
  productId: _productId,
  disabled,
}: AddToCartButtonProps) {
  const handleAddToCart = () => {
    // TODO: Add to cart logic using _productId
    console.log("Add to cart:", _productId);
  };

  return (
    <Button onClick={handleAddToCart} disabled={disabled} className="w-full">
      Ajouter au panier
    </Button>
  );
}
