import { test, expect } from "@playwright/test";

test.describe("Cart page", () => {
  test("loads the cart page directly", async ({ page }) => {
    const response = await page.goto("/cart");
    expect(response?.status()).toBeLessThan(500);
    const heading = page.locator("h1, h2").first();
    await expect(heading).toBeVisible();
  });

  test("displays an empty-state or items list", async ({ page }) => {
    await page.goto("/cart");
    const body = page.locator("main, body").first();
    await expect(body).toBeVisible();
    const content = await body.innerText();
    expect(content.length).toBeGreaterThan(0);
  });
});
