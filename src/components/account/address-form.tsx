"use client";

import { useEffect, useState } from "react";
import { AlertCircle, Loader2, MapPin, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

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
          icon: <MapPin className="h-4 w-4" />,
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {initialAddress ? "Modifier l'adresse" : "Nouvelle adresse"}
          </DialogTitle>
          <DialogDescription>
            Les champs marqués sont nécessaires pour la livraison et la
            facturation.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {formError && (
            <div
              role="alert"
              className="flex items-start gap-2.5 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive"
            >
              <AlertCircle
                className="mt-0.5 h-4 w-4 shrink-0"
                aria-hidden="true"
              />
              <span>{formError}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="af-firstName">Prénom</Label>
              <Input
                id="af-firstName"
                required
                value={form.firstName}
                onChange={(e) =>
                  setForm({ ...form, firstName: e.target.value })
                }
                autoComplete="given-name"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="af-lastName">Nom</Label>
              <Input
                id="af-lastName"
                required
                value={form.lastName}
                onChange={(e) =>
                  setForm({ ...form, lastName: e.target.value })
                }
                autoComplete="family-name"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="af-street">Adresse</Label>
            <Input
              id="af-street"
              required
              value={form.street}
              onChange={(e) => setForm({ ...form, street: e.target.value })}
              placeholder="123 rue de la Paix"
              autoComplete="address-line1"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="af-street2">
              Complément{" "}
              <span className="text-xs font-normal text-muted-foreground">
                (optionnel)
              </span>
            </Label>
            <Input
              id="af-street2"
              value={form.street2}
              onChange={(e) => setForm({ ...form, street2: e.target.value })}
              placeholder="Bâtiment, étage, digicode…"
              autoComplete="address-line2"
            />
          </div>

          <div className="grid grid-cols-[1fr_auto] gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="af-city">Ville</Label>
              <Input
                id="af-city"
                required
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                autoComplete="address-level2"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="af-postalCode">Code postal</Label>
              <Input
                id="af-postalCode"
                required
                value={form.postalCode}
                onChange={(e) =>
                  setForm({ ...form, postalCode: e.target.value })
                }
                autoComplete="postal-code"
                inputMode="numeric"
                className="w-28"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="af-region">
                Région{" "}
                <span className="text-xs font-normal text-muted-foreground">
                  (optionnel)
                </span>
              </Label>
              <Input
                id="af-region"
                value={form.region}
                onChange={(e) => setForm({ ...form, region: e.target.value })}
                autoComplete="address-level1"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="af-country">Pays</Label>
              <Input
                id="af-country"
                required
                value={form.country}
                onChange={(e) =>
                  setForm({ ...form, country: e.target.value })
                }
                autoComplete="country-name"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="af-phone">
              Téléphone{" "}
              <span className="text-xs font-normal text-muted-foreground">
                (optionnel)
              </span>
            </Label>
            <Input
              id="af-phone"
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              autoComplete="tel"
              inputMode="tel"
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <Checkbox
              id="af-isDefault"
              checked={form.isDefault}
              onCheckedChange={(checked) =>
                setForm({ ...form, isDefault: checked === true })
              }
            />
            <Label
              htmlFor="af-isDefault"
              className="cursor-pointer text-sm font-normal text-muted-foreground"
            >
              Définir comme adresse par défaut
            </Label>
          </div>

          <DialogFooter className="gap-2 pt-2 sm:gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSaving}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2
                    className="mr-2 h-4 w-4 animate-spin"
                    aria-hidden="true"
                  />
                  Enregistrement…
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" aria-hidden="true" />
                  Enregistrer
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
