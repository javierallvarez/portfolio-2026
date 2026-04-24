# JAG-005 — Auth (Clerk) & External API (Discogs)

| Field       | Value                                  |
| ----------- | -------------------------------------- |
| **ID**      | JAG-005                                |
| **Status**  | ✅ Done                                |
| **Type**    | Feature / Auth / External API          |
| **Author**  | Javier Álvarez (+ AI pair programming) |
| **Created** | 2026-04-24                             |
| **Depends** | JAG-004                                |

---

## 1. Context & Motivation

The Interactive Lab is publicly readable but needs two new capabilities:

1. **Authentication** — Only Javier (the authenticated admin) should be able to mark vinyls
   as "In Collection" or delete records. Community visitors can still search and recommend
   to the recommendations list without signing in.

2. **Discogs Integration** — Instead of manually typing vinyl metadata, the search bar queries
   the [Discogs API](https://www.discogs.com/developers) to auto-populate title, artist, year,
   and cover art. This demonstrates real-world external API integration with server-side token
   handling.

---

## 2. Technical Decisions

### Authentication: Clerk

[Clerk](https://clerk.com) was chosen over rolling a custom auth solution for several reasons:

- Pre-built UI components (`SignInButton`, `UserButton`) that match the portfolio's aesthetic
- `auth()` helper works natively in Next.js Server Actions and Server Components
- Session management handled out of the box (JWTs, refresh, multi-device)
- Free tier is more than sufficient for a solo-admin portfolio

### RBAC Model

| User type                 | Create vinyl          | Set `in_collection` | Update / Delete |
| ------------------------- | --------------------- | ------------------- | --------------- |
| Anonymous visitor         | ✅ (recommended only) | ❌                  | ❌              |
| Authenticated admin (JAG) | ✅ (any status)       | ✅                  | ✅              |

Authorization is enforced **inside each Server Action** via `auth()`. The Next.js `proxy.ts`
layer integrates Clerk's session sync but is not relied on as the sole auth gate, per the
Next.js proxy docs:

> _"Always verify authentication and authorization inside each Server Function rather than
> relying on Proxy alone."_

### proxy.ts (formerly middleware.ts)

Next.js 16 renamed `middleware.ts` → `proxy.ts` with a `proxy` named export. Clerk's
`clerkMiddleware` is wrapped and re-exported as `proxy` to comply with the new convention.

### Discogs API

- **Endpoint**: `GET https://api.discogs.com/database/search`
- **Params**: `q`, `type=release`, `per_page=10`
- **Auth**: `Authorization: Discogs token=TOKEN` header
- **Token**: Server-only (`DISCOGS_TOKEN` env var — never exposed to the client)
- **Search action**: `searchDiscogsAction(query)` — a Server Action that calls the utility
  and returns a `DiscogsResult[]` array. The client never sees the token.
- Title parsing: Discogs titles are formatted as `"Artist - Album"` — the utility splits on
  `-` to extract separate `artist` and `title` fields.

### VinylSearch UI

- Client Component with a controlled input (debounced via `useTransition`)
- Results rendered as a click-to-select list below the input
- Selected result shown in a preview card with cover art
- "Add to Wishlist" / "Add to Collection" (admin) submit buttons

---

## 3. File Changes

```
proxy.ts                              ← NEW: Clerk session sync for Next.js 16
lib/external/discogs.ts               ← NEW: Discogs search utility
actions/search.ts                     ← NEW: Server Action wrapping Discogs search
actions/vinyls.ts                     ← UPDATED: auth() guards on all mutations
lib/validations/vinyl.ts              ← UPDATED: allow both statuses in base schema
components/vinyls/vinyl-search.tsx    ← NEW: Search + preview client component
components/vinyls/vinyl-card.tsx      ← NEW: Vinyl display card
app/layout.tsx                        ← UPDATED: ClerkProvider wraps html
app/interactive-lab/page.tsx          ← UPDATED: vinyl list + search UI
components/layout/navbar.tsx          ← UPDATED: SignInButton / UserButton
next.config.ts                        ← UPDATED: i.discogs.com remotePattern
.env.example                          ← UPDATED: document Clerk + Discogs keys
README.md                             ← UPDATED: spec index
specs/JAG-005-auth-and-discogs.md     ← this file
```

---

## 4. Acceptance Criteria

- [x] `proxy.ts` exists at project root; Clerk session is available across all routes
- [x] Anonymous user submitting a vinyl → status always `"recommended"`
- [x] Authenticated admin submitting → can set status to `"in_collection"`
- [x] `updateVinylAction` and `deleteVinylAction` return 401 for unauthenticated callers
- [x] `searchDiscogsAction` calls Discogs API server-side; `DISCOGS_TOKEN` never in client bundle
- [x] VinylSearch component searches, displays results, and pre-fills the add form
- [x] Interactive Lab shows vinyls grouped by status with HeroUI cards and badges
- [x] `UserButton` appears in Navbar when signed in; `SignInButton` when signed out
- [x] `i.discogs.com` added to `next.config.ts` remotePatterns
- [x] All 30 E2E smoke tests pass (no auth-gated UI in selectors)
- [x] `npm run lint` → zero errors

---

## 5. AI Contribution Notes

| Area              | AI Involvement  |
| ----------------- | --------------- |
| Spec authoring    | Full (reviewed) |
| Clerk integration | Full (reviewed) |
| Discogs utility   | Full (reviewed) |
| RBAC logic        | Collaborative   |
| VinylSearch UI    | Full (reviewed) |
