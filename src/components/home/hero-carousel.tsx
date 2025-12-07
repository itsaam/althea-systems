"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface CarouselSlide {
  id: string;
  title: string;
  subtitle?: string;
  ctaText?: string;
  ctaLink?: string;
  imageUrl?: string;
  backgroundColor?: string;
}

export default function HeroCarousel() {
  const [slides, setSlides] = useState<CarouselSlide[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchSlides() {
      try {
        const res = await fetch("/api/carousel");
        if (res.ok) {
          const data = await res.json();
          setSlides(data.length > 0 ? data : getDefaultSlides());
        } else {
          setSlides(getDefaultSlides());
        }
      } catch {
        setSlides(getDefaultSlides());
      } finally {
        setIsLoading(false);
      }
    }
    fetchSlides();
  }, []);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const getDefaultSlides = (): CarouselSlide[] => [
    {
      id: "1",
      title: "Équipement médical de pointe",
      subtitle: "Des solutions innovantes pour votre cabinet médical",
      ctaText: "Découvrir nos produits",
      ctaLink: "/categories",
    },
  ];

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () =>
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

  if (isLoading) {
    return (
      <section className="w-full">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative h-[500px] md:h-[600px] rounded-2xl bg-muted animate-pulse" />
        </div>
      </section>
    );
  }

  const slide = slides[currentSlide];

  return (
    <section className="w-full pt-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div
          className="relative h-[500px] md:h-[600px] rounded-2xl overflow-hidden"
          style={{
            backgroundColor: slide?.backgroundColor || "#f5f5f5",
          }}
        >
          {/* Background Image */}
          {slide?.imageUrl && (
            <div
              className="absolute inset-0 bg-cover bg-center transition-opacity duration-700"
              style={{ backgroundImage: `url(${slide.imageUrl})` }}
            />
          )}

          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

          {/* Content */}
          <div className="relative h-full flex flex-col items-center justify-center text-center px-8">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white max-w-4xl leading-tight tracking-tight">
              {slide?.title}
            </h1>
            {slide?.subtitle && (
              <p className="mt-6 text-lg md:text-xl text-white/80 max-w-2xl">
                {slide.subtitle}
              </p>
            )}
            {slide?.ctaText && slide?.ctaLink && (
              <Link href={slide.ctaLink} className="mt-8">
                <Button
                  size="lg"
                  className="rounded-full px-8 h-12 text-base font-medium bg-white text-black hover:bg-white/90 transition-all duration-200"
                >
                  {slide.ctaText}
                </Button>
              </Link>
            )}
          </div>

          {/* Navigation Arrows */}
          {slides.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm border border-white/20"
                onClick={prevSlide}
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm border border-white/20"
                onClick={nextSlide}
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            </>
          )}

          {/* Dots */}
          {slides.length > 1 && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    index === currentSlide
                      ? "w-8 bg-white"
                      : "w-2 bg-white/50 hover:bg-white/70"
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
