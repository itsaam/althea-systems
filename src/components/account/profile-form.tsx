"use client";

import { useEffect, useState } from "react";
import { Check, Loader2, Lock, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

interface ProfileData {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
}

export default function ProfileForm() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [profile, setProfile] = useState<ProfileData>({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
  });

  useEffect(() => {
    fetch("/api/profile")
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setProfile({
            firstName: data.user.firstName ?? "",
            lastName: data.user.lastName ?? "",
            phone: data.user.phone ?? "",
            email: data.user.email ?? "",
          });
        }
      })
      .catch(() => toast.error("Impossible de charger votre profil"))
      .finally(() => setIsLoading(false));
  }, []);

  const updateField = <K extends keyof ProfileData>(
    key: K,
    value: ProfileData[K]
  ) => {
    setProfile((prev) => ({ ...prev, [key]: value }));
    setIsDirty(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: profile.firstName,
          lastName: profile.lastName,
          phone: profile.phone,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Erreur lors de la mise à jour");
        return;
      }

      toast.success("Profil mis à jour", {
        description: "Vos informations sont enregistrées.",
        icon: <Check className="h-4 w-4" />,
      });
      setIsDirty(false);
    } catch {
      toast.error("Une erreur est survenue");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-40" />
          <Skeleton className="mt-2 h-4 w-64" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Informations personnelles</CardTitle>
        <CardDescription>
          Ces informations apparaîtront sur vos factures et lors de vos livraisons.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="firstName">Prénom</Label>
              <Input
                id="firstName"
                value={profile.firstName}
                onChange={(e) => updateField("firstName", e.target.value)}
                placeholder="Jean"
                autoComplete="given-name"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="lastName">Nom</Label>
              <Input
                id="lastName"
                value={profile.lastName}
                onChange={(e) => updateField("lastName", e.target.value)}
                placeholder="Dupont"
                autoComplete="family-name"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email" className="flex items-center gap-1.5">
              Email
              <Lock
                className="h-3 w-3 text-muted-foreground"
                aria-hidden="true"
              />
            </Label>
            <Input
              id="email"
              type="email"
              value={profile.email}
              disabled
              className="bg-muted"
              autoComplete="email"
            />
            <p className="text-xs text-muted-foreground">
              L&apos;email sert d&apos;identifiant de connexion et ne peut pas
              être modifié. Contactez le support pour toute demande.
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="phone">Téléphone</Label>
            <Input
              id="phone"
              type="tel"
              value={profile.phone}
              onChange={(e) => updateField("phone", e.target.value)}
              placeholder="06 12 34 56 78"
              autoComplete="tel"
              inputMode="tel"
            />
            <p className="text-xs text-muted-foreground">
              Utilisé uniquement pour le suivi de vos commandes.
            </p>
          </div>

          <div className="flex flex-col-reverse items-stretch gap-3 border-t pt-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-muted-foreground">
              {isDirty
                ? "Modifications non enregistrées"
                : "Toutes vos modifications sont enregistrées"}
            </p>
            <Button
              type="submit"
              disabled={isSaving || !isDirty}
              className="h-10"
            >
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
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
