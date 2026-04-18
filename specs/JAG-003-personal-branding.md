# JAG-003 — Personal Branding, Content Refinement & Interactive Lab Setup

| Field       | Value                                  |
| ----------- | -------------------------------------- |
| **ID**      | JAG-003                                |
| **Status**  | ✅ Done                                |
| **Type**    | Feature / Content / UX                 |
| **Author**  | Javier Álvarez (+ AI pair programming) |
| **Created** | 2026-04-18                             |
| **Depends** | JAG-002                                |

---

## 1. Context & Motivation

JAG-002 established the UI foundation but left the content generic. This ticket replaces every
placeholder with real professional identity (Javier Álvarez, Adevinta) and shapes the site into
an honest showcase of the actual engineering work done day-to-day — internal tooling, automation,
Slack/Google Workspace administration — rather than a contrived demo.

It also renames the "Movies" feature to "Interactive Lab", which better conveys its purpose: a
live demonstration of complex database interactions, optimistic UI, and full-stack validation,
using a movie collection as the data model.

---

## 2. Technical Decisions

### Identity surface area

- **Metadata title** (`layout.tsx`) → `"Javier Álvarez — Software Engineering Portfolio"`
- **Navbar logo** → `Javier Álvarez` (replaces `JAG`)
- **Footer** (new `components/layout/footer.tsx`) → copyright line + nav links
- `JAG-XXX` convention is preserved strictly for tasks, specs, and PR identifiers

### Homepage hero

- Removes the "pulsing availability badge" — it was a placeholder; real status belongs in a
  structured résumé/CV, not a blinking DOM element
- Headline and subtitle rewritten to reflect actual work at Adevinta
- Feature cards updated: "Internal Tooling & Automation" replaces the generic "Spec-Driven" card,
  accurately describing Slack/Google Workspace admin work and ad-hoc scripting

### Command Palette Easter Egg — Slack Webhook simulation

A new `"Automations (Mock)"` category is added to the command palette with a single command:
**"Run Slack Webhook (Simulated)"**. When triggered it fires a `toast` notification:

> _"Ping! 🚀 Simulated Google Workspace task completed and team notified via Slack."_

This demonstrates the real-world pattern used at Adevinta: a Google Apps Script triggers a
Slack Incoming Webhook after a Workspace automation completes. No real API call is made — it
is clearly labelled as a simulation.

### Interactive Lab rename (`/movies` → `/interactive-lab`)

The Next.js route directory `app/movies/` is renamed to `app/interactive-lab/`. All internal
links (Navbar, Command Palette, Hero CTA, E2E smoke tests) are updated accordingly. The page
receives a proper hero-style header that explains the engineering intent behind the feature.

The `components/movies/` directory and any movie-scoped hooks are **not** renamed in this ticket
— they will be addressed when the full CRUD UI is built in a future JAG-XXX ticket.

---

## 3. Component & File Changes

```
app/
  layout.tsx                  ← Updated metadata title + imports Footer
  page.tsx                    ← Removed badge; updated hero headline, subtitle, feature cards
  interactive-lab/
    page.tsx                  ← Renamed from app/movies/; added hero header

components/
  hero-actions.tsx            ← CTA link updated to /interactive-lab
  layout/
    navbar.tsx                ← "Movies" → "Interactive Lab" link; logo text updated
    command-palette.tsx       ← nav-movies command updated; Automations category added
    footer.tsx                ← NEW: site footer with copyright + nav links

specs/
  JAG-003-personal-branding.md ← this file

tests/e2e/
  smoke.spec.ts               ← All /movies refs updated to /interactive-lab

README.md                     ← Spec index updated; project structure updated
```

---

## 4. Acceptance Criteria

- [x] `<title>` reads "Javier Álvarez — Software Engineering Portfolio" (and template pages)
- [x] Navbar logo displays "Javier Álvarez"
- [x] Footer renders on all pages with copyright and nav links
- [x] Homepage availability badge removed
- [x] Hero headline and subtitle reflect Adevinta role and engineering focus
- [x] "Internal Tooling & Automation" feature card present and accurate
- [x] Command Palette contains "Automations (Mock)" category
- [x] "Run Slack Webhook (Simulated)" command triggers correct toast message
- [x] `/movies` route no longer exists; `/interactive-lab` returns 200
- [x] Navbar, Command Palette, and Hero CTA all link to `/interactive-lab`
- [x] Interactive Lab page renders hero header with correct text
- [x] All 15 E2E smoke tests pass after URL updates
- [x] `npm run lint:fix` → zero errors
- [x] TypeScript strict: zero type errors

---

## 5. AI Contribution Notes

This ticket was implemented via AI pair programming (Cursor / Claude Sonnet).

| Area                | AI Involvement  |
| ------------------- | --------------- |
| Spec authoring      | Full (reviewed) |
| Content copywriting | Collaborative   |
| Component edits     | Full (reviewed) |
| Footer component    | Full (reviewed) |
| Easter egg copy     | Human           |
