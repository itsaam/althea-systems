"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ImageUpload from "@/components/admin/image-upload";
import {useRouter} from "next/navigation";
import {useEffect, useState} from "react";
import {toast} from "sonner";
import Image from "next/image";

interface ProductFormProps {
  productId?: string;
}

interface FormData {
    name: string;
    slug: string;
    description: string;
    image: string;
    categoryId: string;
    price: string;
    stock: string;
}

interface Category {
    id: string;
    name: string;
}

export default function ProductForm({ productId }: ProductFormProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);
    const [formData, setFormData] = useState<FormData>({
        name: "",
        slug: "",
        description: "",
        image: "",
        categoryId: "",
        price: "",
        stock: "",
    });

    // Charger les catégories
    useEffect(() => {
        fetch("/api/categories")
            .then((res) => res.json())
            .then((data) => {
                setCategories(data.categories || []);
            })
            .catch((error) => {
                console.error("Erreur chargement catégories:", error);
                toast.error("Impossible de charger les catégories");
            });
    }, []);

    // Charger les données édition
    useEffect(() => {
        if (productId) {
            setIsLoading(true);
            fetch(`/api/products/${productId}`)
                .then((res) => {
                    if (!res.ok) throw new Error("Produit non trouvé");
                    return res.json();
                })
                .then((data) => {
                    setFormData({
                        name: data.product.name || "",
                        slug: data.product.slug || "",
                        description: data.product.description || "",
                        image: data.product.image || "",
                        categoryId: data.product.categoryId || "",
                        price: data.product.price?.toString() || "",
                        stock: data.product.stock?.toString() || "",
                    });
                })
                .catch((error) => {
                    console.error("Erreur chargement produit:", error);
                    toast.error("Impossible de charger le produit");
                })
                .finally(() => {
                    setIsLoading(false);
                });
        }
    }, [productId]);

    //Générer le slug automatiquement depuis le nom
    const handleNameChange = (name: string) => {
        const slug = name
            .toLowerCase()
            .normalize("NFD") // Normaliser les accents
            .replace(/[\u0300-\u036f]/g, "") // Supprimer les accents
            .replace(/[^a-z0-9]+/g, "-") // Remplacer les espaces par des tirets
            .replace(/^-+|-+$/g, ""); // Supprimer les tirets en début/fin

        setFormData({
            ...formData,
            name,
            slug,
        });
    };

    //Gérer les changements des autres champs
    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    //Gérer l'upload d'image
    const handleImageUpload = (imageUrl: string) => {
        setFormData({
            ...formData,
            image: imageUrl,
        });
    };

    //Gérer la soumission du formulaire
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name.trim()) {
            toast.error("Le nom du produit est requis");
            return;
        }

        if (!formData.slug.trim()) {
            toast.error("Le slug est requis");
            return;
        }

        if (!formData.categoryId) {
            toast.error("La catégorie est requise");
            return;
        }

        if (!formData.price || parseFloat(formData.price) <= 0) {
            toast.error("Le prix doit être supérieur à 0");
            return;
        }

        if (!formData.stock || parseInt(formData.stock) < 0) {
            toast.error("Le stock ne peut pas être négatif");
            return;
        }

        setIsLoading(true);

        try {
            const url = productId
                ? `/api/products/${productId}`
                : `/api/products`;
            const method = productId ? "PUT" : "POST";

            const response = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    ...formData,
                    price: parseFloat(formData.price),
                    stock: parseInt(formData.stock, 10),
                }),
            });

            const data = await response.json();

            if (response.ok) {
                toast.success(
                    productId
                        ? "Produit mis à jour avec succès"
                        : "Produit créé avec succès"
                );
                router.push("/admin/products");
                router.refresh();
            } else {
                toast.error(data.error || "Une erreur est survenue");
            }
        } catch (error) {
            console.error("Erreur soumission formulaire:", error);
            toast.error("Erreur de connexion au serveur");
        } finally {
            setIsLoading(false);
        }
    };

    if (productId && isLoading && !formData.name) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="text-muted-foreground">Chargement...</div>
            </div>
        );
    }
    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
            {/* NOM Du Produit */}
            <div>
                <Label htmlFor="name">
                    Nom du Produit <span className="text-red-500">*</span>
                </Label>
                <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="Ex: iPhone 15 Pro"
                    required
                    disabled={isLoading}
                />
            </div>

            {/* SLUG */}
            <div>
                <Label htmlFor="slug">
                    Slug <span className="text-red-500">*</span>
                </Label>
                <Input
                    id="slug"
                    name="slug"
                    value={formData.slug}
                    onChange={handleChange}
                    placeholder="Ex: iphone-15-pro"
                    required
                    disabled={isLoading}
                />
                <p className="text-sm text-muted-foreground mt-1">
                    URL du produit : /products/{formData.slug || "..."}
                </p>
            </div>

            {/* CATÉGORIE */}
            <div>
                <Label htmlFor="categoryId">
                    Catégorie <span className="text-red-500">*</span>
                </Label>
                <Select
                    value={formData.categoryId}
                    onValueChange={(value) =>
                        setFormData({ ...formData, categoryId: value })
                    }
                    disabled={isLoading}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Sélectionner une catégorie" />
                    </SelectTrigger>
                    <SelectContent>
                        {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                                {category.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* PRIX */}
            <div>
                <Label htmlFor="price">
                    Prix (€) <span className="text-red-500">*</span>
                </Label>
                <Input
                    id="price"
                    name="price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={handleChange}
                    placeholder="Ex: 999.99"
                    required
                    disabled={isLoading}
                />
            </div>

            {/* STOCK */}
            <div>
                <Label htmlFor="stock">
                    Stock <span className="text-red-500">*</span>
                </Label>
                <Input
                    id="stock"
                    name="stock"
                    type="number"
                    min="0"
                    value={formData.stock}
                    onChange={handleChange}
                    placeholder="Ex: 50"
                    required
                    disabled={isLoading}
                />
            </div>

            {/* DESCRIPTION */}
            <div>
                <Label htmlFor="description">Description</Label>
                <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                    placeholder="Description du produit (Optionnel)"
                    disabled={isLoading}
                />
            </div>

            {/* IMAGE */}
            <div>
                <Label>Image du Produit</Label>
                <ImageUpload
                    value={formData.image}
                    onChange={handleImageUpload}
                    disabled={isLoading}
                    folder="products"
                />
                {formData.image && (
                    <div className="mt-2">
                        <Image
                            src={formData.image}
                            alt="Preview"
                            width={128}
                            height={128}
                            className="w-32 h-32 object-cover rounded-md border"
                        />
                    </div>
                )}
            </div>

            {/* BOUTONS */}
            <div className="flex gap-4">
                <Button type="submit" disabled={isLoading}>
                    {isLoading
                        ? "Enregistrement..."
                        : productId
                            ? "Mettre à jour"
                            : "Créer le produit"}
                </Button>
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push("/admin/products")}
                    disabled={isLoading}
                >
                    Annuler
                </Button>
            </div>
        </form>
    );
}