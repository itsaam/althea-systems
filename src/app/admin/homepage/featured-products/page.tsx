"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";
import { toast } from "sonner";

interface Product {
  id: string;
  name: string;
  price: number;
  images: string[];
  featured: boolean;
  status: string;
  stock: number;
  category: { id: string; name: string; slug: string } | null;
}

export default function AdminFeaturedProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(
        "/api/admin/products?limit=200&status=PUBLISHED"
      );
      if (!res.ok) throw new Error("Erreur");
      const data = await res.json();
      setProducts(data.products || []);
    } catch {
      // Silent fallback — DB unavailable in dev backdoor mode
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleFeatured = async (
    productId: string,
    currentFeatured: boolean
  ) => {
    try {
      const res = await fetch(`/api/admin/products/${productId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ featured: !currentFeatured }),
      });

      if (!res.ok) throw new Error("Erreur");

      setProducts(
        products.map((p) =>
          p.id === productId ? { ...p, featured: !currentFeatured } : p
        )
      );
      toast.success(
        !currentFeatured
          ? "Produit ajouté aux favoris"
          : "Produit retiré des favoris"
      );
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Erreur lors de la mise à jour");
    }
  };

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const featuredProducts = filteredProducts.filter((p) => p.featured);
  const otherProducts = filteredProducts.filter((p) => !p.featured);

  if (isLoading) {
    return <div className="p-8">Chargement...</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Top Produits</h1>
        <p className="text-muted-foreground mt-1">
          Sélectionnez les produits à mettre en avant sur la page
          d&apos;accueil. ({featuredProducts.length} produit(s) sélectionné(s))
        </p>
      </div>

      <Input
        placeholder="Rechercher un produit..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="max-w-sm"
      />

      {featuredProducts.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Star className="h-5 w-5 text-warning fill-warning" />
            Produits en vedette
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {featuredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onToggle={toggleFeatured}
              />
            ))}
          </div>
        </div>
      )}

      <div>
        <h2 className="text-xl font-semibold mb-4">Tous les produits</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {otherProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onToggle={toggleFeatured}
            />
          ))}
        </div>
        {otherProducts.length === 0 && !searchTerm && (
          <p className="text-muted-foreground">
            Tous les produits sont en vedette !
          </p>
        )}
        {otherProducts.length === 0 && searchTerm && (
          <p className="text-muted-foreground">Aucun produit trouvé.</p>
        )}
      </div>
    </div>
  );
}

function ProductCard({
  product,
  onToggle,
}: {
  product: Product;
  onToggle: (id: string, featured: boolean) => void;
}) {
  return (
    <Card
      className={
        product.featured
          ? "border-warning/50 bg-warning/5"
          : ""
      }
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {product.images[0] ? (
            <img
              src={product.images[0]}
              alt={product.name}
              className="h-16 w-16 rounded object-cover"
            />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded bg-muted">
              <span className="text-xs text-muted-foreground">N/A</span>
            </div>
          )}
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-sm font-medium">{product.name}</h3>
            <p className="text-sm text-muted-foreground">
              {product.price.toFixed(2)} &euro;
            </p>
            {product.category && (
              <Badge variant="outline" className="mt-1 text-xs">
                {product.category.name}
              </Badge>
            )}
          </div>
          <Switch
            checked={product.featured}
            onCheckedChange={() => onToggle(product.id, product.featured)}
          />
        </div>
      </CardContent>
    </Card>
  );
}
