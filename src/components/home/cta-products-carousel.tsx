"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export type CarouselProduct = {
  id: string;
  slug: string;
  name: string;
  price: number;
  image: string | null;
  categoryName: string | null;
};

function formatPrice(value: number) {
  if (!Number.isFinite(value)) return "";
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function CtaProductsCarousel({
  products,
}: {
  products: CarouselProduct[];
}) {
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const pinRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const progressRef = useRef<HTMLSpanElement | null>(null);
  const imageRefs = useRef<Array<HTMLDivElement | null>>([]);

  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!sectionRef.current || !pinRef.current || !trackRef.current) return;
    if (products.length === 0) return;

    // Register defensively in case this component mounts before the provider.
    gsap.registerPlugin(ScrollTrigger);

    const section = sectionRef.current;
    const pin = pinRef.current;
    const track = trackRef.current;
    const progressBar = progressRef.current;
    const images = imageRefs.current.filter(
      (el): el is HTMLDivElement => el !== null,
    );
    const total = products.length;

    const mm = gsap.matchMedia();

    mm.add(
      {
        isDesktop: "(min-width: 768px) and (prefers-reduced-motion: no-preference)",
        isMobile: "(max-width: 767px), (prefers-reduced-motion: reduce)",
      },
      (context) => {
        const conditions = context.conditions as
          | { isDesktop: boolean; isMobile: boolean }
          | undefined;
        if (!conditions?.isDesktop) {
          // Mobile / reduced-motion fallback: simple horizontal scroll-snap,
          // no pin, no scrub. Keeps the experience accessible.
          gsap.set(track, { x: 0 });
          return;
        }

        const getDistance = () => {
          const scrollWidth = track.scrollWidth;
          const viewport = window.innerWidth;
          // Right-side breathing room so the last card doesn't kiss the edge.
          const offsetRight = viewport * 0.08;
          return Math.max(0, scrollWidth - viewport + offsetRight);
        };

        const tween = gsap.to(track, {
          x: () => -getDistance(),
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: () => `+=${getDistance()}`,
            pin,
            pinSpacing: true,
            scrub: 1,
            invalidateOnRefresh: true,
            anticipatePin: 1,
            onUpdate: (self) => {
              if (progressBar) {
                progressBar.style.transform = `scaleX(${self.progress})`;
              }
              const idx = Math.min(
                total - 1,
                Math.round(self.progress * (total - 1)),
              );
              setActiveIndex(idx);
            },
          },
        });

        // Subtle inverse parallax on each image to add depth during the scrub.
        const imageTweens = images.map((img) =>
          gsap.to(img, {
            xPercent: -8,
            ease: "none",
            scrollTrigger: {
              trigger: section,
              start: "top top",
              end: () => `+=${getDistance()}`,
              scrub: 1,
              invalidateOnRefresh: true,
            },
          }),
        );

        return () => {
          tween.scrollTrigger?.kill();
          tween.kill();
          imageTweens.forEach((t) => {
            t.scrollTrigger?.kill();
            t.kill();
          });
        };
      },
    );

    const handleLoad = () => ScrollTrigger.refresh();
    window.addEventListener("load", handleLoad);

    // ── Drag-to-scroll : pointer drag horizontal → vertical scroll ──
    // Pin transforms vertical scroll into horizontal motion, so we pipe
    // drag deltas into vertical scroll. We track an absolute target from
    // the drag start (not a per-event delta) to avoid feedback loops with
    // Lenis's smoothed `scroll` value.
    const dragSurface = pin;
    let dragging = false;
    let startX = 0;
    let startScrollY = 0;
    let pointerId: number | null = null;
    let movedEnough = false;

    const dragSpeed = 1.1;
    const dragThreshold = 4; // px before we engage and block link clicks

    type LenisLike = {
      scroll: number;
      scrollTo: (
        target: number,
        opts?: { immediate?: boolean; force?: boolean; lock?: boolean },
      ) => void;
    };
    const getLenis = (): LenisLike | undefined =>
      (window as unknown as { __lenis?: LenisLike }).__lenis;

    const onPointerDown = (e: PointerEvent) => {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      dragging = true;
      movedEnough = false;
      startX = e.clientX;
      startScrollY = getLenis()?.scroll ?? window.scrollY;
      pointerId = e.pointerId;
      dragSurface.setPointerCapture?.(e.pointerId);
      dragSurface.style.cursor = "grabbing";
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!dragging) return;
      const totalDx = e.clientX - startX;
      if (!movedEnough && Math.abs(totalDx) < dragThreshold) return;
      movedEnough = true;
      const target = startScrollY - totalDx * dragSpeed;
      const lenis = getLenis();
      if (lenis) {
        lenis.scrollTo(target, { immediate: true, force: true, lock: true });
      } else {
        window.scrollTo({ top: target, behavior: "auto" });
      }
    };

    const endDrag = (e?: PointerEvent) => {
      if (!dragging) return;
      dragging = false;
      if (e && pointerId !== null) {
        try {
          dragSurface.releasePointerCapture?.(e.pointerId);
        } catch {
          /* noop */
        }
      }
      pointerId = null;
      dragSurface.style.cursor = "grab";
      // Brief delay before re-allowing link clicks if user actually dragged
      if (movedEnough) {
        const blockClick = (ev: MouseEvent) => {
          ev.preventDefault();
          ev.stopPropagation();
          dragSurface.removeEventListener("click", blockClick, true);
        };
        dragSurface.addEventListener("click", blockClick, true);
      }
    };

    const onPointerUp = (e: PointerEvent) => endDrag(e);
    const onPointerCancel = (e: PointerEvent) => endDrag(e);

    // Prevent native image drag from stealing the gesture.
    const onDragStart = (e: DragEvent) => e.preventDefault();

    dragSurface.addEventListener("pointerdown", onPointerDown);
    dragSurface.addEventListener("pointermove", onPointerMove);
    dragSurface.addEventListener("pointerup", onPointerUp);
    dragSurface.addEventListener("pointercancel", onPointerCancel);
    dragSurface.addEventListener("dragstart", onDragStart);
    dragSurface.style.cursor = "grab";
    dragSurface.style.touchAction = "pan-y";
    dragSurface.style.userSelect = "none";

    return () => {
      window.removeEventListener("load", handleLoad);
      dragSurface.removeEventListener("pointerdown", onPointerDown);
      dragSurface.removeEventListener("pointermove", onPointerMove);
      dragSurface.removeEventListener("pointerup", onPointerUp);
      dragSurface.removeEventListener("pointercancel", onPointerCancel);
      dragSurface.removeEventListener("dragstart", onDragStart);
      dragSurface.style.cursor = "";
      dragSurface.style.userSelect = "";
      mm.revert();
    };
  }, [products]);

  if (products.length === 0) return null;

  const total = products.length;

  return (
    <section
      ref={sectionRef}
      className="relative w-full"
      aria-label="Produits signature"
    >
      <div
        ref={pinRef}
        className="relative flex h-[100svh] w-full flex-col overflow-hidden"
      >
        {/* Eyebrow row — sits above the horizontal track */}
        <div className="mx-auto flex w-full max-w-[1600px] items-center justify-between px-4 pt-10 font-mono text-[10px] uppercase tracking-[0.22em] text-foreground/40 sm:px-6 md:pt-16 lg:px-10">
          <span>— Produits signature</span>
          <span className="tabular-nums text-foreground/50">
            {String(activeIndex + 1).padStart(2, "0")} /{" "}
            {String(total).padStart(2, "0")}
          </span>
        </div>

        {/* Horizontal track — centered vertically in the pinned viewport */}
        <div className="relative flex flex-1 items-center">
          <div
            ref={trackRef}
            className="flex items-center gap-5 pl-[6vw] pr-[6vw] md:gap-6 md:pl-[8vw] md:pr-[8vw] max-md:w-full max-md:snap-x max-md:snap-mandatory max-md:overflow-x-auto max-md:scroll-smooth"
            style={{ willChange: "transform" }}
          >
            {products.map((product, i) => (
              <Link
                key={product.id}
                href={`/products/${product.slug}`}
                className="group relative block shrink-0 basis-[62vw] snap-start sm:basis-[42vw] md:basis-[26vw] lg:basis-[22vw]"
              >
                <div className="relative aspect-[3/4] w-full overflow-hidden rounded-[2px] bg-foreground/[0.04] ring-1 ring-inset ring-border/60 transition-colors duration-500 group-hover:ring-foreground/40">
                  {product.image ? (
                    <div
                      ref={(el) => {
                        imageRefs.current[i] = el;
                      }}
                      className="absolute inset-0"
                      style={{ willChange: "transform" }}
                    >
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        sizes="(min-width: 1024px) 22vw, (min-width: 768px) 26vw, (min-width: 640px) 42vw, 62vw"
                        className="scale-[1.15] object-cover grayscale transition-[filter,transform] duration-[900ms] ease-out group-hover:scale-[1.18] group-hover:grayscale-0"
                      />
                    </div>
                  ) : (
                    <div className="absolute inset-0 bg-foreground/[0.04]" />
                  )}
                  <span className="absolute left-5 top-5 font-mono text-[10px] uppercase tracking-[0.22em] tabular-nums text-foreground/40 transition-colors duration-500 group-hover:text-foreground">
                    {String(i + 1).padStart(2, "0")} /{" "}
                    {String(total).padStart(2, "0")}
                  </span>
                </div>

                <div className="mt-6 flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    {product.categoryName && (
                      <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-foreground/40">
                        {product.categoryName}
                      </p>
                    )}
                    <h3 className="mt-2 truncate font-mono text-[14px] uppercase tracking-[0.14em] text-foreground">
                      {product.name}
                    </h3>
                  </div>
                  <span className="shrink-0 font-mono text-[14px] tabular-nums text-foreground/70">
                    {formatPrice(product.price)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Progress indicator — discrete, centered at the bottom of the pin */}
        <div className="mx-auto flex w-full max-w-[1600px] items-center justify-center px-4 pb-10 sm:px-6 md:pb-16 lg:px-10">
          <div className="relative h-[2px] w-40 overflow-hidden bg-foreground/10">
            <span
              ref={progressRef}
              aria-hidden="true"
              className="absolute inset-y-0 left-0 block h-full w-full origin-left bg-foreground/70"
              style={{ transform: "scaleX(0)" }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
