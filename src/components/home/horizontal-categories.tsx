"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import SplitText from "@/components/ui/split-text";
import ScrollReveal from "@/components/ui/scroll-reveal";

export type HorizontalCategory = {
  id: string;
  slug: string;
  name: string;
  image: string | null;
};

const FALLBACK_GRADIENTS = [
  "from-shadow-grey-100 to-shadow-grey-200",
  "from-shadow-grey-200 to-shadow-grey-100",
  "from-shadow-grey-50 to-shadow-grey-200",
  "from-shadow-grey-100 to-shadow-grey-50",
  "from-shadow-grey-200 to-shadow-grey-100",
  "from-shadow-grey-50 to-shadow-grey-100",
];

export default function HorizontalCategories({
  categories,
}: {
  categories: HorizontalCategory[];
}) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  const translate = useTransform(scrollYProgress, [0, 1], ["0%", "-72%"]);

  return (
    <>
      {/* Desktop — horizontal scroll */}
      <section
        ref={sectionRef}
        className="relative hidden h-[300vh] bg-background lg:block"
      >
        <div className="sticky top-0 flex h-screen flex-col overflow-hidden">
          <div className="mx-auto w-full max-w-[1400px] px-4 pt-24 sm:px-6 lg:px-10">
            <div className="flex items-end justify-between gap-10">
              <div>
                <ScrollReveal>
                  <p className="text-eyebrow text-foreground/45">
                    — Explorer · Par spécialité
                  </p>
                </ScrollReveal>
                <h2 className="mt-6 text-h1 text-foreground">
                  <SplitText as="span" text="Par" className="block" />
                  <SplitText
                    as="span"
                    text="spécialité."
                    delay={0.25}
                    className="block text-foreground/40"
                  />
                </h2>
              </div>
              <span className="hidden font-mono text-[10px] uppercase tracking-[0.22em] tabular-nums text-foreground/40 md:block">
                {String(categories.length).padStart(2, "0")} catégories — scroll horizontal
              </span>
            </div>
          </div>

          <div className="mt-14 flex flex-1 items-center">
            <motion.div
              style={{ x: translate }}
              className="flex gap-6 pl-6 pr-[30vw] md:pl-10 lg:pl-10"
            >
              {categories.map((category, i) => (
                <Link
                  key={category.id}
                  href={`/categories/${category.slug}`}
                  className="group relative block aspect-[4/5] w-[32vw] shrink-0 overflow-hidden rounded-[2px]"
                >
                  {category.image ? (
                    <Image
                      src={category.image}
                      alt={category.name}
                      fill
                      sizes="40vw"
                      className="object-cover grayscale transition-all duration-[1200ms] ease-out group-hover:scale-[1.04] group-hover:grayscale-0"
                    />
                  ) : (
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${
                        FALLBACK_GRADIENTS[i % FALLBACK_GRADIENTS.length]
                      }`}
                    />
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-shadow-grey-950/85 via-shadow-grey-950/30 to-transparent" />
                  <div className="absolute inset-0 ring-1 ring-inset ring-white/0 transition-colors duration-500 group-hover:ring-white/40" />

                  <div className="absolute inset-x-8 bottom-8">
                    <p className="font-mono text-[10px] uppercase tracking-[0.22em] tabular-nums text-white/60">
                      {String(i + 1).padStart(2, "0")} / {String(categories.length).padStart(2, "0")}
                    </p>
                    <h3 className="mt-4 text-h3 font-semibold leading-[1.05] text-white">
                      {category.name}
                    </h3>
                    <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.22em] text-white/70 transition-colors duration-300 group-hover:text-white">
                      Explorer →
                    </p>
                  </div>
                </Link>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Mobile / reduced motion — normal grid */}
      <section className="bg-background py-24 lg:hidden">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6">
          <p className="text-eyebrow text-foreground/45">
            — Explorer · Par spécialité
          </p>
          <h2 className="mt-6 text-h1 text-foreground">
            Par{" "}
            <span className="text-foreground/40">spécialité.</span>
          </h2>

          <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {categories.map((category, i) => (
              <Link
                key={category.id}
                href={`/categories/${category.slug}`}
                className="group relative block aspect-[4/5] overflow-hidden rounded-[2px]"
              >
                {category.image ? (
                  <Image
                    src={category.image}
                    alt={category.name}
                    fill
                    sizes="(min-width: 640px) 50vw, 100vw"
                    className="object-cover grayscale transition-all duration-700 ease-out group-hover:scale-[1.03] group-hover:grayscale-0"
                  />
                ) : (
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${
                      FALLBACK_GRADIENTS[i % FALLBACK_GRADIENTS.length]
                    }`}
                  />
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-shadow-grey-950/85 via-shadow-grey-950/30 to-transparent" />

                <div className="absolute inset-x-6 bottom-6">
                  <p className="font-mono text-[10px] uppercase tracking-[0.22em] tabular-nums text-white/60">
                    {String(i + 1).padStart(2, "0")} / {String(categories.length).padStart(2, "0")}
                  </p>
                  <h3 className="mt-3 text-h3 font-semibold leading-[1.05] text-white">
                    {category.name}
                  </h3>
                  <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.22em] text-white/70">
                    Explorer →
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
