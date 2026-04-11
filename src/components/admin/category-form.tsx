"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import ImageUpload from "@/components/admin/image-upload";
import { signalDegradedMode } from "@/lib/admin/mock-data";

interface CategoryFormProps {
    categoryId?: string;
}

interface FormData {
    name: string;
    slug: string;
    description: string;
    image: string;
}

const LABEL_CLASS =
    "font-mono text-[11px] uppercase tracking-[0.22em] text-foreground/55";
const INPUT_CLASS =
    "mt-3 h-11 rounded-none border-x-0 border-t-0 border-b border-border/60 bg-transparent px-0 text-[15px] text-foreground shadow-none placeholder:text-foreground/30 focus-visible:border-foreground focus-visible:ring-0";
const SECTION_CLASS = "space-y-6 border-b border-border/60 pb-10";

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
                .catch(() => {
                    // Silent fallback — DB unavailable in dev backdoor mode
                    signalDegradedMode();
                    toast.error("Impossible de charger la catégorie");
                })
                .finally(() => {
                    setIsLoading(false);
                });
        }
    }, [categoryId]);

    // Générer le slug automatiquement depuis le nom
    const handleNameChange = (name: string) => {
        const slug = name
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "");

        setFormData({
            ...formData,
            name,
            slug,
        });
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handleImageUpload = (imageUrl: string) => {
        setFormData({
            ...formData,
            image: imageUrl,
        });
    };

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
        } catch {
            toast.error("Erreur de connexion au serveur");
        } finally {
            setIsLoading(false);
        }
    };

    if (categoryId && isLoading && !formData.name) {
        return (
            <div className="flex items-center justify-center border border-border/60 bg-foreground/[0.02] py-16">
                <div className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.22em] text-foreground/50">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Chargement
                </div>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="max-w-3xl space-y-10">
            {/* Section 1 — Identification */}
            <section className={SECTION_CLASS}>
                <header className="flex items-center gap-3">
                    <span
                        aria-hidden
                        className="h-1.5 w-1.5 rounded-full bg-electric-indigo-500"
                    />
                    <h2 className="font-mono text-[11px] uppercase tracking-[0.22em] text-foreground/55">
                        01 — Identification
                    </h2>
                </header>

                <div>
                    <Label htmlFor="name" className={LABEL_CLASS}>
                        Nom de la catégorie *
                    </Label>
                    <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={(e) => handleNameChange(e.target.value)}
                        placeholder="Ex: Électronique"
                        required
                        disabled={isLoading}
                        className={INPUT_CLASS}
                    />
                </div>

                <div>
                    <Label htmlFor="slug" className={LABEL_CLASS}>
                        Slug *
                    </Label>
                    <Input
                        id="slug"
                        name="slug"
                        value={formData.slug}
                        onChange={handleChange}
                        placeholder="Ex: electronique"
                        required
                        disabled={isLoading}
                        className={`${INPUT_CLASS} font-mono`}
                    />
                    <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.18em] text-foreground/40">
                        URL — /categories/{formData.slug || "…"}
                    </p>
                </div>
            </section>

            {/* Section 2 — Description */}
            <section className={SECTION_CLASS}>
                <header className="flex items-center gap-3">
                    <span
                        aria-hidden
                        className="h-1.5 w-1.5 rounded-full bg-electric-indigo-500"
                    />
                    <h2 className="font-mono text-[11px] uppercase tracking-[0.22em] text-foreground/55">
                        02 — Description
                    </h2>
                </header>

                <div>
                    <Label htmlFor="description" className={LABEL_CLASS}>
                        Description
                    </Label>
                    <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        className="mt-3 min-h-[120px] w-full resize-none rounded-none border-x-0 border-t-0 border-b border-border/60 bg-transparent px-0 py-2 text-[15px] text-foreground shadow-none placeholder:text-foreground/30 focus-visible:border-foreground focus-visible:outline-none focus-visible:ring-0"
                        placeholder="Décrivez brièvement cette catégorie…"
                        disabled={isLoading}
                    />
                </div>
            </section>

            {/* Section 3 — Visuel */}
            <section className={SECTION_CLASS}>
                <header className="flex items-center gap-3">
                    <span
                        aria-hidden
                        className="h-1.5 w-1.5 rounded-full bg-electric-indigo-500"
                    />
                    <h2 className="font-mono text-[11px] uppercase tracking-[0.22em] text-foreground/55">
                        03 — Visuel
                    </h2>
                </header>

                <div>
                    <Label className={LABEL_CLASS}>Image de la catégorie</Label>
                    <div className="mt-3">
                        <ImageUpload
                            value={formData.image}
                            onChange={handleImageUpload}
                            disabled={isLoading}
                        />
                    </div>
                    {formData.image && (
                        <div className="mt-4 inline-block border border-border/60 bg-foreground/[0.02] p-2">
                            <div className="relative h-32 w-32 overflow-hidden">
                                <Image
                                    src={formData.image}
                                    alt="Aperçu"
                                    fill
                                    sizes="128px"
                                    className="object-cover"
                                />
                            </div>
                        </div>
                    )}
                </div>
            </section>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
                <button
                    type="button"
                    onClick={() => router.push("/admin/categories")}
                    disabled={isLoading}
                    className="h-10 rounded-none px-4 font-mono text-[11px] uppercase tracking-[0.18em] text-foreground/60 transition-colors hover:text-foreground disabled:opacity-50"
                >
                    Annuler
                </button>
                <button
                    type="submit"
                    disabled={isLoading}
                    className="inline-flex h-10 items-center gap-2 rounded-full bg-foreground px-6 font-mono text-[11px] uppercase tracking-[0.18em] text-background transition-colors hover:bg-foreground/85 disabled:opacity-50"
                >
                    {isLoading && (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    )}
                    {isLoading
                        ? "Enregistrement"
                        : categoryId
                            ? "Mettre à jour"
                            : "Enregistrer"}
                </button>
            </div>
        </form>
    );
}
