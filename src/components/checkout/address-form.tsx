"use client";

import { useEffect, useState } from "react";
import { ArrowUpRight, Loader2, MapPin, Plus } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { CheckoutAddress } from "./types";
import { EMPTY_ADDRESS } from "./types";

interface SavedAddress {
  id: string;
  firstName: string;
  lastName: string;
  street: string;
  street2?: string | null;
  city: string;
  postalCode: string;
  region?: string | null;
  country: string;
  phone?: string | null;
  isDefault?: boolean;
}

interface AddressFormProps {
  initialAddress: CheckoutAddress | null;
  initialSavedAddressId: string | null;
  isAuthenticated: boolean;
  userEmail?: string | null;
  onBack: () => void;
  onContinue: (
    address: CheckoutAddress,
    savedAddressId: string | null
  ) => void;
}

type AddressErrors = Partial<Record<keyof CheckoutAddress, string>>;

const LABEL =
  "font-mono text-[11px] uppercase tracking-[0.22em] text-foreground/55";
const INPUT =
  "mt-3 h-11 w-full border-x-0 border-t-0 border-b border-border/60 bg-transparent px-0 text-[15px] text-foreground outline-none placeholder:text-foreground/30 transition-colors focus:border-foreground";
const ERROR =
  "mt-2 font-mono text-[10px] uppercase tracking-[0.18em] text-destructive";

function validateAddress(address: CheckoutAddress): AddressErrors {
  const errors: AddressErrors = {};
  if (!address.firstName.trim()) errors.firstName = "Prénom requis";
  if (!address.lastName.trim()) errors.lastName = "Nom requis";
  if (!address.email.trim()) {
    errors.email = "Email requis";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address.email)) {
    errors.email = "Email invalide";
  }
  if (!address.phone.trim()) {
    errors.phone = "Téléphone requis";
  } else if (!/^[\d\s()+-]{8,}$/.test(address.phone)) {
    errors.phone = "Téléphone invalide";
  }
  if (!address.street.trim()) errors.street = "Adresse requise";
  if (!address.city.trim()) errors.city = "Ville requise";
  if (!address.postalCode.trim()) {
    errors.postalCode = "Code postal requis";
  } else if (!/^[A-Z0-9\s-]{3,10}$/i.test(address.postalCode)) {
    errors.postalCode = "Code postal invalide";
  }
  if (!address.country.trim()) errors.country = "Pays requis";
  return errors;
}

