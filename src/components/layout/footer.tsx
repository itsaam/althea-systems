import Link from "next/link";
import Logo from "@/components/shared/logo";
import { Mail, MapPin, Phone } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t bg-[#003d5c] text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Logo />
            <p className="mt-4 text-sm text-white/70 leading-relaxed">
              Votre partenaire de confiance pour l&apos;équipement médical
              professionnel. Qualité, expertise et service.
            </p>
            <div className="mt-6 space-y-3">
              <a
                href="mailto:contact@althea-systems.com"
                className="flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors"
              >
                <Mail className="h-4 w-4" />
                contact@althea-systems.com
              </a>
              <a
                href="tel:+33123456789"
                className="flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors"
              >
                <Phone className="h-4 w-4" />
                +33 1 23 45 67 89
              </a>
              <p className="flex items-center gap-2 text-sm text-white/70">
                <MapPin className="h-4 w-4" />
                Paris, France
              </p>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="font-semibold mb-4 text-white">Navigation</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/categories"
                  className="text-sm text-white/70 hover:text-white transition-colors"
                >
                  Catégories
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="text-sm text-white/70 hover:text-white transition-colors"
                >
                  À propos
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-sm text-white/70 hover:text-white transition-colors"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Account */}
          <div>
            <h3 className="font-semibold mb-4 text-white">Compte</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/login"
                  className="text-sm text-white/70 hover:text-white transition-colors"
                >
                  Connexion
                </Link>
              </li>
              <li>
                <Link
                  href="/register"
                  className="text-sm text-white/70 hover:text-white transition-colors"
                >
                  Inscription
                </Link>
              </li>
              <li>
                <Link
                  href="/orders"
                  className="text-sm text-white/70 hover:text-white transition-colors"
                >
                  Mes commandes
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold mb-4 text-white">Légal</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/cgu"
                  className="text-sm text-white/70 hover:text-white transition-colors"
                >
                  Conditions générales
                </Link>
              </li>
              <li>
                <Link
                  href="/mentions-legales"
                  className="text-sm text-white/70 hover:text-white transition-colors"
                >
                  Mentions légales
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-white/70">
            © {new Date().getFullYear()} Althea Systems. Tous droits réservés.
          </p>
          <div className="flex items-center gap-4">
            <span className="text-xs text-white/50">Paiement sécurisé</span>
            <div className="flex items-center gap-2">
              <div className="h-6 w-10 rounded bg-white/10 flex items-center justify-center text-[10px] font-medium text-white/70">
                VISA
              </div>
              <div className="h-6 w-10 rounded bg-white/10 flex items-center justify-center text-[10px] font-medium text-white/70">
                MC
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
