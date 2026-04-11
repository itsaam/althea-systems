"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import AccountPageHeader from "./account-page-header";
import AddressForm, { Address } from "./address-form";

export default function AddressList() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Address | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Address | null>(null);
  const [isMutating, setIsMutating] = useState<string | null>(null);

  const fetchAddresses = useCallback(async () => {
    try {
      const res = await fetch("/api/addresses");
      const data = await res.json();
      const list =
        data?.data?.addresses ??
        data?.addresses ??
        data?.result?.addresses ??
        [];
      setAddresses(list as Address[]);
    } catch {
      toast.error("Impossible de charger vos adresses");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  const handleAdd = () => {
    setEditing(null);
    setDialogOpen(true);
  };

  const handleEdit = (address: Address) => {
    setEditing(address);
    setDialogOpen(true);
  };

  const handleSetDefault = async (address: Address) => {
    if (address.isDefault) return;
    setIsMutating(address.id);
    try {
      const res = await fetch(`/api/addresses/${address.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isDefault: true }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Erreur");
      }
      toast.success("Adresse définie par défaut");
      await fetchAddresses();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur");
    } finally {
      setIsMutating(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsMutating(deleteTarget.id);
    try {
      const res = await fetch(`/api/addresses/${deleteTarget.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Erreur de suppression");
      }
      toast.success("Adresse supprimée");
      setDeleteTarget(null);
      await fetchAddresses();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur");
    } finally {
      setIsMutating(null);
    }
  };

  return (
    <div className="space-y-12">
      <AccountPageHeader
        eyebrow="Adresses"
        index="Index · 003 / Addresses"
        title="Mes adresses."
        description="Gérez votre carnet d'adresses de livraison et de facturation. L'adresse par défaut est pré-sélectionnée au checkout."
        actions={
          <button
            type="button"
            onClick={handleAdd}
            className="inline-flex items-center justify-center rounded-full bg-foreground px-6 py-3 font-mono text-[11px] uppercase tracking-[0.18em] text-background"
          >
            Nouvelle adresse
          </button>
        }
      />

      {isLoading ? (
        <div
          aria-busy="true"
          className="grid gap-px bg-border/60 sm:grid-cols-2"
        >
          {[0, 1].map((i) => (
            <div
              key={i}
              className="h-48 animate-pulse bg-background"
              aria-hidden="true"
            />
          ))}
        </div>
      ) : addresses.length === 0 ? (
        <section className="border-t border-border/60 pt-16">
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-foreground/55">
            <span className="mr-1.5 opacity-60">—</span>
            Aucune adresse
          </p>
          <h2 className="mt-4 font-display text-[28px] font-semibold leading-[1.1] tracking-[-0.02em] text-foreground md:text-[34px]">
            Créez votre première adresse
            <span
              aria-hidden
              className="ml-1 inline-block h-1.5 w-1.5 translate-y-[-0.25em] rounded-full bg-electric-indigo-500 align-middle"
            />
          </h2>
          <p className="mt-3 max-w-xl text-[14px] leading-relaxed text-foreground/60">
            Enregistrez une adresse de livraison pour accélérer vos prochains
            achats. Vous pourrez en gérer plusieurs depuis cette page.
          </p>
          <button
            type="button"
            onClick={handleAdd}
            className="mt-8 inline-flex items-center justify-center rounded-full bg-foreground px-8 py-4 font-mono text-[11px] uppercase tracking-[0.18em] text-background"
          >
            Créer une adresse
          </button>
        </section>
      ) : (
        <div className="grid gap-px bg-border/60 sm:grid-cols-2">
          {addresses.map((address) => (
            <article
              key={address.id}
              className="flex flex-col gap-5 bg-background p-6"
            >
              <div className="flex items-start justify-between gap-4">
                <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-foreground/55">
                  <span className="mr-1.5 opacity-60">—</span>
                  Livraison
                </p>
                {address.isDefault && (
                  <span className="border border-border/60 px-2 py-1 font-mono text-[9px] uppercase tracking-[0.14em] text-foreground">
                    Par défaut
                  </span>
                )}
              </div>

              <address className="not-italic text-[14px] leading-relaxed text-foreground/70">
                <p className="font-display text-[16px] font-semibold text-foreground">
                  {address.firstName} {address.lastName}
                </p>
                <p className="mt-2">{address.street}</p>
                {address.street2 && <p>{address.street2}</p>}
                <p className="tabular-nums">
                  {address.postalCode} {address.city}
                </p>
                {address.region && <p>{address.region}</p>}
                <p className="font-medium text-foreground/80">
                  {address.country}
                </p>
                {address.phone && (
                  <p className="pt-2 font-mono text-[11px] tabular-nums text-foreground/55">
                    {address.phone}
                  </p>
                )}
              </address>

              <div className="mt-auto flex flex-wrap items-center gap-4 border-t border-border/60 pt-4">
                <button
                  type="button"
                  onClick={() => handleEdit(address)}
                  className="font-mono text-[10px] uppercase tracking-[0.18em] text-foreground/70 transition-colors hover:text-foreground"
                  disabled={isMutating === address.id}
                >
                  Modifier
                </button>
                {!address.isDefault && (
                  <button
                    type="button"
                    onClick={() => handleSetDefault(address)}
                    className="font-mono text-[10px] uppercase tracking-[0.18em] text-foreground/70 transition-colors hover:text-foreground"
                    disabled={isMutating === address.id}
                  >
                    Définir par défaut
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setDeleteTarget(address)}
                  className="font-mono text-[10px] uppercase tracking-[0.18em] text-foreground/55 transition-colors hover:text-destructive"
                  disabled={isMutating === address.id}
                >
                  Supprimer
                </button>
                {isMutating === address.id && (
                  <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-foreground/40">
                    …
                  </span>
                )}
              </div>
            </article>
          ))}
        </div>
      )}

      <AddressForm
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        initialAddress={editing}
        onSaved={fetchAddresses}
      />

      {/* Confirmation suppression */}
      {deleteTarget && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/10 p-6 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) setDeleteTarget(null);
          }}
        >
          <div className="w-full max-w-md border border-border/60 bg-background p-8 shadow-sm">
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-foreground/55">
              <span className="mr-1.5 opacity-60">—</span>
              Confirmation
            </p>
            <h2 className="mt-4 font-display text-[22px] font-semibold leading-[1.15] tracking-[-0.02em] text-foreground">
              Supprimer cette adresse
              <span
                aria-hidden
                className="ml-1 inline-block h-1 w-1 translate-y-[-0.3em] rounded-full bg-electric-indigo-500 align-middle"
              />
            </h2>
            <p className="mt-3 text-[13px] leading-relaxed text-foreground/60">
              Cette action est définitive. Vous ne pourrez plus la
              sélectionner lors de vos prochains achats.
            </p>
            <div className="mt-5 border-l-2 border-border/60 pl-4 py-2 text-[13px] text-foreground/70">
              <p className="font-medium text-foreground">
                {deleteTarget.firstName} {deleteTarget.lastName}
              </p>
              <p className="tabular-nums">
                {deleteTarget.street}, {deleteTarget.postalCode}{" "}
                {deleteTarget.city}
              </p>
            </div>
            <div className="mt-8 flex items-center justify-end gap-4">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={isMutating === deleteTarget.id}
                className="font-mono text-[10px] uppercase tracking-[0.18em] text-foreground/55 hover:text-foreground"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isMutating === deleteTarget.id}
                className={cn(
                  "inline-flex items-center justify-center rounded-full bg-foreground px-6 py-3 font-mono text-[11px] uppercase tracking-[0.18em] text-background transition-opacity",
                  isMutating === deleteTarget.id && "opacity-40"
                )}
              >
                {isMutating === deleteTarget.id
                  ? "Suppression…"
                  : "Supprimer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
