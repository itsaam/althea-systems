import Link from "next/link";
import Logo from "@/components/shared/logo";
import SocialLinks from "@/components/shared/social-links";
import { Mail, MapPin, Phone } from "lucide-react";

export default function Footer() {
  return (
    <footer
      className="border-t bg-[#003d5c] text-white"
      aria-labelledby="footer-heading"
    >
      <h2 id="footer-heading" className="sr-only">
        Pied de page
      </h2>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Logo />
            <p className="mt-4 text-sm text-white/85 leading-relaxed">
              Votre partenaire de confiance pour l&apos;équipement médical
              professionnel. Qualité, expertise et service.
            </p>
            <address className="mt-6 space-y-3 not-italic">
              <a
                href="mailto:contact@althea-systems.com"
                className="flex items-center gap-2 text-sm text-white/85 hover:text-white transition-colors rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#003d5c]"
              >
                <Mail className="h-4 w-4" aria-hidden="true" />
                contact@althea-systems.com
              </a>
              <a
                href="tel:+33123456789"
                className="flex items-center gap-2 text-sm text-white/85 hover:text-white transition-colors rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#003d5c]"
              >
                <Phone className="h-4 w-4" aria-hidden="true" />
                +33 1 23 45 67 89
              </a>
              <p className="flex items-center gap-2 text-sm text-white/85">
                <MapPin className="h-4 w-4" aria-hidden="true" />
                Paris, France
              </p>
            </address>
            <div className="mt-6">
              <p
                id="footer-social-heading"
                className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/75"
              >
                Suivez-nous
              </p>
              <SocialLinks />
            </div>
          </div>

          {/* Navigation */}
          <nav aria-labelledby="footer-nav-heading">
            <h3
              id="footer-nav-heading"
              className="font-semibold mb-4 text-white"
            >
              Navigation
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/categories"
                  className="text-sm text-white/85 hover:text-white transition-colors rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#003d5c]"
                >
                  Catégories
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="text-sm text-white/85 hover:text-white transition-colors rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#003d5c]"
                >
                  À propos
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-sm text-white/85 hover:text-white transition-colors rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#003d5c]"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </nav>

          {/* Account */}
          <nav aria-labelledby="footer-account-heading">
            <h3
              id="footer-account-heading"
              className="font-semibold mb-4 text-white"
            >
              Compte
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/login"
                  className="text-sm text-white/85 hover:text-white transition-colors rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#003d5c]"
                >
                  Connexion
                </Link>
              </li>
              <li>
                <Link
                  href="/register"
                  className="text-sm text-white/85 hover:text-white transition-colors rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#003d5c]"
                >
                  Inscription
                </Link>
              </li>
              <li>
                <Link
                  href="/orders"
                  className="text-sm text-white/85 hover:text-white transition-colors rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#003d5c]"
                >
                  Mes commandes
                </Link>
              </li>
            </ul>
          </nav>

          {/* Legal */}
          <nav aria-labelledby="footer-legal-heading">
            <h3
              id="footer-legal-heading"
              className="font-semibold mb-4 text-white"
            >
              Légal
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/cgu"
                  className="text-sm text-white/85 hover:text-white transition-colors rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#003d5c]"
                >
                  Conditions générales
                </Link>
              </li>
              <li>
                <Link
                  href="/mentions-legales"
                  className="text-sm text-white/85 hover:text-white transition-colors rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#003d5c]"
                >
                  Mentions légales
                </Link>
              </li>
            </ul>
          </nav>
        </div>

        {/* Bottom */}
        <div className="mt-16 pt-8 border-t border-white/15 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-white/85">
            © {new Date().getFullYear()} Althea Systems. Tous droits réservés.
          </p>
          <div className="flex items-center gap-4">
            <span className="text-xs text-white/75">Paiement sécurisé</span>
            <div className="flex items-center gap-2" aria-hidden="true">
              <div className="h-6 w-10 rounded bg-white/15 flex items-center justify-center text-[10px] font-medium text-white/85">
                VISA
              </div>
              <div className="h-6 w-10 rounded bg-white/15 flex items-center justify-center text-[10px] font-medium text-white/85">
                MC
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
