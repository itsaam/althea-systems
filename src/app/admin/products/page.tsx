"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Pencil, Trash2, Plus } from "lucide-react";
import { toast } from "sonner";

interface Product {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    price: number;
    stock: number;
    image: string | null;
    categoryId: string;
    createdAt: string;
}

export default function AdminProductsPage() {
    const router = useRouter();
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        setIsLoading(true);
        try {
            const response = await fetch("/api/products");
            const data = await response.json();
            setProducts(data.products || []);
        } catch (error) {
            console.error("Erreur chargement produits:", error);
            toast.error("Erreur lors du chargement des produits");
        } finally {
            setIsLoading(false);
        }
    };

    const filteredProducts = products.filter((prod) =>
        prod.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prod.slug.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Êtes-vous sûr de vouloir supprimer le produit "${name}" ?`)) {
            return;
        }

        try {
            const response = await fetch(`/api/products/${id}`, {
                method: "DELETE",
            });

            const data = await response.json();

            if (response.ok) {
                toast.success("Produit supprimé avec succès");
                fetchProducts();
            } else {
                toast.error(data.error || "Erreur lors de la suppression");
            }
        } catch (error) {
            console.error("Erreur suppression:", error);
            toast.error("Erreur lors de la suppression");
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Produits</h1>
                <Button onClick={() => router.push("/admin/products/new")}>
                    <Plus className="h-4 w-4 mr-2" />
                    Nouveau produit
                </Button>
            </div>

            <div className="space-y-4">
                <Input
                    placeholder="Rechercher un produit..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-sm"
                />

                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Image</TableHead>
                                <TableHead>Nom</TableHead>
                                <TableHead>Slug</TableHead>
                                <TableHead>Produits</TableHead>
                                <TableHead>Stock</TableHead>
                                <TableHead>Date de création</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center">
                                        Chargement...
                                    </TableCell>
                                </TableRow>
                            ) : filteredProducts.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={7}
                                        className="text-center text-muted-foreground"
                                    >
                                        {searchTerm ? "Aucun produit trouvé" : "Aucun produit"}
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredProducts.map((product) => (
                                    <TableRow key={product.id}>
                                        <TableCell>
                                            {product.image ? (
                                                <div className="relative">
                                                    <img
                                                        src={product.image}
                                                        alt={product.name}
                                                        className="w-12 h-12 object-cover rounded"
                                                    />
                                                </div>
                                            ) : (
                                                <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center text-gray-400 text-xs">
                                                    Pas d&apos;image
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell className="font-medium">
                                            {product.name}
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">
                                            {product.slug}
                                        </TableCell>
                                        <TableCell>
                                            {product.price.toFixed(2)} €
                                        </TableCell>
                                        <TableCell>
                                            {product.stock}
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">
                                            {new Date(product.createdAt).toLocaleDateString("fr-FR")}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    onClick={() =>
                                                        router.push(`/admin/products/${product.id}`)
                                                    }
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="destructive"
                                                    size="icon"
                                                    onClick={() => handleDelete(product.id, product.name)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    );
}