"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { vinyls } from "@/lib/db/schema";
import {
  createVinylSchema,
  adminCreateVinylSchema,
  updateVinylSchema,
  deleteVinylSchema,
} from "@/lib/validations/vinyl";
import { sanitizeObject } from "@/lib/security/sanitize";
import { checkRateLimit } from "@/lib/rate-limit";
import { eq } from "drizzle-orm";
import type { UpdateVinylInput, DeleteVinylInput } from "@/lib/validations/vinyl";

// ─── Response Shape ────────────────────────────────────────────────────────────

export type ActionResult<T = undefined> =
  | { success: true; data?: T }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function requireAuth(): Promise<{ userId: string } | { error: ActionResult }> {
  const { userId } = await auth();
  if (!userId) return { error: { success: false, error: "Unauthorized" } };
  return { userId };
}

// ─── Create ───────────────────────────────────────────────────────────────────
//
// RBAC:
//   - Anonymous visitors  → status forced to "recommended" (community recommendation)
//   - Authenticated admin → any status, defaults to "in_collection"

export async function createVinylAction(input: Record<string, unknown>): Promise<ActionResult> {
  await checkRateLimit("vinyls:create");

  const { userId } = await auth();

  const schema = userId ? adminCreateVinylSchema : createVinylSchema;
  const parsed = schema.safeParse(input);

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

// ─── Update (admin only) ──────────────────────────────────────────────────────

export async function updateVinylAction(input: UpdateVinylInput): Promise<ActionResult> {
  const authResult = await requireAuth();
  if ("error" in authResult) return authResult.error;

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

// ─── Delete (admin only) ──────────────────────────────────────────────────────

export async function deleteVinylAction(input: DeleteVinylInput): Promise<ActionResult> {
  const authResult = await requireAuth();
  if ("error" in authResult) return authResult.error;

  await checkRateLimit("vinyls:create");

  const parsed = deleteVinylSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Invalid vinyl ID" };
  }

  await db.delete(vinyls).where(eq(vinyls.id, parsed.data.id));
  revalidatePath("/interactive-lab");

  return { success: true };
}

// ─── Now Spinning (admin only) ────────────────────────────────────────────────
//
// Single-selection: sets is_now_spinning = true for the target vinyl and
// false for all others. If the target is already spinning, clears all
// (acts as a toggle to stop playback).

export async function setNowSpinningAction(id: string): Promise<ActionResult> {
  const authResult = await requireAuth();
  if ("error" in authResult) return authResult.error;

  await checkRateLimit("vinyls:create");

  const parsed = deleteVinylSchema.safeParse({ id });
  if (!parsed.success) return { success: false, error: "Invalid vinyl ID" };

  // Read current state to implement toggle
  const [current] = await db
    .select({ isNowSpinning: vinyls.isNowSpinning })
    .from(vinyls)
    .where(eq(vinyls.id, id));

  // Clear all first (ensures single-selection invariant)
  await db.update(vinyls).set({ isNowSpinning: false });

  // Toggle: only set to true if it wasn't already spinning
  if (!current?.isNowSpinning) {
    await db.update(vinyls).set({ isNowSpinning: true }).where(eq(vinyls.id, id));
  }

  revalidatePath("/interactive-lab");
  return { success: true };
}

// ─── Read (public) ────────────────────────────────────────────────────────────

export async function getVinylsAction() {
  await checkRateLimit("vinyls:read");
  return db.select().from(vinyls).orderBy(vinyls.createdAt);
}
