import { test, expect } from "@playwright/test";

test.describe("Search", () => {
  test("search page loads", async ({ page }) => {
    const response = await page.goto("/search");
    expect(response?.status()).toBeLessThan(500);
    await expect(page.locator("main, body").first()).toBeVisible();
  });

  test("search with query parameter returns a results view", async ({
    page,
  }) => {
    const response = await page.goto("/search?q=test");
    expect(response?.status()).toBeLessThan(500);
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveURL(/q=test/);
    const main = page.locator("main").first();
    await expect(main).toBeVisible();
  });
});
