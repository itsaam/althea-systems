"use client";

import { useState, useRef, DragEvent } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { X, Upload, Loader2 } from "lucide-react";

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  disabled?: boolean;
  maxSize?: number;
  folder?: string;
}

export default function ImageUpload({
  value,
  onChange,
  disabled = false,
  maxSize = 5,
  folder = "images",
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): boolean => {
    if (!file.type.startsWith("image/")) {
      toast.error("Le fichier doit être une image");
      return false;
    }

    const sizeMB = file.size / (1024 * 1024);
    if (sizeMB > maxSize) {
      toast.error(`L'image ne doit pas dépasser ${maxSize} MB`);
      return false;
    }

    return true;
  };

  // Upload l'image sur Cloudflare R2
  const uploadImage = async (file: File) => {
    if (!validateFile(file)) return;

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", folder);
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok && data.url) {
        onChange(data.url);
        toast.success("Image uploadée avec succès");
      } else {
        throw new Error(data.error || "Erreur lors de l'upload");
      }
    } catch (error) {
      console.error("Erreur upload image:", error);
      toast.error(
        error instanceof Error ? error.message : "Erreur lors de l'upload"
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadImage(file);
    }
  };

  // Gérer le drag & drop
  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled && !isUploading) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (disabled || isUploading) return;

    const file = e.dataTransfer.files[0];
    if (file) {
      uploadImage(file);
    }
  };

  const handleRemove = () => {
    onChange("");
    if (inputRef.current) {
      inputRef.current.value = "";
    }
    toast.success("Image supprimée");
  };

  const handleClick = () => {
    if (!disabled && !isUploading) {
      inputRef.current?.click();
    }
  };

  return (
    <div className="space-y-4">
      {/* Zone d'upload */}
      {!value && (
        <div
          onClick={handleClick}
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
            transition-colors duration-200
            ${
              isDragging
                ? "border-primary bg-primary/5"
                : "border-gray-300 hover:border-primary"
            }
            ${disabled || isUploading ? "opacity-50 cursor-not-allowed" : ""}
          `}
        >
          <Input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            className="hidden"
            onChange={handleFileChange}
            disabled={disabled || isUploading}
          />

          <div className="flex flex-col items-center gap-2">
            {isUploading ? (
              <>
                <Loader2 className="h-10 w-10 text-primary animate-spin" />
                <p className="text-sm text-muted-foreground">
                  Upload en cours...
                </p>
              </>
            ) : (
              <>
                <Upload className="h-10 w-10 text-muted-foreground" />
                <div className="text-muted-foreground">
                  <p className="font-medium">
                    Cliquez pour uploader une image
                  </p>
                  <p className="text-sm">ou glissez-déposez</p>
                  <p className="text-xs mt-2">
                    PNG, JPG, WebP (max. {maxSize} MB)
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Aperçu de l'image */}
      {value && !isUploading && (
        <div className="relative inline-block">
          <Image
            src={value}
            alt="Preview"
            width={400}
            height={192}
            className="w-full max-w-md h-48 object-cover rounded-lg border"
          />
          {!disabled && (
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2"
              onClick={handleRemove}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
