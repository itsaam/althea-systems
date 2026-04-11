"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export interface Address {
  id: string;
  firstName: string;
  lastName: string;
  street: string;
  street2?: string | null;
  city: string;
  region?: string | null;
  postalCode: string;
  country: string;
  phone?: string | null;
  isDefault: boolean;
}

interface AddressFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialAddress: Address | null;
  onSaved: () => void;
}

type FormState = {
  firstName: string;
  lastName: string;
  street: string;
  street2: string;
  city: string;
  region: string;
  postalCode: string;
  country: string;
  phone: string;
  isDefault: boolean;
};

const EMPTY_FORM: FormState = {
  firstName: "",
  lastName: "",
  street: "",
  street2: "",
  city: "",
  region: "",
  postalCode: "",
  country: "France",
  phone: "",
  isDefault: false,
};

const INPUT_BASE =
  "block w-full border-0 border-b border-border/60 bg-transparent px-0 py-2 text-[14px] text-foreground transition-colors placeholder:text-foreground/30 focus:border-foreground focus:outline-none focus:ring-0";
const LABEL_BASE =
  "block font-mono text-[10px] uppercase tracking-[0.18em] text-foreground/55";

export default function AddressForm({
  open,
  onOpenChange,
  initialAddress,
  onSaved,
}: AddressFormProps) {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    if (initialAddress) {
      setForm({
        firstName: initialAddress.firstName,
        lastName: initialAddress.lastName,
        street: initialAddress.street,
        street2: initialAddress.street2 ?? "",
        city: initialAddress.city,
        region: initialAddress.region ?? "",
        postalCode: initialAddress.postalCode,
        country: initialAddress.country,
        phone: initialAddress.phone ?? "",
        isDefault: initialAddress.isDefault,
      });
    } else {
      setForm(EMPTY_FORM);
    }
    setFormError(null);
  }, [open, initialAddress]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onOpenChange]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setIsSaving(true);

    const payload = {
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      street: form.street.trim(),
      street2: form.street2.trim() || undefined,
      city: form.city.trim(),
      region: form.region.trim() || undefined,
      postalCode: form.postalCode.trim(),
      country: form.country.trim(),
      phone: form.phone.trim() || undefined,
      isDefault: form.isDefault,
    };

    try {
      const url = initialAddress
        ? `/api/addresses/${initialAddress.id}`
        : "/api/addresses";
      const method = initialAddress ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setFormError(
          data?.error || data?.message || "Erreur lors de l'enregistrement"
        );
        return;
      }

      toast.success(
        initialAddress ? "Adresse mise à jour" : "Adresse ajoutée",
        {
          description: initialAddress
            ? "Vos modifications sont enregistrées."
            : "Votre nouvelle adresse est disponible au checkout.",
        }
      );
      onSaved();
      onOpenChange(false);
    } catch {
      setFormError("Une erreur est survenue");
    } finally {
      setIsSaving(false);
    }
  };

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="address-dialog-title"
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-foreground/10 p-4 backdrop-blur-sm md:items-center md:p-6"
      onClick={(e) => {
        if (e.target === e.currentTarget) onOpenChange(false);
      }}
    >
      <div className="w-full max-w-lg border border-border/60 bg-background p-8 shadow-sm">
        <div className="mb-8">
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-foreground/55">
            <span className="mr-1.5 opacity-60">—</span>
            {initialAddress ? "Édition" : "Nouvelle adresse"}
          </p>
          <h2
            id="address-dialog-title"
            className="mt-3 font-display text-[24px] font-semibold leading-[1.1] tracking-[-0.02em] text-foreground"
          >
            {initialAddress ? "Modifier l'adresse" : "Créer une adresse"}
            <span
              aria-hidden
              className="ml-1 inline-block h-1 w-1 translate-y-[-0.3em] rounded-full bg-electric-indigo-500 align-middle"
            />
          </h2>
          <p className="mt-2 text-[13px] leading-relaxed text-foreground/60">
            Les champs marqués sont nécessaires pour la livraison et la
            facturation.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          {formError && (
            <div
              role="alert"
              className="border-l-2 border-destructive pl-4 py-2 font-mono text-[11px] uppercase tracking-[0.14em] text-destructive"
            >
              {formError}
            </div>
          )}

          <div className="grid grid-cols-2 gap-5">
            <div className="space-y-2">
              <label htmlFor="af-firstName" className={LABEL_BASE}>
                Prénom
              </label>
              <input
                id="af-firstName"
                required
                value={form.firstName}
                onChange={(e) =>
                  setForm({ ...form, firstName: e.target.value })
                }
                autoComplete="given-name"
                className={INPUT_BASE}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="af-lastName" className={LABEL_BASE}>
                Nom
              </label>
              <input
                id="af-lastName"
                required
                value={form.lastName}
                onChange={(e) =>
                  setForm({ ...form, lastName: e.target.value })
                }
                autoComplete="family-name"
                className={INPUT_BASE}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="af-street" className={LABEL_BASE}>
              Adresse
            </label>
            <input
              id="af-street"
              required
              value={form.street}
              onChange={(e) => setForm({ ...form, street: e.target.value })}
              placeholder="123 rue de la Paix"
              autoComplete="address-line1"
              className={INPUT_BASE}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="af-street2" className={LABEL_BASE}>
              Complément · optionnel
            </label>
            <input
              id="af-street2"
              value={form.street2}
              onChange={(e) => setForm({ ...form, street2: e.target.value })}
              placeholder="Bâtiment, étage, digicode…"
              autoComplete="address-line2"
              className={INPUT_BASE}
            />
          </div>

          <div className="grid grid-cols-[1fr_140px] gap-5">
            <div className="space-y-2">
              <label htmlFor="af-city" className={LABEL_BASE}>
                Ville
              </label>
              <input
                id="af-city"
                required
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                autoComplete="address-level2"
                className={INPUT_BASE}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="af-postalCode" className={LABEL_BASE}>
                Code postal
              </label>
              <input
                id="af-postalCode"
                required
                value={form.postalCode}
                onChange={(e) =>
                  setForm({ ...form, postalCode: e.target.value })
                }
                autoComplete="postal-code"
                inputMode="numeric"
                className={cn(INPUT_BASE, "tabular-nums")}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-5">
            <div className="space-y-2">
              <label htmlFor="af-region" className={LABEL_BASE}>
                Région · optionnel
              </label>
              <input
                id="af-region"
                value={form.region}
                onChange={(e) => setForm({ ...form, region: e.target.value })}
                autoComplete="address-level1"
                className={INPUT_BASE}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="af-country" className={LABEL_BASE}>
                Pays
              </label>
              <input
                id="af-country"
                required
                value={form.country}
                onChange={(e) =>
                  setForm({ ...form, country: e.target.value })
                }
                autoComplete="country-name"
                className={INPUT_BASE}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="af-phone" className={LABEL_BASE}>
              Téléphone · optionnel
            </label>
            <input
              id="af-phone"
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              autoComplete="tel"
              inputMode="tel"
              className={cn(INPUT_BASE, "tabular-nums")}
            />
          </div>

          <label className="flex cursor-pointer items-center gap-3 pt-2">
            <input
              type="checkbox"
              checked={form.isDefault}
              onChange={(e) =>
                setForm({ ...form, isDefault: e.target.checked })
              }
              className="h-4 w-4 cursor-pointer accent-foreground"
            />
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-foreground/70">
              Définir comme adresse par défaut
            </span>
          </label>

          <div className="flex items-center justify-end gap-4 border-t border-border/60 pt-6">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              disabled={isSaving}
              className="font-mono text-[10px] uppercase tracking-[0.18em] text-foreground/55 hover:text-foreground"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className={cn(
                "inline-flex items-center justify-center rounded-full bg-foreground px-8 py-4 font-mono text-[11px] uppercase tracking-[0.18em] text-background transition-opacity",
                isSaving && "opacity-40"
              )}
            >
              {isSaving ? "Enregistrement…" : "Enregistrer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
