import { test, expect } from "@playwright/test";

test.describe("Home page", () => {
  test("loads and displays page title", async ({ page }) => {
    const response = await page.goto("/");
    expect(response?.status()).toBeLessThan(400);
    await expect(page).toHaveTitle(/althea/i);
  });

  test("renders a primary heading and navigation", async ({ page }) => {
    await page.goto("/");
    const heading = page.locator("h1, h2").first();
    await expect(heading).toBeVisible();
    const nav = page.locator("nav, header").first();
    await expect(nav).toBeVisible();
  });

  test("has at least one call-to-action link", async ({ page }) => {
    await page.goto("/");
    const links = page.locator("a[href]");
    const count = await links.count();
    expect(count).toBeGreaterThan(0);
  });
});
