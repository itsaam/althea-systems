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
  "from-electric-indigo-200 via-lavender-mist-200 to-shadow-grey-100",
  "from-lavender-mist-300 via-electric-indigo-100 to-shadow-grey-100",
  "from-electric-indigo-100 via-shadow-grey-100 to-lavender-mist-200",
  "from-lavender-mist-200 via-electric-indigo-200 to-shadow-grey-50",
  "from-shadow-grey-100 via-lavender-mist-200 to-electric-indigo-100",
  "from-electric-indigo-200 via-shadow-grey-100 to-lavender-mist-300",
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
        className="relative hidden h-[300vh] bg-shadow-grey-50 lg:block"
      >
        <div className="sticky top-0 flex h-screen flex-col overflow-hidden">
          <div className="mx-auto w-full max-w-7xl px-6 pt-24 md:px-10">
            <ScrollReveal>
              <p className="eyebrow text-shadow-grey-500">Explorer</p>
            </ScrollReveal>
            <h2 className="font-display mt-6 text-display-sm text-shadow-grey-900">
              <SplitText as="span" text="Par" className="not-italic" />{" "}
              <SplitText
                as="span"
                text="spécialité."
                delay={0.25}
                className="italic text-brand-gradient"
              />
            </h2>
          </div>

          <div className="flex flex-1 items-center">
            <motion.div
              style={{ x: translate }}
              className="flex gap-8 pl-6 pr-[30vw] md:pl-20"
            >
              {categories.map((category, i) => (
                <Link
                  key={category.id}
                  href={`/categories/${category.slug}`}
                  className="group relative block aspect-[4/5] w-[35vw] shrink-0 overflow-hidden rounded-3xl"
                >
                  {category.image ? (
                    <Image
                      src={category.image}
                      alt={category.name}
                      fill
                      sizes="40vw"
                      className="object-cover transition-transform duration-[1200ms] ease-out-expo group-hover:scale-[1.05]"
                    />
                  ) : (
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${
                        FALLBACK_GRADIENTS[i % FALLBACK_GRADIENTS.length]
                      }`}
                    />
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-electric-indigo-900/70 via-electric-indigo-900/10 to-transparent" />

                  <div className="absolute inset-x-8 bottom-8">
                    <p className="eyebrow text-lavender-mist-300">
                      {String(i + 1).padStart(2, "0")} / {categories.length}
                    </p>
                    <h3 className="font-display mt-4 text-3xl italic leading-[1] text-white md:text-4xl">
                      {category.name}
                    </h3>
                    <p className="eyebrow mt-6 text-white/80">Explorer →</p>
                  </div>
                </Link>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Mobile / reduced motion — normal grid */}
      <section className="bg-shadow-grey-50 py-24 lg:hidden">
        <div className="mx-auto max-w-7xl px-6">
          <p className="eyebrow text-shadow-grey-500">Explorer</p>
          <h2 className="font-display mt-6 text-display-sm italic text-shadow-grey-900">
            Par <em className="text-brand-gradient">spécialité</em>
          </h2>

          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2">
            {categories.map((category, i) => (
              <Link
                key={category.id}
                href={`/categories/${category.slug}`}
                className="group relative block aspect-[4/5] overflow-hidden rounded-2xl"
              >
                {category.image ? (
                  <Image
                    src={category.image}
                    alt={category.name}
                    fill
                    sizes="(min-width: 640px) 50vw, 100vw"
                    className="object-cover transition-transform duration-700 ease-out-expo group-hover:scale-[1.03]"
                  />
                ) : (
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${
                      FALLBACK_GRADIENTS[i % FALLBACK_GRADIENTS.length]
                    }`}
                  />
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-electric-indigo-900/70 via-electric-indigo-900/10 to-transparent" />

                <div className="absolute inset-x-6 bottom-6">
                  <h3 className="font-display text-2xl italic text-white">
                    {category.name}
                  </h3>
                  <p className="eyebrow mt-2 text-white/80">Explorer →</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
