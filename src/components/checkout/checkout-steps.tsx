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
  { id: 3, label: "Paiement", description: "Méthode de paiement" },
  { id: 4, label: "Confirmation", description: "Récapitulatif final" },
];

interface CheckoutStepsProps {
  currentStep: number;
  onStepClick?: (step: number) => void;
  completedStep?: number;
}

export default function CheckoutSteps({
  currentStep,
  onStepClick,
  completedStep = 0,
}: CheckoutStepsProps) {
  return (
    <nav
      aria-label="Progression du checkout"
      className="w-full"
    >
      <ol className="flex items-start justify-between gap-2 sm:gap-4">
        {CHECKOUT_STEPS.map((step, index) => {
          const isCompleted = step.id < currentStep || step.id <= completedStep;
          const isCurrent = step.id === currentStep;
          const isClickable = onStepClick && step.id <= completedStep + 1;
          const isLast = index === CHECKOUT_STEPS.length - 1;

          return (
            <li
              key={step.id}
              className="flex flex-1 items-start"
              aria-current={isCurrent ? "step" : undefined}
            >
              <div className="flex flex-1 flex-col items-center">
                <div className="flex w-full items-center">
                  <div
                    className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 text-sm font-semibold transition-all",
                      isCompleted &&
                        "border-primary bg-primary text-primary-foreground",
                      isCurrent &&
                        !isCompleted &&
                        "border-primary bg-background text-primary ring-4 ring-primary/15",
                      !isCompleted &&
                        !isCurrent &&
                        "border-muted bg-background text-muted-foreground",
                      isClickable &&
                        !isCurrent &&
                        "cursor-pointer hover:border-primary/70"
                    )}
                    onClick={
                      isClickable ? () => onStepClick(step.id) : undefined
                    }
                    role={isClickable ? "button" : undefined}
                    tabIndex={isClickable ? 0 : undefined}
                    onKeyDown={
                      isClickable
                        ? (e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              onStepClick(step.id);
                            }
                          }
                        : undefined
                    }
                  >
                    {isCompleted ? (
                      <Check className="h-5 w-5" aria-hidden="true" />
                    ) : (
                      step.id
                    )}
                  </div>
                  {!isLast && (
                    <div
                      className={cn(
                        "mx-2 h-0.5 flex-1 rounded-full transition-colors",
                        step.id < currentStep
                          ? "bg-primary"
                          : "bg-muted"
                      )}
                      aria-hidden="true"
                    />
                  )}
                </div>
                <div className="mt-3 hidden text-center sm:block">
                  <p
                    className={cn(
                      "text-sm font-medium",
                      isCurrent || isCompleted
                        ? "text-foreground"
                        : "text-muted-foreground"
                    )}
                  >
                    {step.label}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {step.description}
                  </p>
                </div>
                <p
                  className={cn(
                    "mt-2 text-xs font-medium sm:hidden",
                    isCurrent || isCompleted
                      ? "text-foreground"
                      : "text-muted-foreground"
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
