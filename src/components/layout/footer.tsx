import Link from "next/link";
import Logo from "@/components/shared/logo";

export default function Footer() {
  return (
    <footer className="border-t bg-muted/50">
      <div className="container py-12">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <Logo />
            <p className="mt-4 text-sm text-muted-foreground">
              Votre boutique en ligne de confiance.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Navigation</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/categories" className="hover:text-primary">
                  Catégories
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-primary">
                  À propos
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-primary">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Compte</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/login" className="hover:text-primary">
                  Connexion
                </Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-primary">
                  Inscription
                </Link>
              </li>
              <li>
                <Link href="/orders" className="hover:text-primary">
                  Mes commandes
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Légal</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/cgu" className="hover:text-primary">
                  CGU
                </Link>
              </li>
              <li>
                <Link href="/mentions-legales" className="hover:text-primary">
                  Mentions légales
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Althea Systems. Tous droits réservés.
        </div>
      </div>
    </footer>
  );
}
