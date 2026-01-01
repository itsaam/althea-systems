"use client";

import { useCallback, useSyncExternalStore } from "react";

function getServerSnapshot(): boolean {
  return false;
}

export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (callback: () => void) => {
      const media = window.matchMedia(query);
      media.addEventListener("change", callback);
      return () => media.removeEventListener("change", callback);
    },
    [query]
  );

  const getSnapshot = useCallback(() => {
    return window.matchMedia(query).matches;
  }, [query]);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function useIsMobile() {
  return useMediaQuery("(max-width: 768px)");
}

export function useIsDesktop() {
  return useMediaQuery("(min-width: 1024px)");
}
