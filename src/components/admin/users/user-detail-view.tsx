"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Ban,
  CheckCircle2,
  Clock,
  Mail,
  MapPin,
  Phone,
  Shield,
  ShieldCheck,
  Trash2,
  User as UserIcon,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

type UserRole = "USER" | "ADMIN";
type UserStatus = "PENDING" | "ACTIVE" | "INACTIVE";

interface UserAddress {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  street: string;
  city: string;
  postalCode: string;
  country: string;
  phone?: string | null;
  isDefault?: boolean;
}

interface UserOrderSummary {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  total: number | string;
  createdAt: string;
}

interface UserDetail {
  id: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
  role: UserRole;
  status?: UserStatus;
  emailVerified?: string | null;
  lastLoginAt?: string | null;
  createdAt: string;
  updatedAt: string;
  addresses: UserAddress[];
  orders: UserOrderSummary[];
}

const ROLE_LABELS: Record<UserRole, string> = {
  USER: "Utilisateur",
  ADMIN: "Administrateur",
};

const STATUS_LABELS: Record<UserStatus, string> = {
  PENDING: "En attente",
  ACTIVE: "Actif",
  INACTIVE: "Inactif",
};

const STATUS_TONE: Record<
  UserStatus,
  { badge: string; dot: string; icon: typeof CheckCircle2 }
> = {
  ACTIVE: {
    badge:
      "border border-foreground/80 bg-background text-foreground",
    dot: "bg-foreground",
    icon: CheckCircle2,
  },
  PENDING: {
    badge:
      "border border-border/60 bg-background text-foreground/60",
    dot: "bg-foreground/40",
    icon: Clock,
  },
  INACTIVE: {
    badge:
      "border border-destructive/60 bg-background text-destructive",
    dot: "bg-destructive",
    icon: Ban,
  },
};

const ORDER_STATUS_LABELS: Record<string, string> = {
  PENDING: "En attente",
  CONFIRMED: "Confirmée",
  PROCESSING: "En préparation",
  SHIPPED: "Expédiée",
  DELIVERED: "Livrée",
  CANCELLED: "Annulée",
};

const PAYMENT_STATUS_LABELS: Record<string, string> = {
  PENDING: "En attente",
  PAID: "Payé",
  FAILED: "Échoué",
  REFUNDED: "Remboursé",
};

function toNumber(value: number | string | null | undefined): number {
  if (value === null || value === undefined) return 0;
  return typeof value === "number" ? value : Number(value);
}

function formatCurrency(value: number | string | null | undefined): string {
  return `${toNumber(value).toFixed(2)} €`;
}

