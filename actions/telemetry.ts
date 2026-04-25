"use server";

import { db } from "@/lib/db";
import { telemetryEvents } from "@/lib/db/schema";
import { count } from "drizzle-orm";

// ─── Known event types ────────────────────────────────────────────────────────

export type EventType = "password_generated" | "cron_translated" | "discogs_searched";

// ─── Track ────────────────────────────────────────────────────────────────────

/**
 * Fire-and-forget — inserts a single telemetry row.
 * Errors are silently caught so tracking never breaks the calling UI.
 */
export async function trackEventAction(eventType: EventType): Promise<void> {
  try {
    await db.insert(telemetryEvents).values({ eventType });
  } catch {
    // Intentionally silent — telemetry must never block or break the UI
  }
}

// ─── Stats ────────────────────────────────────────────────────────────────────

export interface TelemetryStats {
  password_generated: number;
  cron_translated: number;
  discogs_searched: number;
}

/**
 * Returns the total event count grouped by type.
 * Returns zeros gracefully if the table doesn't exist yet or the DB is down.
 */
export async function getTelemetryStatsAction(): Promise<TelemetryStats> {
  const defaults: TelemetryStats = {
    password_generated: 0,
    cron_translated: 0,
    discogs_searched: 0,
  };

  try {
    const rows = await db
      .select({ eventType: telemetryEvents.eventType, total: count() })
      .from(telemetryEvents)
      .groupBy(telemetryEvents.eventType);

    const stats = { ...defaults };
    for (const row of rows) {
      const key = row.eventType as keyof TelemetryStats;
      if (key in stats) stats[key] = Number(row.total);
    }
    return stats;
  } catch {
    return defaults;
  }
}
