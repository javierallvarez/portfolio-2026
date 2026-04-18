import { HeroActions } from "@/components/hero-actions";

export default function HomePage() {
  return (
    <div className="relative isolate overflow-hidden">
      {/* Subtle radial gradient background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 [background:radial-gradient(ellipse_80%_50%_at_50%_-20%,oklch(65%_0.18_270_/_15%),transparent)]"
      />

      <section className="mx-auto flex max-w-4xl flex-col items-center px-6 pt-20 pb-24 text-center sm:pt-32">
        {/* Status badge */}
        <div className="bg-surface text-muted mb-6 inline-flex items-center gap-2 rounded-full border border-[--border-color,oklch(0%_0_0_/_10%)] px-4 py-1.5 text-xs font-medium shadow-sm">
          <span className="relative flex h-2 w-2">
            <span className="bg-success absolute inline-flex h-full w-full animate-ping rounded-full opacity-75" />
            <span className="bg-success relative inline-flex h-2 w-2 rounded-full" />
          </span>
          Available for new opportunities · Apr 2026
        </div>

        {/* Headline */}
        <h1 className="text-foreground text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
          Software Engineer{" "}
          <span className="from-primary to-secondary bg-gradient-to-r bg-clip-text text-transparent">
            building for humans
          </span>
        </h1>

        {/* Subheading */}
        <p className="text-muted mt-6 max-w-2xl text-lg leading-relaxed sm:text-xl">
          I design and build full-stack web applications with a focus on performance, security, and
          developer experience. Every feature starts with a spec. Every PR tells a story.
        </p>

        {/* CTA Buttons (client component for palette interaction) */}
        <HeroActions />

        {/* Tech chips */}
        <div className="mt-12 flex flex-wrap justify-center gap-2">
          {[
            "Next.js 15",
            "TypeScript",
            "PostgreSQL",
            "Drizzle ORM",
            "HeroUI v3",
            "Playwright",
            "GitHub Actions",
          ].map((tech) => (
            <span
              key={tech}
              className="bg-surface text-muted rounded-full px-3 py-1 text-xs font-medium ring-1 ring-[--border-color,oklch(0%_0_0_/_8%)]"
            >
              {tech}
            </span>
          ))}
        </div>
      </section>

      {/* Feature cards */}
      <section className="mx-auto max-w-5xl px-6 pb-24">
        <div className="grid gap-4 sm:grid-cols-3">
          {FEATURE_CARDS.map((card) => (
            <div
              key={card.title}
              className="bg-surface rounded-2xl border border-[--border-color,oklch(0%_0_0_/_8%)] p-6 shadow-sm"
            >
              <div className="mb-3 text-2xl">{card.icon}</div>
              <h3 className="text-foreground mb-2 font-semibold">{card.title}</h3>
              <p className="text-muted text-sm leading-relaxed">{card.description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

const FEATURE_CARDS = [
  {
    icon: "📋",
    title: "Spec-Driven",
    description:
      "Every feature starts as a JAG-XXX ticket with context, decisions, and acceptance criteria before any code is written.",
  },
  {
    icon: "🤖",
    title: "AI-Transparent",
    description:
      "AI pair programming is used as a multiplier — and disclosed in every PR via a dedicated AI Contribution table.",
  },
  {
    icon: "🔒",
    title: "Security-First",
    description:
      "Zod validation, DOMPurify XSS sanitization, CORS allowlisting, and rate limiting on every mutating endpoint.",
  },
] as const;
