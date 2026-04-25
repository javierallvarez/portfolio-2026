# JAG-009 — Utilities Hub & DB Telemetry

**Branch:** `feat/JAG-009-utilities-telemetry`
**Status:** ✅ Done

---

## Context

After JAG-008 (AI Career Agent), the portfolio needed more interactive depth to showcase
full-stack skills end-to-end. JAG-009 adds a `/tools` page with client-side developer
utilities whose every interaction is anonymously tracked in the live PostgreSQL database
and surfaced as a live telemetry dashboard on the "Under the Hood" page.

---

## Technical Decisions

| Concern         | Decision                                       | Rationale                                                            |
| --------------- | ---------------------------------------------- | -------------------------------------------------------------------- |
| Cron parsing    | `cronstrue` npm package                        | Zero-dependency, browser-safe, handles all cron formats              |
| Telemetry model | Single `telemetry_events` event-log table      | Append-only; no updates/deletes; cheap count queries by `event_type` |
| Tracking calls  | Fire-and-forget (`void trackEventAction(...)`) | Tracking must never block or break the UI                            |
| Debounce        | 600ms on cron translator                       | Avoid spamming the DB on every keystroke                             |
| Dashboard data  | Server Component fetch in under-the-hood page  | No client waterfall; data fresh on every request                     |

---

## DB Schema

```sql
CREATE TABLE telemetry_events (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type  varchar(255) NOT NULL,
  created_at  timestamp DEFAULT now()
);
```

### Event Types

| Event                | Trigger                                          |
| -------------------- | ------------------------------------------------ |
| `password_generated` | Password Generator — on every generation         |
| `cron_translated`    | Cron Translator — 600ms after a valid expression |
| `discogs_searched`   | Discogs Search — on successful API response      |

---

## Files Created / Modified

```
lib/db/schema.ts                        — new telemetry_events table
actions/telemetry.ts                    — trackEventAction + getTelemetryStatsAction
actions/search.ts                       — hooks trackEventAction('discogs_searched')
app/tools/page.tsx                      — /tools route with hero + both tools
components/tools/password-generator.tsx — client tool with clipboard + tracking
components/tools/cron-translator.tsx    — client tool with debounce + tracking
components/layout/navbar.tsx            — link to /tools
components/layout/command-palette.tsx   — command to navigate to /tools
app/(marketing)/under-the-hood/page.tsx — Live DB Telemetry section
```

---

## Acceptance Criteria

- [x] `telemetry_events` table exists in schema (run `npm run db:push` to apply)
- [x] `trackEventAction` is fire-and-forget — failures are silently caught
- [x] Password Generator tracks every generation
- [x] Cron Translator tracks with 600ms debounce on valid expressions
- [x] Discogs search tracks on successful response
- [x] `/tools` page accessible from Navbar and ⌘K Command Palette
- [x] Under the Hood "Live DB Telemetry" section shows live counts
- [x] Lint, type-check, format all pass
