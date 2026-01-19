"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus, Package, MessageSquare } from "lucide-react";

export default function QuickActions() {
  return (
    <div className="flex flex-col sm:flex-row gap-4">
      {/* Ajouter produit */}
      <Button asChild className="flex-1">
        <Link href="/admin/products/new">
          <Plus className="mr-2 h-4 w-4" />
          Ajouter un produit
        </Link>
      </Button>

      {/* Nouvelle commande - disabled car pas encore implémenté */}
      <Button variant="outline" className="flex-1" disabled>
        <Package className="mr-2 h-4 w-4" />
        Nouvelle commande
      </Button>

      {/* Voir messages */}
      <Button asChild variant="outline" className="flex-1">
        <Link href="/admin/messages">
          <MessageSquare className="mr-2 h-4 w-4" />
          Voir les messages
        </Link>
      </Button>
    </div>
  );
}
