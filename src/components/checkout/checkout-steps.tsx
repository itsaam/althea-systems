"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CheckoutStep {
  id: number;
  label: string;
  description: string;
}

export const CHECKOUT_STEPS: CheckoutStep[] = [
  { id: 1, label: "Compte", description: "Connexion ou invité" },
  { id: 2, label: "Adresse", description: "Livraison & facturation" },
  { id: 3, label: "Paiement", description: "Méthode sécurisée" },
  { id: 4, label: "Confirmation", description: "Récapitulatif final" },
];

interface CheckoutStepsProps {
  currentStep: number;
  onStepClick?: (step: number) => void;
  completedStep?: number;
}

/**
 * Stepper éditorial — numérotation mono tabular, pastilles outline,
 * ligne de progression minimale. Aucun bg-primary violet.
 */
export default function CheckoutSteps({
  currentStep,
  onStepClick,
  completedStep = 0,
}: CheckoutStepsProps) {
  return (
    <nav aria-label="Progression du checkout" className="w-full">
      <ol className="flex items-start justify-between gap-2 sm:gap-6">
        {CHECKOUT_STEPS.map((step, index) => {
          const isCompleted = step.id < currentStep || step.id <= completedStep;
          const isCurrent = step.id === currentStep;
          const isClickable = onStepClick && step.id <= completedStep + 1;
          const isLast = index === CHECKOUT_STEPS.length - 1;
          const stepRef = String(step.id).padStart(2, "0");

          return (
            <li
              key={step.id}
              className="flex flex-1 items-start"
              aria-current={isCurrent ? "step" : undefined}
            >
              <div className="flex flex-1 flex-col items-start">
                {/* Ligne du haut : pastille + trait */}
                <div className="flex w-full items-center">
                  <button
                    type="button"
                    onClick={
                      isClickable ? () => onStepClick(step.id) : undefined
                    }
                    disabled={!isClickable}
                    className={cn(
                      "flex h-9 w-9 shrink-0 items-center justify-center border font-mono text-[11px] tabular-nums transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2",
                      isCompleted &&
                        "border-foreground bg-foreground text-background",
                      isCurrent &&
                        !isCompleted &&
                        "border-foreground bg-background text-foreground",
                      !isCompleted &&
                        !isCurrent &&
                        "border-border/60 bg-background text-foreground/40",
                      isClickable &&
                        !isCurrent &&
                        "cursor-pointer hover:border-foreground hover:text-foreground",
                      !isClickable && "cursor-default"
                    )}
                    aria-label={`Étape ${step.id} : ${step.label}`}
                  >
                    {isCompleted ? (
                      <Check className="h-3.5 w-3.5" aria-hidden="true" />
                    ) : (
                      stepRef
                    )}
                  </button>
                  {!isLast && (
                    <div
                      className={cn(
                        "ml-3 h-px flex-1 transition-colors",
                        step.id < currentStep
                          ? "bg-foreground"
                          : "bg-border/60"
                      )}
                      aria-hidden="true"
                    />
                  )}
                </div>

                {/* Labels sous la pastille */}
                <div className="mt-4 hidden sm:block">
                  <p
                    className={cn(
                      "font-mono text-[11px] uppercase tracking-[0.18em]",
                      isCurrent || isCompleted
                        ? "text-foreground"
                        : "text-foreground/40"
                    )}
                  >
                    {step.label}
                  </p>
                  <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.18em] text-foreground/40">
                    {step.description}
                  </p>
                </div>
                <p
                  className={cn(
                    "mt-3 font-mono text-[10px] uppercase tracking-[0.18em] sm:hidden",
                    isCurrent || isCompleted
                      ? "text-foreground"
                      : "text-foreground/40"
                  )}
                >
                  {step.label}
                </p>
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
