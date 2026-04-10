import Link from "next/link";
import { ArrowLeft, Shield, Stethoscope, Truck } from "lucide-react";
import Logo from "@/components/shared/logo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen bg-background">
      <div className="grid min-h-screen lg:grid-cols-2">
        <aside className="relative hidden overflow-hidden bg-[#003d5c] text-white lg:block">
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.08),transparent_60%),radial-gradient(ellipse_at_bottom_left,rgba(255,255,255,0.05),transparent_60%)]"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
              backgroundSize: "32px 32px",
            }}
          />

          <div className="relative flex h-full flex-col justify-between p-12">
            <div>
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-sm text-white/70 transition-colors hover:text-white"
              >
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                Retour à l&apos;accueil
              </Link>
              <div className="mt-10">
                <Logo />
              </div>
            </div>

            <div className="max-w-md">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/50">
                Plateforme professionnelle
              </p>
              <h2 className="mt-3 text-4xl font-bold leading-tight tracking-tight">
                L&apos;équipement médical qui fait la différence.
              </h2>
              <p className="mt-4 text-base text-white/70">
                Rejoignez plus de 2 500 professionnels de santé qui nous font
                confiance pour leurs fournitures et matériels spécialisés.
              </p>

              <ul className="mt-10 space-y-5">
                <li className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 backdrop-blur">
                    <Stethoscope className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="font-semibold">Catalogue certifié CE</p>
                    <p className="mt-0.5 text-sm text-white/70">
                      Plus de 12 000 références contrôlées et normées.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 backdrop-blur">
                    <Truck className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="font-semibold">Livraison 24/48h</p>
                    <p className="mt-0.5 text-sm text-white/70">
                      Partout en France métropolitaine, gratuite dès 100 €.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 backdrop-blur">
                    <Shield className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="font-semibold">Paiement sécurisé</p>
                    <p className="mt-0.5 text-sm text-white/70">
                      Conformité PCI-DSS, données chiffrées SSL 256 bits.
                    </p>
                  </div>
                </li>
              </ul>
            </div>

            <p className="text-xs text-white/50">
              © {new Date().getFullYear()} Althea Systems. Tous droits réservés.
            </p>
          </div>
        </aside>

        <main className="flex items-center justify-center px-6 py-12 sm:px-10 lg:px-16">
          <div className="w-full max-w-md">
            <div className="mb-8 lg:hidden">
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                Retour à l&apos;accueil
              </Link>
            </div>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
