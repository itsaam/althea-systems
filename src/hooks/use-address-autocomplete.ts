"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Résultat normalisé d'une suggestion d'adresse.
 * Source : API Adresse data.gouv.fr (Base Adresse Nationale).
 */
export interface AddressSuggestion {
  /** Libellé complet affiché (ex: "12 Rue de la Paix 75002 Paris") */
  label: string;
  /** Numéro + voie (ex: "12 Rue de la Paix") */
  street: string;
  /** Code postal */
  postalCode: string;
  /** Ville */
  city: string;
  /** Coordonnées GPS [lng, lat] */
  coordinates: [number, number];
}

const API_URL = "https://api-adresse.data.gouv.fr/search";
const MIN_QUERY_LENGTH = 4;
const DEBOUNCE_MS = 300;

/**
 * Hook d'autocomplétion d'adresses françaises via l'API Adresse BAN.
 * Gratuit, sans clé API, pas de quota restrictif.
 *
 * @example
 * const { suggestions, isLoading, search, clear } = useAddressAutocomplete();
 * // Call search("12 rue de la") on input change
 * // Render suggestions as a dropdown
 */
export function useAddressAutocomplete() {
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clear = useCallback(() => {
    setSuggestions([]);
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const search = useCallback(
    (query: string) => {
      // Cancel any pending request
      if (abortRef.current) abortRef.current.abort();
      if (timerRef.current) clearTimeout(timerRef.current);

      const trimmed = query.trim();
      if (trimmed.length < MIN_QUERY_LENGTH) {
        setSuggestions([]);
        return;
      }

      timerRef.current = setTimeout(async () => {
        const controller = new AbortController();
        abortRef.current = controller;
        setIsLoading(true);

        try {
          const params = new URLSearchParams({
            q: trimmed,
            limit: "5",
            type: "housenumber",
            autocomplete: "1",
          });

          const res = await fetch(`${API_URL}?${params}`, {
            signal: controller.signal,
          });

          if (!res.ok) throw new Error("API error");

          const data = await res.json();

          const results: AddressSuggestion[] = (
            data.features ?? []
          ).map(
            (f: {
              properties: {
                label: string;
                name: string;
                postcode: string;
                city: string;
              };
              geometry: { coordinates: [number, number] };
            }) => ({
              label: f.properties.label,
              street: f.properties.name,
              postalCode: f.properties.postcode,
              city: f.properties.city,
              coordinates: f.geometry.coordinates,
            })
          );

          setSuggestions(results);
        } catch (err) {
          if ((err as Error).name !== "AbortError") {
            setSuggestions([]);
          }
        } finally {
          setIsLoading(false);
        }
      }, DEBOUNCE_MS);
    },
    []
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortRef.current) abortRef.current.abort();
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return { suggestions, isLoading, search, clear };
}
