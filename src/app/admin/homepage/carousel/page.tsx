"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2, Plus, Save, Upload, Loader2 } from "lucide-react";

interface CarouselSlide {
  id: string;
  title: string;
  subtitle: string | null;
  image: string;
  link: string | null;
  order: number;
  active: boolean;
}

export default function AdminCarouselPage() {
  const [slides, setSlides] = useState<CarouselSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [newSlide, setNewSlide] = useState({
    title: "",
    subtitle: "",
    image: "",
    link: "",
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editFileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  useEffect(() => {
    fetchSlides();
  }, []);

  async function fetchSlides() {
    try {
      const res = await fetch("/api/carousel");
      if (res.ok) {
        const data = await res.json();
        setSlides(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Erreur chargement carrousel:", error);
    } finally {
      setLoading(false);
    }
  }

  async function uploadImage(file: File): Promise<string | null> {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        return data.url;
      } else {
        const data = await res.json();
        alert(data.error || "Erreur upload");
        return null;
      }
    } catch (error) {
      console.error("Erreur upload:", error);
      alert("Erreur lors de l'upload");
      return null;
    } finally {
      setUploading(false);
    }
  }

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>, slideId?: string) {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = await uploadImage(file);
    if (url) {
      if (slideId) {
        updateSlideField(slideId, "image", url);
      } else {
        setNewSlide({ ...newSlide, image: url });
      }
    }
  }

  async function handleAddSlide() {
    if (!newSlide.title || !newSlide.image) {
      alert("Titre et image requis");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/carousel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSlide),
      });

      if (res.ok) {
        setNewSlide({ title: "", subtitle: "", image: "", link: "" });
        fetchSlides();
      } else {
        const data = await res.json();
        alert(data.error || "Erreur lors de l'ajout");
      }
    } catch (error) {
      console.error("Erreur ajout slide:", error);
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdateSlide(slide: CarouselSlide) {
    setSaving(true);
    try {
      const res = await fetch(`/api/carousel/${slide.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(slide),
      });

      if (res.ok) {
        alert("Slide mis à jour !");
      } else {
        alert("Erreur lors de la mise à jour");
      }
    } catch (error) {
      console.error("Erreur update slide:", error);
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteSlide(id: string) {
    if (!confirm("Supprimer ce slide ?")) return;

    try {
      const res = await fetch(`/api/carousel/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        fetchSlides();
      }
    } catch (error) {
      console.error("Erreur suppression slide:", error);
    }
  }

  function updateSlideField(id: string, field: keyof CarouselSlide, value: string | boolean) {
    setSlides(slides.map(s => 
      s.id === id ? { ...s, [field]: value } : s
    ));
  }

  if (loading) {
    return <div className="p-8">Chargement...</div>;
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Gestion du carrousel</h1>
      <p className="text-muted-foreground">Maximum 3 slides actifs. Uploadez vos images directement.</p>

      {/* Liste des slides existants */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Slides actuels ({slides.length}/3)</h2>
        
        {slides.length === 0 ? (
          <p className="text-muted-foreground">Aucun slide configuré</p>
        ) : (
          slides.map((slide) => (
            <div key={slide.id} className="border rounded-lg p-4 space-y-4">
              <div className="flex items-start gap-4">
                <div className="relative">
                  {slide.image ? (
                    <img 
                      src={slide.image} 
                      alt={slide.title} 
                      className="w-40 h-24 object-cover rounded cursor-pointer hover:opacity-80"
                      onClick={() => editFileInputRefs.current[slide.id]?.click()}
                    />
                  ) : (
                    <div 
                      className="w-40 h-24 bg-muted rounded flex items-center justify-center cursor-pointer hover:bg-muted/80"
                      onClick={() => editFileInputRefs.current[slide.id]?.click()}
                    >
                      <Upload className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    ref={(el) => { editFileInputRefs.current[slide.id] = el; }}
                    onChange={(e) => handleFileSelect(e, slide.id)}
                  />
                  <p className="text-xs text-muted-foreground mt-1 text-center">Cliquer pour changer</p>
                </div>
                <div className="flex-1 space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Titre</Label>
                      <Input
                        value={slide.title}
                        onChange={(e) => updateSlideField(slide.id, "title", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Sous-titre</Label>
                      <Input
                        value={slide.subtitle || ""}
                        onChange={(e) => updateSlideField(slide.id, "subtitle", e.target.value)}
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Lien (optionnel)</Label>
                    <Input
                      value={slide.link || ""}
                      onChange={(e) => updateSlideField(slide.id, "link", e.target.value)}
                      placeholder="/categories/..."
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={slide.active}
                    onChange={(e) => updateSlideField(slide.id, "active", e.target.checked)}
                  />
                  <span className="text-sm">Actif</span>
                </label>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleUpdateSlide(slide)}
                    disabled={saving}
                  >
                    <Save className="h-4 w-4 mr-1" />
                    Sauvegarder
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDeleteSlide(slide.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Ajouter nouveau slide */}
      {slides.length < 3 && (
        <div className="border rounded-lg p-4 space-y-4">
          <h2 className="text-xl font-semibold">Ajouter un slide</h2>
          
          {/* Upload image */}
          <div>
            <Label>Image *</Label>
            <div className="mt-2">
              {newSlide.image ? (
                <div className="relative inline-block">
                  <img 
                    src={newSlide.image} 
                    alt="Preview" 
                    className="w-48 h-28 object-cover rounded"
                  />
                  <Button
                    size="sm"
                    variant="secondary"
                    className="mt-2"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Changer l&apos;image
                  </Button>
                </div>
              ) : (
                <div 
                  className="w-48 h-28 border-2 border-dashed rounded flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {uploading ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : (
                    <>
                      <Upload className="h-6 w-6 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground mt-1">Uploader</span>
                    </>
                  )}
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                ref={fileInputRef}
                onChange={(e) => handleFileSelect(e)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Titre *</Label>
              <Input
                value={newSlide.title}
                onChange={(e) => setNewSlide({ ...newSlide, title: e.target.value })}
                placeholder="Titre du slide"
              />
            </div>
            <div>
              <Label>Sous-titre</Label>
              <Input
                value={newSlide.subtitle}
                onChange={(e) => setNewSlide({ ...newSlide, subtitle: e.target.value })}
                placeholder="Sous-titre optionnel"
              />
            </div>
          </div>
          <div>
            <Label>Lien</Label>
            <Input
              value={newSlide.link}
              onChange={(e) => setNewSlide({ ...newSlide, link: e.target.value })}
              placeholder="/categories/..."
            />
          </div>
          <Button onClick={handleAddSlide} disabled={saving || !newSlide.image}>
            <Plus className="h-4 w-4 mr-1" />
            Ajouter le slide
          </Button>
        </div>
      )}
    </div>
  );
}
