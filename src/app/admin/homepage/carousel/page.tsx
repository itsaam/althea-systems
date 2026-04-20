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

import DOMPurify from "dompurify";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { RichTextEditor } from "@/components/admin/rich-text-editor";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import PageHeader from "@/components/admin/shell/page-header";
import { signalDegradedMode } from "@/lib/admin/mock-data";

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

const RICH_TEXT_ALLOWED_TAGS = [
  "p",
  "br",
  "strong",
  "em",
  "u",
  "s",
  "a",
  "span",
  "b",
  "i",
];
const RICH_TEXT_ALLOWED_ATTR = ["href", "target", "rel", "style", "class"];

function sanitizeRichText(html: string): string {
  if (!html) return "";
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: RICH_TEXT_ALLOWED_TAGS,
    ALLOWED_ATTR: RICH_TEXT_ALLOWED_ATTR,
    ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto|tel):|\/)/i,
  });
}

function stripHtml(html: string): string {
  if (!html) return "";
  // Preview plate pour la liste des slides
  return html.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
}

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
      className="group relative overflow-hidden border border-border/60 bg-background transition-colors hover:border-foreground/40 motion-reduce:transition-none"
    >
      <div className="flex flex-col gap-4 p-4 md:flex-row md:items-center md:p-5">
        <button
          type="button"
          aria-label={`Déplacer ${slide.title}`}
          className="flex h-10 w-10 shrink-0 items-center justify-center border border-border/60 bg-background text-foreground/50 transition-colors hover:border-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/40 cursor-grab active:cursor-grabbing"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4" />
        </button>

        <div className="relative h-24 w-40 shrink-0 overflow-hidden bg-foreground/[0.04] ring-1 ring-inset ring-border/60">
          {slide.image ? (
            <Image
              src={slide.image}
              alt={slide.title}
              fill
              sizes="160px"
              className="object-cover grayscale transition-[filter] duration-500 group-hover:grayscale-0"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <ImageIcon className="h-6 w-6 text-foreground/30" />
            </div>
          )}
          {isPrimary && (
            <div className="absolute left-2 top-2 inline-flex items-center rounded-none border border-foreground/60 bg-background/90 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.22em] text-foreground">
              Principal
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1 space-y-1.5">
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] tabular-nums text-foreground/45">
              Slide {String(index + 1).padStart(2, "0")} / {String(MAX_SLIDES).padStart(2, "0")}
            </span>
            <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.22em] text-foreground/60">
              <span
                aria-hidden="true"
                className={`h-1.5 w-1.5 rounded-full ${slide.active ? "bg-success" : "bg-foreground/25"}`}
              />
              {slide.active ? "Actif" : "Inactif"}
            </span>
          </div>
          <h3 className="truncate font-display text-lg font-semibold tracking-tight text-foreground">
            {slide.title}
          </h3>
          {slide.subtitle && (
            <p className="truncate text-sm text-foreground/60">
              {stripHtml(slide.subtitle)}
            </p>
          )}
          {slide.link && (
            <p className="truncate font-mono text-[11px] text-foreground/50">
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
              className="h-9 gap-1.5 rounded-none border-border/60 font-mono text-[10px] uppercase tracking-[0.18em]"
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
            className="h-9 rounded-none border-border/60 font-mono text-[10px] uppercase tracking-[0.18em]"
          >
            Modifier
          </Button>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            onClick={() => onDelete(slide)}
            className="h-9 w-9 rounded-none text-foreground/50 hover:bg-destructive/10 hover:text-destructive"
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
      <div className="relative flex aspect-[16/9] w-full items-center justify-center overflow-hidden border border-dashed border-border/60 bg-foreground/[0.02]">
        <div className="text-center">
          <ImageIcon className="mx-auto h-8 w-8 text-foreground/25" />
          <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.22em] text-foreground/40">
            Aperçu
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative aspect-[16/9] w-full overflow-hidden bg-shadow-grey-950 ring-1 ring-inset ring-border/60">
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
        <h1 className="max-w-lg font-display text-2xl font-semibold leading-tight tracking-tight text-white md:text-4xl">
          {slide.title || "Titre du slide"}
        </h1>
        {slide.subtitle && (
          <div
            className="prose prose-sm prose-invert mt-3 max-w-md text-sm text-white/80 md:text-base [&_a]:underline"
            // sanitisation stricte côté client avant rendu
            dangerouslySetInnerHTML={{
              __html: sanitizeRichText(slide.subtitle),
            }}
          />
        )}
        {slide.link && (
          <div className="mt-5 inline-flex h-10 items-center justify-center rounded-full bg-white px-6 font-mono text-[11px] uppercase tracking-[0.18em] text-shadow-grey-950">
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
    } catch {
      // Silent fallback — DB unavailable in dev backdoor mode
      signalDegradedMode();
      setSlides([]);
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

      toast.success(editingSlide ? "Slide mise à jour" : "Slide créée");
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
      toast.success("Slide supprimée");
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
      toast.success("Slide définie comme principale");
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
      toast.success(active ? "Slide activée" : "Slide désactivée");
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
      <PageHeader
        eyebrow="Admin — Homepage · FR"
        index="Index · 008 / Carousel"
        title="Carrousel."
        description="Pilotez la vitrine de la page d'accueil. Glissez-déposez pour réordonner, définissez un slide principal et prévisualisez en temps réel avant publication."
        actions={
          <Button
            type="button"
            onClick={openCreateDialog}
            disabled={!canAddMore}
            className="h-9 gap-2 rounded-full bg-foreground px-5 font-mono text-[10px] uppercase tracking-[0.18em] text-background hover:bg-foreground/85 disabled:opacity-50"
          >
            <Plus className="h-3.5 w-3.5" />
            Nouvelle slide
          </Button>
        }
      />

      <div className="grid gap-px bg-border/60 md:grid-cols-3">
        <div className="bg-background p-5">
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-foreground/45">
            — Total
          </p>
          <p className="mt-3 font-display text-3xl font-semibold tabular-nums text-foreground">
            {slides.length}
            <span className="ml-1 font-mono text-base font-normal text-foreground/40">
              / {MAX_SLIDES}
            </span>
          </p>
        </div>
        <div className="bg-background p-5">
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-foreground/45">
            — Actifs
          </p>
          <p className="mt-3 font-display text-3xl font-semibold tabular-nums text-foreground">
            {activeCount}
          </p>
        </div>
        <div className="bg-background p-5">
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-foreground/45">
            — Principal
          </p>
          <p className="mt-3 truncate font-display text-lg font-semibold text-foreground">
            {slides[0]?.title ?? "—"}
          </p>
        </div>
      </div>

      <section className="grid gap-8 lg:grid-cols-5">
        <div className="space-y-4 lg:col-span-3">
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <h2 className="font-mono text-[10px] uppercase tracking-[0.22em] text-foreground/50">
              — Ordre d&apos;affichage
            </h2>
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-foreground/40">
              {slides.length > 1 && "Glissez pour réordonner"}
            </p>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-28 w-full rounded-none" />
              ))}
            </div>
          ) : slides.length === 0 ? (
            <div className="flex flex-col items-center justify-center border border-dashed border-border/60 bg-foreground/[0.02] py-16 text-center">
              <div className="flex h-12 w-12 items-center justify-center border border-border/60 bg-background">
                <ImageIcon className="h-5 w-5 text-foreground/40" />
              </div>
              <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.22em] text-foreground/50">
                — Aucune slide configurée
              </p>
              <p className="mt-3 max-w-sm font-display text-xl font-semibold tracking-tight text-foreground">
                Créez votre première slide.
              </p>
              <p className="mt-2 max-w-sm text-sm text-foreground/55">
                Pour animer la page d&apos;accueil du site.
              </p>
              <Button
                type="button"
                onClick={openCreateDialog}
                className="mt-6 h-9 gap-2 rounded-full bg-foreground px-5 font-mono text-[10px] uppercase tracking-[0.18em] text-background hover:bg-foreground/85"
              >
                <Plus className="h-3.5 w-3.5" />
                Créer une slide
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
            <div className="border-b border-border/60 pb-3">
              <h2 className="font-mono text-[10px] uppercase tracking-[0.22em] text-foreground/50">
                — Aperçu principal
              </h2>
              <p className="mt-2 text-xs text-foreground/55">
                Rendu public tel qu&apos;il apparaîtra sur la page d&apos;accueil.
              </p>
            </div>
            <SlidePreview slide={slides[0] ?? null} />
            {slides.length > 1 && (
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-foreground/45">
                {slides.length - 1} autre{slides.length - 1 > 1 ? "s" : ""}{" "}
                slide{slides.length - 1 > 1 ? "s" : ""} défile
                {slides.length - 1 > 1 ? "nt" : ""} toutes les 6 secondes
              </p>
            )}
          </div>
        </aside>
      </section>

      <Dialog open={dialogOpen} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-foreground/45">
              — {editingSlide ? "Édition" : "Création"}
            </p>
            <DialogTitle className="font-display text-2xl font-semibold tracking-tight text-foreground">
              {editingSlide ? "Modifier la slide" : "Nouvelle slide"}
            </DialogTitle>
            <DialogDescription className="text-foreground/60">
              Renseignez les champs ci-dessous. Le lien peut être absolu
              (https://...) ou relatif (/categories/...).
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div>
                <Label htmlFor="slide-title" className="font-mono text-[10px] uppercase tracking-[0.22em] text-foreground/55">
                  Titre *
                </Label>
                <Input
                  id="slide-title"
                  value={draft.title}
                  onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                  placeholder="Équipement médical de pointe"
                  maxLength={200}
                  className="mt-2 rounded-none border-x-0 border-t-0 border-b border-border/60 bg-transparent px-0 shadow-none focus-visible:border-foreground focus-visible:ring-0"
                />
              </div>

              <div>
                <Label
                  htmlFor="slide-subtitle"
                  className="font-mono text-[10px] uppercase tracking-[0.22em] text-foreground/55"
                >
                  Sous-titre
                </Label>
                <div id="slide-subtitle" className="mt-2">
                  <RichTextEditor
                    minimal
                    value={draft.subtitle}
                    onChange={(html) =>
                      setDraft({ ...draft, subtitle: html })
                    }
                    placeholder="Des solutions innovantes pour votre cabinet"
                  />
                </div>
                <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.18em] text-foreground/40">
                  Formatage : gras, italique, souligné, liens, couleurs
                </p>
              </div>

              <div>
                <Label htmlFor="slide-link" className="font-mono text-[10px] uppercase tracking-[0.22em] text-foreground/55">
                  Lien de redirection
                </Label>
                <Input
                  id="slide-link"
                  value={draft.link}
                  onChange={(e) => setDraft({ ...draft, link: e.target.value })}
                  placeholder="/categories ou https://..."
                  className="mt-2 rounded-none border-x-0 border-t-0 border-b border-border/60 bg-transparent px-0 font-mono text-sm shadow-none focus-visible:border-foreground focus-visible:ring-0"
                />
              </div>

              <div>
                <Label className="font-mono text-[10px] uppercase tracking-[0.22em] text-foreground/55">
                  Image *
                </Label>
                <div className="mt-2 flex items-center gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="gap-2 rounded-none border-border/60 font-mono text-[10px] uppercase tracking-[0.18em]"
                  >
                    {isUploading ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Upload className="h-3.5 w-3.5" />
                    )}
                    {draft.image ? "Changer" : "Uploader"}
                  </Button>
                  {draft.image && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => setDraft({ ...draft, image: "" })}
                      className="rounded-none text-foreground/50 hover:text-destructive"
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
                <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.18em] text-foreground/40">
                  JPG/PNG/WebP · Max 5 Mo · Ratio 16/9
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="font-mono text-[10px] uppercase tracking-[0.22em] text-foreground/55">
                Aperçu en temps réel
              </Label>
              <SlidePreview slide={draft} />
            </div>
          </div>

          <DialogFooter className="border-t border-border/60 pt-5">
            <Button
              type="button"
              variant="ghost"
              onClick={closeDialog}
              className="rounded-none font-mono text-[10px] uppercase tracking-[0.18em]"
            >
              Annuler
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={isSaving || isUploading}
              className="gap-2 rounded-full bg-foreground px-6 font-mono text-[11px] uppercase tracking-[0.18em] text-background hover:bg-foreground/85"
            >
              {isSaving ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Save className="h-3.5 w-3.5" />
              )}
              {editingSlide ? "Enregistrer" : "Créer"}
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
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-foreground/45">
              — Suppression
            </p>
            <DialogTitle className="font-display text-xl font-semibold text-foreground">
              Supprimer la slide
            </DialogTitle>
            <DialogDescription className="text-foreground/60">
              Cette action est irréversible. La slide{" "}
              <span className="font-semibold text-foreground">
                {deleteTarget?.title}
              </span>{" "}
              sera définitivement supprimée du carrousel.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="border-t border-border/60 pt-5">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setDeleteTarget(null)}
              className="rounded-none font-mono text-[10px] uppercase tracking-[0.18em]"
            >
              Annuler
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={confirmDelete}
              className="gap-2 rounded-none font-mono text-[10px] uppercase tracking-[0.18em]"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
