"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowUpRight, ShoppingBag } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { useAuth } from "@/hooks/use-auth";
import CheckoutSteps, { CHECKOUT_STEPS } from "./checkout-steps";
import AuthStep from "./auth-step";
import AddressForm from "./address-form";
import PaymentForm from "./payment-form";
import OrderReview from "./order-review";
import type { CheckoutAddress, CheckoutMode } from "./types";

const SHIPPING_COST = 10;
const TAX_RATE = 0.2;

function formatPrice(value: number) {
  if (!Number.isFinite(value)) return "—";
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

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

  // ── Empty state ────────────────────────────────────────
  if (!isAuthLoading && items.length === 0) {
    return (
      <div className="border-y border-border/60 py-24 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center border border-border/60">
          <ShoppingBag
            className="h-4 w-4 text-foreground/60"
            aria-hidden="true"
            strokeWidth={1.5}
          />
        </div>
        <p className="mt-6 font-mono text-[11px] uppercase tracking-[0.22em] text-foreground/50">
          Panier · 000 / Vide
        </p>
        <p className="mt-4 text-body text-foreground/70">
          Ajoutez des articles avant de procéder au paiement.
        </p>
        <button
          type="button"
          onClick={() => router.push("/categories")}
          className="group/back mt-8 inline-flex h-11 items-center gap-3 border border-foreground bg-background px-6 font-mono text-[10px] uppercase tracking-[0.22em] text-foreground transition-colors duration-300 hover:bg-foreground hover:text-background"
        >
          Explorer le catalogue
          <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover/back:-translate-y-0.5 group-hover/back:translate-x-0.5" />
        </button>
      </div>
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
            address,
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
          toast.success("Redirection vers le paiement sécurisé…");
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

  const currentStepConfig = CHECKOUT_STEPS[currentStep - 1];

  return (
    <div className="space-y-12">
      {/* ── Stepper ────────────────────────────────── */}
      <div className="border-y border-border/60 py-8">
        <CheckoutSteps
          currentStep={currentStep}
          completedStep={completedStep}
          onStepClick={goTo}
        />
      </div>

      {/* ── Main grid ──────────────────────────────── */}
      <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_400px] lg:gap-16">
        {/* Active step panel */}
        <div className="min-w-0">
          <header className="mb-10">
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-foreground/40">
              Étape {String(currentStep).padStart(2, "0")} / {String(CHECKOUT_STEPS.length).padStart(2, "0")}
            </p>
            <h2 className="mt-3 font-display text-[32px] font-semibold leading-[1.05] tracking-[-0.02em] text-foreground md:text-[40px]">
              {currentStepConfig.label}
              <span
                aria-hidden
                className="ml-1 inline-block h-1.5 w-1.5 translate-y-[-0.25em] rounded-full bg-electric-indigo-500 align-middle"
              />
            </h2>
            <p className="mt-3 max-w-md text-[14px] leading-relaxed text-foreground/60">
              {currentStepConfig.description}
            </p>
          </header>

          <div>
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
          </div>
        </div>

        {/* Sticky summary sidebar */}
        <aside
          aria-label="Récapitulatif de commande"
          className="lg:sticky lg:top-24 lg:self-start"
        >
          <div className="border border-border/60 bg-background">
            <header className="flex items-center justify-between border-b border-border/60 px-6 py-5">
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-foreground/50">
                — Récapitulatif
              </p>
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-foreground/40 tabular-nums">
                {String(items.length).padStart(2, "0")} art.
              </p>
            </header>

            {/* Items */}
            <ul className="divide-y divide-border/40 px-6">
              {items.map((item) => (
                <li
                  key={item.id}
                  className="flex items-start justify-between gap-3 py-4"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-mono text-[11px] uppercase tracking-[0.14em] text-foreground">
                      {item.name}
                    </p>
                    <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.18em] tabular-nums text-foreground/40">
                      Qté · {item.quantity}
                    </p>
                  </div>
                  <p className="whitespace-nowrap font-mono text-[12px] tabular-nums text-foreground/80">
                    {formatPrice(item.price * item.quantity)}
                  </p>
                </li>
              ))}
            </ul>

            {/* Totals */}
            <dl className="space-y-3 border-t border-border/60 px-6 py-6">
              <div className="flex items-baseline justify-between gap-4">
                <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-foreground/50">
                  Sous-total
                </dt>
                <dd className="font-mono text-[12px] tabular-nums text-foreground">
                  {formatPrice(subtotal)}
                </dd>
              </div>
              <div className="flex items-baseline justify-between gap-4">
                <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-foreground/50">
                  Livraison
                </dt>
                <dd className="font-mono text-[12px] tabular-nums text-foreground">
                  {formatPrice(SHIPPING_COST)}
                </dd>
              </div>
              <div className="flex items-baseline justify-between gap-4">
                <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-foreground/50">
                  TVA · 20%
                </dt>
                <dd className="font-mono text-[12px] tabular-nums text-foreground">
                  {formatPrice(tax)}
                </dd>
              </div>
            </dl>

            <div className="border-t border-border/60 px-6 py-6">
              <div className="flex items-baseline justify-between gap-4">
                <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-foreground/60">
                  Total TTC
                </p>
                <p className="font-mono text-[22px] font-medium tabular-nums text-foreground">
                  {formatPrice(grandTotal)}
                </p>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
