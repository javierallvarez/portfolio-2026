import { test, expect } from "@playwright/test";

/**
 * JAG-002 Smoke Tests
 * Verifies the HeroUI-powered UI renders correctly across key pages.
 * Selectors target semantic HTML and ARIA attributes to stay resilient
 * against styling changes.
 */
test.describe("Smoke Tests", () => {
  test("root redirects to a locale-prefixed home", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/(es|en)\/?$/);
  });

  test("Spanish accept-language sends home to /es", async ({ browser }) => {
    // Use a dedicated context with locale — setExtraHTTPHeaders alone can be merged
    // behind the browser default Accept-Language (en-US first), which broke CI.
    const context = await browser.newContext({ locale: "es-ES" });
    const page = await context.newPage();
    try {
      await page.goto("/");
      await expect(page).toHaveURL(/\/es\/?$/);
    } finally {
      await context.close();
    }
  });

  test("homepage loads and has correct title", async ({ page }) => {
    await page.goto("/en");
    await expect(page).toHaveTitle(/portfolio/i);
  });

  test("homepage has a main landmark", async ({ page }) => {
    await page.goto("/en");
    await expect(page.locator("main")).toBeVisible();
  });

  // ── Navbar ────────────────────────────────────────────────────────────────

  test.describe("Navbar", () => {
    test("renders the Javier Álvarez logo linking to home", async ({ page }) => {
      await page.goto("/en");
      const logo = page.locator("header").getByRole("link").first();
      await expect(logo).toBeVisible();
      await expect(logo).toContainText("Javier Álvarez");
      await expect(logo).toHaveAttribute("href", "/en");
    });

    test("renders navigation links in the menu drawer (all viewports)", async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 720 });
      await page.goto("/en");
      await page.getByRole("button", { name: /open navigation menu/i }).click();
      const drawer = page.getByRole("dialog", { name: "Menu" });
      await expect(drawer.getByRole("link", { name: "Interactive Lab" })).toBeVisible();
      await expect(drawer.getByRole("link", { name: "Tools" })).toBeVisible();
      await expect(drawer.getByRole("link", { name: "Automations" })).toBeVisible();
      await expect(drawer.getByRole("link", { name: "Under the Hood" })).toBeVisible();
    });

    test("home route marks the logo link with aria-current on the homepage", async ({ page }) => {
      await page.goto("/en");
      await expect(page.locator("header nav").getByRole("link").first()).toHaveAttribute(
        "aria-current",
        "page",
      );
    });

    test("renders a theme-toggle button", async ({ page }) => {
      await page.goto("/en");
      await expect(
        page.getByRole("button", { name: /switch to (light|dark) mode/i }),
      ).toBeVisible();
    });

    test("renders a command-palette trigger button", async ({ page }) => {
      await page.goto("/en");
      await expect(
        page.getByRole("button", { name: /open command palette/i }).first(),
      ).toBeVisible();
    });
  });

  // ── Homepage hero section ─────────────────────────────────────────────────

  test.describe("Homepage hero section", () => {
    test("renders the bio headline", async ({ page }) => {
      await page.goto("/en");
      await expect(page.locator("h1")).toContainText("Hi, I'm Javier");
    });

    test("renders Adevinta in the bio", async ({ page }) => {
      await page.goto("/en");
      await expect(page.getByText(/Adevinta/).first()).toBeVisible();
    });

    test("renders a LinkedIn CTA linking out", async ({ page }) => {
      await page.goto("/en");
      const cta = page.getByRole("link", { name: /connect on linkedin/i });
      await expect(cta).toBeVisible();
      await expect(cta).toHaveAttribute("href", /07783a111/);
    });

    test("renders a CV CTA button", async ({ page }) => {
      await page.goto("/en");
      await expect(page.getByRole("button", { name: /view full cv/i })).toBeVisible();
    });

    test("renders all three feature cards", async ({ page }) => {
      await page.goto("/en");
      await expect(page.getByText("Internal Tooling & Automation")).toBeVisible();
      await expect(page.getByText("AI-Transparent")).toBeVisible();
      await expect(page.getByText("Security-First")).toBeVisible();
    });
  });

  // ── Sub-pages ─────────────────────────────────────────────────────────────

  test("under-the-hood page loads and renders its heading", async ({ page }) => {
    await page.goto("/en/under-the-hood");
    await expect(page.locator("h1")).toContainText("Under the Hood");
  });

  test("interactive lab page loads and renders its heading", async ({ page }) => {
    await page.goto("/en/interactive-lab");
    await expect(page.locator("h1")).toContainText(/Vinyl Collection|Recommendations/);
  });
});