function formatDateTime(value: string | null | undefined): string {
  if (!value) return "—";
  return new Date(value).toLocaleString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDate(value: string | null | undefined): string {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getInitials(user: Pick<UserDetail, "email" | "firstName" | "lastName">): string {
  const first = user.firstName?.trim()?.[0];
  const last = user.lastName?.trim()?.[0];
  if (first && last) return `${first}${last}`.toUpperCase();
  if (first) return first.toUpperCase();
  return user.email.slice(0, 2).toUpperCase();
}

function getFullName(user: Pick<UserDetail, "firstName" | "lastName">): string | null {
  const parts = [user.firstName, user.lastName].filter(Boolean);
  return parts.length > 0 ? parts.join(" ") : null;
}

interface UserDetailViewProps {
  userId: string;
}

export function UserDetailView({ userId }: UserDetailViewProps) {
  const router = useRouter();
  const [user, setUser] = useState<UserDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMutating, setIsMutating] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const fetchUser = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/users/${userId}`);
      if (!res.ok) throw new Error("Erreur lors du chargement");
      const json = await res.json();
      const data = (json.data ?? json) as UserDetail;
      setUser(data);
    } catch (error) {
      console.error("Erreur chargement utilisateur:", error);
      toast.error("Impossible de charger l'utilisateur");
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const handleRoleChange = useCallback(
    async (newRole: UserRole) => {
      if (!user || user.role === newRole) return;
      setIsMutating(true);
      try {
        const res = await fetch(`/api/users/${userId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ role: newRole }),
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Erreur lors de la mise à jour");
        }
        toast.success(
          newRole === "ADMIN"
            ? "Utilisateur promu administrateur"
            : "Utilisateur rétrogradé"
        );
        await fetchUser();
      } catch (error) {
        console.error(error);
        toast.error(
          error instanceof Error ? error.message : "Erreur lors de la mise à jour"
        );
      } finally {
        setIsMutating(false);
      }
    },
    [user, userId, fetchUser]
  );

  const handleStatusChange = useCallback(
    async (newStatus: UserStatus) => {
      if (!user || user.status === newStatus) return;
      setIsMutating(true);
      try {
        const res = await fetch(`/api/users/${userId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Erreur lors de la mise à jour");
        }
        toast.success("Statut mis à jour");
        await fetchUser();
      } catch (error) {
        console.error(error);
        toast.error(
          error instanceof Error ? error.message : "Erreur lors de la mise à jour"
        );
      } finally {
        setIsMutating(false);
      }
    },
    [user, userId, fetchUser]
  );

  const handleDelete = useCallback(async () => {
    setIsMutating(true);
    try {
      const res = await fetch(`/api/users/${userId}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erreur lors de la suppression");
      }
      toast.success("Utilisateur supprimé");
      router.push("/admin/users");
    } catch (error) {
      console.error(error);
      toast.error(
        error instanceof Error ? error.message : "Erreur lors de la suppression"
      );
      setIsMutating(false);
      setDeleteOpen(false);
    }
  }, [userId, router]);

  if (isLoading) return <UserDetailSkeleton />;

  if (!user) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">Utilisateur introuvable.</p>
        <Button variant="outline" asChild>
          <Link href="/admin/users">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour à la liste
          </Link>
        </Button>
      </div>
    );
  }

  const currentStatus = (user.status ?? "PENDING") as UserStatus;
  const tone = STATUS_TONE[currentStatus];
  const ToneIcon = tone.icon;
  const fullName = getFullName(user);
  const initials = getInitials(user);
  const canDelete = user.orders.length === 0 && user.addresses.length === 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-6">
        <Button variant="ghost" size="sm" asChild className="-ml-2 h-8">
          <Link href="/admin/users">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour aux utilisateurs
          </Link>
        </Button>

        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="flex items-start gap-5">
            <div
              className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#003d5c] to-[#00a8b5] text-lg font-semibold text-white shadow-sm"
              aria-hidden="true"
            >
              {initials}
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold tracking-tight">
                  {fullName ?? user.email}
                </h1>
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${tone.badge}`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${tone.dot}`}
                    aria-hidden="true"
                  />
                  <ToneIcon className="h-3 w-3" aria-hidden="true" />
                  {STATUS_LABELS[currentStatus]}
                </span>
                {user.role === "ADMIN" && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#003d5c]/10 px-2.5 py-0.5 text-xs font-medium text-[#003d5c] ring-1 ring-inset ring-[#003d5c]/20 dark:bg-[#00a8b5]/15 dark:text-[#7fd4dc] dark:ring-[#00a8b5]/30">
                    <ShieldCheck className="h-3 w-3" aria-hidden="true" />
                    Admin
                  </span>
                )}
              </div>
              {fullName && (
                <p className="text-sm text-muted-foreground">{user.email}</p>
              )}
              <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                Inscrit le {formatDate(user.createdAt)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setDeleteOpen(true)}
              disabled={!canDelete || isMutating}
              title={
                canDelete
                  ? "Supprimer l'utilisateur"
                  : "Impossible de supprimer : commandes ou adresses associées"
              }
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Supprimer
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main column */}
        <div className="space-y-6 lg:col-span-2">
          {/* Management card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Gestion du compte</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <label
                  htmlFor="role-select"
                  className="font-mono text-xs uppercase tracking-wider text-muted-foreground"
                >
                  Rôle
                </label>
                <Select
                  value={user.role}
                  onValueChange={(value) => handleRoleChange(value as UserRole)}
                  disabled={isMutating}
                >
                  <SelectTrigger id="role-select" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USER">
                      <div className="flex items-center gap-2">
                        <UserIcon className="h-4 w-4" />
                        Utilisateur
                      </div>
                    </SelectItem>
                    <SelectItem value="ADMIN">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        Administrateur
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="status-select"
                  className="font-mono text-xs uppercase tracking-wider text-muted-foreground"
                >
                  Statut
                </label>
                <Select
                  value={currentStatus}
                  onValueChange={(value) => handleStatusChange(value as UserStatus)}
                  disabled={isMutating}
                >
                  <SelectTrigger id="status-select" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE">Actif</SelectItem>
                    <SelectItem value="PENDING">En attente</SelectItem>
                    <SelectItem value="INACTIVE">Inactif</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Orders history */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">
                Historique commandes
                <span className="ml-2 font-mono text-xs uppercase tracking-wider text-muted-foreground">
                  {user.orders.length} {user.orders.length > 1 ? "commandes" : "commande"}
                </span>
              </CardTitle>
              {user.orders.length > 0 && (
                <Button variant="ghost" size="sm" asChild>
                  <Link
                    href={`/admin/orders?search=${encodeURIComponent(user.email)}`}
                  >
                    Voir toutes
                  </Link>
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {user.orders.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  Aucune commande passée.
                </p>
              ) : (
                <ul className="divide-y divide-border">
                  {user.orders.map((order) => (
                    <li key={order.id}>
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="group flex items-center justify-between gap-4 py-3 outline-none transition-colors hover:bg-muted/50 focus-visible:bg-muted/70 focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p className="truncate font-medium">
                              {order.orderNumber}
                            </p>
                            <Badge variant="outline" className="text-xs">
                              {ORDER_STATUS_LABELS[order.status] || order.status}
                            </Badge>
                          </div>
                          <p className="mt-0.5 font-mono text-xs uppercase tracking-wider text-muted-foreground">
                            {formatDate(order.createdAt)} ·{" "}
                            {PAYMENT_STATUS_LABELS[order.paymentStatus] ||
                              order.paymentStatus}
                          </p>
                        </div>
                        <div className="shrink-0 text-right">
                          <p className="font-medium tabular-nums">
                            {formatCurrency(order.total)}
                          </p>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Contact</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-start gap-2.5">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                <div className="min-w-0">
                  <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                    Email
                  </p>
                  <a
                    href={`mailto:${user.email}`}
                    className="break-all underline decoration-muted-foreground/30 underline-offset-4 hover:decoration-foreground"
                  >
                    {user.email}
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                    Téléphone
                  </p>
                  {user.phone ? (
                    <a
                      href={`tel:${user.phone}`}
                      className="underline decoration-muted-foreground/30 underline-offset-4 hover:decoration-foreground"
                    >
                      {user.phone}
                    </a>
                  ) : (
                    <p className="text-muted-foreground">Non renseigné</p>
                  )}
                </div>
              </div>
              <Separator />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                    Email vérifié
                  </p>
                  <p>
                    {user.emailVerified ? (
                      <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Oui
                      </span>
                    ) : (
                      <span className="text-muted-foreground">Non</span>
                    )}
                  </p>
                </div>
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                    Dernière connexion
                  </p>
                  <p className="text-xs">{formatDateTime(user.lastLoginAt)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Adresses
                <span className="ml-2 font-mono text-xs uppercase tracking-wider text-muted-foreground">
                  {user.addresses.length}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {user.addresses.length === 0 ? (
                <p className="py-4 text-center text-sm text-muted-foreground">
                  Aucune adresse enregistrée.
                </p>
              ) : (
                <ul className="space-y-4">
                  {user.addresses.map((address) => (
                    <li key={address.id} className="text-sm">
                      <div className="flex items-start gap-2.5">
                        <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                        <div className="min-w-0 flex-1">
                          {(address.firstName || address.lastName) && (
                            <p className="font-medium">
                              {[address.firstName, address.lastName]
                                .filter(Boolean)
                                .join(" ")}
                            </p>
                          )}
                          <p className="text-muted-foreground">{address.street}</p>
                          <p className="text-muted-foreground">
                            {address.postalCode} {address.city}
                          </p>
                          <p className="text-muted-foreground">{address.country}</p>
                          {address.isDefault && (
                            <span className="mt-1 inline-block font-mono text-[10px] uppercase tracking-wider text-[#00a8b5]">
                              Par défaut
                            </span>
                          )}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Delete confirmation dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer cet utilisateur ?</DialogTitle>
            <DialogDescription>
              Cette action est irréversible. Le compte de{" "}
              <span className="font-medium text-foreground">{user.email}</span>{" "}
              sera définitivement supprimé.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteOpen(false)}
              disabled={isMutating}
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isMutating}
            >
              {isMutating ? "Suppression..." : "Supprimer définitivement"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function UserDetailSkeleton() {
  return (
    <div className="space-y-8">
      <Skeleton className="h-8 w-40" />
      <div className="flex items-start gap-5">
        <Skeleton className="h-16 w-16 rounded-full" />
        <div className="space-y-3">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-3 w-32" />
        </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
        <div className="space-y-6">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    </div>
  );
}
