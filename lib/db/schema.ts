import {
  pgTable,
  varchar,
  integer,
  timestamp,
  uuid,
  pgEnum,
  boolean,
  index,
  uniqueIndex,
  jsonb,
} from "drizzle-orm/pg-core";

// ─── Enums ────────────────────────────────────────────────────────────────────

export const vinylStatusEnum = pgEnum("vinyl_status", ["in_collection", "recommended"]);

// ─── Vinyls Table ─────────────────────────────────────────────────────────────

export const vinyls = pgTable(
  "vinyls",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    /** Discogs release id — unique when set (multiple NULLs allowed). */
    discogsId: integer("discogs_id"),
    title: varchar("title", { length: 255 }).notNull(),
    artist: varchar("artist", { length: 255 }).notNull(),
    year: integer("year").notNull(),
    coverUrl: varchar("cover_url", { length: 500 }),
    status: vinylStatusEnum("status").notNull().default("recommended"),
    // Genre extracted from Discogs API (genre[0] ?? style[0]) — added in JAG-007
    genre: varchar("genre", { length: 255 }),
    // Marks the single vinyl currently being played — only one can be true at a time
    isNowSpinning: boolean("is_now_spinning").default(false).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("vinyls_discogs_id_idx").on(table.discogsId),
    index("vinyls_artist_idx").on(table.artist),
  ],
);

// ─── Inferred Types ───────────────────────────────────────────────────────────

export type Vinyl = typeof vinyls.$inferSelect;
export type NewVinyl = typeof vinyls.$inferInsert;

// ─── Telemetry Events Table ───────────────────────────────────────────────────
// Append-only event log. Each row records a single anonymous interaction.
// Run `npm run db:push` after adding this table to apply it to Neon.

export const telemetryEvents = pgTable(
  "telemetry_events",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    eventType: varchar("event_type", { length: 255 }).notNull(),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("telemetry_events_event_type_idx").on(table.eventType)],
);

export type TelemetryEvent = typeof telemetryEvents.$inferSelect;
export type NewTelemetryEvent = typeof telemetryEvents.$inferInsert;
