"use client";

import { useTranslations } from "next-intl";

const TICKER_KEYS = [
  "iso",
  "ce",
  "delivery48h",
  "support7d",
  "euStock",
  "batchTracking",
  "warranty",
  "sameDayShipping",
  "practitionerAdvice",
  "soberPackaging",
] as const;

export default function Ticker() {
  const t = useTranslations("home.ticker");
  const marks = TICKER_KEYS.map((k) => t(`items.${k}`));
  const repeated = [...marks, ...marks, ...marks, ...marks];

  return (
    <section
      aria-label={t("ariaLabel")}
      className="relative w-full overflow-hidden border-y border-border/60 bg-background py-4"
    >
      {/* Edge fades */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-0 z-10 w-28 bg-gradient-to-r from-background to-transparent"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 right-0 z-10 w-28 bg-gradient-to-l from-background to-transparent"
      />

      <div
        className="ticker-left flex min-w-max items-center"
        style={{ animationDuration: "140s" }}
      >
        {repeated.map((label, i) => (
          <div
            key={`${label}-${i}`}
            className="flex shrink-0 items-center gap-4 pr-10 text-foreground/60"
          >
            <span className="font-mono text-[11px] uppercase tracking-[0.2em] tabular-nums">
              {label}
            </span>
            <span
              aria-hidden="true"
              className="h-[3px] w-[3px] rounded-full bg-foreground/25"
            />
          </div>
        ))}
      </div>

      <style>{`
        .ticker-left {
          animation-name: ticker-left;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
        }
        @keyframes ticker-left {
          from { transform: translateX(0); }
          to { transform: translateX(-25%); }
        }
        @media (prefers-reduced-motion: reduce) {
          .ticker-left {
            animation: none;
          }
        }
      `}</style>
    </section>
  );
}
