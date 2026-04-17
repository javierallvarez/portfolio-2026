"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { movies } from "@/lib/db/schema";
import { createMovieSchema, updateMovieSchema, deleteMovieSchema } from "@/lib/validations/movie";
import { sanitizeObject } from "@/lib/security/sanitize";
import { checkRateLimit } from "@/lib/rate-limit";
import { eq } from "drizzle-orm";
import type { CreateMovieInput, UpdateMovieInput, DeleteMovieInput } from "@/lib/validations/movie";

// ─── Response Shape ────────────────────────────────────────────────────────────

export type ActionResult<T = undefined> =
  | { success: true; data?: T }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };

// ─── Create ────────────────────────────────────────────────────────────────────

export async function createMovieAction(input: CreateMovieInput): Promise<ActionResult> {
  await checkRateLimit("movies:create");

  const parsed = createMovieSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: "Validation failed",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const sanitized = sanitizeObject(parsed.data);

  await db.insert(movies).values(sanitized);
  revalidatePath("/movies");

  return { success: true };
}

// ─── Update ────────────────────────────────────────────────────────────────────

export async function updateMovieAction(input: UpdateMovieInput): Promise<ActionResult> {
  await checkRateLimit("movies:create");

  const parsed = updateMovieSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: "Validation failed",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const { id, ...fields } = parsed.data;
  const sanitized = sanitizeObject(fields);

  await db.update(movies).set(sanitized).where(eq(movies.id, id));
  revalidatePath("/movies");

  return { success: true };
}

// ─── Delete ────────────────────────────────────────────────────────────────────

export async function deleteMovieAction(input: DeleteMovieInput): Promise<ActionResult> {
  await checkRateLimit("movies:create");

  const parsed = deleteMovieSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Invalid movie ID" };
  }

  await db.delete(movies).where(eq(movies.id, parsed.data.id));
  revalidatePath("/movies");

  return { success: true };
}

// ─── Read ──────────────────────────────────────────────────────────────────────

export async function getMoviesAction() {
  await checkRateLimit("movies:read");
  return db.select().from(movies).orderBy(movies.createdAt);
}
