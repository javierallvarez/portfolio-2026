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

    test("renders navigation links for Home, Interactive Lab, and Under the Hood", async ({
      page,
    }) => {
      await page.goto("/en");
      const nav = page.locator("header nav");
      await expect(nav.getByRole("link", { name: "Home", includeHidden: true })).toBeAttached();
      await expect(
        nav.getByRole("link", { name: "Interactive Lab", includeHidden: true }),
      ).toBeAttached();
      await expect(
        nav.getByRole("link", { name: "Under the Hood", includeHidden: true }),
      ).toBeAttached();
    });

    test("Home nav link is marked aria-current='page' on the homepage", async ({ page }) => {
      await page.goto("/en");
      await expect(
        page.locator("header nav").getByRole("link", { name: "Home", includeHidden: true }),
      ).toHaveAttribute("aria-current", "page");
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
    test("renders the main headline", async ({ page }) => {
      await page.goto("/en");
      await expect(page.locator("h1")).toContainText("Software Engineer");
    });

    test("renders Adevinta in the subtitle", async ({ page }) => {
      await page.goto("/en");
      await expect(page.getByText(/Adevinta/)).toBeVisible();
    });

    test("renders a 'Explore the Interactive Lab' CTA that links to localized lab", async ({
      page,
    }) => {
      await page.goto("/en");
      const cta = page.getByRole("link", { name: /explore the interactive lab/i });
      await expect(cta).toBeVisible();
      await expect(cta).toHaveAttribute("href", "/en/interactive-lab");
    });

    test("renders an 'Open Command Palette' CTA button", async ({ page }) => {
      await page.goto("/en");
      const paletteButtons = page.getByRole("button", { name: /open command palette/i });
      await expect(paletteButtons.last()).toBeVisible();
    });

    test("renders tech-stack chips including Next.js 15 and HeroUI v3", async ({ page }) => {
      await page.goto("/en");
      await expect(page.getByText("Next.js 15")).toBeVisible();
      await expect(page.getByText("HeroUI v3")).toBeVisible();
      await expect(page.getByText("TypeScript")).toBeVisible();
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
