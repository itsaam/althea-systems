"use client";

import { useEffect, type ReactNode } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register once at module scope to avoid re-registering on every mount.
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function SmoothScrollProvider({
  children,
}: {
  children: ReactNode;
}) {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) return;

    const lenis = new Lenis({
      lerp: 0.1,
      wheelMultiplier: 1,
      smoothWheel: true,
    });

    // Expose globally so other components (e.g. drag-driven carousels)
    // can pipe their gestures through the same smooth scroll loop.
    (window as unknown as { __lenis?: Lenis }).__lenis = lenis;

    // Bridge Lenis <-> GSAP ScrollTrigger so that any pinned/scrubbed
    // animation stays in sync with the smooth scroll loop.
    const onScroll = () => ScrollTrigger.update();
    lenis.on("scroll", onScroll);

    const tickerCallback = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(tickerCallback);
    gsap.ticker.lagSmoothing(0);

    return () => {
      lenis.off("scroll", onScroll);
      gsap.ticker.remove(tickerCallback);
      delete (window as unknown as { __lenis?: Lenis }).__lenis;
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}
