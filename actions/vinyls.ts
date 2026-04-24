"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { vinyls } from "@/lib/db/schema";
import { createVinylSchema, updateVinylSchema, deleteVinylSchema } from "@/lib/validations/vinyl";
import { sanitizeObject } from "@/lib/security/sanitize";
import { checkRateLimit } from "@/lib/rate-limit";
import { eq } from "drizzle-orm";
import type { CreateVinylInput, UpdateVinylInput, DeleteVinylInput } from "@/lib/validations/vinyl";

// ─── Response Shape ────────────────────────────────────────────────────────────

export type ActionResult<T = undefined> =
  | { success: true; data?: T }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };

// ─── Create (public — status always 'wishlist') ───────────────────────────────

export async function createVinylAction(input: CreateVinylInput): Promise<ActionResult> {
  await checkRateLimit("vinyls:create");

  const parsed = createVinylSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: "Validation failed",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const sanitized = sanitizeObject(parsed.data);

  await db.insert(vinyls).values(sanitized);
  revalidatePath("/interactive-lab");

  return { success: true };
}

// ─── Update (admin) ───────────────────────────────────────────────────────────

export async function updateVinylAction(input: UpdateVinylInput): Promise<ActionResult> {
  await checkRateLimit("vinyls:create");

  const parsed = updateVinylSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: "Validation failed",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const { id, ...fields } = parsed.data;
  const sanitized = sanitizeObject(fields);

  await db.update(vinyls).set(sanitized).where(eq(vinyls.id, id));
  revalidatePath("/interactive-lab");

  return { success: true };
}

// ─── Delete ───────────────────────────────────────────────────────────────────

export async function deleteVinylAction(input: DeleteVinylInput): Promise<ActionResult> {
  await checkRateLimit("vinyls:create");

  const parsed = deleteVinylSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Invalid vinyl ID" };
  }

  await db.delete(vinyls).where(eq(vinyls.id, parsed.data.id));
  revalidatePath("/interactive-lab");

  return { success: true };
}

// ─── Read ─────────────────────────────────────────────────────────────────────

export async function getVinylsAction() {
  await checkRateLimit("vinyls:read");
  return db.select().from(vinyls).orderBy(vinyls.createdAt);
}