export default function AddressForm({
  initialAddress,
  initialSavedAddressId,
  isAuthenticated,
  userEmail,
  onBack,
  onContinue,
}: AddressFormProps) {
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [selectedSavedId, setSelectedSavedId] = useState<string | null>(
    initialSavedAddressId
  );
  const [showNewForm, setShowNewForm] = useState<boolean>(
    !isAuthenticated || !!initialAddress
  );
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);
  const [address, setAddress] = useState<CheckoutAddress>(
    initialAddress ?? { ...EMPTY_ADDRESS, email: userEmail ?? "" }
  );
  const [errors, setErrors] = useState<AddressErrors>({});

  useEffect(() => {
    if (!isAuthenticated) return;
    let cancelled = false;
    setIsLoadingAddresses(true);

    fetch("/api/addresses", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : { data: { addresses: [] } }))
      .then((body) => {
        if (cancelled) return;
        const list: SavedAddress[] =
          body?.data?.addresses ?? body?.addresses ?? [];
        setSavedAddresses(list);
        if (list.length > 0 && !initialAddress && !initialSavedAddressId) {
          const defaultAddr = list.find((a) => a.isDefault) ?? list[0];
          setSelectedSavedId(defaultAddr.id);
          setShowNewForm(false);
        } else if (list.length === 0) {
          // Aucune adresse enregistrée → afficher le formulaire directement
          setShowNewForm(true);
        }
      })
      .catch(() => {
        if (!cancelled) setSavedAddresses([]);
      })
      .finally(() => {
        if (!cancelled) setIsLoadingAddresses(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, initialAddress, initialSavedAddressId]);

  const handleChange = (field: keyof CheckoutAddress, value: string) => {
    setAddress((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!showNewForm && selectedSavedId) {
      const saved = savedAddresses.find((a) => a.id === selectedSavedId);
      if (!saved) return;
      const resolved: CheckoutAddress = {
        firstName: saved.firstName,
        lastName: saved.lastName,
        email: userEmail ?? "",
        phone: saved.phone ?? "",
        street: saved.street,
        street2: saved.street2 ?? "",
        city: saved.city,
        postalCode: saved.postalCode,
        region: saved.region ?? "",
        country: saved.country,
      };
      onContinue(resolved, selectedSavedId);
      return;
    }

    const validationErrors = validateAddress(address);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }
    onContinue(address, null);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-10">
      {/* Saved addresses */}
      {isAuthenticated && savedAddresses.length > 0 && (
        <div className="space-y-4">
          <p className={LABEL}>Adresses enregistrées</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {savedAddresses.map((saved) => {
              const isSelected =
                !showNewForm && selectedSavedId === saved.id;
              return (
                <button
                  type="button"
                  key={saved.id}
                  onClick={() => {
                    setSelectedSavedId(saved.id);
                    setShowNewForm(false);
                  }}
                  className={cn(
                    "flex flex-col items-start gap-3 border bg-background p-5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2",
                    isSelected
                      ? "border-foreground"
                      : "border-border/60 hover:border-foreground/60"
                  )}
                  aria-pressed={isSelected}
                >
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5 text-foreground/60" strokeWidth={1.5} />
                    <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-foreground">
                      {saved.firstName} {saved.lastName}
                    </span>
                    {saved.isDefault && (
                      <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-foreground/40">
                        · Défaut
                      </span>
                    )}
                  </div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-foreground/50">
                    {saved.street}, {saved.postalCode} {saved.city}
                  </p>
                </button>
              );
            })}
            <button
              type="button"
              onClick={() => {
                setShowNewForm(true);
                setSelectedSavedId(null);
              }}
              className={cn(
                "flex flex-col items-center justify-center gap-2 border border-dashed p-5 font-mono text-[10px] uppercase tracking-[0.22em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2",
                showNewForm
                  ? "border-foreground text-foreground"
                  : "border-border/60 text-foreground/50 hover:border-foreground/60 hover:text-foreground"
              )}
              aria-pressed={showNewForm}
            >
              <Plus className="h-4 w-4" />
              Nouvelle adresse
            </button>
          </div>
        </div>
      )}

      {isLoadingAddresses && (
        <p className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.22em] text-foreground/50">
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          Chargement
        </p>
      )}

      {/* New address form */}
      {showNewForm && (
        <div className="space-y-6 border-t border-border/60 pt-8">
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="firstName" className={LABEL}>Prénom *</label>
              <input id="firstName" value={address.firstName} onChange={(e) => handleChange("firstName", e.target.value)} placeholder="Jean" autoComplete="given-name" className={cn(INPUT, errors.firstName && "border-destructive focus:border-destructive")} />
              {errors.firstName && <p className={ERROR}>{errors.firstName}</p>}
            </div>
            <div>
              <label htmlFor="lastName" className={LABEL}>Nom *</label>
              <input id="lastName" value={address.lastName} onChange={(e) => handleChange("lastName", e.target.value)} placeholder="Dupont" autoComplete="family-name" className={cn(INPUT, errors.lastName && "border-destructive focus:border-destructive")} />
              {errors.lastName && <p className={ERROR}>{errors.lastName}</p>}
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="email" className={LABEL}>Email *</label>
              <input id="email" type="email" value={address.email} onChange={(e) => handleChange("email", e.target.value)} placeholder="jean@example.com" autoComplete="email" className={cn(INPUT, errors.email && "border-destructive focus:border-destructive")} />
              {errors.email && <p className={ERROR}>{errors.email}</p>}
            </div>
            <div>
              <label htmlFor="phone" className={LABEL}>Téléphone *</label>
              <input id="phone" type="tel" value={address.phone} onChange={(e) => handleChange("phone", e.target.value)} placeholder="06 12 34 56 78" autoComplete="tel" className={cn(INPUT, errors.phone && "border-destructive focus:border-destructive")} />
              {errors.phone && <p className={ERROR}>{errors.phone}</p>}
            </div>
          </div>

          <div>
            <label htmlFor="street" className={LABEL}>Adresse *</label>
            <input id="street" value={address.street} onChange={(e) => handleChange("street", e.target.value)} placeholder="123 rue de la Paix" autoComplete="address-line1" className={cn(INPUT, errors.street && "border-destructive focus:border-destructive")} />
            {errors.street && <p className={ERROR}>{errors.street}</p>}
          </div>

          <div>
            <label htmlFor="street2" className={LABEL}>Complément</label>
            <input id="street2" value={address.street2 ?? ""} onChange={(e) => handleChange("street2", e.target.value)} placeholder="Bâtiment, étage (optionnel)" autoComplete="address-line2" className={INPUT} />
          </div>

          <div className="grid gap-6 sm:grid-cols-3">
            <div>
              <label htmlFor="postalCode" className={LABEL}>Code postal *</label>
              <input id="postalCode" value={address.postalCode} onChange={(e) => handleChange("postalCode", e.target.value)} placeholder="75000" autoComplete="postal-code" className={cn(INPUT, "font-mono", errors.postalCode && "border-destructive focus:border-destructive")} />
              {errors.postalCode && <p className={ERROR}>{errors.postalCode}</p>}
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="city" className={LABEL}>Ville *</label>
              <input id="city" value={address.city} onChange={(e) => handleChange("city", e.target.value)} placeholder="Paris" autoComplete="address-level2" className={cn(INPUT, errors.city && "border-destructive focus:border-destructive")} />
              {errors.city && <p className={ERROR}>{errors.city}</p>}
            </div>
          </div>

          <div>
            <label htmlFor="country" className={LABEL}>Pays *</label>
            <div className="mt-3 border-b border-border/60">
              <select id="country" value={address.country} onChange={(e) => handleChange("country", e.target.value)} autoComplete="country" className="h-11 w-full appearance-none bg-transparent text-[15px] text-foreground outline-none">
                <option value="FR">France</option>
                <option value="BE">Belgique</option>
                <option value="CH">Suisse</option>
                <option value="LU">Luxembourg</option>
                <option value="DE">Allemagne</option>
                <option value="ES">Espagne</option>
                <option value="IT">Italie</option>
                <option value="PT">Portugal</option>
                <option value="NL">Pays-Bas</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col-reverse gap-3 border-t border-border/60 pt-8 sm:flex-row sm:justify-between">
        <button type="button" onClick={onBack} className="h-11 px-6 font-mono text-[10px] uppercase tracking-[0.22em] text-foreground/60 transition-colors hover:text-foreground focus-visible:outline-none focus-visible:underline">
          ← Retour
        </button>
        <button type="submit" className="group/cta inline-flex h-11 items-center gap-3 border border-foreground bg-background px-6 font-mono text-[10px] uppercase tracking-[0.22em] text-foreground transition-colors duration-300 hover:bg-foreground hover:text-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2">
          Continuer
          <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover/cta:-translate-y-0.5 group-hover/cta:translate-x-0.5" />
        </button>
      </div>
    </form>
  );
}
