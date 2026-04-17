# JAG-002 — Core UI Foundation, HeroUI Setup & Developer Experience

| Field       | Value                       |
| ----------- | --------------------------- |
| **ID**      | JAG-002                     |
| **Status**  | ✅ Done                     |
| **Type**    | Feature / Foundation        |
| **Author**  | JAG (+ AI pair programming) |
| **Created** | 2026-04-15                  |
| **Depends** | JAG-001                     |

---

## 1. Context & Motivation

With the project scaffold in place (JAG-001), the next priority is establishing the global UI
layer before building feature-specific pages. This ensures every subsequent ticket (JAG-003+)
starts from a consistent, functional design system rather than duplicating layout boilerplate.

This ticket covers:

- Correctly integrating **HeroUI v3** (CSS-based, no wrapper provider required)
- **next-themes** for SSR-safe light/dark mode toggling
- A fully functional **Navbar** with navigation and theme toggle
- A **Command Palette** (⌘K / Ctrl+K) as a first-class navigation and action tool
- A polished **Hero section** on the homepage
- A **developer Easter Egg** console greeting

---

## 2. Technical Decisions

### HeroUI v3 CSS Architecture

HeroUI v3 moved away from a Tailwind plugin + provider wrapper to a **pure CSS custom properties**
approach. Instead of `HeroUIProvider`, we simply import `@heroui/styles` in `globals.css`, which:

- Imports Tailwind v4 (so we drop the separate `@import "tailwindcss"` line)
- Declares all design tokens as CSS variables under `:root`, `.light`, and `.dark` selectors
- Applies animations via `tw-animate-css` (already a transitive dependency)

This means HeroUI components work anywhere in the tree without a context provider.

### Dark Mode Strategy

- **next-themes** with `attribute="class"` is the sole mechanism for toggling themes
- It adds/removes the `.dark` class on `<html>`, which HeroUI's CSS variables already map to
- `suppressHydrationWarning` on `<html>` prevents hydration mismatch from SSR

### Command Palette Architecture

- State managed by the existing `useCommandPalette` hook (keyboard binding + open/close)
- UI built with **HeroUI's `Modal`** compound component (controlled via `useOverlayState`)
- HeroUI's **`SearchField`** for the filter input
- Custom filtered list rendered with accessible keyboard navigation
- Commands dispatched via a `CommandItem` abstraction

### Toast Notifications

- HeroUI's **`Toast`** system uses a global `toast` function (singleton queue pattern)
- `Toast.Provider` must live high in the tree — placed in the `Providers` component
- Call `toast("message")` anywhere without prop-drilling

### Easter Egg

A `useEffect` in a dedicated `<DeveloperGreeting />` client component fires once on mount,
printing a styled ASCII art message to the browser console. Kept in its own file to avoid
polluting the root layout or providers with client-only side effects.

---

## 3. Component Architecture

```
app/
  layout.tsx              ← Server Component; imports Providers, Navbar, CommandPalette,
                            DeveloperGreeting
  page.tsx                ← Hero section (HeroUI Button, Kbd)
  globals.css             ← @import "@heroui/styles" (replaces bare tailwind import)

components/
  providers/index.tsx     ← next-themes ThemeProvider + Toast.Provider (Client Component)
  layout/
    navbar.tsx            ← Navbar: logo, nav links, theme toggle, ⌘K badge (Client Component)
    command-palette.tsx   ← Command Palette: Modal + SearchField + command list (Client Component)
    developer-greeting.tsx← Easter egg console.log (Client Component)

hooks/
  use-command-palette.ts  ← Keyboard binding + open/close state (unchanged from JAG-001)
```

---

## 4. Command Palette Commands

| Command                    | Action                                          |
| -------------------------- | ----------------------------------------------- |
| Navigate to Home           | `router.push("/")`                              |
| Navigate to Movies         | `router.push("/movies")`                        |
| Navigate to Under the Hood | `router.push("/under-the-hood")`                |
| Toggle Theme               | `setTheme(theme === "dark" ? "light" : "dark")` |
| Download CV                | `toast.info("CV download coming soon")` (mock)  |

---

## 5. Acceptance Criteria

- [x] `@heroui/styles` imported in `globals.css`; HeroUI design tokens available globally
- [x] Light/dark mode toggles correctly via theme button and via Command Palette
- [x] `suppressHydrationWarning` on `<html>` prevents SSR/CSR mismatch
- [x] `Toast.Provider` in the provider tree; `toast()` callable from anywhere
- [x] Navbar renders: logo, Home / Movies / Under the Hood links, theme toggle, ⌘K badge
- [x] Command Palette opens on ⌘K / Ctrl+K, closes on Escape or backdrop click
- [x] Command Palette search filters commands in real time
- [x] All five commands are functional
- [x] Developer Easter Egg fires once on app mount (console only, no UI)
- [x] ESLint + Prettier: zero errors, zero warnings
- [x] TypeScript strict: zero type errors

---

## 6. AI Contribution Notes

This ticket was implemented via AI pair programming (Cursor / Claude Sonnet).

| Area            | AI Involvement  |
| --------------- | --------------- |
| Boilerplate     | Full            |
| Component logic | Full (reviewed) |
| Accessibility   | Partial         |
| Easter Egg text | Human           |

All generated code was reviewed by the human engineer before commit.
