/**
 * Discogs API utility — server-side only.
 *
 * The DISCOGS_TOKEN is never exposed to the client bundle; all calls to this
 * module must originate from Server Actions or Route Handlers.
 */

const DISCOGS_API_BASE = "https://api.discogs.com";

export interface DiscogsResult {
  discogsId: number;
  title: string;
  artist: string;
  year: number | null;
  coverUrl: string | null;
  thumb: string | null;
  genre: string | null;
}

interface DiscogsRawResult {
  id: number;
  title: string;
  year?: string;
  cover_image?: string;
  thumb?: string;
  genre?: string[];
  style?: string[];
}

interface DiscogsSearchResponse {
  results: DiscogsRawResult[];
}

/**
 * Parses a Discogs title string into separate artist and album title.
 *
 * Discogs formats combined titles as "Artist - Album Title". If no separator
 * is found, the entire string is treated as the title with an unknown artist.
 */
function parseTitleArtist(raw: string): { artist: string; title: string } {
  const sep = " - ";
  const idx = raw.indexOf(sep);
  if (idx === -1) return { artist: "Unknown", title: raw.trim() };
  return {
    artist: raw.substring(0, idx).trim(),
    title: raw.substring(idx + sep.length).trim(),
  };
}

/**
 * Searches the Discogs database for releases matching `query`.
 *
 * Returns up to 10 results with parsed artist, title, year, and cover art.
 * Throws if `DISCOGS_TOKEN` is not configured.
 */
export async function searchDiscogs(query: string): Promise<DiscogsResult[]> {
  const token = process.env.DISCOGS_TOKEN;
  if (!token) {
    throw new Error("DISCOGS_TOKEN is not configured. Add it to your .env.local file.");
  }

  if (!query.trim()) return [];

  const url = new URL(`${DISCOGS_API_BASE}/database/search`);
  url.searchParams.set("q", query);
  url.searchParams.set("type", "release");
  url.searchParams.set("per_page", "10");

  const response = await fetch(url.toString(), {
    headers: {
      Authorization: `Discogs token=${token}`,
      "User-Agent": "JAG-Portfolio/1.0 +https://github.com/javieralaves/portfolio",
      Accept: "application/json",
    },
    // Do not cache search results — they should always be fresh
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Discogs API error: ${response.status} ${response.statusText}`);
  }

  const data: DiscogsSearchResponse = await response.json();

  return data.results.map((r) => {
    const { artist, title } = parseTitleArtist(r.title);
    // Prefer the broader genre classification; fall back to style (sub-genre)
    const genre = r.genre?.[0] ?? r.style?.[0] ?? null;
    return {
      discogsId: r.id,
      title,
      artist,
      year: r.year ? parseInt(r.year, 10) : null,
      coverUrl: r.cover_image ?? null,
      thumb: r.thumb ?? null,
      genre,
    };
  });
}
