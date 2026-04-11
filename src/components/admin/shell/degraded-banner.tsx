"use client";

import { useEffect, useState } from "react";
import { DEGRADED_MODE_EVENT } from "@/lib/admin/mock-data";

/**
 * Bannière discrète affichée en haut du panel admin quand
 * un ou plusieurs composants sont tombés en fallback mock.
 */
export function DegradedBanner() {
  const [degraded, setDegraded] = useState(false);

  useEffect(() => {
    const handler = () => setDegraded(true);
    window.addEventListener(DEGRADED_MODE_EVENT, handler);
    return () => window.removeEventListener(DEGRADED_MODE_EVENT, handler);
  }, []);

  if (!degraded) return null;

  return (
    <div className="border-l-2 border-amber-500 bg-amber-500/5 px-4 py-2.5">
      <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-amber-700 dark:text-amber-400">
        <span className="mr-2 opacity-60">—</span>
        Mode dégradé · données de démonstration
      </p>
    </div>
  );
}
