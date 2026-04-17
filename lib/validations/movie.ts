import { z } from "zod";

const currentYear = new Date().getFullYear();

export const genreValues = [
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
] as const;

export type Genre = (typeof genreValues)[number];

/**
 * Base movie schema — shared between create and update operations.
 * Used on both the client (form validation) and server (Server Action guard).
 *
 * Uses Zod v4 API (no `invalid_type_error` / `errorMap` — use `error` instead).
 */
export const movieBaseSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(200, "Title must be 200 characters or fewer")
    .trim(),

  director: z
    .string()
    .min(1, "Director is required")
    .max(150, "Director name must be 150 characters or fewer")
    .trim(),

  year: z
    .number({ error: "Year must be a number" })
    .int("Year must be a whole number")
    .min(1888, "Year must be 1888 or later (first film ever made)")
    .max(currentYear + 1, `Year cannot be more than ${currentYear + 1}`),

  genre: z.enum(genreValues, { error: "Please select a valid genre" }),

  synopsis: z.string().max(1000, "Synopsis must be 1000 characters or fewer").trim().optional(),

  posterUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),

  rating: z
    .number({ error: "Rating must be a number" })
    .int()
    .min(1, "Rating must be between 1 and 10")
    .max(10, "Rating must be between 1 and 10")
    .optional(),
});

export const createMovieSchema = movieBaseSchema;
export const updateMovieSchema = movieBaseSchema.partial().extend({
  id: z.string().uuid("Invalid movie ID"),
});
export const deleteMovieSchema = z.object({
  id: z.string().uuid("Invalid movie ID"),
});

export type CreateMovieInput = z.infer<typeof createMovieSchema>;
export type UpdateMovieInput = z.infer<typeof updateMovieSchema>;
export type DeleteMovieInput = z.infer<typeof deleteMovieSchema>;
