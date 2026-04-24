import { pgTable, varchar, integer, timestamp, uuid, pgEnum, boolean } from "drizzle-orm/pg-core";

// ─── Enums ────────────────────────────────────────────────────────────────────

export const vinylStatusEnum = pgEnum("vinyl_status", ["in_collection", "recommended"]);

// ─── Vinyls Table ─────────────────────────────────────────────────────────────

export const vinyls = pgTable("vinyls", {
  id: uuid("id").defaultRandom().primaryKey(),
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
});

// ─── Inferred Types ───────────────────────────────────────────────────────────

export type Vinyl = typeof vinyls.$inferSelect;
export type NewVinyl = typeof vinyls.$inferInsert;
