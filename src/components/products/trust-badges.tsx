import { Truck, RotateCcw, ShieldCheck, Lock } from "lucide-react";

const BADGES = [
  {
    icon: Truck,
    title: "Livraison 48h",
    detail: "France métropolitaine",
  },
  {
    icon: RotateCcw,
    title: "Retour 30 jours",
    detail: "sans discussion",
  },
  {
    icon: ShieldCheck,
    title: "ISO 13485 / CE",
    detail: "traçabilité par lot",
  },
  {
    icon: Lock,
    title: "Paiement sécurisé",
    detail: "Stripe · 3DS",
  },
];

export default function TrustBadges() {
  return (
    <ul className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-shadow-grey-200 bg-shadow-grey-200">
      {BADGES.map((badge) => {
        const Icon = badge.icon;
        return (
          <li
            key={badge.title}
            className="flex items-start gap-4 bg-background p-5 transition-colors duration-500 hover:bg-shadow-grey-50"
          >
            <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-shadow-grey-200 bg-background text-electric-indigo-500">
              <Icon className="h-5 w-5" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-medium leading-tight text-shadow-grey-900">
                {badge.title}
              </p>
              <p className="mt-1 text-xs text-shadow-grey-500">{badge.detail}</p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
