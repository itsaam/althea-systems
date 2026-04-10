"use client";

import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface PasswordRule {
  id: string;
  label: string;
  test: (value: string) => boolean;
}

export const PASSWORD_RULES: PasswordRule[] = [
  {
    id: "length",
    label: "Au moins 12 caractères",
    test: (v) => v.length >= 12,
  },
  {
    id: "uppercase",
    label: "Une majuscule",
    test: (v) => /[A-Z]/.test(v),
  },
  {
    id: "lowercase",
    label: "Une minuscule",
    test: (v) => /[a-z]/.test(v),
  },
  {
    id: "number",
    label: "Un chiffre",
    test: (v) => /\d/.test(v),
  },
  {
    id: "special",
    label: "Un caractère spécial",
    test: (v) => /[^A-Za-z0-9]/.test(v),
  },
];

export function evaluatePasswordScore(value: string): number {
  return PASSWORD_RULES.reduce(
    (score, rule) => (rule.test(value) ? score + 1 : score),
    0
  );
}

export function isPasswordValid(value: string): boolean {
  return PASSWORD_RULES.every((rule) => rule.test(value));
}

interface PasswordStrengthMeterProps {
  value: string;
  className?: string;
}

const STRENGTH_LABELS = [
  "Très faible",
  "Faible",
  "Moyen",
  "Bon",
  "Fort",
  "Excellent",
];
const STRENGTH_COLORS = [
  "bg-destructive",
  "bg-destructive",
  "bg-orange-500",
  "bg-yellow-500",
  "bg-lime-500",
  "bg-emerald-500",
];

export default function PasswordStrengthMeter({
  value,
  className,
}: PasswordStrengthMeterProps) {
  const score = evaluatePasswordScore(value);
  const label = STRENGTH_LABELS[score];
  const color = STRENGTH_COLORS[score];

  return (
    <div className={cn("space-y-3", className)} aria-live="polite">
      <div className="flex items-center gap-2">
        <div
          className="flex h-1.5 flex-1 overflow-hidden rounded-full bg-muted"
          role="progressbar"
          aria-valuenow={score}
          aria-valuemin={0}
          aria-valuemax={PASSWORD_RULES.length}
          aria-label="Robustesse du mot de passe"
        >
          <div
            className={cn(
              "h-full rounded-full transition-all duration-300",
              color
            )}
            style={{
              width: `${(score / PASSWORD_RULES.length) * 100}%`,
            }}
          />
        </div>
        <span
          className={cn(
            "min-w-[72px] text-right text-xs font-medium",
            score <= 2 ? "text-destructive" : "text-muted-foreground"
          )}
        >
          {value.length > 0 ? label : "—"}
        </span>
      </div>

      <ul className="grid grid-cols-1 gap-1.5 text-xs sm:grid-cols-2">
        {PASSWORD_RULES.map((rule) => {
          const ok = rule.test(value);
          return (
            <li
              key={rule.id}
              className={cn(
                "flex items-center gap-1.5",
                ok ? "text-emerald-600" : "text-muted-foreground"
              )}
            >
              {ok ? (
                <Check className="h-3.5 w-3.5" aria-hidden="true" />
              ) : (
                <X className="h-3.5 w-3.5 opacity-50" aria-hidden="true" />
              )}
              <span>{rule.label}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
