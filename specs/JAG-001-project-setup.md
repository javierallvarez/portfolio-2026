# JAG-001 — Project Initialization & Architecture Setup

| Field       | Value                       |
| ----------- | --------------------------- |
| **ID**      | JAG-001                     |
| **Status**  | ✅ Done                     |
| **Type**    | Chore / Foundation          |
| **Author**  | JAG (+ AI pair programming) |
| **Created** | 2026-04-15                  |

---

## 1. Context & Motivation

This is the foundational setup for the 2026 professional portfolio. The project is built using a
**Spec-Driven Development** approach where every feature, bug fix, or chore is tracked via a
`JAG-XXX` spec file before any code is written.

The portfolio is intended to demonstrate:

- Enterprise-level code quality and standards
- Security best practices (Zod validation, XSS sanitization, CORS, Rate Limiting)
- CI/CD culture (GitHub Actions, PR templates, Playwright E2E)
- Modern UX patterns (Optimistic UI, Skeleton Loaders, Command Palette, Toasts)

---

## 2. Technical Decisions

### Framework: Next.js 15 (App Router)

- Chosen for RSC (React Server Components) + Server Actions, enabling full-stack patterns
  with zero-client-bundle overhead for data-fetching layers.
- App Router enables co-located layouts, loading states, and error boundaries.

### Database: PostgreSQL via Drizzle ORM

- Drizzle is type-safe at the schema level, lightweight, and generates raw SQL (no magic).
- Neon (serverless Postgres) as the default target for easy deployment to Vercel.

### Styling: Tailwind CSS + HeroUI

- HeroUI provides accessible, production-grade components built on Radix primitives.
- Tailwind enables rapid, consistent design without context-switching to CSS files.

### Validation: Zod

- Shared schema definitions used on both the frontend (React Hook Form) and backend
  (Server Actions), eliminating double-validation logic.

### Monitoring: Sentry

- Automatic error capture for both client and server (Edge/Node runtime).
- Source map uploads on build for production-grade stack traces.

### Testing: Playwright

- E2E tests simulate real user flows against a local dev server.
- Run on every CI push via GitHub Actions.

### Rate Limiting Strategy

- Middleware-level rate limiting using Upstash Redis (token bucket algorithm).
- Applied to all API route handlers under `/api/` and Server Action endpoints.

---

## 3. Folder Architecture

```
/
├── app/                     # Next.js App Router
│   ├── (marketing)/         # Route group: public pages
│   │   ├── page.tsx         # Homepage
│   │   └── under-the-hood/  # Architecture showcase page
│   ├── movies/              # Movie CRUD feature
│   ├── api/                 # API route handlers
│   ├── layout.tsx           # Root layout (Providers, Sentry)
│   └── globals.css
├── components/
│   ├── ui/                  # Low-level, reusable primitives
│   ├── movies/              # Feature-scoped components
│   ├── layout/              # Navbar, Footer, CommandPalette
│   └── providers/           # ThemeProvider, HeroUIProvider
├── lib/
│   ├── db/                  # Drizzle client + schema
│   ├── validations/         # Zod schemas (shared)
│   ├── security/            # XSS sanitizer, CORS config
│   ├── rate-limit/          # Upstash rate limiter factory
│   └── sentry.ts            # Sentry helpers
├── actions/                 # Next.js Server Actions
├── hooks/                   # Custom React hooks
├── specs/                   # Spec-Driven tickets (JAG-XXX)
├── tests/
│   ├── e2e/                 # Playwright E2E tests
│   └── fixtures/            # Shared test data
├── .github/
│   ├── PULL_REQUEST_TEMPLATE.md
│   └── workflows/ci.yml
├── drizzle.config.ts
├── playwright.config.ts
└── sentry.*.config.ts
```

---

## 4. Acceptance Criteria

- [x] Next.js 15 App Router initialized with TypeScript strict mode
- [x] Tailwind CSS + HeroUI installed and configured
- [x] Drizzle ORM config (`drizzle.config.ts`) and initial `schema.ts` created
- [x] Playwright configured with a smoke test placeholder
- [x] Sentry client/server/edge config files scaffolded
- [x] ESLint + Prettier strictly configured
- [x] `.env.example` documents all required environment variables
- [x] `/specs` directory established with this file as the first entry
- [x] `.github/PULL_REQUEST_TEMPLATE.md` created
- [x] `.github/workflows/ci.yml` runs lint + Playwright on every push
- [x] `README.md` explains the JAG-XXX workflow

---

## 5. AI Contribution Notes

This ticket was implemented via AI pair programming (Cursor / Claude Sonnet).
The AI was responsible for:

- Scaffolding boilerplate configuration files
- Generating the initial Drizzle schema shape
- Writing the CI workflow YAML

All generated code was reviewed by the human engineer before commit.

---

## 6. References

- [Next.js App Router Docs](https://nextjs.org/docs/app)
- [Drizzle ORM Docs](https://orm.drizzle.team)
- [HeroUI Docs](https://www.heroui.com)
- [Playwright Docs](https://playwright.dev)
- [Sentry Next.js SDK](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [Upstash Rate Limiting](https://upstash.com/docs/redis/sdks/ratelimit/overview)
