import Link from "next/link";
import { Instrument_Serif } from "next/font/google";
import { ArrowUpRight, ArrowLeft } from "lucide-react";
import styles from "./not-found.module.css";

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  display: "swap",
});

const ERROR_CODE = "404";
const TIMESTAMP = "ERR_ROUTE_NOT_FOUND";

export default function NotFound() {
  return (
    <main className={`${styles.page} ${instrumentSerif.className}`}>
      <div className={styles.grainLayer} aria-hidden="true" />

      <header className={styles.topBar}>
        <Link href="/" className={styles.brand} aria-label="Althea Systems — Accueil">
          <span className={styles.brandMark}>Althea</span>
          <span className={styles.brandDot} aria-hidden="true" />
          <span className={styles.brandMeta}>Systems</span>
        </Link>
        <span className={styles.status}>
          <span className={styles.statusDot} aria-hidden="true" />
          {TIMESTAMP}
        </span>
      </header>

      <section className={styles.hero}>
        <p className={styles.eyebrow}>
          <span className={styles.eyebrowLine} aria-hidden="true" />
          Erreur 04 — Page introuvable
        </p>

        <h1 className={styles.display}>
          <span className={styles.displayRow}>
            <em className={styles.emph}>Cette</em>
            <span className={styles.numeralWrap} aria-hidden="true">
              <span className={styles.numeral}>{ERROR_CODE}</span>
            </span>
          </span>
          <span className={styles.displayRowTwo}>page a pris</span>
          <span className={styles.displayRowThree}>
            <em className={styles.emph}>la mauvaise</em> ordonnance.
          </span>
        </h1>

        <div className={styles.divider} aria-hidden="true" />

        <div className={styles.bodyRow}>
          <p className={styles.lede}>
            Elle n’existe plus, a changé d’adresse, ou n’a jamais vraiment fait partie
            de notre catalogue. Rien de grave. Reprenons le fil, ensemble.
          </p>

          <div className={styles.actions}>
            <Link href="/" className={styles.primaryCta}>
              <ArrowLeft className={styles.primaryIcon} aria-hidden="true" />
              <span>Retour à l’accueil</span>
            </Link>
            <Link href="/contact" className={styles.secondaryCta}>
              <span>Nous écrire</span>
              <ArrowUpRight className={styles.secondaryIcon} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      <footer className={styles.bottomBar}>
        <dl className={styles.meta}>
          <div className={styles.metaItem}>
            <dt>Ref.</dt>
            <dd>#404-ALT-SYS</dd>
          </div>
          <div className={styles.metaItem}>
            <dt>Service</dt>
            <dd>Équipement médical</dd>
          </div>
          <div className={styles.metaItem}>
            <dt>Statut</dt>
            <dd>Opérationnel</dd>
          </div>
        </dl>
        <p className={styles.signature}>
          Althea Systems — <span className={styles.signatureItalic}>édition numérique</span>
        </p>
      </footer>
    </main>
  );
}
