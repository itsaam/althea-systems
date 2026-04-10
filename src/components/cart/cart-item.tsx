"use client";

import { useTranslations } from "next-intl";
import { Minus, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CartItemProps {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  onIncrease: (id: string) => void;
  onDecrease: (id: string) => void;
  onRemove: (id: string) => void;
}

export default function CartItem({
  id,
  name,
  price,
  quantity,
  image,
  onIncrease,
  onDecrease,
  onRemove,
}: CartItemProps) {
  const t = useTranslations("cart");

  return (
    <div className="flex flex-col gap-4 border-b py-4 sm:flex-row sm:items-start sm:gap-5">
      <div className="flex gap-4 sm:contents">
        <div className="h-20 w-20 shrink-0 overflow-hidden rounded bg-muted sm:h-24 sm:w-24">
          {image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={image}
              alt={name}
              className="h-full w-full object-cover"
            />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="line-clamp-2 text-sm font-medium leading-snug sm:text-base">
            {name}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {price.toFixed(2)} €
          </p>
          <div className="mt-3 inline-flex items-center rounded-md border">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-none rounded-l-md"
              onClick={() => onDecrease(id)}
              aria-label={t("decreaseQuantity", { name })}
            >
              <Minus className="h-3.5 w-3.5" aria-hidden="true" />
            </Button>
            <span
              className="min-w-8 px-2 text-center text-sm font-medium tabular-nums"
              aria-live="polite"
            >
              {quantity}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-none rounded-r-md"
              onClick={() => onIncrease(id)}
              aria-label={t("increaseQuantity", { name })}
            >
              <Plus className="h-3.5 w-3.5" aria-hidden="true" />
            </Button>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end sm:justify-start sm:text-right">
        <p className="text-base font-bold tabular-nums sm:text-lg">
          {(price * quantity).toFixed(2)} €
        </p>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 px-2 text-destructive hover:bg-destructive/10 hover:text-destructive"
          onClick={() => onRemove(id)}
          aria-label={t("removeItemNamed", { name })}
        >
          <Trash2 className="h-4 w-4 sm:mr-1.5" aria-hidden="true" />
          <span className="hidden sm:inline">{t("remove")}</span>
        </Button>
      </div>
    </div>
  );
}
