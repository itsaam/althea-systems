import { Button } from "@/components/ui/button";

interface CartItemProps {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

export default function CartItem({
  id,
  name,
  price,
  quantity,
  image,
}: CartItemProps) {
  return (
    <div className="flex gap-4 py-4 border-b">
      <div className="w-20 h-20 bg-muted rounded">
        {image && (
          <img
            src={image}
            alt={name}
            className="object-cover w-full h-full rounded"
          />
        )}
      </div>
      <div className="flex-1">
        <h3 className="font-medium">{name}</h3>
        <p className="text-sm text-muted-foreground">{price.toFixed(2)} €</p>
        <div className="flex items-center gap-2 mt-2">
          <Button variant="outline" size="sm">
            -
          </Button>
          <span>{quantity}</span>
          <Button variant="outline" size="sm">
            +
          </Button>
        </div>
      </div>
      <div className="text-right">
        <p className="font-bold">{(price * quantity).toFixed(2)} €</p>
        <Button variant="ghost" size="sm" className="text-destructive">
          Supprimer
        </Button>
      </div>
    </div>
  );
}
