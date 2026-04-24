import { test, expect } from "@playwright/test";

/**
 * JAG-002 Smoke Tests
 * Verifies the HeroUI-powered UI renders correctly across key pages.
 * Selectors target semantic HTML and ARIA attributes to stay resilient
 * against styling changes.
 */
test.describe("Smoke Tests", () => {
  test("homepage loads and has correct title", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/portfolio/i);
  });

  test("homepage has a main landmark", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("main")).toBeVisible();
  });

  // ── Navbar ────────────────────────────────────────────────────────────────

  test.describe("Navbar", () => {
    test("renders the Javier Álvarez logo linking to home", async ({ page }) => {
      await page.goto("/");
      // Logo is the first link inside the sticky header
      const logo = page.locator("header").getByRole("link").first();
      await expect(logo).toBeVisible();
      await expect(logo).toContainText("Javier Álvarez");
      await expect(logo).toHaveAttribute("href", "/");
    });

    test("renders navigation links for Home, Interactive Lab, and Under the Hood", async ({
      page,
    }) => {
      await page.goto("/");
      const nav = page.locator("header nav");
      // Links are CSS-hidden on mobile (hidden sm:flex) but still in the DOM.
      // We use includeHidden + toBeAttached to test routing correctness on all viewports.
      await expect(nav.getByRole("link", { name: "Home", includeHidden: true })).toBeAttached();
      await expect(
        nav.getByRole("link", { name: "Interactive Lab", includeHidden: true }),
      ).toBeAttached();
      await expect(
        nav.getByRole("link", { name: "Under the Hood", includeHidden: true }),
      ).toBeAttached();
    });

    test("Home nav link is marked aria-current='page' on the homepage", async ({ page }) => {
      await page.goto("/");
      // includeHidden so this passes on the mobile viewport where the link is CSS-hidden.
      await expect(
        page.locator("header nav").getByRole("link", { name: "Home", includeHidden: true }),
      ).toHaveAttribute("aria-current", "page");
    });

    test("renders a theme-toggle button", async ({ page }) => {
      await page.goto("/");
      await expect(
        page.getByRole("button", { name: /switch to (light|dark) mode/i }),
      ).toBeVisible();
    });

    test("renders a command-palette trigger button", async ({ page }) => {
      await page.goto("/");
      // Two triggers exist (desktop + mobile icon-only); at least one must be visible
      await expect(
        page.getByRole("button", { name: /open command palette/i }).first(),
      ).toBeVisible();
    });
  });

  // ── Homepage hero ─────────────────────────────────────────────────────────

  test.describe("Homepage hero section", () => {
    test("renders the main headline", async ({ page }) => {
      await page.goto("/");
      await expect(page.locator("h1")).toContainText("Software Engineer");
    });

    test("renders Adevinta in the subtitle", async ({ page }) => {
      await page.goto("/");
      await expect(page.getByText(/Adevinta/)).toBeVisible();
    });

    test("renders a 'Explore the Interactive Lab' CTA that links to /interactive-lab", async ({
      page,
    }) => {
      await page.goto("/");
      const cta = page.getByRole("link", { name: /explore the interactive lab/i });
      await expect(cta).toBeVisible();
      await expect(cta).toHaveAttribute("href", "/interactive-lab");
    });

    test("renders an 'Open Command Palette' CTA button", async ({ page }) => {
      await page.goto("/");
      // Hero section button (not the navbar one) — use last() since the navbar
      // button comes first in the DOM and may be hidden on mobile
      const paletteButtons = page.getByRole("button", { name: /open command palette/i });
      await expect(paletteButtons.last()).toBeVisible();
    });

    test("renders tech-stack chips including Next.js 15 and HeroUI v3", async ({ page }) => {
      await page.goto("/");
      await expect(page.getByText("Next.js 15")).toBeVisible();
      await expect(page.getByText("HeroUI v3")).toBeVisible();
      await expect(page.getByText("TypeScript")).toBeVisible();
    });

    test("renders all three feature cards", async ({ page }) => {
      await page.goto("/");
      await expect(page.getByText("Internal Tooling & Automation")).toBeVisible();
      await expect(page.getByText("AI-Transparent")).toBeVisible();
      await expect(page.getByText("Security-First")).toBeVisible();
    });
  });

  // ── Sub-pages ─────────────────────────────────────────────────────────────

  test("under-the-hood page loads and renders its heading", async ({ page }) => {
    await page.goto("/under-the-hood");
    await expect(page.locator("h1")).toContainText("Under the Hood");
  });

  test("interactive lab page loads and renders its heading", async ({ page }) => {
    await page.goto("/interactive-lab");
    await expect(page.locator("h1")).toContainText("Vinyl Collection");
  });
});
