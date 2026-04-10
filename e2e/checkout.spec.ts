import { test, expect } from "@playwright/test";

test.describe("Checkout flow", () => {
  test("checkout route responds without server error", async ({ page }) => {
    const response = await page.goto("/checkout");
    expect(response?.status()).toBeLessThan(500);
  });

  test("renders checkout container or redirects to auth", async ({ page }) => {
    await page.goto("/checkout");
    await page.waitForLoadState("networkidle");
    const url = page.url();
    const matchesCheckoutOrAuth = /\/(checkout|login|register|auth)/.test(url);
    expect(matchesCheckoutOrAuth).toBe(true);
  });
});
