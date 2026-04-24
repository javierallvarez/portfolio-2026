"use server";

import { searchDiscogs, type DiscogsResult } from "@/lib/external/discogs";

export interface SearchDiscogsResult {
  data: DiscogsResult[] | null;
  error: string | null;
}

/**
 * Server Action that proxies a Discogs search.
 *
 * Keeping the search in a Server Action ensures DISCOGS_TOKEN never
 * reaches the client bundle, regardless of how the component imports it.
 */
export async function searchDiscogsAction(query: string): Promise<SearchDiscogsResult> {
  if (!query || query.trim().length < 2) {
    return { data: [], error: null };
  }

  try {
    const results = await searchDiscogs(query.trim());
    return { data: results, error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Search failed";
    return { data: null, error: message };
  }
}
