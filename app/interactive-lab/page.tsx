import type { Metadata } from "next";
import Image from "next/image";
import { auth } from "@clerk/nextjs/server";
import { Chip } from "@heroui/react";
import { Disc3, Music2 } from "lucide-react";
import { db } from "@/lib/db";
import { vinyls } from "@/lib/db/schema";
import { VinylSearch } from "@/components/vinyls/vinyl-search";
import { VinylDeleteButton } from "@/components/vinyls/vinyl-delete-button";
import { VinylNowSpinningButton } from "@/components/vinyls/vinyl-now-spinning-button";
import { VinylSommelier } from "@/components/interactive-lab/vinyl-sommelier";
import type { Vinyl } from "@/lib/db/schema";

export const metadata: Metadata = {
  title: "Interactive Lab · Vinyl Collection",
  description:
    "A live laboratory powered by a real vinyl record collection. Demonstrates PostgreSQL with Drizzle ORM, optimistic UI, rate limiting, and strict Zod validation in Next.js.",
};

// ─── Now Spinning spotlight ───────────────────────────────────────────────────

function NowSpinningCard({ vinyl, isAdmin }: { vinyl: Vinyl; isAdmin: boolean }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-teal-400/30 bg-gradient-to-br from-teal-400/10 via-cyan-400/5 to-transparent p-6 shadow-lg">
      {/* Radial glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-10 -right-10 h-48 w-48 rounded-full bg-teal-400/15 blur-3xl"
      />

      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center">
        {/* Spinning disc + cover */}
        <div className="relative h-28 w-28 flex-shrink-0">
          {/* Static outer ring with gentle pulse — acts as the platter rim */}
          <div className="absolute inset-0 animate-pulse rounded-full border-4 border-dashed border-teal-400/40" />

          {/* The record itself spins — cover art + grooves illusion */}
          <div className="animate-spin-slow absolute inset-2 overflow-hidden rounded-full shadow-md">
            {vinyl.coverUrl ? (
              <Image
                src={vinyl.coverUrl}
                alt={`${vinyl.title} cover art`}
                fill
                sizes="96px"
                className="object-cover"
                unoptimized
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-teal-400/20">
                <Disc3 size={32} className="text-teal-400" aria-hidden="true" />
              </div>
            )}
          </div>

          {/* Centre spindle hole — stays fixed on top of the rotating record */}
          <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
            <div className="h-3 w-3 rounded-full bg-teal-400/70 shadow ring-2 ring-teal-400/20" />
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 space-y-1">
          <p className="text-xs font-semibold tracking-widest text-teal-400 uppercase">
            Now Spinning
          </p>
          <h2 className="text-foreground font-serif text-2xl leading-tight font-normal">
            {vinyl.title}
          </h2>
          <p className="text-default-500 text-base">{vinyl.artist}</p>
          <div className="flex flex-wrap items-center gap-2 pt-1">
            {vinyl.year && <span className="text-default-400 text-sm">{vinyl.year}</span>}
            {vinyl.genre && (
              <Chip size="sm" variant="primary">
                {vinyl.genre}
              </Chip>
            )}
            {isAdmin && (
              <VinylNowSpinningButton vinylId={vinyl.id} title={vinyl.title} isCurrentlySpinning />
            )}
            {isAdmin && <VinylDeleteButton vinylId={vinyl.id} title={vinyl.title} />}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Vinyl Card ───────────────────────────────────────────────────────────────

function VinylCard({ vinyl, isAdmin }: { vinyl: Vinyl; isAdmin: boolean }) {
  return (
    <article className="border-divider bg-content1 hover:bg-content2 flex gap-4 rounded-xl border p-4 transition-colors">
      {/* Cover art */}
      <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg">
        {vinyl.coverUrl ? (
          <Image
            src={vinyl.coverUrl}
            alt={`${vinyl.title} cover art`}
            fill
            sizes="80px"
            className="object-cover"
            unoptimized
          />
        ) : (
          <div
            className="bg-content3 text-default-400 flex h-full w-full items-center justify-center rounded-lg"
            aria-label="No cover art"
          >
            <Music2 size={20} aria-hidden="true" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex min-w-0 flex-1 flex-col justify-between gap-2">
        <div>
          <h3 className="truncate text-sm leading-tight font-semibold">{vinyl.title}</h3>
          <p className="text-default-500 truncate text-sm">{vinyl.artist}</p>
          {vinyl.year && <p className="text-default-400 text-xs">{vinyl.year}</p>}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Chip size="sm" variant={vinyl.status === "in_collection" ? "primary" : "secondary"}>
            {vinyl.status === "in_collection" ? "In Collection" : "Recommended"}
          </Chip>

          {vinyl.genre && <span className="text-default-400 text-xs">{vinyl.genre}</span>}

          {isAdmin && vinyl.status === "in_collection" && (
            <VinylNowSpinningButton
              vinylId={vinyl.id}
              title={vinyl.title}
              isCurrentlySpinning={false}
            />
          )}

          {isAdmin && <VinylDeleteButton vinylId={vinyl.id} title={vinyl.title} />}
        </div>
      </div>
    </article>
  );
}

// ─── Section heading ─────────────────────────────────────────────────────────

function SectionHeading({
  label,
  count,
  dotColor,
}: {
  label: React.ReactNode;
  count: number;
  dotColor: "primary" | "secondary";
}) {
  return (
    <div className="flex items-center gap-2">
      <span
        className={`h-2.5 w-2.5 rounded-full ${dotColor === "primary" ? "bg-primary" : "bg-secondary"}`}
        aria-hidden="true"
      />
      <h2 className="text-foreground text-lg font-semibold">{label}</h2>
      <span className="text-default-400 text-sm">({count})</span>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default async function InteractiveLabPage() {
  // Gracefully degrade when Clerk is unavailable (e.g. rate-limited handshake
  // or a dummy publishableKey in CI). Treat as unauthenticated rather than
  // crashing the render.
  let userId: string | null = null;
  try {
    ({ userId } = await auth());
  } catch {
    // Clerk unavailable — treat as unauthenticated
  }
  const isAdmin = !!userId;

  // Gracefully degrade when the database is unreachable (e.g. CI with a stub
  // DATABASE_URL). The page still renders — heading, hero, search — just with
  // empty collection/recommendation lists instead of a 500 error boundary.
  let allVinyls: Vinyl[] = [];
  try {
    allVinyls = await db.select().from(vinyls).orderBy(vinyls.createdAt);
  } catch {
    // DB unavailable — fall through with empty list
  }

  const nowSpinning = allVinyls.find((v) => v.isNowSpinning) ?? null;
  const collection = allVinyls.filter((v) => v.status === "in_collection" && !v.isNowSpinning);
  const recommended = allVinyls.filter((v) => v.status === "recommended");

  // Group collection by genre for the genre-organised view
  const byGenre = collection.reduce<Record<string, Vinyl[]>>((acc, v) => {
    const key = v.genre?.trim() || "Other";
    (acc[key] ??= []).push(v);
    return acc;
  }, {});
  // Sort genres alphabetically, "Other" last
  const sortedGenres = Object.keys(byGenre).sort((a, b) =>
    a === "Other" ? 1 : b === "Other" ? -1 : a.localeCompare(b),
  );

  return (
    <div className="mx-auto max-w-5xl px-4 py-16">
      {/* ── Hero ── */}
      <div className="from-primary/10 via-surface to-secondary/10 relative isolate overflow-hidden rounded-2xl bg-gradient-to-br p-8 sm:p-12">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 [background:radial-gradient(ellipse_70%_60%_at_60%_40%,oklch(65%_0.18_270_/_12%),transparent)]"
        />

        <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
          {/* Text content */}
          <div>
            <h1 className="text-foreground font-serif text-3xl font-normal tracking-tight sm:text-4xl">
              Vinyl Collection &amp; <span className="gradient-heading">Recommendations</span>
            </h1>
            <p className="text-muted mt-4 text-base leading-relaxed sm:text-lg">
              I spent years as an{" "}
              <span className="text-foreground font-medium">Electronic Music Producer</span> and{" "}
              <span className="text-foreground font-medium">Record Label Director</span>, and sound
              still runs through everything I do, including the records that fill this collection.
            </p>
            <p className="text-muted mt-3 text-base leading-relaxed sm:text-lg">
              But it&apos;s also a{" "}
              <span className="text-foreground font-medium">live PostgreSQL database</span>{" "}
              demonstrating real-world full-stack architecture: Drizzle ORM, optimistic UI, rate
              limiting, Zod validation, Clerk RBAC, and Discogs API integration, all running against
              a live Neon database.
            </p>
            <p className="text-muted mt-3 text-base leading-relaxed sm:text-lg">
              Go ahead,{" "}
              <span className="text-foreground font-medium">test the DB architecture</span> and drop
              a recommendation below. What record should be in my collection?
            </p>
          </div>

          {/* Home setup photo */}
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl shadow-lg">
            <Image
              src="/vinyl_collection.jpeg"
              alt="Javier's vinyl collection"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
            />
            <div className="from-background/60 absolute inset-0 bg-gradient-to-t to-transparent" />
          </div>
        </div>
      </div>

      {/* ── Now Spinning ── */}
      {nowSpinning && (
        <section className="mt-10" aria-label="Now spinning">
          <NowSpinningCard vinyl={nowSpinning} isAdmin={isAdmin} />
        </section>
      )}

      {/* ── Vinyl Sommelier ── */}
      <section className="mt-10" aria-label="Vinyl Sommelier">
        <VinylSommelier />
      </section>

      {/* ── Discogs Search ── */}
      <section className="mt-10" aria-label="Search and add vinyl records">
        <h2 className="text-foreground mb-1 text-lg font-semibold">
          {isAdmin ? "Add to Your Collection" : "Recommend a Record"}
        </h2>
        <p className="text-default-500 mb-4 text-sm">
          {isAdmin
            ? "Search Discogs and add records directly to your collection or recommendations."
            : "Search Discogs and recommend an album you think should be here."}
        </p>
        <VinylSearch isAdmin={isAdmin} />
      </section>

      {/* ── Collection (grouped by genre) ── */}
      <section className="mt-12" aria-label="Javier's vinyl collection">
        <SectionHeading
          label={
            <>
              Javier&apos;s <span className="gradient-heading">Collection</span>
            </>
          }
          count={collection.length + (nowSpinning?.status === "in_collection" ? 1 : 0)}
          dotColor="primary"
        />

        {sortedGenres.length > 0 ? (
          <div className="mt-4 space-y-8">
            {sortedGenres.map((genre) => (
              <div key={genre}>
                <p className="text-default-400 mb-3 flex items-center gap-2 text-xs font-semibold tracking-widest uppercase">
                  <Disc3 size={12} className="text-teal-400" aria-hidden="true" />
                  {genre}
                  <span className="text-default-300">({byGenre[genre].length})</span>
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {byGenre[genre].map((vinyl) => (
                    <VinylCard key={vinyl.id} vinyl={vinyl} isAdmin={isAdmin} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-default-400 mt-4 text-sm">
            No records in the collection yet. Check back soon!
          </p>
        )}
      </section>

      {/* ── Community Recommendations ── */}
      <section className="mt-12" aria-label="Community recommendations">
        <SectionHeading
          label={
            <>
              Community <span className="gradient-heading">Recommendations</span>
            </>
          }
          count={recommended.length}
          dotColor="secondary"
        />
        <p className="text-default-500 mt-1 mb-4 text-sm">
          Albums the community thinks Javier should own.
        </p>
        {recommended.length > 0 ? (
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {recommended.map((vinyl) => (
              <VinylCard key={vinyl.id} vinyl={vinyl} isAdmin={isAdmin} />
            ))}
          </div>
        ) : (
          <p className="text-default-400 mt-4 text-sm">
            No recommendations yet — be the first to recommend an album above!
          </p>
        )}
      </section>
    </div>
  );
}
