"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import ImageUpload from "@/components/admin/image-upload";

interface CategoryFormProps {
    categoryId?: string;
}

interface FormData {
    name: string;
    slug: string;
    description: string;
    image: string;
}

export default function CategoryForm({ categoryId }: CategoryFormProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState<FormData>({
        name: "",
        slug: "",
        description: "",
        image: "",
    });

    // Charger les données édition
    useEffect(() => {
        if (categoryId) {
            setIsLoading(true);
            fetch(`/api/categories/${categoryId}`)
                .then((res) => {
                    if (!res.ok) throw new Error("Catégorie non trouvée");
                    return res.json();
                })
                .then((data) => {
                    setFormData({
                        name: data.category.name || "",
                        slug: data.category.slug || "",
                        description: data.category.description || "",
                        image: data.category.image || "",
                    });
                })
                .catch((error) => {
                    console.error("Erreur chargement catégorie:", error);
                    toast.error("Impossible de charger la catégorie");
                })
                .finally(() => {
                    setIsLoading(false);
                });
        }
    }, [categoryId]);

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
            toast.error("Le nom de la catégorie est requis");
            return;
        }

        if (!formData.slug.trim()) {
            toast.error("Le slug est requis");
            return;
        }

        setIsLoading(true);

        try {
            const url = categoryId
                ? `/api/categories/${categoryId}`
                : `/api/categories`;
            const method = categoryId ? "PUT" : "POST";

            const response = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (response.ok) {
                toast.success(
                    categoryId
                        ? "Catégorie mise à jour avec succès"
                        : "Catégorie créée avec succès"
                );
                router.push("/admin/categories");
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

    if (categoryId && isLoading && !formData.name) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="text-muted-foreground">Chargement...</div>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
            {/* NOM DE LA CATÉGORIE */}
            <div>
                <Label htmlFor="name">
                    Nom de la catégorie <span className="text-red-500">*</span>
                </Label>
                <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="Ex: Électronique"
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
                    placeholder="Ex: electronique"
                    required
                    disabled={isLoading}
                />
                <p className="text-sm text-muted-foreground mt-1">
                    URL de la catégorie : /categories/{formData.slug || "..."}
                </p>
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
                    placeholder="Description de la catégorie"
                    disabled={isLoading}
                />
            </div>

            {/* IMAGE */}
            <div>
                <Label>Image de la catégorie</Label>
                <ImageUpload
                    value={formData.image}
                    onChange={handleImageUpload}
                    disabled={isLoading}
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
                        : categoryId
                            ? "Mettre à jour"
                            : "Créer la catégorie"}
                </Button>
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push("/admin/categories")}
                    disabled={isLoading}
                >
                    Annuler
                </Button>
            </div>
        </form>
    );
}