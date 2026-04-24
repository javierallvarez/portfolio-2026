# JAG-004 — The Vinyl Pivot & Live DB Connection

| Field       | Value                                  |
| ----------- | -------------------------------------- |
| **ID**      | JAG-004                                |
| **Status**  | ✅ Done                                |
| **Type**    | Feature / Schema / Content             |
| **Author**  | Javier Álvarez (+ AI pair programming) |
| **Created** | 2026-04-24                             |
| **Depends** | JAG-003, JAG-001 (DB scaffold)         |

---

## 1. Context & Motivation

The "Interactive Lab" was seeded with a generic Movies domain as a placeholder. This ticket
pivots the data model to **Vinyl Records** — a genuine personal passion — making the feature
more authentic and interesting to visitors while preserving every engineering demonstration goal
(optimistic UI, rate limiting, Zod validation, DOMPurify, PostgreSQL).

The pivot also establishes the foundation for **JAG-005**, which will integrate the
[Discogs API](https://www.discogs.com/developers) to auto-populate cover art, label, and
catalogue number for records in the collection.

---

## 2. Technical Decisions

### Schema design

| Column      | Type                         | Notes                                    |
| ----------- | ---------------------------- | ---------------------------------------- |
| `id`        | `uuid` PK                    | `defaultRandom()`                        |
| `title`     | `varchar(255)` NOT NULL      | Album / release title                    |
| `artist`    | `varchar(255)` NOT NULL      | Primary artist or band                   |
| `year`      | `integer` NOT NULL           | Original release year                    |
| `coverUrl`  | `varchar(500)`               | Discogs / CDN cover image URL (JAG-005)  |
| `status`    | `vinyl_status` enum NOT NULL | `'in_collection'` or `'wishlist'`        |
| `createdAt` | `timestamp` NOT NULL         | `defaultNow()`                           |
| `updatedAt` | `timestamp` NOT NULL         | `defaultNow()` (updated via application) |

### Status enum & public submissions

Public visitors may submit records to the **Community Wishlist**. The `status` field Zod schema
hard-codes `'wishlist'` as the only value accepted for public inserts. Admin operations
(setting `'in_collection'`) are gated server-side and reserved for future authenticated flows.

### Migration strategy

Using `drizzle-kit push` (schema push) rather than a versioned migration. This is appropriate
for a solo dev database at this stage — the live Neon DB is treated as non-production data.
Versioned migrations (`drizzle-kit generate` + `migrate`) will be adopted in JAG-006 when
the schema stabilises.

### Discogs integration (JAG-005 hook)

`coverUrl` is included now so the column is available in the live DB when JAG-005 lands.
The field is optional at the application level; Discogs enrichment will back-fill it.

### Image optimisation

The Interactive Lab hero uses `next/image` with a placeholder Unsplash URL. Unsplash
(`images.unsplash.com`) is added to `next.config.ts` `remotePatterns` so Next.js's Image
Optimisation API can resize and serve it.

---

## 3. File Changes

```
lib/
  db/schema.ts                ← movies table replaced with vinyls table + vinyl_status enum
  validations/vinyl.ts        ← NEW: Zod schemas for createVinyl / updateVinyl / deleteVinyl
  validations/movie.ts        ← DELETED

actions/
  vinyls.ts                   ← NEW: Server Actions (create / update / delete / get)
  movies.ts                   ← DELETED

hooks/
  use-vinyls.ts               ← NEW: optimistic UI hook for vinyl list
  use-movies.ts               ← DELETED

tests/fixtures/
  vinyls.ts                   ← NEW: shared test fixtures
  movies.ts                   ← DELETED

app/
  interactive-lab/page.tsx    ← updated hero copy + Next/Image placeholder

next.config.ts                ← images.remotePatterns for images.unsplash.com

specs/JAG-004-vinyl-collection.md  ← this file
README.md                          ← spec index updated
```

---

## 4. Acceptance Criteria

- [x] `vinyls` table and `vinyl_status` enum created in Drizzle schema
- [x] Old `movies` table, validation, action, hook, and fixtures removed
- [x] `createVinylSchema` enforces `status: 'wishlist'` for public submissions
- [x] `updateVinylSchema` allows `status` to be set freely (admin path)
- [x] DOMPurify sanitization applied to all string fields before DB write
- [x] Rate limit keys updated to `vinyls:create` / `vinyls:read`
- [x] Interactive Lab hero reflects Vinyl / audio setup theme
- [x] `next/image` placeholder renders without optimisation errors
- [x] `images.unsplash.com` added to `next.config.ts` remotePatterns
- [x] `npm run lint` → zero errors
- [x] TypeScript strict: zero type errors
- [x] All 30 E2E smoke tests pass (no domain-specific selectors broken)
- [x] `npm run db:push` successfully applies schema to live Neon DB (manual step)

---

## 5. JAG-005 Preview — Discogs Integration

The next ticket will:

- Integrate the Discogs REST API to search and auto-populate vinyl metadata
- Use the `coverUrl` column to store the Discogs CDN image URL
- Add a server-side enrichment step that fires after a wishlist submission
- Display cover art in the collection grid with a fallback placeholder

---

## 6. AI Contribution Notes

| Area             | AI Involvement  |
| ---------------- | --------------- |
| Spec authoring   | Full (reviewed) |
| Schema design    | Collaborative   |
| Zod schemas      | Full (reviewed) |
| Server Actions   | Full (reviewed) |
| Hero copywriting | Collaborative   |
