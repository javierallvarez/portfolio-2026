# JAG — Software Engineering Portfolio

[![CI](https://github.com/YOUR_GITHUB_USERNAME/2026_portfolio/actions/workflows/ci.yml/badge.svg)](https://github.com/YOUR_GITHUB_USERNAME/2026_portfolio/actions/workflows/ci.yml)

> A spec-driven, AI-assisted, enterprise-grade portfolio built in public.  
> Every feature is a ticket. Every PR is documented. Every decision is explained.

---

## Tech Stack

| Layer         | Technology                                                               |
| ------------- | ------------------------------------------------------------------------ |
| Framework     | [Next.js 15](https://nextjs.org) (App Router)                            |
| Language      | TypeScript (strict mode)                                                 |
| Styling       | Tailwind CSS + [HeroUI](https://heroui.com)                              |
| Database      | PostgreSQL via [Drizzle ORM](https://orm.drizzle.team) + Neon            |
| Validation    | [Zod](https://zod.dev) (shared frontend/backend)                         |
| XSS Safety    | [isomorphic-dompurify](https://github.com/kkomelin/isomorphic-dompurify) |
| Rate Limiting | Upstash Redis (token bucket via `@upstash/ratelimit`)                    |
| Monitoring    | [Sentry](https://sentry.io) (client + server + edge)                     |
| Testing       | [Playwright](https://playwright.dev) E2E                                 |
| Linting       | ESLint (strict) + Prettier                                               |
| CI/CD         | GitHub Actions                                                           |

---

## Spec-Driven Development: The JAG-XXX Workflow

This project uses a **Spec-Driven Development** approach. No code is written without a spec.

### The Lifecycle

```
1. IDEA        →  Open a discussion or note the feature/bug
2. SPEC        →  Create /specs/JAG-XXX-short-title.md
3. REVIEW      →  Acceptance criteria defined & agreed
4. BRANCH      →  git checkout -b feat/JAG-XXX-short-title
5. IMPLEMENT   →  Build against the spec
6. PR          →  Open PR using the PULL_REQUEST_TEMPLATE
7. CI          →  GitHub Actions runs lint, type-check, build, E2E
8. MERGE       →  Squash merge to main with JAG-XXX in commit message
9. CLOSE       →  Update spec status to ✅ Done
```

### Spec File Format

Every spec lives in `/specs/JAG-XXX-title.md` and contains:

- **Context & Motivation** — why this work is needed
- **Technical Decisions** — architectural choices and trade-offs
- **Acceptance Criteria** — a checklist that defines "done"
- **AI Contribution Notes** — transparent record of AI involvement

### Naming Convention

| Prefix | Example                        | Meaning             |
| ------ | ------------------------------ | ------------------- |
| JAG-   | `JAG-001-project-setup`        | All tickets         |
| feat/  | `feat/JAG-002-movie-crud`      | Feature branches    |
| fix/   | `fix/JAG-015-xss-sanitize-bug` | Bug fix branches    |
| chore/ | `chore/JAG-003-ci-setup`       | Tooling/config work |

---

## Getting Started

### Prerequisites

- Node.js ≥ 20
- PostgreSQL database (local, [Neon](https://neon.tech), or [Supabase](https://supabase.com))

### Setup

```bash
# 1. Clone the repository
git clone https://github.com/YOUR_GITHUB_USERNAME/2026_portfolio.git
cd 2026_portfolio

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env.local
# Edit .env.local with your DATABASE_URL and other secrets

# 4. Push the database schema
npm run db:push

# 5. Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Available Scripts

| Command                | Description                                |
| ---------------------- | ------------------------------------------ |
| `npm run dev`          | Start dev server with hot reload           |
| `npm run build`        | Build for production                       |
| `npm run start`        | Start production server                    |
| `npm run lint`         | Run ESLint                                 |
| `npm run lint:fix`     | Run ESLint with auto-fix                   |
| `npm run format`       | Format all files with Prettier             |
| `npm run format:check` | Check formatting (used in CI)              |
| `npm run type-check`   | Run TypeScript type check without emitting |
| `npm run test:e2e`     | Run Playwright E2E tests (headless)        |
| `npm run test:e2e:ui`  | Run Playwright with interactive UI         |
| `npm run db:generate`  | Generate Drizzle migration files           |
| `npm run db:migrate`   | Apply pending migrations                   |
| `npm run db:push`      | Push schema directly (dev only)            |
| `npm run db:studio`    | Open Drizzle Studio (visual DB browser)    |

---

## Project Structure

```
/
├── app/                     # Next.js App Router
│   ├── (marketing)/         # Route group: public pages (no extra layout)
│   │   └── under-the-hood/  # Architecture showcase page
│   ├── interactive-lab/     # Interactive Lab feature (movies DB demo)
│   ├── api/                 # API route handlers
│   ├── layout.tsx           # Root layout (Providers, Navbar)
│   └── page.tsx             # Homepage
│
├── components/
│   ├── ui/                  # Reusable primitive components
│   ├── layout/              # Navbar, Footer, CommandPalette
│   └── providers/           # HeroUIProvider, ThemeProvider
│
├── lib/
│   ├── db/                  # Drizzle client (index.ts) + schema
│   ├── validations/         # Zod schemas (shared client/server)
│   ├── security/            # XSS sanitizer, CORS helpers
│   └── rate-limit/          # Upstash rate limiter factory
│
├── actions/                 # Next.js Server Actions (vinyls.ts, etc.)
├── hooks/                   # Custom React hooks (useVinyls, useCommandPalette)
│
├── tests/
│   ├── e2e/                 # Playwright E2E test files
│   └── fixtures/            # Shared test data
│
├── specs/                   # JAG-XXX spec files
│
├── .github/
│   ├── PULL_REQUEST_TEMPLATE.md
│   └── workflows/ci.yml
│
├── drizzle.config.ts        # Drizzle Kit configuration
├── playwright.config.ts     # Playwright configuration
├── sentry.*.config.ts       # Sentry configs (client/server/edge)
└── .env.example             # Environment variable documentation
```

---

## Security Model

| Concern          | Implementation                                                  |
| ---------------- | --------------------------------------------------------------- |
| Input Validation | Zod schemas on every Server Action and API route handler        |
| XSS Prevention   | `isomorphic-dompurify` strips all HTML before DB writes         |
| CORS             | `lib/security/cors.ts` — allowlist-based origin checking        |
| Rate Limiting    | Upstash Redis sliding-window limiter on all mutating endpoints  |
| Secrets          | Never in code — `.env.local` only, documented in `.env.example` |
| Type Safety      | TypeScript strict mode — `any` is a lint error                  |

---

## CI/CD Pipeline

Every push triggers three GitHub Actions jobs:

```
push → lint (ESLint + Prettier + tsc) → build → e2e (Playwright)
```

- **Lint**: ESLint + Prettier check + TypeScript `--noEmit`
- **Build**: `next build` with dummy env vars to catch build-time errors
- **E2E**: Playwright runs against the built artifact on Chromium + Mobile Safari
- Playwright reports are uploaded as artifacts on every run (retained 7 days)

---

## AI-Assisted Development Policy

This portfolio is explicitly built with AI pair programming (Cursor + Claude). This is:

- **Transparent** — every PR documents AI involvement in the `AI Contribution` section
- **Intentional** — AI is used as a productivity multiplier, not a replacement for engineering judgment
- **Verified** — all AI-generated code is reviewed, tested, and understood by the human engineer

> The goal is to demonstrate how a senior engineer effectively uses AI tooling — not to hide it.

---

## Spec Index

| Spec    | Title                                                   | Status  |
| ------- | ------------------------------------------------------- | ------- |
| JAG-001 | Project Initialization                                  | ✅ Done |
| JAG-002 | Core UI, HeroUI & Dev Experience                        | ✅ Done |
| JAG-003 | Personal Branding, Content Refinement & Interactive Lab | ✅ Done |
| JAG-004 | Vinyl Collection Pivot & Live DB Connection             | ✅ Done |
| JAG-005 | Auth (Clerk) & External API (Discogs)                   | ✅ Done |
| JAG-006 | Infrastructure Showcase (AWS & IaC)                     | ✅ Done    |
| JAG-007 | UI & Data Magic (Typography, Icons, Now Spinning)       | ✅ Done    |

---

## License

MIT © JAG
