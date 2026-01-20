"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import { useDropzone } from "react-dropzone";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, rectSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { Upload, X, GripVertical, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface MultiImageUploadProps {
  value: string[];
  onChange: (urls: string[]) => void;
  disabled?: boolean;
  maxImages?: number;
}

interface SortableImageProps {
  id: string;
  url: string;
  index: number;
  isPrimary: boolean;
  onRemove: () => void;
  disabled?: boolean;
}

function SortableImage({ id, url, index, isPrimary, onRemove, disabled }: SortableImageProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, disabled });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative group aspect-square rounded-lg border bg-muted overflow-hidden"
    >
      <Image
        src={url}
        alt={`Image ${index + 1}`}
        fill
        className="object-cover"
      />

      {/* Badge principale */}
      {isPrimary && (
        <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
          Principale
        </div>
      )}

      {/* Bouton de suppression */}
      <Button
        type="button"
        variant="destructive"
        size="icon"
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
        onClick={onRemove}
        disabled={disabled}
      >
        <X className="h-4 w-4" />
      </Button>

      {/* Drag handle */}
      {!disabled && (
        <div
          {...attributes}
          {...listeners}
          className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing bg-background/80 rounded p-1"
        >
          <GripVertical className="h-4 w-4" />
        </div>
      )}
    </div>
  );
}

export function MultiImageUpload({
  value = [],
  onChange,
  disabled = false,
  maxImages = 10,
}: MultiImageUploadProps) {
  const [uploading, setUploading] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (disabled) return;

      const remainingSlots = maxImages - value.length;
      if (acceptedFiles.length > remainingSlots) {
        toast.error(`Vous ne pouvez ajouter que ${remainingSlots} image(s) supplémentaire(s)`);
        return;
      }

      setUploading(true);

      try {
        const uploadPromises = acceptedFiles.map(async (file) => {
          const formData = new FormData();
          formData.append("file", file);
          formData.append("folder", "products");
          formData.append("currentImagesCount", value.length.toString());

          const response = await fetch("/api/upload", {
            method: "POST",
            body: formData,
          });

          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || "Erreur lors de l'upload");
          }

          const data = await response.json();
          return data.url;
        });

        const newUrls = await Promise.all(uploadPromises);
        onChange([...value, ...newUrls]);
        toast.success(`${newUrls.length} image(s) uploadée(s) avec succès`);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Erreur lors de l'upload");
      } finally {
        setUploading(false);
      }
    },
    [value, onChange, disabled, maxImages]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".webp", ".gif"],
    },
    disabled: disabled || uploading || value.length >= maxImages,
    multiple: true,
  });

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = value.findIndex((url) => url === active.id);
      const newIndex = value.findIndex((url) => url === over.id);

      onChange(arrayMove(value, oldIndex, newIndex));
    }
  };

  const handleRemove = (index: number) => {
    if (window.confirm("Supprimer cette image ? Cette action est irréversible.")) {
      const newValue = [...value];
      newValue.splice(index, 1);
      onChange(newValue);
    }
  };

  return (
    <div className="space-y-4">
      {/* Zone de drop */}
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25"}
          ${disabled || uploading || value.length >= maxImages ? "opacity-50 cursor-not-allowed" : "hover:border-primary"}
        `}
      >
        <input {...getInputProps()} />
        <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          {uploading
            ? "Upload en cours..."
            : isDragActive
            ? "Déposez les images ici..."
            : `Glissez des images ici ou cliquez pour sélectionner (${value.length}/${maxImages})`}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Formats acceptés : JPG, PNG, WebP, GIF (max 5MB par image)
        </p>
      </div>

      {/* Indicateur de chargement */}
      {uploading && (
        <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Upload en cours...</span>
        </div>
      )}

      {/* Grille d'images avec drag & drop */}
      {value.length > 0 && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={value} strategy={rectSortingStrategy}>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {value.map((url, index) => (
                <SortableImage
                  key={url}
                  id={url}
                  url={url}
                  index={index}
                  isPrimary={index === 0}
                  onRemove={() => handleRemove(index)}
                  disabled={disabled}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {value.length > 0 && (
        <p className="text-xs text-muted-foreground">
          💡 La première image est l&apos;image principale. Glissez les images pour réorganiser.
        </p>
      )}
    </div>
  );
}
