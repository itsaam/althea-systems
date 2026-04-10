"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ShoppingBag } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { useAuth } from "@/hooks/use-auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import CheckoutSteps, { CHECKOUT_STEPS } from "./checkout-steps";
import AuthStep from "./auth-step";
import AddressForm from "./address-form";
import PaymentForm from "./payment-form";
import OrderReview from "./order-review";
import type { CheckoutAddress, CheckoutMode } from "./types";

const SHIPPING_COST = 10;
const TAX_RATE = 0.2;

export default function CheckoutForm() {
  const router = useRouter();
  const { items, total, clearCart } = useCart();
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [completedStep, setCompletedStep] = useState<number>(0);
  const [mode, setMode] = useState<CheckoutMode | null>(null);
  const [address, setAddress] = useState<CheckoutAddress | null>(null);
  const [savedAddressId, setSavedAddressId] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"stripe" | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const subtotal = total;
  const tax = useMemo(
    () => Math.round(subtotal * TAX_RATE * 100) / 100,
    [subtotal]
  );
  const grandTotal = subtotal + SHIPPING_COST + tax;

  if (!isAuthLoading && items.length === 0) {
    return (
      <Card className="border-orange-200 bg-orange-50/40">
        <CardContent className="flex flex-col items-center gap-4 p-8 text-center sm:flex-row sm:text-left">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-orange-100 text-orange-600">
            <ShoppingBag className="h-6 w-6" aria-hidden="true" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-orange-900">
              Votre panier est vide
            </p>
            <p className="mt-1 text-sm text-orange-800/80">
              Ajoutez des articles avant de procéder au paiement.
            </p>
          </div>
          <Button onClick={() => router.push("/products")}>
            Continuer vos achats
          </Button>
        </CardContent>
      </Card>
    );
  }

  const goTo = (step: number) => {
    if (step < 1 || step > CHECKOUT_STEPS.length) return;
    if (step > completedStep + 1) return;
    setCurrentStep(step);
  };

  const handleAuthContinue = (nextMode: CheckoutMode) => {
    setMode(nextMode);
    setCompletedStep((s) => Math.max(s, 1));
    setCurrentStep(2);
  };

  const handleAddressContinue = (
    nextAddress: CheckoutAddress,
    nextSavedId: string | null
  ) => {
    setAddress(nextAddress);
    setSavedAddressId(nextSavedId);
    setCompletedStep((s) => Math.max(s, 2));
    setCurrentStep(3);
  };

  const handlePaymentContinue = (method: "stripe") => {
    setPaymentMethod(method);
    setCompletedStep((s) => Math.max(s, 3));
    setCurrentStep(4);
  };

  const handleConfirmOrder = async () => {
    if (!address || !paymentMethod) {
      toast.error("Veuillez compléter toutes les étapes");
      return;
    }

    setIsSubmitting(true);

    try {
      if (isAuthenticated && user?.id) {
        const lineItems = items.map((item) => ({
          price_data: {
            currency: "eur",
            unit_amount: Math.round(item.price * 100),
            product_data: {
              name: item.name,
              metadata: { productId: item.id },
            },
          },
          quantity: item.quantity,
        }));

        const response = await fetch("/api/stripe/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            items: lineItems,
            orderId: `cart-${Date.now()}`,
          }),
        });

        if (!response.ok) {
          const error = await response.json().catch(() => ({}));
          throw new Error(
            error?.error ?? "Impossible de créer la session de paiement"
          );
        }

        const { url } = await response.json();

        if (url) {
          toast.success("Redirection vers le paiement sécurisé...");
          window.location.href = url;
          return;
        }

        throw new Error("URL de paiement manquante");
      } else {
        toast.info(
          "Commande en invité enregistrée. Vous serez recontacté par email."
        );
        clearCart();
        router.push("/checkout/confirmation?guest=1");
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Erreur lors du paiement";
      toast.error(message);
      console.error("Checkout error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardContent className="p-6 sm:p-8">
          <CheckoutSteps
            currentStep={currentStep}
            completedStep={completedStep}
            onStepClick={goTo}
          />
        </CardContent>
      </Card>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div>
          <Card>
            <CardHeader>
              <CardTitle>{CHECKOUT_STEPS[currentStep - 1].label}</CardTitle>
              <CardDescription>
                {CHECKOUT_STEPS[currentStep - 1].description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {currentStep === 1 && (
                <AuthStep
                  isAuthenticated={isAuthenticated}
                  userName={user?.name ?? null}
                  userEmail={user?.email ?? null}
                  onContinueAuthenticated={() =>
                    handleAuthContinue("authenticated")
                  }
                  onContinueGuest={() => handleAuthContinue("guest")}
                />
              )}

              {currentStep === 2 && (
                <AddressForm
                  initialAddress={address}
                  initialSavedAddressId={savedAddressId}
                  isAuthenticated={mode === "authenticated"}
                  userEmail={user?.email ?? null}
                  onBack={() => setCurrentStep(1)}
                  onContinue={handleAddressContinue}
                />
              )}

              {currentStep === 3 && (
                <PaymentForm
                  selected={paymentMethod}
                  onBack={() => setCurrentStep(2)}
                  onContinue={handlePaymentContinue}
                />
              )}

              {currentStep === 4 && address && (
                <OrderReview
                  address={address}
                  items={items.map((item) => ({
                    id: item.id,
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity,
                  }))}
                  subtotal={subtotal}
                  shipping={SHIPPING_COST}
                  tax={tax}
                  total={grandTotal}
                  isGuest={mode === "guest"}
                  onEditAddress={() => setCurrentStep(2)}
                  onEditPayment={() => setCurrentStep(3)}
                  onConfirm={handleConfirmOrder}
                  onBack={() => setCurrentStep(3)}
                  isSubmitting={isSubmitting}
                />
              )}
            </CardContent>
          </Card>
        </div>

        <aside aria-label="Récapitulatif de commande">
          <Card className="lg:sticky lg:top-24">
            <CardHeader>
              <CardTitle className="text-base">Récapitulatif</CardTitle>
              <CardDescription>
                {items.length} article{items.length > 1 ? "s" : ""} dans votre
                panier
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-3">
                {items.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-start justify-between gap-3 text-sm"
                  >
                    <div className="flex-1">
                      <p className="font-medium leading-tight">{item.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Qté : {item.quantity}
                      </p>
                    </div>
                    <p className="whitespace-nowrap font-medium">
                      {(item.price * item.quantity).toFixed(2)} €
                    </p>
                  </li>
                ))}
              </ul>

              <Separator />

              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Sous-total</dt>
                  <dd>{subtotal.toFixed(2)} €</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Livraison</dt>
                  <dd>{SHIPPING_COST.toFixed(2)} €</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">TVA (20 %)</dt>
                  <dd>{tax.toFixed(2)} €</dd>
                </div>
              </dl>

              <Separator />

              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>{grandTotal.toFixed(2)} €</span>
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
