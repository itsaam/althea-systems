"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Pencil, Trash2, Star } from "lucide-react";
import { toast } from "sonner";
import DOMPurify from "dompurify";

import type { ProductStatus, TvaRate } from "@prisma/client";

interface ProductViewData {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  comparePrice: number | null;
  tva: TvaRate;
  stock: number;
  status: ProductStatus;
  featured: boolean;
  priority: number;
  sku: string | null;
  images: string[];
  technicalSpecs: string | null;
  createdAt: string;
  updatedAt: string;
  category: {
    id: string;
    name: string;
    slug: string;
  } | null;
}

interface ProductViewClientProps {
  product: ProductViewData;
}

export default function ProductViewClient({ product }: ProductViewClientProps) {
  const router = useRouter();

  // Calcul prix TTC
  const tvaRates: Record<TvaRate, number> = {
    TVA_20: 1.20,
    TVA_10: 1.10,
    TVA_5_5: 1.055,
    TVA_0: 1.00,
  };
  const prixTTC = product.price * tvaRates[product.tva];

  // Format TVA pour affichage
  const formatTva = (tva: TvaRate): string => {
    return tva.replace("TVA_", "").replace("_", ".");
  };

  const handleDelete = async () => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer le produit "${product.name}" ?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/products/bulk`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: [product.id] }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Produit supprimé avec succès");
        router.push("/admin/products");
      } else {
        toast.error(data.error || "Erreur lors de la suppression");
      }
    } catch (error) {
      console.error("Erreur suppression:", error);
      toast.error("Erreur lors de la suppression");
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/admin/products")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{product.name}</h1>
            <div className="flex gap-2 mt-2">
              <Badge variant={product.status === "PUBLISHED" ? "default" : "secondary"}>
                {product.status === "PUBLISHED" ? "Publié" : "Brouillon"}
              </Badge>
              {product.featured && (
                <Badge variant="outline" className="gap-1">
                  <Star className="h-3 w-3 fill-current" />
                  Mis en avant
                </Badge>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button onClick={() => router.push(`/admin/products/${product.id}/edit`)}>
            <Pencil className="mr-2 h-4 w-4" />
            Modifier
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            <Trash2 className="mr-2 h-4 w-4" />
            Supprimer
          </Button>
        </div>
      </div>

      {/* Informations principales */}
      <Card>
        <CardHeader>
          <CardTitle>Informations générales</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Nom</p>
            <p className="font-medium">{product.name}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Slug</p>
            <p className="font-mono text-sm">{product.slug}</p>
          </div>
          {product.sku && (
            <div>
              <p className="text-sm text-muted-foreground">SKU</p>
              <p className="font-mono text-sm">{product.sku}</p>
            </div>
          )}
          <div>
            <p className="text-sm text-muted-foreground">Catégorie</p>
            <p>{product.category?.name || "Aucune"}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Créé le</p>
            <p>{new Date(product.createdAt).toLocaleDateString("fr-FR", {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Modifié le</p>
            <p>{new Date(product.updatedAt).toLocaleDateString("fr-FR", {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}</p>
          </div>
        </CardContent>
      </Card>

      {/* Prix et stock */}
      <Card>
        <CardHeader>
          <CardTitle>Prix et stock</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Prix HT</p>
            <p className="text-2xl font-bold">{product.price.toFixed(2)} €</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Prix TTC (TVA {formatTva(product.tva)}%)</p>
            <p className="text-2xl font-bold text-primary">{prixTTC.toFixed(2)} €</p>
          </div>
          {product.comparePrice && (
            <div>
              <p className="text-sm text-muted-foreground">Prix de comparaison</p>
              <p className="line-through text-muted-foreground">{product.comparePrice.toFixed(2)} €</p>
            </div>
          )}
          <div>
            <p className="text-sm text-muted-foreground">Stock</p>
            <p className={product.stock > 0 ? "text-success font-medium" : "text-destructive font-medium"}>
              {product.stock} unité{product.stock > 1 ? "s" : ""}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Priorité d&apos;affichage</p>
            <p>{product.priority}/100</p>
          </div>
        </CardContent>
      </Card>

      {/* Images */}
      {product.images.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Images ({product.images.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              {product.images.map((img, idx) => (
                <div key={idx} className="relative aspect-square border rounded-lg overflow-hidden bg-muted">
                  <Image 
                    src={img} 
                    alt={`${product.name} ${idx + 1}`} 
                    fill 
                    className="object-cover" 
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                  {idx === 0 && (
                    <Badge className="absolute top-2 left-2">Principale</Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Description */}
      {product.description && (
        <Card>
          <CardHeader>
            <CardTitle>Description</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className="prose prose-sm max-w-none dark:prose-invert"
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(product.description, {
                  ALLOWED_TAGS: ["p", "strong", "em", "h2", "h3", "ul", "ol", "li", "a", "br"],
                  ALLOWED_ATTR: ["href", "class", "target", "rel"],
                }),
              }}
            />
          </CardContent>
        </Card>
      )}

      {/* Caractéristiques techniques */}
      {product.technicalSpecs && (
        <Card>
          <CardHeader>
            <CardTitle>Caractéristiques techniques</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="whitespace-pre-wrap text-sm bg-muted p-4 rounded-lg">{product.technicalSpecs}</pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
