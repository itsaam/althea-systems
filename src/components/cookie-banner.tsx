"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

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
  const [visible, setVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);

  useEffect(() => {
    const consent = getStoredConsent();
    if (!consent) {
      setVisible(true);
    }
  }, []);

  function acceptAll() {
    const consent: CookieConsent = {
      essential: true,
      analytics: true,
      marketing: true,
      consentDate: new Date().toISOString(),
    };
    storeConsent(consent);
    setVisible(false);
  }

  function rejectAll() {
    const consent: CookieConsent = {
      essential: true,
      analytics: false,
      marketing: false,
      consentDate: new Date().toISOString(),
    };
    storeConsent(consent);
    setVisible(false);
  }

  function savePreferences() {
    const consent: CookieConsent = {
      essential: true,
      analytics,
      marketing,
      consentDate: new Date().toISOString(),
    };
    storeConsent(consent);
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t shadow-lg p-4 md:p-6">
      <div className="container max-w-4xl mx-auto">
        <div className="flex flex-col gap-4">
          <div>
            <h3 className="text-lg font-semibold mb-2">
              Gestion des cookies
            </h3>
            <p className="text-sm text-muted-foreground">
              Nous utilisons des cookies essentiels pour le fonctionnement du
              site. Avec votre consentement, nous pouvons egalement utiliser des
              cookies analytiques et marketing.{" "}
              <Link
                href="/legal/privacy"
                className="underline hover:text-foreground"
              >
                En savoir plus
              </Link>
            </p>
          </div>

          {showDetails && (
            <div className="border rounded-md p-4 space-y-3">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={true}
                  disabled
                  className="rounded"
                />
                <div>
                  <span className="font-medium text-sm">
                    Cookies essentiels
                  </span>
                  <p className="text-xs text-muted-foreground">
                    Necessaires au fonctionnement du site (session,
                    authentification, panier). Toujours actifs.
                  </p>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={analytics}
                  onChange={(e) => setAnalytics(e.target.checked)}
                  className="rounded"
                />
                <div>
                  <span className="font-medium text-sm">
                    Cookies analytiques
                  </span>
                  <p className="text-xs text-muted-foreground">
                    Nous aident a comprendre comment le site est utilise pour
                    l&apos;ameliorer.
                  </p>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={marketing}
                  onChange={(e) => setMarketing(e.target.checked)}
                  className="rounded"
                />
                <div>
                  <span className="font-medium text-sm">
                    Cookies marketing
                  </span>
                  <p className="text-xs text-muted-foreground">
                    Utilises pour vous proposer du contenu et des offres
                    personnalises.
                  </p>
                </div>
              </label>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <Button onClick={acceptAll}>Tout accepter</Button>
            <Button variant="outline" onClick={rejectAll}>
              Tout refuser
            </Button>
            {showDetails ? (
              <Button variant="secondary" onClick={savePreferences}>
                Enregistrer mes preferences
              </Button>
            ) : (
              <Button
                variant="secondary"
                onClick={() => setShowDetails(true)}
              >
                Personnaliser
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
