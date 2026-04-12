"use client";

import { useState } from "react";
import Image from "next/image";
import { ImageOff, Expand } from "lucide-react";

interface ProductGalleryProps {
  images: string[];
  alt: string;
}

export default function ProductGallery({ images, alt }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [zoomed, setZoomed] = useState(false);

  const hasImages = images.length > 0;
  const hasMultiple = images.length > 1;
  const current = hasImages ? images[activeIndex] : null;

  return (
    <div
      className={
        hasMultiple
          ? "flex flex-col gap-5 md:grid md:grid-cols-[88px_1fr] md:gap-6"
          : "w-full"
      }
    >
      {/* Thumbnails — only when multiple images */}
      {hasMultiple && (
        <div className="order-2 flex gap-3 overflow-x-auto pb-2 md:order-1 md:flex-col md:overflow-visible md:pb-0">
          {images.slice(0, 5).map((src, i) => {
            const isActive = i === activeIndex;
            return (
              <button
                key={`${src}-${i}`}
                type="button"
                onClick={() => setActiveIndex(i)}
                aria-label={`Image ${i + 1} de ${alt}`}
                aria-pressed={isActive}
                className={`group relative aspect-square w-20 shrink-0 overflow-hidden rounded-[2px] border transition-all duration-500 ease-out-expo md:w-full ${
                  isActive
                    ? "border-foreground"
                    : "border-border/60 hover:border-foreground/60"
                }`}
              >
                <Image
                  src={src}
                  alt=""
                  fill
                  sizes="88px"
                  className={`object-cover transition-transform duration-500 ease-out-expo ${
                    isActive ? "scale-105" : "group-hover:scale-105"
                  }`}
                />
              </button>
            );
          })}
        </div>
      )}

      {/* Main image */}
      <div className={hasMultiple ? "order-1 md:order-2" : ""}>
        <div
          className={`group relative aspect-[4/5] w-full overflow-hidden rounded-[2px] ring-1 ring-inset ring-border/60 bg-foreground/[0.04] transition-all duration-700 ease-out-expo ${
            zoomed ? "cursor-zoom-out" : "cursor-zoom-in"
          }`}
          onClick={() => hasImages && setZoomed((v) => !v)}
          role={hasImages ? "button" : undefined}
          tabIndex={hasImages ? 0 : undefined}
          onKeyDown={(e) => {
            if (hasImages && (e.key === "Enter" || e.key === " ")) {
              e.preventDefault();
              setZoomed((v) => !v);
            }
          }}
        >
          {current ? (
            <Image
              key={current}
              src={current}
              alt={alt}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 55vw"
              className={`object-cover transition-transform duration-[1200ms] ease-out-expo ${
                zoomed ? "scale-150" : "group-hover:scale-[1.04]"
              }`}
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-foreground/50">
              <ImageOff className="h-10 w-10" strokeWidth={1} />
              <span className="font-mono text-[11px] uppercase tracking-[0.18em]">
                Aucune image
              </span>
            </div>
          )}

          {/* Zoom hint */}
          {hasImages && (
            <div className="pointer-events-none absolute right-4 top-4 flex items-center gap-2 border border-border/60 bg-background/80 px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.22em] text-foreground/70 opacity-0 backdrop-blur transition-opacity duration-500 group-hover:opacity-100">
              <Expand className="h-3 w-3" />
              {zoomed ? "Dézoomer" : "Zoomer"}
            </div>
          )}

          {/* Index pill */}
          {hasMultiple && (
            <div className="absolute bottom-4 left-4 border border-border/60 bg-background/80 px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.22em] tabular-nums text-foreground/70 backdrop-blur">
              {String(activeIndex + 1).padStart(2, "0")} /{" "}
              {String(images.length).padStart(2, "0")}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
