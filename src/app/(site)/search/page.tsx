"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AddToCartButton from "@/components/cart/add-to-cart-button";
import { ArrowLeft, Filter } from "lucide-react";

interface SearchProduct {
  id: string;
  name: string;
  slug: string | null;
  price: number;
  image?: string;
  categoryId?: string;
  category?: {
    name: string;
    slug: string | null;
  };
}

interface SearchResponse {
  query: string;
  count: number;
  products: SearchProduct[];
}

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";

  const [products, setProducts] = useState<SearchProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Filtres
  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(1000);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([]);

  // Charger les catégories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/categories");
        const data = await res.json();
        setCategories(data.categories || []);
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    };
    fetchCategories();
  }, []);

  // Recherche
  useEffect(() => {
    const executeSearch = async () => {
      if (!query && !selectedCategory) {
        setProducts([]);
        return;
      }

      setLoading(true);
      setError("");

      try {
        const params = new URLSearchParams();
        if (query) params.append("q", query);
        if (selectedCategory) params.append("categoryId", selectedCategory);
        params.append("minPrice", minPrice.toString());
        params.append("maxPrice", maxPrice.toString());

        const res = await fetch(`/api/search?${params.toString()}`);
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.message || "Erreur de recherche");
        }

        const data: SearchResponse = await res.json();
        setProducts(data.products);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Erreur serveur";
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    executeSearch();
  }, [query, selectedCategory, minPrice, maxPrice]);

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="mb-8">
        <Button asChild variant="ghost" size="sm" className="mb-4">
          <Link href="/">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Link>
        </Button>
        <h1 className="text-3xl font-bold mb-2">Résultats de recherche</h1>
        {query && (
          <p className="text-muted-foreground">
            Resultats pour: <span className="font-semibold">{query}</span>
          </p>
        )}
      </div>

      <div className="grid gap-8 lg:grid-cols-[300px_1fr]">
        {/* Filtres */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="h-4 w-4" />
            <h2 className="font-semibold">Filtres</h2>
          </div>

          {/* Catégorie */}
          {categories.length > 0 && (
            <div className="space-y-3">
              <Label className="font-medium">Catégorie</Label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full p-2 border rounded-lg text-sm"
              >
                <option value="">Toutes les catégories</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Prix */}
          <div className="space-y-3">
            <Label className="font-medium">Prix</Label>
            <div className="space-y-3">
              <div>
                <Label htmlFor="minPrice" className="text-sm">Min: {minPrice} €</Label>
                <Input
                  id="minPrice"
                  type="range"
                  min="0"
                  max="1000"
                  step="10"
                  value={minPrice}
                  onChange={(e) => setMinPrice(parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
              <div>
                <Label htmlFor="maxPrice" className="text-sm">Max: {maxPrice} €</Label>
                <Input
                  id="maxPrice"
                  type="range"
                  min="0"
                  max="1000"
                  step="10"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Résultats */}
        <div>
          {loading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Recherche en cours...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12 text-red-600">
              <p>{error}</p>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">Aucun produit trouvé</p>
              <Button asChild>
                <Link href="/categories">Explorer les catégories</Link>
              </Button>
            </div>
          ) : (
            <div>
              <p className="text-sm text-muted-foreground mb-6">
                {products.length} produit{products.length > 1 ? "s" : ""} trouvé{products.length > 1 ? "s" : ""}
              </p>
              <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {products.map((product) => (
                  <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    {/* Image */}
                    <Link href={`/products/${product.slug || product.id}`}>
                      <div className="aspect-square bg-muted overflow-hidden">
                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover hover:scale-105 transition-transform"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full text-muted-foreground">
                            Pas d&apos;image
                          </div>
                        )}
                      </div>
                    </Link>

                    {/* Infos */}
                    <div className="p-4">
                      <Link href={`/products/${product.slug || product.id}`}>
                        <h3 className="font-semibold line-clamp-2 hover:text-primary mb-2">
                          {product.name}
                        </h3>
                      </Link>

                      {product.category && (
                        <p className="text-xs text-muted-foreground mb-3">
                          {product.category.name}
                        </p>
                      )}

                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold">{product.price.toFixed(2)} €</span>
                      </div>

                      <div className="mt-4">
                        <AddToCartButton
                          productId={product.id}
                          productName={product.name}
                          price={product.price}
                          image={product.image}
                        />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
