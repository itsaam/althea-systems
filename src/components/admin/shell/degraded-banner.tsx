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
    <div className="border-l-2 border-warning bg-warning/10 px-4 py-2.5">
      <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-warning">
        <span className="mr-2 opacity-60">—</span>
        Mode dégradé · données de démonstration
      </p>
    </div>
  );
}
