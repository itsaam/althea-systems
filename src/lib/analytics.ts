/**
 * Analytics helpers for Vercel Analytics
 * RGPD-compliant: no third-party cookies, data stays on Vercel infrastructure
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
  // Cart events
  productId?: string;
  productName?: string;
  quantity?: number;
  price?: number;
  currency?: string;

  // Search events
  query?: string;
  resultsCount?: number;

  // Category events
  categoryId?: string;
  categoryName?: string;

  // Purchase events
  orderId?: string;
  total?: number;
  itemCount?: number;

  // Generic
  [key: string]: string | number | boolean | undefined;
}

/**
 * Track a custom analytics event via Vercel Analytics.
 * This function is safe to call server-side (it will no-op).
 */
export function trackEvent(
  name: AnalyticsEventName,
  properties?: AnalyticsEventProperties
): void {
  if (typeof window === "undefined") return;

  try {
    // Vercel Analytics track function is injected globally
    // We use the official @vercel/analytics track export
    import("@vercel/analytics").then(({ track }) => {
      track(name, properties ?? {});
    });
  } catch {
    // Silent fail -- analytics should never break the app
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
