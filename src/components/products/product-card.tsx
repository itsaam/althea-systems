"use client";

import Link from "next/link";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import StockBadge from "@/components/products/stock-badge";
import AddToCartButton from "@/components/cart/add-to-cart-button";

interface ProductCardProps {
  id: string;
  name: string;
  slug?: string;
  price: number;
  image?: string;
  stock: number;
}

export default function ProductCard({
  id,
  name,
  slug,
  price,
  image,
  stock,
}: ProductCardProps) {
  const productUrl = `/products/${slug || id}`;

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <Link href={productUrl}>
        <div className="aspect-square bg-muted relative cursor-pointer">
          {image && (
            <img src={image} alt={name} className="object-cover w-full h-full" />
          )}
          <StockBadge stock={stock} className="absolute top-2 right-2" />
        </div>
      </Link>
      <CardContent className="p-4">
        <Link href={productUrl}>
          <h3 className="font-medium truncate hover:underline cursor-pointer">{name}</h3>
        </Link>
        <p className="text-lg font-bold">{price.toFixed(2)} €</p>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <AddToCartButton
          productId={id}
          productName={name}
          price={price}
          image={image}
          disabled={stock === 0}
        />
      </CardFooter>
    </Card>
  );
}
