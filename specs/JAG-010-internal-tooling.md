# JAG-010 — Internal Tooling & Productivity Engineering Showcase

**Branch:** `feat/JAG-010-internal-tooling`
**Status:** ⏳ In Progress

---

## Context

JAG-010 adds a dedicated `/internal-tooling` page that showcases the kind of
productivity-engineering work I do at Adevinta: zero-touch IAM provisioning pipelines
(HR webhook → Flask API → Google Workspace + Slack) and scheduled reporting pipelines
(Jenkins cron → Python aggregation → Slack). The page uses a custom `ArchitectureFlow`
component to make the system topology tangible and scannable without a heavyweight
diagram library.

---

## Technical Decisions

| Concern         | Decision                                            | Rationale                                                             |
| --------------- | --------------------------------------------------- | --------------------------------------------------------------------- |
| Diagram library | CSS + Lucide icons (no D3 / Mermaid)                | Zero runtime cost; matches existing Tailwind design system            |
| Animation       | `animate-pulse` on connector lines                  | Conveys live data flow without JS timers                              |
| Component API   | `nodes[]` array prop                                | Declarative; each showcase just passes its own data, no duplicated UI |
| Tech badges     | Small pill tags below each node                     | Lets recruiters/engineers see the stack at a glance                   |
| Route placement | `/internal-tooling` (top-level, not under `/tools`) | Distinct audience from the developer utilities page                   |

---

## Architecture Showcases

### A — Automated IAM Provisioning (HR → IT)

```
HR System Webhook → Python Flask API → GWS Admin API
                                     → Slack API (welcome + IT alert)
```

### B — Daily Activity Reporting Pipeline

```
Jenkins Cron Job → Python Aggregation Script → Slack Webhook (rich report)
```

---

## Acceptance Criteria

- [ ] `/internal-tooling` route renders correctly
- [ ] `ArchitectureFlow` component accepts `nodes[]` and renders sequential flow with animated connectors
- [ ] Both showcases (IAM provisioning, reporting pipeline) are present with correct nodes, icons, and tech badges
- [ ] "Automations" link appears in Navbar
- [ ] "Go to Internal Tooling" command appears in Command Palette
- [ ] `npm run lint:fix` and `npm run format` pass cleanly

---

## AI Contribution Notes

Component and page scaffolded by AI (Cursor/Claude) following the design patterns
established in JAG-007 through JAG-009. Architecture content is real work performed
at Adevinta and described by the developer.
