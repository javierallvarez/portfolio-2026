import { pgTable, text, integer, timestamp, uuid, pgEnum } from "drizzle-orm/pg-core";

// ─── Enums ────────────────────────────────────────────────────────────────────

export const genreEnum = pgEnum("genre", [
  "action",
  "comedy",
  "drama",
  "horror",
  "sci-fi",
  "thriller",
  "romance",
  "animation",
  "documentary",
  "other",
]);

// ─── Movies Table ─────────────────────────────────────────────────────────────

export const movies = pgTable("movies", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: text("title").notNull(),
  director: text("director").notNull(),
  year: integer("year").notNull(),
  genre: genreEnum("genre").notNull().default("other"),
  synopsis: text("synopsis"),
  posterUrl: text("poster_url"),
  rating: integer("rating"), // 1–10
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ─── Inferred Types ───────────────────────────────────────────────────────────

export type Movie = typeof movies.$inferSelect;
export type NewMovie = typeof movies.$inferInsert;
