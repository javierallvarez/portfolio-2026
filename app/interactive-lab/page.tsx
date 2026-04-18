import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Interactive Lab",
  description:
    "A live laboratory demonstrating PostgreSQL interactions, optimistic UI, rate limiting, and strict data validation in Next.js — powered by a curated movie collection.",
};

export default function InteractiveLabPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-16">
      {/* Hero header */}
      <div className="from-primary/10 via-surface to-secondary/10 relative isolate overflow-hidden rounded-2xl bg-gradient-to-br p-8 sm:p-12">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 [background:radial-gradient(ellipse_70%_60%_at_60%_40%,oklch(65%_0.18_270_/_12%),transparent)]"
        />
        <div className="mb-2 text-4xl">🍿</div>
        <h1 className="text-foreground text-3xl font-bold tracking-tight sm:text-4xl">
          Interactive Lab
        </h1>
        <p className="text-muted mt-4 max-w-2xl text-base leading-relaxed sm:text-lg">
          I&apos;m a massive movie nerd 🍿. This section isn&apos;t just an excuse to talk about my
          favorite films—it&apos;s a live laboratory demonstrating complex relational database
          interactions (PostgreSQL), optimistic UI updates, rate limiting, and strict data
          validation in Next.js. Go ahead, break it... or better yet, add your favorite movie to the
          live database!
        </p>
      </div>

      {/* Placeholder for full CRUD UI */}
      <div className="border-default-200 text-default-400 mt-12 rounded-xl border border-dashed p-8 text-center">
        🚧 Full CRUD UI coming in JAG-XXX
      </div>
    </div>
  );
}
