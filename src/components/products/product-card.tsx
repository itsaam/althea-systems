import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import StockBadge from "@/components/products/stock-badge";

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  image?: string;
  stock: number;
}

export default function ProductCard({
  id: _id,
  name,
  price,
  image,
  stock,
}: ProductCardProps) {
  return (
    <Card className="overflow-hidden">
      <div className="aspect-square bg-muted relative">
        {image && (
          <img src={image} alt={name} className="object-cover w-full h-full" />
        )}
        <StockBadge stock={stock} className="absolute top-2 right-2" />
      </div>
      <CardContent className="p-4">
        <h3 className="font-medium truncate">{name}</h3>
        <p className="text-lg font-bold">{price.toFixed(2)} €</p>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button className="w-full" disabled={stock === 0}>
          Ajouter au panier
        </Button>
      </CardFooter>
    </Card>
  );
}
