import Link from "next/link";
import { getTranslations } from "next-intl/server";
import SocialLinks from "@/components/shared/social-links";

const linkClass =
  "font-mono text-[11px] lowercase tracking-[0.14em] text-white/70 transition-colors duration-300 hover:text-white rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-navy-700";

const columnHeadingClass =
  "font-mono text-[10px] uppercase tracking-[0.22em] text-white/40 mb-5";

export default async function Footer() {
  const tFooter = await getTranslations("footer");
  const tNav = await getTranslations("nav");
  const tCommon = await getTranslations("common");
  const year = new Date().getFullYear();

  return (
    <footer
      className="relative isolate overflow-hidden border-t border-white/10 bg-navy-700 text-white"
      aria-labelledby="footer-heading"
    >
      <h2 id="footer-heading" className="sr-only">
        {tFooter("heading")}
      </h2>

      {/* Giant ALTHEA outline wordmark — full-bleed editorial backdrop */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center overflow-hidden leading-none"
      >
        <span
          className="select-none whitespace-nowrap font-display text-[34vw] font-semibold leading-[0.8] tracking-[-0.04em]"
          style={{
            WebkitTextStroke: "1px rgba(255,255,255,0.07)",
            color: "transparent",
          }}
        >
          ALTHEA
        </span>
      </div>

      <div className="relative z-10 mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-10 pt-24 pb-10">
        {/* ── Top grid : tagline + columns ────────────────────── */}
        <div className="grid gap-16 md:grid-cols-12 md:gap-10">
          <div className="md:col-span-5">
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/40">
              {tFooter("followUs")}
            </p>
            <p className="mt-6 max-w-md text-h3 font-semibold leading-[1.1] tracking-[-0.02em] text-white">
              {tFooter("tagline")}
            </p>
            <div className="mt-8">
              <SocialLinks />
            </div>
          </div>

          <nav
            className="md:col-span-2"
            aria-labelledby="footer-nav-heading"
          >
            <h3 id="footer-nav-heading" className={columnHeadingClass}>
              {tFooter("navigation")}
            </h3>
            <ul className="space-y-3">
              <li>
                <Link href="/categories" className={linkClass}>
                  {tNav("categories")}
                </Link>
              </li>
              <li>
                <Link href="/about" className={linkClass}>
                  {tNav("about")}
                </Link>
              </li>
              <li>
                <Link href="/contact" className={linkClass}>
                  {tNav("contact")}
                </Link>
              </li>
            </ul>
          </nav>

          <nav
            className="md:col-span-2"
            aria-labelledby="footer-account-heading"
          >
            <h3 id="footer-account-heading" className={columnHeadingClass}>
              {tFooter("account")}
            </h3>
            <ul className="space-y-3">
              <li>
                <Link href="/login" className={linkClass}>
                  {tCommon("login")}
                </Link>
              </li>
              <li>
                <Link href="/register" className={linkClass}>
                  {tCommon("register")}
                </Link>
              </li>
              <li>
                <Link href="/orders" className={linkClass}>
                  {tCommon("myOrders")}
                </Link>
              </li>
            </ul>
          </nav>

          <nav
            className="md:col-span-3"
            aria-labelledby="footer-contact-heading"
          >
            <h3 id="footer-contact-heading" className={columnHeadingClass}>
              {tFooter("legalHeading")}
            </h3>
            <ul className="space-y-3">
              <li>
                <Link href="/cgu" className={linkClass}>
                  {tFooter("terms")}
                </Link>
              </li>
              <li>
                <Link href="/mentions-legales" className={linkClass}>
                  {tFooter("legal")}
                </Link>
              </li>
              <li>
                <a
                  href="mailto:contact@althea-systems.com"
                  className={linkClass}
                >
                  contact@althea-systems.com
                </a>
              </li>
              <li>
                <a href="tel:+33123456789" className={linkClass}>
                  +33 1 23 45 67 89
                </a>
              </li>
              <li>
                <span className="font-mono text-[11px] lowercase tracking-[0.14em] text-white/50">
                  {tFooter("location")}
                </span>
              </li>
            </ul>
          </nav>
        </div>

        {/* ── Massive wordmark ────────────────────────────────── */}
        <div
          aria-hidden="true"
          className="mt-24 flex select-none items-end justify-center overflow-hidden"
        >
          <span className="font-display block text-hero font-semibold leading-[0.82] tracking-[-0.045em] text-white/95">
            althea<span className="text-electric-indigo-400">.</span>
          </span>
        </div>

        {/* ── Bottom strip ────────────────────────────────────── */}
        <div className="mt-14 flex flex-col items-start justify-between gap-4 border-t border-white/10 pt-6 md:flex-row md:items-center">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/40">
            © {year} althea systems — {tFooter("rights")}
          </p>
          <div className="flex items-center gap-4">
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/40">
              {tFooter("securePayment")}
            </span>
            <div className="flex items-center gap-2" aria-hidden="true">
              <div className="flex h-6 w-10 items-center justify-center rounded border border-white/15 font-mono text-[9px] tracking-wider text-white/60">
                VISA
              </div>
              <div className="flex h-6 w-10 items-center justify-center rounded border border-white/15 font-mono text-[9px] tracking-wider text-white/60">
                MC
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
