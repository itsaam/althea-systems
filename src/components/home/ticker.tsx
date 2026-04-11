import { ShieldCheck, Award, Truck, HeartHandshake, Leaf, Stethoscope } from "lucide-react";

const MARKS = [
  { icon: ShieldCheck, label: "ISO 13485" },
  { icon: Award, label: "Marquage CE" },
  { icon: Truck, label: "Livraison 48h" },
  { icon: HeartHandshake, label: "SAV 7j/7" },
  { icon: Leaf, label: "Emballage sobre" },
  { icon: Stethoscope, label: "Conseil praticien" },
  { icon: ShieldCheck, label: "Traçabilité lot" },
  { icon: Award, label: "Garantie 24 mois" },
];

export default function Ticker() {
  // Quadrupled so the track is always wider than any viewport — no visual gaps.
  const repeated = [...MARKS, ...MARKS, ...MARKS, ...MARKS];

  return (
    <section
      aria-label="Garanties Althea Systems"
      className="relative w-full overflow-hidden border-y border-shadow-grey-200 bg-shadow-grey-50 py-6"
    >
      {/* Edge fades */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-shadow-grey-50 to-transparent"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-shadow-grey-50 to-transparent"
      />

      <div className="ticker-track flex min-w-max items-center">
        {repeated.map((mark, i) => {
          const Icon = mark.icon;
          return (
            <div
              key={`${mark.label}-${i}`}
              className="flex shrink-0 items-center gap-3 pr-12 text-shadow-grey-700"
            >
              <Icon className="h-4 w-4 text-electric-indigo-500" />
              <span className="font-mono text-[11px] uppercase tracking-[0.18em]">
                {mark.label}
              </span>
              <span
                aria-hidden="true"
                className="h-1 w-1 rounded-full bg-shadow-grey-300"
              />
            </div>
          );
        })}
      </div>

      <style>{`
        .ticker-track {
          animation: ticker 96s linear infinite;
        }
        @keyframes ticker {
          from { transform: translateX(0); }
          to { transform: translateX(-25%); }
        }
        @media (prefers-reduced-motion: reduce) {
          .ticker-track {
            animation: none;
          }
        }
      `}</style>
    </section>
  );
}
