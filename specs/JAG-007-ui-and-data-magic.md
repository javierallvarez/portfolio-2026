# JAG-007 — UI & Data Magic

| Field       | Value                                  |
| ----------- | -------------------------------------- |
| **ID**      | JAG-007                                |
| **Status**  | ✅ Done                                |
| **Type**    | Feature / UI / Data                    |
| **Author**  | Javier Álvarez (+ AI pair programming) |
| **Created** | 2026-04-24                             |
| **Depends** | JAG-006                                |

---

## 1. Context & Motivation

Three categories of work bundled into one ticket:

1. **Critical bug** — The ⌘K command palette loses keyboard focus after opening, renders at
   bottom-left instead of centered, and requires a mouse click before keyboard navigation works.
   This is a regression introduced when HeroUI's `Modal` was used as the wrapper; its internal
   focus management conflicts with the custom `useEffect`-based keyboard handler.

2. **Visual polish** — The current type treatment is utilitarian. Applying `DM Serif Display` to
   page headings and a teal→cyan gradient accent lifts the portfolio from "developer boilerplate"
   to a distinctive personal brand. Emoji icons in the command palette and content cards are
   replaced with `lucide-react` for a consistent, professional icon system.

3. **Data enrichment** — Adding `genre` and `isNowSpinning` columns to the `vinyls` table enables
   two showcase features: genre-grouped collection view (demonstrates GROUP BY thinking) and a
   "Now Spinning" spotlight (demonstrates real-time, single-selection state management).

---

## 2. Technical Decisions

### Command Palette: drop HeroUI Modal, use native fixed overlay

HeroUI's `Modal` manages its own focus trap and portal, which conflicts with the
custom `useEffect`-based keyboard listener. Solution: render the palette as a plain
`fixed inset-0 z-[100]` div with a backdrop; focus the input directly via `useEffect`
when `isOpen` becomes `true`. Arrow-key navigation continues to be handled by the
existing `keydown` listener.

### Typography: DM Serif Display via `next/font/google`

Loaded as `--font-dm-serif` CSS variable in `app/layout.tsx` and mapped to
`--font-heading` inside `globals.css` `@theme inline`. All page headings use
`font-serif` (Tailwind maps this to `--font-serif` → `--font-dm-serif`).
The gradient accent is a single reusable CSS utility class `gradient-heading`.

### Icons: lucide-react

- Tree-shaken per import — zero bundle cost for unused icons.
- Consistent 24px stroke-based style that works in both light and dark themes.

### `isNowSpinning` — single-selection constraint enforced in the Server Action

The `setNowSpinningAction` runs two sequential updates inside a single async call:

1. `UPDATE vinyls SET is_now_spinning = false` — clears any existing selection.
2. `UPDATE vinyls SET is_now_spinning = true WHERE id = $id` — sets the new one.

This avoids a DB-level unique partial index (simpler, sufficient for a portfolio).
Toggle semantics: clicking a vinyl that is already spinning clears all (stops playback).

### Genre extraction from Discogs

The Discogs `/database/search` endpoint returns `genre[]` and `style[]` arrays.
We take `genre[0] ?? style[0] ?? null` — the most specific primary classification.

---

## 3. Acceptance Criteria

- [x] Command palette opens centered, auto-focuses input, arrow keys work immediately.
- [x] `DM Serif Display` applied to all page `<h1>` elements; teal gradient on key words.
- [x] All emoji icons replaced with `lucide-react` equivalents.
- [x] `vinyls` table has `genre varchar(255)` and `is_now_spinning boolean default false`.
- [x] Discogs search populates `genre` from the API response.
- [x] Admin can mark one vinyl as "Now Spinning"; it appears in a spotlight at page top.
- [x] Collection vinyls are visually grouped by genre.
- [x] `npm run lint`, `npm run type-check`, `npm run build` all pass.
- [x] Playwright E2E tests (30/30) still pass.

---

## 4. AI Contribution Notes

| Task                          | AI involvement                                            |
| ----------------------------- | --------------------------------------------------------- |
| Command palette rewrite       | AI-led; human verified focus & keyboard behaviour         |
| Typography + gradient utility | Collaborative                                             |
| Icon substitution             | AI-led search + replace; human spot-checked visual result |
| DB schema + Zod changes       | Collaborative                                             |
| setNowSpinningAction          | AI drafted; human reviewed single-selection logic         |
| Genre grouping UI             | AI-led; human reviewed grouping algorithm                 |
