"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface CartSummaryProps {
  subtotal: number;
  shipping: number;
  total: number;
  actionLabel?: string;
  actionDisabled?: boolean;
  onActionClick?: () => void;
}

export default function CartSummary({
  subtotal,
  shipping,
  total,
  actionLabel,
  actionDisabled = false,
  onActionClick,
}: CartSummaryProps) {
  const t = useTranslations("cart");
  const label = actionLabel ?? t("placeOrder");

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("summary")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between">
          <span>{t("subtotal")}</span>
          <span>{subtotal.toFixed(2)} €</span>
        </div>
        <div className="flex justify-between">
          <span>{t("shipping")}</span>
          <span>
            {shipping === 0 ? t("free") : `${shipping.toFixed(2)} €`}
          </span>
        </div>
        <Separator />
        <div className="flex justify-between font-bold text-lg">
          <span>{t("total")}</span>
          <span>{total.toFixed(2)} €</span>
        </div>
      </CardContent>
      <CardFooter>
        <Button
          className="w-full"
          disabled={actionDisabled}
          onClick={onActionClick}
        >
          {label}
        </Button>
      </CardFooter>
    </Card>
  );
}
