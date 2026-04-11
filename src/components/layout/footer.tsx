import Link from "next/link";
import { getTranslations } from "next-intl/server";
import Logo from "@/components/shared/logo";
import SocialLinks from "@/components/shared/social-links";
import { Mail, MapPin, Phone } from "lucide-react";

export default async function Footer() {
  const tFooter = await getTranslations("footer");
  const tNav = await getTranslations("nav");
  const tCommon = await getTranslations("common");

  return (
    <footer
      className="border-t border-white/10 bg-shadow-grey-950 text-white"
      aria-labelledby="footer-heading"
    >
      <h2 id="footer-heading" className="sr-only">
        {tFooter("heading")}
      </h2>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Logo />
            <p className="mt-4 text-sm text-white/85 leading-relaxed">
              {tFooter("tagline")}
            </p>
            <address className="mt-6 space-y-3 not-italic">
              <a
                href="mailto:contact@althea-systems.com"
                className="flex items-center gap-2 text-sm text-white/85 hover:text-white transition-colors rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-shadow-grey-950"
              >
                <Mail className="h-4 w-4" aria-hidden="true" />
                contact@althea-systems.com
              </a>
              <a
                href="tel:+33123456789"
                className="flex items-center gap-2 text-sm text-white/85 hover:text-white transition-colors rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-shadow-grey-950"
              >
                <Phone className="h-4 w-4" aria-hidden="true" />
                +33 1 23 45 67 89
              </a>
              <p className="flex items-center gap-2 text-sm text-white/85">
                <MapPin className="h-4 w-4" aria-hidden="true" />
                {tFooter("location")}
              </p>
            </address>
            <div className="mt-6">
              <p
                id="footer-social-heading"
                className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/75"
              >
                {tFooter("followUs")}
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
              {tFooter("navigation")}
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/categories"
                  className="text-sm text-white/85 hover:text-white transition-colors rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-shadow-grey-950"
                >
                  {tNav("categories")}
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="text-sm text-white/85 hover:text-white transition-colors rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-shadow-grey-950"
                >
                  {tNav("about")}
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-sm text-white/85 hover:text-white transition-colors rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-shadow-grey-950"
                >
                  {tNav("contact")}
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
              {tFooter("account")}
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/login"
                  className="text-sm text-white/85 hover:text-white transition-colors rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-shadow-grey-950"
                >
                  {tCommon("login")}
                </Link>
              </li>
              <li>
                <Link
                  href="/register"
                  className="text-sm text-white/85 hover:text-white transition-colors rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-shadow-grey-950"
                >
                  {tCommon("register")}
                </Link>
              </li>
              <li>
                <Link
                  href="/orders"
                  className="text-sm text-white/85 hover:text-white transition-colors rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-shadow-grey-950"
                >
                  {tCommon("myOrders")}
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
              {tFooter("legalHeading")}
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/cgu"
                  className="text-sm text-white/85 hover:text-white transition-colors rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-shadow-grey-950"
                >
                  {tFooter("terms")}
                </Link>
              </li>
              <li>
                <Link
                  href="/mentions-legales"
                  className="text-sm text-white/85 hover:text-white transition-colors rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-shadow-grey-950"
                >
                  {tFooter("legal")}
                </Link>
              </li>
            </ul>
          </nav>
        </div>

        {/* Bottom */}
        <div className="mt-16 pt-8 border-t border-white/15 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-white/85">
            © {new Date().getFullYear()} Althea Systems. {tFooter("rights")}
          </p>
          <div className="flex items-center gap-4">
            <span className="text-xs text-white/75">
              {tFooter("securePayment")}
            </span>
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
