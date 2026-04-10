"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export interface LegalSection {
  id: string;
  title: string;
}

interface LegalPageProps {
  eyebrow: string;
  title: string;
  subtitle?: string;
  updatedAt: string;
  sections: LegalSection[];
  children: React.ReactNode;
}

export default function LegalPage({
  eyebrow,
  title,
  subtitle,
  updatedAt,
  sections,
  children,
}: LegalPageProps) {
  const [activeId, setActiveId] = useState<string>(sections[0]?.id ?? "");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]?.target?.id) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: "-80px 0px -70% 0px", threshold: 0.1 }
    );

    sections.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [sections]);

  return (
    <div className="container py-12 md:py-16">
      <div className="mx-auto max-w-6xl">
        <header className="mb-10 border-b pb-10">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            {eyebrow}
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-4 max-w-3xl text-base text-muted-foreground md:text-lg">
              {subtitle}
            </p>
          )}
          <p className="mt-6 text-xs text-muted-foreground">
            Dernière mise à jour :{" "}
            <time className="font-medium text-foreground/70">{updatedAt}</time>
          </p>
        </header>

        <div className="flex flex-col gap-10 lg:flex-row lg:gap-16">
          <aside className="lg:w-64 lg:shrink-0">
            <div className="lg:sticky lg:top-24">
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Sommaire
              </p>
              <nav aria-label="Table des matières">
                <ol className="space-y-1 border-l">
                  {sections.map((section, index) => {
                    const isActive = activeId === section.id;
                    return (
                      <li key={section.id}>
                        <a
                          href={`#${section.id}`}
                          aria-current={isActive ? "true" : undefined}
                          className={cn(
                            "-ml-px block border-l-2 py-1.5 pl-4 text-sm transition-colors",
                            isActive
                              ? "border-primary font-semibold text-primary"
                              : "border-transparent text-muted-foreground hover:border-foreground/30 hover:text-foreground"
                          )}
                        >
                          <span className="mr-2 font-mono text-[10px] opacity-60">
                            {String(index + 1).padStart(2, "0")}
                          </span>
                          {section.title}
                        </a>
                      </li>
                    );
                  })}
                </ol>
              </nav>
            </div>
          </aside>

          <article className="min-w-0 flex-1 space-y-10 text-sm leading-relaxed text-muted-foreground md:text-[15px]">
            {children}
          </article>
        </div>
      </div>
    </div>
  );
}

interface SectionProps {
  id: string;
  title: string;
  children: React.ReactNode;
}

export function Section({ id, title, children }: SectionProps) {
  return (
    <section id={id} className="scroll-mt-24">
      <h2 className="mb-4 text-xl font-bold tracking-tight text-foreground md:text-2xl">
        {title}
      </h2>
      <div className="space-y-3 [&_p]:leading-relaxed [&_a]:text-primary [&_a]:underline-offset-4 [&_a:hover]:underline [&_strong]:font-semibold [&_strong]:text-foreground/90 [&_ul]:list-disc [&_ul]:space-y-1.5 [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:space-y-1.5 [&_ol]:pl-5">
        {children}
      </div>
    </section>
  );
}
