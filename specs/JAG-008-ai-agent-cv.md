# JAG-008 — AI Career Agent (Vercel AI SDK)

**Branch:** `feat/JAG-008-ai-agent-cv`
**Status:** ✅ Done

---

## Context

The static "Download CV" action in the command palette was a placeholder. This ticket replaces it with a real, streaming AI Career Agent that knows everything about Javier Álvarez's professional history, tech stack, and personal projects. Visitors can ask natural-language questions and get personalized answers in real time.

---

## Technical Decisions

| Concern      | Decision                                       | Rationale                                                                          |
| ------------ | ---------------------------------------------- | ---------------------------------------------------------------------------------- |
| AI SDK       | `ai` v6 + `@ai-sdk/google`                     | Vercel-native, tree-shakable, works with Next.js 16 streaming                      |
| Model        | `gemini-2.0-flash`                             | Fast, cost-efficient, generous free tier — no OpenAI account needed                |
| API key      | `GEMINI_API_KEY`                               | Passed via `createGoogleGenerativeAI({ apiKey })` to avoid env name mismatch       |
| Streaming    | `streamText` → `result.toTextStreamResponse()` | Plain text stream — no SDK-specific protocol needed on client                      |
| Client state | Custom `useCareerChat` hook                    | AI SDK v6 dropped `useChat` React hook; thin hook using `fetch` + `ReadableStream` |
| UI surface   | Full-height side drawer (right)                | Stays in context while browsing; doesn't interrupt page layout                     |
| Entry points | Command Palette "Ask my AI" + Navbar icon      | Multiple discovery paths for recruiters                                            |

---

## Files Created / Modified

```
lib/ai/knowledge-base.ts          — Structured career knowledge base (system prompt source)
app/api/chat/route.ts             — POST route: streamText → toTextStreamResponse
hooks/use-career-chat.ts          — Lightweight streaming chat hook (fetch + ReadableStream)
components/ai/career-chat.tsx     — Drawer UI (streaming messages, turquoise theme)
components/layout/command-palette.tsx — "Ask my AI" replaces "Download CV"
components/layout/navbar.tsx      — Bot icon button opens chat
```

---

## Knowledge Base Coverage

- **Current role**: Software Engineer at Adevinta (internal tooling, GWS/Slack admin)
- **Music career**: Electronic Music Producer & Record Label Director (past)
- **Tech stack**: Next.js 16, TypeScript, PostgreSQL (Neon), Drizzle ORM, Clerk, Terraform/AWS, GitHub Actions, Vercel
- **Projects**: This engineering portfolio (JAG-001 → JAG-008 spec-driven)
- **Personality**: Automation-driven, passionate about music and clean architecture
- **Contact**: LinkedIn invitation for anything outside the knowledge base

---

## Acceptance Criteria

- [x] `POST /api/chat` streams tokens using the Vercel AI SDK
- [x] Drawer opens from Command Palette (`⌘K` → "Ask my AI") and Navbar bot icon
- [x] Streaming text appears token-by-token with a blinking cursor
- [x] System prompt grounds the model in Javier's knowledge base
- [x] Out-of-scope questions redirect to LinkedIn
- [x] `OPENAI_API_KEY` consumed from environment; missing key returns graceful error
- [x] Lint, type-check, format all pass
