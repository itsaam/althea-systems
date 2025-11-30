"use client";

import { cn } from "@/lib/utils";

interface Step {
  id: number;
  label: string;
}

const steps: Step[] = [
  { id: 1, label: "Panier" },
  { id: 2, label: "Livraison" },
  { id: 3, label: "Paiement" },
  { id: 4, label: "Confirmation" },
];

interface CheckoutStepsProps {
  currentStep: number;
}

export default function CheckoutSteps({ currentStep }: CheckoutStepsProps) {
  return (
    <div className="flex justify-between">
      {steps.map((step) => (
        <div key={step.id} className="flex items-center">
          <div
            className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
              currentStep >= step.id
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            )}
          >
            {step.id}
          </div>
          <span className="ml-2 text-sm hidden sm:inline">{step.label}</span>
        </div>
      ))}
    </div>
  );
}
