import { pgTable, varchar, integer, timestamp, uuid, pgEnum } from "drizzle-orm/pg-core";

// ─── Enums ────────────────────────────────────────────────────────────────────

export const vinylStatusEnum = pgEnum("vinyl_status", ["in_collection", "recommended"]);

// ─── Vinyls Table ─────────────────────────────────────────────────────────────

export const vinyls = pgTable("vinyls", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  artist: varchar("artist", { length: 255 }).notNull(),
  year: integer("year").notNull(),
  // Reserved for Discogs CDN cover art — populated in JAG-005
  coverUrl: varchar("cover_url", { length: 500 }),
  status: vinylStatusEnum("status").notNull().default("recommended"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ─── Inferred Types ───────────────────────────────────────────────────────────

export type Vinyl = typeof vinyls.$inferSelect;
export type NewVinyl = typeof vinyls.$inferInsert;
