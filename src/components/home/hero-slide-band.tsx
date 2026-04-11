import Image from "next/image";
import { ArrowUpRight } from "lucide-react";

interface Slide {
  id: string;
  title: string;
  subtitle?: string | null;
  image?: string | null;
}

interface HeroSlideBandProps {
  slides?: Slide[];
}

export default function HeroSlideBand({ slides = [] }: HeroSlideBandProps) {
  const slide = slides[0];
  if (!slide) return null;

  return (
    <section
      aria-label="Sélection éditoriale"
      className="relative mx-auto max-w-7xl px-6 py-10 md:px-10 md:py-14"
    >
      <div className="group relative aspect-[21/9] overflow-hidden rounded-3xl bg-shadow-grey-100 shadow-[0_40px_120px_-24px_rgba(29,22,25,0.3)]">
        {slide.image ? (
          <Image
            src={slide.image}
            alt={slide.title || "Équipement médical Althea"}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 80vw"
            className="object-cover transition-transform duration-[1400ms] ease-out-expo group-hover:scale-[1.04]"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-shadow-grey-200 via-shadow-grey-100 to-lavender-mist-100" />
        )}

        {/* Edge vignette for caption legibility */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-shadow-grey-950/60 via-shadow-grey-950/10 to-transparent"
        />

        {/* Caption glass panel */}
        <div className="absolute inset-x-5 bottom-5 flex items-end justify-between gap-5 rounded-2xl border border-white/20 bg-shadow-grey-900/70 p-5 backdrop-blur-xl md:inset-x-8 md:bottom-8 md:p-6">
          <div className="min-w-0">
            <p className="eyebrow text-lavender-mist-300">
              {slide.subtitle || "Édition avril 2026"}
            </p>
            <p className="mt-2 font-display text-xl italic leading-tight text-white md:text-2xl">
              {slide.title || "Sélection signature"}
            </p>
          </div>
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white text-shadow-grey-900 transition-transform duration-500 ease-out-expo group-hover:rotate-45">
            <ArrowUpRight className="h-5 w-5" />
          </span>
        </div>

        {/* Floating badge — Norme CE */}
        <div className="absolute left-5 top-5 rotate-[-4deg] rounded-full border border-white/30 bg-white/90 px-5 py-3 shadow-[0_18px_50px_-12px_rgba(29,22,25,0.25)] backdrop-blur-md md:left-8 md:top-8">
          <p className="eyebrow text-electric-indigo-600">Norme CE</p>
          <p className="mt-1 text-xs font-medium text-shadow-grey-900">
            100% conforme
          </p>
        </div>
      </div>
    </section>
  );
}
