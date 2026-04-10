"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { Cookie, X, Check, ShieldCheck, BarChart3, Megaphone } from "lucide-react";
import styles from "./cookie-banner.module.css";

const COOKIE_CONSENT_KEY = "althea-cookie-consent";

interface CookieConsent {
  essential: boolean;
  analytics: boolean;
  marketing: boolean;
  consentDate: string;
}

function getStoredConsent(): CookieConsent | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!stored) return null;
    return JSON.parse(stored) as CookieConsent;
  } catch {
    return null;
  }
}

function storeConsent(consent: CookieConsent): void {
  localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(consent));
}

export default function CookieBanner() {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [closing, setClosing] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const firstFocusRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setMounted(true);
    const consent = getStoredConsent();
    if (!consent) {
      const t = window.setTimeout(() => setVisible(true), 600);
      return () => window.clearTimeout(t);
    }
  }, []);

  const close = useCallback(() => {
    setClosing(true);
    window.setTimeout(() => {
      setVisible(false);
      setClosing(false);
    }, 240);
  }, []);

  const acceptAll = useCallback(() => {
    storeConsent({
      essential: true,
      analytics: true,
      marketing: true,
      consentDate: new Date().toISOString(),
    });
    close();
  }, [close]);

  const rejectAll = useCallback(() => {
    storeConsent({
      essential: true,
      analytics: false,
      marketing: false,
      consentDate: new Date().toISOString(),
    });
    close();
  }, [close]);

  const savePreferences = useCallback(() => {
    storeConsent({
      essential: true,
      analytics,
      marketing,
      consentDate: new Date().toISOString(),
    });
    close();
  }, [analytics, marketing, close]);

  useEffect(() => {
    if (!visible) return;

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        rejectAll();
        return;
      }
      if (e.key === "Tab" && cardRef.current) {
        const focusables = cardRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKey);
    firstFocusRef.current?.focus();
    return () => document.removeEventListener("keydown", handleKey);
  }, [visible, rejectAll]);

  if (!mounted || !visible) return null;

  return (
    <div
      className={`${styles.wrap} ${closing ? styles.wrapClosing : ""}`}
      role="region"
      aria-label="Bannière de consentement aux cookies"
    >
      <div
        ref={cardRef}
        className={`${styles.card} ${showDetails ? styles.cardExpanded : ""}`}
        role="dialog"
        aria-modal="false"
        aria-labelledby="cookie-title"
        aria-describedby="cookie-description"
      >
        <button
          type="button"
          onClick={rejectAll}
          className={styles.close}
          aria-label="Fermer et refuser les cookies optionnels"
        >
          <X size={16} aria-hidden="true" />
        </button>

        <header className={styles.header}>
          <span className={styles.iconWrap} aria-hidden="true">
            <Cookie size={18} />
          </span>
          <div>
            <p className={styles.eyebrow}>Vos données, vos règles</p>
            <h2 id="cookie-title" className={styles.title}>
              Un biscuit avec votre visite&nbsp;?
            </h2>
          </div>
        </header>

        <p id="cookie-description" className={styles.body}>
          On utilise des cookies pour que le site fonctionne et pour comprendre ce
          qui vous plaît. Rien de plus. Vous gardez la main à tout moment.{" "}
          <Link href="/legal/privacy" className={styles.link}>
            Politique de confidentialité
          </Link>
        </p>

        {showDetails && (
          <div className={styles.details}>
            <CategoryRow
              icon={<ShieldCheck size={16} aria-hidden="true" />}
              title="Essentiels"
              description="Session, authentification, panier. Impossible de les désactiver sans casser le site."
              checked
              disabled
            />
            <CategoryRow
              icon={<BarChart3 size={16} aria-hidden="true" />}
              title="Analytiques"
              description="Mesurent les pages populaires et les parcours pour nous aider à améliorer l'expérience."
              checked={analytics}
              onChange={setAnalytics}
            />
            <CategoryRow
              icon={<Megaphone size={16} aria-hidden="true" />}
              title="Marketing"
              description="Personnalisent les offres et contenus qui vous sont présentés sur le site."
              checked={marketing}
              onChange={setMarketing}
            />
          </div>
        )}

        <div className={styles.actions}>
          <button
            ref={firstFocusRef}
            type="button"
            onClick={acceptAll}
            className={`${styles.btn} ${styles.btnPrimary}`}
          >
            <Check size={15} aria-hidden="true" />
            Tout accepter
          </button>
          <button
            type="button"
            onClick={rejectAll}
            className={`${styles.btn} ${styles.btnGhost}`}
          >
            Refuser
          </button>
          {showDetails ? (
            <button
              type="button"
              onClick={savePreferences}
              className={`${styles.btn} ${styles.btnOutline}`}
            >
              Enregistrer mes choix
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setShowDetails(true)}
              className={`${styles.btn} ${styles.btnOutline}`}
              aria-expanded="false"
              aria-controls="cookie-details"
            >
              Personnaliser
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

interface CategoryRowProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  checked: boolean;
  disabled?: boolean;
  onChange?: (value: boolean) => void;
}

function CategoryRow({
  icon,
  title,
  description,
  checked,
  disabled,
  onChange,
}: CategoryRowProps) {
  return (
    <label className={`${styles.category} ${disabled ? styles.categoryLocked : ""}`}>
      <span className={styles.categoryHead}>
        <span className={styles.categoryIcon} aria-hidden="true">
          {icon}
        </span>
        <span className={styles.categoryTitle}>{title}</span>
        {disabled && <span className={styles.categoryBadge}>Toujours actif</span>}
      </span>
      <span className={styles.categoryDesc}>{description}</span>
      {!disabled && (
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange?.(e.target.checked)}
          className={styles.toggle}
          aria-label={`Activer les cookies ${title.toLowerCase()}`}
        />
      )}
      {disabled && (
        <input
          type="checkbox"
          checked
          disabled
          className={styles.toggle}
          aria-hidden="true"
          tabIndex={-1}
        />
      )}
    </label>
  );
}
