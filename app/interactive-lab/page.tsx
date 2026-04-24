import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Interactive Lab — Vinyl Collection",
  description:
    "A live laboratory powered by a real vinyl record collection. Demonstrates PostgreSQL with Drizzle ORM, optimistic UI, rate limiting, and strict Zod validation in Next.js.",
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

        <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
          {/* Text content */}
          <div>
            <div className="mb-3 text-4xl">🎵</div>
            <h1 className="text-foreground text-3xl font-bold tracking-tight sm:text-4xl">
              Vinyl Collection &amp; Wishlist
            </h1>
            <p className="text-muted mt-4 text-base leading-relaxed sm:text-lg">
              I collect vinyl records and love showing off my home audio setup — a warm, analogue
              corner of my flat that I&apos;m constantly adding to. But this page isn&apos;t just an
              excuse to talk about records.
            </p>
            <p className="text-muted mt-3 text-base leading-relaxed sm:text-lg">
              It&apos;s a <span className="text-foreground font-medium">live laboratory</span>{" "}
              demonstrating complex relational database interactions (PostgreSQL + Drizzle ORM),
              optimistic UI updates, rate limiting, and strict data validation in Next.js — all
              backed by a real Neon database.
            </p>
            <p className="text-muted mt-3 text-base leading-relaxed sm:text-lg">
              <span className="text-foreground font-medium">My collection</span> is what I own and
              spin at home. The{" "}
              <span className="text-foreground font-medium">Community Wishlist</span> is open to
              everyone — add a record you think I should own. Go ahead, break it… or better yet,
              convince me to buy your favourite album. 🎶
            </p>
          </div>

          {/* Placeholder image — replace src with a real photo of your setup */}
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl shadow-lg">
            <Image
              src="https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=800&auto=format&fit=crop&q=80"
              alt="Vinyl turntable and home audio setup"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
            />
            <div className="from-background/60 absolute inset-0 bg-gradient-to-t to-transparent" />
            <p className="text-muted absolute right-3 bottom-3 text-xs italic">
              📸 Replace with a photo of your actual setup
            </p>
          </div>
        </div>
      </div>

      {/* Status legend */}
      <div className="mt-8 flex flex-wrap gap-3">
        <span className="bg-surface text-muted inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm ring-1 ring-[--border-color,oklch(0%_0_0_/_8%)]">
          <span className="bg-primary h-2 w-2 rounded-full" aria-hidden="true" />
          In Collection
        </span>
        <span className="bg-surface text-muted inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm ring-1 ring-[--border-color,oklch(0%_0_0_/_8%)]">
          <span className="bg-secondary h-2 w-2 rounded-full" aria-hidden="true" />
          Community Wishlist
        </span>
      </div>

      {/* Placeholder for full CRUD UI */}
      <div className="border-default-200 text-default-400 mt-8 rounded-xl border border-dashed p-8 text-center">
        🚧 Full CRUD UI (add to wishlist, browse collection) coming in JAG-006
      </div>
    </div>
  );
}
