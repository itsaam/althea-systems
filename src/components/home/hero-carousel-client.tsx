"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ArrowUpRight } from "lucide-react";

export type CarouselSlide = {
  id: string;
  title: string;
  subtitle: string | null;
  image: string;
  link: string | null;
};

const AUTOPLAY_MS = 6000;

export default function HeroCarouselClient({
  slides,
}: {
  slides: CarouselSlide[];
}) {
  const [index, setIndex] = useState(0);
  const total = slides.length;

  const goTo = useCallback(
    (i: number) => setIndex(((i % total) + total) % total),
    [total]
  );

  useEffect(() => {
    if (total <= 1) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % total);
    }, AUTOPLAY_MS);
    return () => clearInterval(id);
  }, [total]);

  return (
    <section
      className="relative isolate w-full bg-background"
      aria-label="Mises en avant"
    >
      <div className="mx-auto w-full max-w-[1400px] px-4 pb-8 pt-4 sm:px-6 lg:px-10 lg:pb-14 lg:pt-6">
        <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.22em] text-foreground/40">
          <span>— Sélection du moment</span>
          <span className="tabular-nums">
            {String(index + 1).padStart(2, "0")} /{" "}
            {String(total).padStart(2, "0")}
          </span>
        </div>

        <div className="relative mt-4 aspect-[21/9] w-full overflow-hidden bg-foreground/[0.04] ring-1 ring-inset ring-border/60 sm:aspect-[21/8]">
          {slides.map((slide, i) => {
            const active = i === index;
            const content = (
              <>
                <Image
                  src={slide.image}
                  alt={slide.title}
                  fill
                  priority={i === 0}
                  sizes="(min-width: 1024px) 1400px, 100vw"
                  className={`object-cover transition-[transform,filter] duration-[1400ms] ease-out ${
                    active ? "scale-100" : "scale-[1.06]"
                  }`}
                />
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent"
                />
                <div className="absolute inset-x-0 bottom-0 p-6 sm:p-10 lg:p-14">
                  <div className="max-w-[720px]">
                    <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/70">
                      Slide {String(i + 1).padStart(2, "0")}
                    </p>
                    <h2 className="mt-3 font-display text-3xl leading-[1.05] tracking-[-0.02em] text-white sm:text-5xl lg:text-6xl">
                      {slide.title}
                    </h2>
                    {slide.subtitle ? (
                      <p
                        className="mt-4 max-w-xl text-[15px] leading-relaxed text-white/80"
                        dangerouslySetInnerHTML={{ __html: slide.subtitle }}
                      />
                    ) : null}
                    {slide.link ? (
                      <span className="mt-6 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-white underline-offset-4 group-hover:underline">
                        Découvrir
                        <ArrowUpRight className="h-4 w-4 transition-transform duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                      </span>
                    ) : null}
                  </div>
                </div>
              </>
            );

            return (
              <div
                key={slide.id}
                aria-hidden={!active}
                className={`absolute inset-0 transition-opacity duration-700 ease-out ${
                  active ? "opacity-100" : "pointer-events-none opacity-0"
                }`}
              >
                {slide.link ? (
                  <Link
                    href={slide.link}
                    className="group absolute inset-0 block focus-visible:outline-none"
                  >
                    {content}
                  </Link>
                ) : (
                  <div className="group absolute inset-0">{content}</div>
                )}
              </div>
            );
          })}
        </div>

        {total > 1 ? (
          <div className="mt-4 flex items-center gap-3">
            {slides.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => goTo(i)}
                aria-label={`Aller au slide ${i + 1}`}
                aria-current={i === index}
                className="group relative h-[2px] flex-1 overflow-hidden bg-foreground/10 focus-visible:outline-none"
              >
                <span
                  className={`absolute inset-y-0 left-0 block bg-foreground transition-[width] ease-out ${
                    i === index
                      ? "w-full duration-[6000ms]"
                      : i < index
                        ? "w-full duration-300"
                        : "w-0 duration-300"
                  }`}
                  key={`${i}-${index}`}
                />
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
