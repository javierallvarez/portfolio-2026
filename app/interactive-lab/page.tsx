import type { Metadata } from "next";
import Image from "next/image";
import { auth } from "@clerk/nextjs/server";
import { Chip } from "@heroui/react";
import { db } from "@/lib/db";
import { vinyls } from "@/lib/db/schema";
import { VinylSearch } from "@/components/vinyls/vinyl-search";
import { VinylDeleteButton } from "@/components/vinyls/vinyl-delete-button";
import type { Vinyl } from "@/lib/db/schema";

export const metadata: Metadata = {
  title: "Interactive Lab — Vinyl Collection",
  description:
    "A live laboratory powered by a real vinyl record collection. Demonstrates PostgreSQL with Drizzle ORM, optimistic UI, rate limiting, and strict Zod validation in Next.js.",
};

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
            className="bg-content3 text-default-400 flex h-full w-full items-center justify-center rounded-lg text-xs"
            aria-label="No cover art"
          >
            🎵
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

        <div className="flex items-center gap-2">
          <Chip size="sm" variant={vinyl.status === "in_collection" ? "primary" : "secondary"}>
            {vinyl.status === "in_collection" ? "In Collection" : "Recommended"}
          </Chip>

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
  label: string;
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
  const { userId } = await auth();
  const isAdmin = !!userId;

  const allVinyls = await db.select().from(vinyls).orderBy(vinyls.createdAt);
  const collection = allVinyls.filter((v) => v.status === "in_collection");
  const recommended = allVinyls.filter((v) => v.status === "recommended");

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
            <h1 className="text-foreground text-3xl font-bold tracking-tight sm:text-4xl">
              Vinyl Collection &amp; Recommendations
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
              <span className="text-foreground font-medium">Community Recommendations</span> section
              is open to everyone — search for an album below and recommend it. Go ahead, convince
              me to buy your favourite record. 🎶
            </p>
          </div>

          {/* Home setup photo */}
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
          </div>
        </div>
      </div>

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

      {/* ── Collection ── */}
      <section className="mt-12" aria-label="Javier's vinyl collection">
        <SectionHeading label="Javier's Collection" count={collection.length} dotColor="primary" />
        {collection.length > 0 ? (
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {collection.map((vinyl) => (
              <VinylCard key={vinyl.id} vinyl={vinyl} isAdmin={isAdmin} />
            ))}
          </div>
        ) : (
          <p className="text-default-400 mt-4 text-sm">
            No records in the collection yet — check back soon!
          </p>
        )}
      </section>

      {/* ── Community Recommendations ── */}
      <section className="mt-12" aria-label="Community recommendations">
        <SectionHeading
          label="Community Recommendations"
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
