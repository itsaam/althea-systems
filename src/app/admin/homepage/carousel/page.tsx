"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  ArrowUpToLine,
  GripVertical,
  ImageIcon,
  Loader2,
  Plus,
  Save,
  Sparkles,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { toast } from "sonner";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface CarouselSlide {
  id: string;
  title: string;
  subtitle: string | null;
  image: string;
  link: string | null;
  order: number;
  active: boolean;
}

interface DraftSlide {
  title: string;
  subtitle: string;
  image: string;
  link: string;
}

const EMPTY_DRAFT: DraftSlide = {
  title: "",
  subtitle: "",
  image: "",
  link: "",
};

const MAX_SLIDES = 3;

function normalizeLink(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (trimmed.startsWith("/")) {
    if (typeof window !== "undefined") {
      return `${window.location.origin}${trimmed}`;
    }
    return trimmed;
  }
  return trimmed;
}

function SortableSlideCard({
  slide,
  index,
  isPrimary,
  onEdit,
  onDelete,
  onPromote,
  onToggleActive,
}: {
  slide: CarouselSlide;
  index: number;
  isPrimary: boolean;
  onEdit: (slide: CarouselSlide) => void;
  onDelete: (slide: CarouselSlide) => void;
  onPromote: (slide: CarouselSlide) => void;
  onToggleActive: (slide: CarouselSlide, active: boolean) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: slide.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm transition-shadow hover:shadow-md motion-reduce:transition-none"
    >
      <div className="flex flex-col gap-4 p-4 md:flex-row md:items-center md:p-5">
        <button
          type="button"
          aria-label={`Déplacer ${slide.title}`}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border/60 bg-background text-muted-foreground transition-colors hover:border-[#00a8b5] hover:text-[#00a8b5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00a8b5] cursor-grab active:cursor-grabbing"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4" />
        </button>

        <div className="relative h-24 w-40 shrink-0 overflow-hidden rounded-xl bg-muted ring-1 ring-border/60">
          {slide.image ? (
            <Image
              src={slide.image}
              alt={slide.title}
              fill
              sizes="160px"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <ImageIcon className="h-6 w-6 text-muted-foreground/60" />
            </div>
          )}
          {isPrimary && (
            <div className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-[#003d5c] to-[#00a8b5] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white shadow-sm">
              <Sparkles className="h-3 w-3" />
              Principal
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Slide {String(index + 1).padStart(2, "0")}
            </span>
            {slide.active ? (
              <Badge className="border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-50">
                Actif
              </Badge>
            ) : (
              <Badge variant="secondary" className="bg-muted text-muted-foreground">
                Inactif
              </Badge>
            )}
          </div>
          <h3 className="truncate text-lg font-semibold tracking-tight text-[#003d5c]">
            {slide.title}
          </h3>
          {slide.subtitle && (
            <p className="truncate text-sm text-muted-foreground">{slide.subtitle}</p>
          )}
          {slide.link && (
            <p className="truncate font-mono text-xs text-muted-foreground/80">
              → {slide.link}
            </p>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <div className="hidden items-center gap-2 md:flex">
            <Switch
              checked={slide.active}
              onCheckedChange={(checked) => onToggleActive(slide, checked)}
              aria-label={slide.active ? "Désactiver" : "Activer"}
            />
          </div>
          {!isPrimary && (
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => onPromote(slide)}
              className="h-9 gap-1.5"
            >
              <ArrowUpToLine className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Principal</span>
            </Button>
          )}
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => onEdit(slide)}
            className="h-9"
          >
            Modifier
          </Button>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            onClick={() => onDelete(slide)}
            className="h-9 w-9 text-muted-foreground hover:bg-red-50 hover:text-red-600"
            aria-label="Supprimer"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function SlidePreview({ slide }: { slide: CarouselSlide | DraftSlide | null }) {
  if (!slide || (!slide.image && !slide.title)) {
    return (
      <div className="relative flex aspect-[16/9] w-full items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-border/60 bg-gradient-to-br from-muted/40 to-muted/20">
        <div className="text-center">
          <ImageIcon className="mx-auto h-8 w-8 text-muted-foreground/40" />
          <p className="mt-2 text-xs text-muted-foreground">
            L&apos;aperçu apparaîtra ici
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl bg-neutral-900 shadow-lg ring-1 ring-black/5">
      {slide.image && (
        <Image
          src={slide.image}
          alt={slide.title || "Aperçu"}
          fill
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-transparent" />
      <div className="relative flex h-full flex-col items-center justify-center px-6 text-center">
        <h1 className="max-w-lg text-2xl font-bold leading-tight tracking-tight text-white md:text-4xl">
          {slide.title || "Titre du slide"}
        </h1>
        {slide.subtitle && (
          <p className="mt-3 max-w-md text-sm text-white/85 md:text-base">
            {slide.subtitle}
          </p>
        )}
        {slide.link && (
          <div className="mt-5 inline-flex h-10 items-center justify-center rounded-full bg-white px-6 text-sm font-medium text-black">
            Découvrir
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminCarouselPage() {
  const [slides, setSlides] = useState<CarouselSlide[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSlide, setEditingSlide] = useState<CarouselSlide | null>(null);
  const [draft, setDraft] = useState<DraftSlide>(EMPTY_DRAFT);
  const [deleteTarget, setDeleteTarget] = useState<CarouselSlide | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    fetchSlides();
  }, []);

  async function fetchSlides() {
    setIsLoading(true);
    try {
      const res = await fetch("/api/carousel");
      if (!res.ok) throw new Error("Erreur API");
      const data = (await res.json()) as CarouselSlide[];
      const sorted = [...data].sort((a, b) => a.order - b.order);
      setSlides(sorted);
    } catch (error) {
      console.error("Erreur chargement carrousel:", error);
      toast.error("Impossible de charger le carrousel");
    } finally {
      setIsLoading(false);
    }
  }

  function openCreateDialog() {
    setEditingSlide(null);
    setDraft(EMPTY_DRAFT);
    setDialogOpen(true);
  }

  function openEditDialog(slide: CarouselSlide) {
    setEditingSlide(slide);
    setDraft({
      title: slide.title,
      subtitle: slide.subtitle ?? "",
      image: slide.image,
      link: slide.link ?? "",
    });
    setDialogOpen(true);
  }

  function closeDialog() {
    setDialogOpen(false);
    setTimeout(() => {
      setEditingSlide(null);
      setDraft(EMPTY_DRAFT);
    }, 200);
  }

  async function uploadImage(file: File): Promise<string | null> {
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image trop volumineuse (max 5 Mo)");
      return null;
    }
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "carousel");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Erreur lors de l'upload");
        return null;
      }
      toast.success("Image uploadée");
      return data.url as string;
    } catch (error) {
      console.error("Erreur upload:", error);
      toast.error("Erreur lors de l'upload");
      return null;
    } finally {
      setIsUploading(false);
    }
  }

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    const url = await uploadImage(file);
    if (url) {
      setDraft((prev) => ({ ...prev, image: url }));
    }
  }

  async function handleSubmit() {
    if (!draft.title.trim()) {
      toast.error("Le titre est requis");
      return;
    }
    if (!draft.image) {
      toast.error("Une image est requise");
      return;
    }
    if (!editingSlide && slides.length >= MAX_SLIDES) {
      toast.error(`Maximum ${MAX_SLIDES} slides`);
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        title: draft.title.trim(),
        subtitle: draft.subtitle.trim() || null,
        image: draft.image,
        link: normalizeLink(draft.link),
      };

      const url = editingSlide
        ? `/api/carousel/${editingSlide.id}`
        : "/api/carousel";
      const method = editingSlide ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Erreur lors de l'enregistrement");
        return;
      }

      toast.success(editingSlide ? "Slide mis à jour" : "Slide créé");
      closeDialog();
      fetchSlides();
    } catch (error) {
      console.error("Erreur enregistrement:", error);
      toast.error("Erreur lors de l'enregistrement");
    } finally {
      setIsSaving(false);
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    try {
      const res = await fetch(`/api/carousel/${deleteTarget.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Erreur lors de la suppression");
        return;
      }
      toast.success("Slide supprimé");
      setDeleteTarget(null);
      fetchSlides();
    } catch (error) {
      console.error("Erreur suppression:", error);
      toast.error("Erreur lors de la suppression");
    }
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = slides.findIndex((s) => s.id === active.id);
    const newIndex = slides.findIndex((s) => s.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;

    const reordered = arrayMove(slides, oldIndex, newIndex);
    setSlides(reordered);

    try {
      await Promise.all(
        reordered.map((slide, index) =>
          fetch(`/api/carousel/${slide.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ order: index }),
          })
        )
      );
      toast.success("Ordre mis à jour");
    } catch (error) {
      console.error("Erreur réordonnancement:", error);
      toast.error("Erreur lors du réordonnancement");
      fetchSlides();
    }
  }

  async function handlePromote(slide: CarouselSlide) {
    const others = slides.filter((s) => s.id !== slide.id);
    const reordered = [slide, ...others];
    setSlides(reordered);
    try {
      await Promise.all(
        reordered.map((s, index) =>
          fetch(`/api/carousel/${s.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ order: index }),
          })
        )
      );
      toast.success("Slide défini comme principal");
    } catch (error) {
      console.error("Erreur promotion:", error);
      toast.error("Erreur lors de la promotion");
      fetchSlides();
    }
  }

  async function handleToggleActive(slide: CarouselSlide, active: boolean) {
    setSlides((prev) =>
      prev.map((s) => (s.id === slide.id ? { ...s, active } : s))
    );
    try {
      const res = await fetch(`/api/carousel/${slide.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active }),
      });
      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Erreur lors du changement de statut");
        fetchSlides();
        return;
      }
      toast.success(active ? "Slide activé" : "Slide désactivé");
    } catch (error) {
      console.error("Erreur toggle active:", error);
      toast.error("Erreur lors du changement de statut");
      fetchSlides();
    }
  }

  const activeCount = slides.filter((s) => s.active).length;
  const canAddMore = slides.length < MAX_SLIDES;

  return (
    <div className="space-y-10">
      <header className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="space-y-2">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#00a8b5]">
            Homepage · Carrousel
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-[#003d5c] md:text-4xl">
            Gestion du carrousel
          </h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Pilotez la vitrine de la page d&apos;accueil. Glissez-déposez pour
            réordonner, définissez un slide principal et prévisualisez en temps
            réel avant publication.
          </p>
        </div>
        <Button
          type="button"
          onClick={openCreateDialog}
          disabled={!canAddMore}
          className="h-11 gap-2 bg-gradient-to-r from-[#003d5c] to-[#00a8b5] px-6 text-white shadow-sm hover:opacity-90 disabled:opacity-50"
        >
          <Plus className="h-4 w-4" />
          Nouveau slide
        </Button>
      </header>

      <div className="grid gap-3 md:grid-cols-3">
        <div className="rounded-xl border border-border/60 bg-card p-5">
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Total
          </p>
          <p className="mt-2 text-3xl font-bold tabular-nums text-[#003d5c]">
            {slides.length}
            <span className="ml-1 text-base font-normal text-muted-foreground">
              / {MAX_SLIDES}
            </span>
          </p>
        </div>
        <div className="rounded-xl border border-border/60 bg-card p-5">
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Actifs
          </p>
          <p className="mt-2 text-3xl font-bold tabular-nums text-emerald-600">
            {activeCount}
          </p>
        </div>
        <div className="rounded-xl border border-border/60 bg-gradient-to-br from-[#003d5c] to-[#00a8b5] p-5 text-white">
          <p className="font-mono text-[10px] uppercase tracking-widest text-white/70">
            Principal
          </p>
          <p className="mt-2 truncate text-lg font-semibold">
            {slides[0]?.title ?? "Aucun slide"}
          </p>
        </div>
      </div>

      <section className="grid gap-8 lg:grid-cols-5">
        <div className="space-y-4 lg:col-span-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Ordre d&apos;affichage
            </h2>
            <p className="text-xs text-muted-foreground">
              {slides.length > 1 && "Glissez-déposez pour réordonner"}
            </p>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-28 w-full rounded-2xl" />
              ))}
            </div>
          ) : slides.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border/60 bg-card/40 py-16 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#003d5c]/10 to-[#00a8b5]/10">
                <ImageIcon className="h-6 w-6 text-[#00a8b5]" />
              </div>
              <p className="mt-4 text-base font-semibold text-[#003d5c]">
                Aucun slide configuré
              </p>
              <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                Créez votre premier slide pour animer la page d&apos;accueil du
                site.
              </p>
              <Button
                type="button"
                onClick={openCreateDialog}
                className="mt-6 gap-2 bg-[#003d5c] hover:bg-[#003d5c]/90"
              >
                <Plus className="h-4 w-4" />
                Créer un slide
              </Button>
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={slides.map((s) => s.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-3">
                  {slides.map((slide, index) => (
                    <SortableSlideCard
                      key={slide.id}
                      slide={slide}
                      index={index}
                      isPrimary={index === 0}
                      onEdit={openEditDialog}
                      onDelete={setDeleteTarget}
                      onPromote={handlePromote}
                      onToggleActive={handleToggleActive}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </div>

        <aside className="space-y-4 lg:col-span-2">
          <div className="sticky top-6 space-y-4">
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Aperçu principal
              </h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Rendu public tel qu&apos;il apparaîtra sur la page d&apos;accueil.
              </p>
            </div>
            <SlidePreview slide={slides[0] ?? null} />
            {slides.length > 1 && (
              <p className="text-xs text-muted-foreground">
                {slides.length - 1} autre{slides.length - 1 > 1 ? "s" : ""}{" "}
                slide{slides.length - 1 > 1 ? "s" : ""} défile
                {slides.length - 1 > 1 ? "nt" : ""} toutes les 6 secondes.
              </p>
            )}
          </div>
        </aside>
      </section>

      <Dialog open={dialogOpen} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-2xl tracking-tight text-[#003d5c]">
              {editingSlide ? "Modifier le slide" : "Nouveau slide"}
            </DialogTitle>
            <DialogDescription>
              Renseignez les champs ci-dessous. Le lien peut être absolu
              (https://...) ou relatif (/categories/...).
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div>
                <Label htmlFor="slide-title" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Titre *
                </Label>
                <Input
                  id="slide-title"
                  value={draft.title}
                  onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                  placeholder="Équipement médical de pointe"
                  maxLength={200}
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label htmlFor="slide-subtitle" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Sous-titre
                </Label>
                <Textarea
                  id="slide-subtitle"
                  value={draft.subtitle}
                  onChange={(e) =>
                    setDraft({ ...draft, subtitle: e.target.value })
                  }
                  placeholder="Des solutions innovantes pour votre cabinet"
                  rows={3}
                  maxLength={500}
                  className="mt-1.5 resize-none"
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  {draft.subtitle.length}/500
                </p>
              </div>

              <div>
                <Label htmlFor="slide-link" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Lien de redirection
                </Label>
                <Input
                  id="slide-link"
                  value={draft.link}
                  onChange={(e) => setDraft({ ...draft, link: e.target.value })}
                  placeholder="/categories ou https://..."
                  className="mt-1.5 font-mono text-sm"
                />
              </div>

              <div>
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Image *
                </Label>
                <div className="mt-1.5 flex items-center gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="gap-2"
                  >
                    {isUploading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Upload className="h-4 w-4" />
                    )}
                    {draft.image ? "Changer l'image" : "Uploader"}
                  </Button>
                  {draft.image && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => setDraft({ ...draft, image: "" })}
                      className="text-muted-foreground hover:text-red-600"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </div>
                <p className="mt-1.5 text-xs text-muted-foreground">
                  JPG/PNG/WebP · Max 5 Mo · Ratio 16/9 recommandé
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Aperçu en temps réel
              </Label>
              <SlidePreview slide={draft} />
            </div>
          </div>

          <Separator />

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={closeDialog}>
              Annuler
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={isSaving || isUploading}
              className="gap-2 bg-gradient-to-r from-[#003d5c] to-[#00a8b5] text-white hover:opacity-90"
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {editingSlide ? "Enregistrer" : "Créer le slide"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl text-[#003d5c]">
              Supprimer le slide
            </DialogTitle>
            <DialogDescription>
              Cette action est irréversible. Le slide{" "}
              <span className="font-semibold text-foreground">
                {deleteTarget?.title}
              </span>{" "}
              sera définitivement supprimé du carrousel.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setDeleteTarget(null)}
            >
              Annuler
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={confirmDelete}
              className="gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
