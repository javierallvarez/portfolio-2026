import { z } from "zod";

const currentYear = new Date().getFullYear();

export const vinylStatusValues = ["in_collection", "recommended"] as const;
export type VinylStatus = (typeof vinylStatusValues)[number];

/**
 * Base vinyl schema — shared fields validated on both client and server.
 *
 * Uses Zod v4 API (`error` instead of `errorMap` / `invalid_type_error`).
 */
export const vinylBaseSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(255, "Title must be 255 characters or fewer")
    .trim(),

  artist: z
    .string()
    .min(1, "Artist is required")
    .max(255, "Artist name must be 255 characters or fewer")
    .trim(),

  year: z
    .number({ error: "Year must be a number" })
    .int("Year must be a whole number")
    .min(1877, "Year must be 1877 or later (year of the first audio recording)")
    .max(currentYear + 1, `Year cannot be more than ${currentYear + 1}`),

  coverUrl: z.string().url("Must be a valid URL").max(500).optional().or(z.literal("")),

  genre: z.string().max(255).optional().or(z.literal("")),

  status: z.enum(vinylStatusValues, {
    error: "Status must be 'in_collection' or 'recommended'",
  }),
});

/**
 * Public submission schema — status is locked to 'recommended'.
 * Used for unauthenticated visitor submissions (community recommendations).
 */
export const createVinylSchema = vinylBaseSchema.extend({
  status: z.literal("recommended").default("recommended"),
});

/**
 * Admin create schema — status is unrestricted, defaults to 'in_collection'.
 * Only used when the caller is authenticated.
 */
export const adminCreateVinylSchema = vinylBaseSchema.extend({
  status: z.enum(vinylStatusValues).default("in_collection"),
});

/**
 * Admin / full update schema — all fields optional except id, status unrestricted.
 */
export const updateVinylSchema = vinylBaseSchema.partial().extend({
  id: z.string().uuid("Invalid vinyl ID"),
});

export const deleteVinylSchema = z.object({
  id: z.string().uuid("Invalid vinyl ID"),
});

export type CreateVinylInput = z.infer<typeof createVinylSchema>;
export type AdminCreateVinylInput = z.infer<typeof adminCreateVinylSchema>;
export type UpdateVinylInput = z.infer<typeof updateVinylSchema>;
export type DeleteVinylInput = z.infer<typeof deleteVinylSchema>;
