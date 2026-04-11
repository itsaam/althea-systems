"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ProfileData {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
}

const INPUT_BASE =
  "block w-full border-0 border-b border-border/60 bg-transparent px-0 py-3 text-[17px] text-foreground transition-colors placeholder:text-foreground/30 focus:border-foreground focus:outline-none focus:ring-0";
const LABEL_BASE =
  "block font-mono text-[11px] uppercase tracking-[0.2em] text-foreground/55";

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
        if (data?.user) {
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
        toast.error(data?.error || "Erreur lors de la mise à jour");
        return;
      }

      toast.success("Profil mis à jour", {
        description: "Vos informations sont enregistrées.",
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
      <section aria-busy="true" className="space-y-6">
        <div className="space-y-3">
          <div className="h-3 w-48 animate-pulse rounded bg-foreground/5" />
          <div className="h-4 w-72 animate-pulse rounded bg-foreground/5" />
        </div>
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="h-10 animate-pulse rounded bg-foreground/5" />
          <div className="h-10 animate-pulse rounded bg-foreground/5" />
        </div>
        <div className="h-10 animate-pulse rounded bg-foreground/5" />
        <div className="h-10 animate-pulse rounded bg-foreground/5" />
      </section>
    );
  }

  return (
    <section className="space-y-8">
      <div className="space-y-3">
        <p className="font-mono text-[12px] uppercase tracking-[0.22em] text-foreground/55">
          <span className="mr-1.5 opacity-60">—</span>
          Informations personnelles
        </p>
        <p className="text-[16px] leading-relaxed text-foreground/65">
          Affichées sur vos factures et livraisons.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8" noValidate>
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="firstName" className={LABEL_BASE}>
              Prénom
            </label>
            <input
              id="firstName"
              value={profile.firstName}
              onChange={(e) => updateField("firstName", e.target.value)}
              placeholder="Jean"
              autoComplete="given-name"
              className={INPUT_BASE}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="lastName" className={LABEL_BASE}>
              Nom
            </label>
            <input
              id="lastName"
              value={profile.lastName}
              onChange={(e) => updateField("lastName", e.target.value)}
              placeholder="Dupont"
              autoComplete="family-name"
              className={INPUT_BASE}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="email" className={LABEL_BASE}>
            Email
          </label>
          <input
            id="email"
            type="email"
            value={profile.email}
            disabled
            autoComplete="email"
            className={cn(INPUT_BASE, "cursor-not-allowed text-foreground/50")}
          />
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-foreground/40">
            Non modifiable
          </p>
        </div>

        <div className="space-y-2">
          <label htmlFor="phone" className={LABEL_BASE}>
            Téléphone
          </label>
          <input
            id="phone"
            type="tel"
            value={profile.phone}
            onChange={(e) => updateField("phone", e.target.value)}
            placeholder="06 12 34 56 78"
            autoComplete="tel"
            inputMode="tel"
            className={INPUT_BASE}
          />
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-foreground/40">
            Suivi des commandes uniquement
          </p>
        </div>

        <div className="flex flex-col-reverse items-stretch gap-4 border-t border-border/60 pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p
            className={cn(
              "font-mono text-[11px] uppercase tracking-[0.18em]",
              isDirty ? "text-foreground/65" : "text-foreground/40"
            )}
          >
            {isDirty ? "Non enregistré" : "Enregistré"}
          </p>
          <button
            type="submit"
            disabled={isSaving || !isDirty}
            className={cn(
              "inline-flex items-center justify-center rounded-full bg-foreground px-10 py-4 font-mono text-[12px] uppercase tracking-[0.2em] text-background transition-opacity",
              (isSaving || !isDirty) && "opacity-40"
            )}
          >
            {isSaving ? "Enregistrement…" : "Enregistrer"}
          </button>
        </div>
      </form>
    </section>
  );
}
