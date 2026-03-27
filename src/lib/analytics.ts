/**
 * Analytics helpers — standalone (pas de dépendance Vercel)
 * RGPD-compliant: events côté client uniquement, pas de cookies tiers
 * Compatible Plausible, Umami, ou custom backend
 */

type AnalyticsEventName =
  | "add_to_cart"
  | "remove_from_cart"
  | "purchase"
  | "search"
  | "view_product"
  | "view_category"
  | "signup"
  | "login"
  | "checkout_start"
  | "checkout_complete"
  | "newsletter_subscribe";

interface AnalyticsEventProperties {
  productId?: string;
  productName?: string;
  quantity?: number;
  price?: number;
  currency?: string;
  query?: string;
  resultsCount?: number;
  categoryId?: string;
  categoryName?: string;
  orderId?: string;
  total?: number;
  itemCount?: number;
  [key: string]: string | number | boolean | undefined;
}

/**
 * Track un event analytics custom.
 * No-op côté serveur. Log en console en dev.
 * En production, peut être connecté à Plausible/Umami/custom.
 */
export function trackEvent(
  name: AnalyticsEventName,
  properties?: AnalyticsEventProperties
): void {
  if (typeof window === "undefined") return;

  try {
    if (process.env.NODE_ENV === "development") {
      console.log(`[Analytics] ${name}`, properties ?? {});
    }

    // Plausible integration (si installé)
    if (typeof window !== "undefined" && "plausible" in window) {
      const plausible = (window as Record<string, unknown>).plausible as
        | ((name: string, opts: { props: unknown }) => void)
        | undefined;
      plausible?.(name, { props: properties ?? {} });
    }
  } catch {
    // Silent fail — analytics ne doit jamais casser l'app
  }
}

// ---- Convenience helpers ----

export function trackAddToCart(
  productId: string,
  productName: string,
  price: number,
  quantity: number = 1
): void {
  trackEvent("add_to_cart", {
    productId,
    productName,
    price,
    quantity,
    currency: "EUR",
  });
}

export function trackRemoveFromCart(
  productId: string,
  productName: string
): void {
  trackEvent("remove_from_cart", { productId, productName });
}

export function trackPurchase(
  orderId: string,
  total: number,
  itemCount: number
): void {
  trackEvent("purchase", {
    orderId,
    total,
    itemCount,
    currency: "EUR",
  });
}

export function trackSearch(query: string, resultsCount: number): void {
  trackEvent("search", { query, resultsCount });
}

export function trackViewProduct(
  productId: string,
  productName: string
): void {
  trackEvent("view_product", { productId, productName });
}

export function trackViewCategory(
  categoryId: string,
  categoryName: string
): void {
  trackEvent("view_category", { categoryId, categoryName });
}

export function trackCheckoutStart(total: number, itemCount: number): void {
  trackEvent("checkout_start", { total, itemCount, currency: "EUR" });
}

export function trackCheckoutComplete(
  orderId: string,
  total: number,
  itemCount: number
): void {
  trackEvent("checkout_complete", {
    orderId,
    total,
    itemCount,
    currency: "EUR",
  });
}
