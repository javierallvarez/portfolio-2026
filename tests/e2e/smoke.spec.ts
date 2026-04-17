import { test, expect } from "@playwright/test";

/**
 * JAG-001 Smoke Test
 * Verifies that the application boots and the homepage renders without crashing.
 * This is the baseline E2E test — expand with feature-specific tests per JAG ticket.
 */
test.describe("Smoke Tests", () => {
  test("homepage loads and has correct title", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/portfolio/i);
  });

  test("homepage has a main landmark", async ({ page }) => {
    await page.goto("/");
    const main = page.locator("main");
    await expect(main).toBeVisible();
  });

  test("under-the-hood page loads", async ({ page }) => {
    await page.goto("/under-the-hood");
    await expect(page.locator("h1")).toBeVisible();
  });

  test("movies page loads", async ({ page }) => {
    await page.goto("/movies");
    await expect(page.locator("h1")).toBeVisible();
  });
});
