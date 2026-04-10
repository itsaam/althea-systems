"use client";

import { useCallback, useEffect, useState } from "react";
import {
  CheckCircle2,
  Loader2,
  MapPin,
  MoreVertical,
  Pencil,
  Plus,
  Star,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
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
        data?.data?.addresses ?? data?.addresses ?? data?.result?.addresses ?? [];
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

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2">
        {[0, 1].map((i) => (
          <Skeleton key={i} className="h-40 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-3 border-b pb-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            {addresses.length === 0
              ? "Aucune adresse enregistrée pour le moment."
              : `${addresses.length} adresse${addresses.length > 1 ? "s" : ""} enregistrée${addresses.length > 1 ? "s" : ""}.`}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            L&apos;adresse par défaut est pré-sélectionnée au checkout.
          </p>
        </div>
        <Button onClick={handleAdd} className="h-10">
          <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
          Ajouter une adresse
        </Button>
      </div>

      {addresses.length === 0 ? (
        <div className="mt-6 rounded-xl border border-dashed bg-muted/30 p-10 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
            <MapPin className="h-6 w-6" aria-hidden="true" />
          </div>
          <h3 className="mt-4 text-base font-semibold">
            Aucune adresse enregistrée
          </h3>
          <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
            Ajoutez une adresse de livraison pour accélérer vos prochains
            achats. Vous pourrez en gérer plusieurs depuis cette page.
          </p>
          <Button className="mt-6" onClick={handleAdd}>
            <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
            Créer ma première adresse
          </Button>
        </div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {addresses.map((address) => (
            <Card
              key={address.id}
              className="relative overflow-hidden transition-colors hover:border-primary/40"
            >
              <CardContent className="flex h-full flex-col gap-4 p-5">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">
                      {address.firstName} {address.lastName}
                    </p>
                    {address.isDefault && (
                      <Badge
                        variant="secondary"
                        className="mt-1.5 border-primary/30 bg-primary/10 text-primary"
                      >
                        <Star
                          className="mr-1 h-3 w-3 fill-primary"
                          aria-hidden="true"
                        />
                        Adresse par défaut
                      </Badge>
                    )}
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 shrink-0 text-muted-foreground"
                        disabled={isMutating === address.id}
                      >
                        {isMutating === address.id ? (
                          <Loader2
                            className="h-4 w-4 animate-spin"
                            aria-hidden="true"
                          />
                        ) : (
                          <MoreVertical className="h-4 w-4" aria-hidden="true" />
                        )}
                        <span className="sr-only">Actions sur l&apos;adresse</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEdit(address)}>
                        <Pencil
                          className="mr-2 h-4 w-4"
                          aria-hidden="true"
                        />
                        Modifier
                      </DropdownMenuItem>
                      {!address.isDefault && (
                        <DropdownMenuItem
                          onClick={() => handleSetDefault(address)}
                        >
                          <CheckCircle2
                            className="mr-2 h-4 w-4"
                            aria-hidden="true"
                          />
                          Définir par défaut
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => setDeleteTarget(address)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" aria-hidden="true" />
                        Supprimer
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="space-y-0.5 text-sm text-muted-foreground">
                  <p>{address.street}</p>
                  {address.street2 && <p>{address.street2}</p>}
                  <p>
                    {address.postalCode} {address.city}
                  </p>
                  {address.region && <p>{address.region}</p>}
                  <p className="font-medium text-foreground/80">
                    {address.country}
                  </p>
                  {address.phone && (
                    <p className="pt-1 text-xs">{address.phone}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AddressForm
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        initialAddress={editing}
        onSaved={fetchAddresses}
      />

      <Dialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Supprimer cette adresse ?</DialogTitle>
            <DialogDescription>
              Cette action est définitive. Vous ne pourrez plus la sélectionner
              lors de vos prochains achats.
            </DialogDescription>
          </DialogHeader>
          {deleteTarget && (
            <div className="rounded-lg border bg-muted/30 p-3 text-sm">
              <p className="font-medium">
                {deleteTarget.firstName} {deleteTarget.lastName}
              </p>
              <p className="text-muted-foreground">
                {deleteTarget.street}, {deleteTarget.postalCode}{" "}
                {deleteTarget.city}
              </p>
            </div>
          )}
          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              variant="outline"
              onClick={() => setDeleteTarget(null)}
              disabled={isMutating === deleteTarget?.id}
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isMutating === deleteTarget?.id}
            >
              {isMutating === deleteTarget?.id ? (
                <>
                  <Loader2
                    className="mr-2 h-4 w-4 animate-spin"
                    aria-hidden="true"
                  />
                  Suppression…
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" aria-hidden="true" />
                  Supprimer
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
