"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";

const SEGMENT_LABELS: Record<string, string> = {
  admin: "Admin",
  products: "Produits",
  orders: "Commandes",
  users: "Utilisateurs",
  categories: "Catégories",
  invoices: "Factures",
  credits: "Avoirs",
  messages: "Messages",
  homepage: "Page d'accueil",
  carousel: "Carrousel",
  "featured-products": "Produits à la une",
  content: "Contenu",
  settings: "Paramètres",
  "2fa": "Authentification 2FA",
  "verify-2fa": "Vérification 2FA",
  new: "Nouveau",
  edit: "Édition",
  view: "Détail",
};

function labelFor(segment: string): string {
  if (SEGMENT_LABELS[segment]) return SEGMENT_LABELS[segment];
  // Likely a dynamic id — display a shortened mono label
  if (segment.length > 10) return segment.slice(0, 8) + "…";
  return segment;
}

/**
 * Top bar minimale : breadcrumb mono uniquement.
 * Pas d'actions globales (les pages ont leur propre AdminPageHeader).
 */
export function AdminTopbar() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  return (
    <div className="sticky top-0 z-30 flex h-12 items-center border-b border-border/60 bg-background/80 px-8 backdrop-blur">
      <nav
        aria-label="Fil d'ariane"
        className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-foreground/50"
      >
        {segments.map((seg, idx) => {
          const isLast = idx === segments.length - 1;
          const href = "/" + segments.slice(0, idx + 1).join("/");
          return (
            <span key={href} className="flex items-center gap-2">
              {idx > 0 && <span className="text-foreground/20">/</span>}
              {isLast ? (
                <span className="text-foreground">{labelFor(seg)}</span>
              ) : (
                <Link
                  href={href}
                  className="transition-colors hover:text-foreground"
                >
                  {labelFor(seg)}
                </Link>
              )}
            </span>
          );
        })}
      </nav>
    </div>
  );
}

export default AdminTopbar;
