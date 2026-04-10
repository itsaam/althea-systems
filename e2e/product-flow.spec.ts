import { test, expect } from "@playwright/test";

test.describe("Product navigation flow", () => {
  test("browses from home to a category listing", async ({ page }) => {
    await page.goto("/");
    const categoryLink = page
      .locator('a[href*="/categories/"], a[href="/categories"]')
      .first();

    if ((await categoryLink.count()) === 0) {
      test.skip(true, "No category link exposed on home page");
    }

    await categoryLink.click();
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveURL(/categor/);
  });

  test("can open a product detail page", async ({ page }) => {
    await page.goto("/");
    const productLink = page.locator('a[href*="/products/"]').first();

    if ((await productLink.count()) === 0) {
      test.skip(true, "No product link available without DB seed");
    }

    await productLink.click();
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveURL(/\/products\//);
    const heading = page.locator("h1").first();
    await expect(heading).toBeVisible();
  });

  test("product page exposes an add-to-cart action", async ({ page }) => {
    await page.goto("/");
    const productLink = page.locator('a[href*="/products/"]').first();

    if ((await productLink.count()) === 0) {
      test.skip(true, "No product link available without DB seed");
    }

    await productLink.click();
    await page.waitForLoadState("networkidle");

    const cta = page.getByRole("button", {
      name: /ajouter|add to cart|panier/i,
    });
    await expect(cta.first()).toBeVisible();
  });
});
