"use client";

import { useEffect, useState } from "react";
import { Loader2, MapPin, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
    if (Object.keys(validationErrors).length > 0) return;

    onContinue(address, null);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {isAuthenticated && savedAddresses.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Adresses enregistrées
          </h3>
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
                    "rounded-lg border p-4 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                    isSelected
                      ? "border-primary bg-primary/5 shadow-sm"
                      : "border-border hover:border-primary/60"
                  )}
                  aria-pressed={isSelected}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-primary" />
                      <span className="font-medium">
                        {saved.firstName} {saved.lastName}
                      </span>
                    </div>
                    {saved.isDefault && (
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase text-primary">
                        Par défaut
                      </span>
                    )}
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {saved.street}
                    {saved.street2 ? `, ${saved.street2}` : ""}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {saved.postalCode} {saved.city}, {saved.country}
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
                "flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-4 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                showNewForm
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-border text-muted-foreground hover:border-primary/60 hover:text-primary"
              )}
              aria-pressed={showNewForm}
            >
              <Plus className="h-5 w-5" aria-hidden="true" />
              Nouvelle adresse
            </button>
          </div>
        </div>
      )}

      {isLoadingAddresses && (
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          Chargement de vos adresses...
        </p>
      )}

      {showNewForm && (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="firstName">Prénom *</Label>
              <Input
                id="firstName"
                value={address.firstName}
                onChange={(e) => handleChange("firstName", e.target.value)}
                placeholder="Jean"
                autoComplete="given-name"
                aria-invalid={!!errors.firstName}
                className={errors.firstName ? "border-destructive" : ""}
              />
              {errors.firstName && (
                <p className="text-xs text-destructive">{errors.firstName}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="lastName">Nom *</Label>
              <Input
                id="lastName"
                value={address.lastName}
                onChange={(e) => handleChange("lastName", e.target.value)}
                placeholder="Dupont"
                autoComplete="family-name"
                aria-invalid={!!errors.lastName}
                className={errors.lastName ? "border-destructive" : ""}
              />
              {errors.lastName && (
                <p className="text-xs text-destructive">{errors.lastName}</p>
              )}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={address.email}
                onChange={(e) => handleChange("email", e.target.value)}
                placeholder="jean@example.com"
                autoComplete="email"
                aria-invalid={!!errors.email}
                className={errors.email ? "border-destructive" : ""}
              />
              {errors.email && (
                <p className="text-xs text-destructive">{errors.email}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone">Téléphone *</Label>
              <Input
                id="phone"
                type="tel"
                value={address.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                placeholder="06 12 34 56 78"
                autoComplete="tel"
                aria-invalid={!!errors.phone}
                className={errors.phone ? "border-destructive" : ""}
              />
              {errors.phone && (
                <p className="text-xs text-destructive">{errors.phone}</p>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="street">Adresse *</Label>
            <Input
              id="street"
              value={address.street}
              onChange={(e) => handleChange("street", e.target.value)}
              placeholder="123 rue de la Paix"
              autoComplete="address-line1"
              aria-invalid={!!errors.street}
              className={errors.street ? "border-destructive" : ""}
            />
            {errors.street && (
              <p className="text-xs text-destructive">{errors.street}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="street2">Complément d&apos;adresse</Label>
            <Input
              id="street2"
              value={address.street2 ?? ""}
              onChange={(e) => handleChange("street2", e.target.value)}
              placeholder="Bâtiment, étage, appartement (optionnel)"
              autoComplete="address-line2"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1.5 sm:col-span-1">
              <Label htmlFor="postalCode">Code postal *</Label>
              <Input
                id="postalCode"
                value={address.postalCode}
                onChange={(e) => handleChange("postalCode", e.target.value)}
                placeholder="75000"
                autoComplete="postal-code"
                aria-invalid={!!errors.postalCode}
                className={errors.postalCode ? "border-destructive" : ""}
              />
              {errors.postalCode && (
                <p className="text-xs text-destructive">{errors.postalCode}</p>
              )}
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="city">Ville *</Label>
              <Input
                id="city"
                value={address.city}
                onChange={(e) => handleChange("city", e.target.value)}
                placeholder="Paris"
                autoComplete="address-level2"
                aria-invalid={!!errors.city}
                className={errors.city ? "border-destructive" : ""}
              />
              {errors.city && (
                <p className="text-xs text-destructive">{errors.city}</p>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="country">Pays *</Label>
            <select
              id="country"
              value={address.country}
              onChange={(e) => handleChange("country", e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              autoComplete="country"
            >
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
      )}

      <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-between">
        <Button type="button" variant="outline" onClick={onBack}>
          Retour
        </Button>
        <Button type="submit">Continuer vers le paiement</Button>
      </div>
    </form>
  );
}
