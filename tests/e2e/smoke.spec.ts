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
    test("renders the JAG logo linking to home", async ({ page }) => {
      await page.goto("/");
      // Logo is the first link inside the sticky header
      const logo = page.locator("header").getByRole("link").first();
      await expect(logo).toBeVisible();
      await expect(logo).toContainText("JAG");
      await expect(logo).toHaveAttribute("href", "/");
    });

    test("renders navigation links for Home, Movies, and Under the Hood", async ({ page }) => {
      await page.goto("/");
      const nav = page.locator("header nav");
      await expect(nav.getByRole("link", { name: "Home" })).toBeVisible();
      await expect(nav.getByRole("link", { name: "Movies" })).toBeVisible();
      await expect(nav.getByRole("link", { name: "Under the Hood" })).toBeVisible();
    });

    test("Home nav link is marked aria-current='page' on the homepage", async ({ page }) => {
      await page.goto("/");
      await expect(page.locator("header nav").getByRole("link", { name: "Home" })).toHaveAttribute(
        "aria-current",
        "page",
      );
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

    test("renders the availability status badge", async ({ page }) => {
      await page.goto("/");
      await expect(page.getByText(/available for new opportunities/i)).toBeVisible();
    });

    test("renders a 'View Movie Collection' CTA that links to /movies", async ({ page }) => {
      await page.goto("/");
      const cta = page.getByRole("link", { name: /view movie collection/i });
      await expect(cta).toBeVisible();
      await expect(cta).toHaveAttribute("href", "/movies");
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
      await expect(page.getByText("Spec-Driven")).toBeVisible();
      await expect(page.getByText("AI-Transparent")).toBeVisible();
      await expect(page.getByText("Security-First")).toBeVisible();
    });
  });

  // ── Sub-pages ─────────────────────────────────────────────────────────────

  test("under-the-hood page loads and renders its heading", async ({ page }) => {
    await page.goto("/under-the-hood");
    await expect(page.locator("h1")).toContainText("Under the Hood");
  });

  test("movies page loads and renders its heading", async ({ page }) => {
    await page.goto("/movies");
    await expect(page.locator("h1")).toContainText("Movie Collection");
  });
});
