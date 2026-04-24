"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import Image from "next/image";
import { Button, toast } from "@heroui/react";
import { searchDiscogsAction } from "@/actions/search";
import { createVinylAction } from "@/actions/vinyls";
import type { DiscogsResult } from "@/lib/external/discogs";

// ─── Types ────────────────────────────────────────────────────────────────────

interface VinylSearchProps {
  isAdmin: boolean;
}

// ─── Component ───────────────────────────────────────────────────────────────

/**
 * Discogs-powered search bar that lets visitors recommend vinyls to the
 * recommendations list, and lets the admin add records directly to the collection.
 *
 * Search calls are debounced via a timeout ref so the Discogs API isn't
 * hammered on every keystroke. The Server Action keeps the API token
 * server-side — it never appears in the client bundle.
 */
export function VinylSearch({ isAdmin }: VinylSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<DiscogsResult[]>([]);
  const [selected, setSelected] = useState<DiscogsResult | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const [isSearching, startSearch] = useTransition();
  const [isSubmitting, startSubmit] = useTransition();

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Close results dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleQueryChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setQuery(value);
    setSelected(null);
    setSearchError(null);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (value.trim().length < 2) {
      setResults([]);
      setShowResults(false);
      return;
    }

    debounceRef.current = setTimeout(() => {
      startSearch(async () => {
        const { data, error } = await searchDiscogsAction(value);
        if (error) {
          setSearchError(error);
          setResults([]);
        } else {
          setResults(data ?? []);
          setShowResults(true);
        }
      });
    }, 400);
  }

  function handleSelect(result: DiscogsResult) {
    setSelected(result);
    setQuery(`${result.artist} — ${result.title}`);
    setShowResults(false);
  }

  function handleSubmit(status: "recommended" | "in_collection") {
    if (!selected) return;

    startSubmit(async () => {
      const result = await createVinylAction({
        title: selected.title,
        artist: selected.artist,
        year: selected.year ?? new Date().getFullYear(),
        coverUrl: selected.coverUrl ?? "",
        status,
      });

      if (result.success) {
        toast.success(
          status === "in_collection"
            ? `"${selected.title}" added to your collection!`
            : `"${selected.title}" recommended to the community list!`,
        );
        setQuery("");
        setSelected(null);
        setResults([]);
      } else {
        toast.danger(result.error ?? "Something went wrong");
      }
    });
  }

  return (
    <div className="space-y-4">
      {/* ── Search input ── */}
      <div ref={wrapperRef} className="relative max-w-xl">
        <div className="border-divider bg-content1 focus-within:ring-primary/50 flex items-center gap-2 rounded-lg border px-3 py-2 transition-all focus-within:ring-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-default-400 flex-shrink-0"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            value={query}
            onChange={handleQueryChange}
            onFocus={() => results.length > 0 && setShowResults(true)}
            placeholder="Search Discogs… e.g. 'Miles Davis Kind of Blue'"
            aria-label="Search Discogs for vinyl records"
            disabled={isSubmitting}
            className="placeholder:text-default-400 min-w-0 flex-1 bg-transparent text-sm outline-none disabled:cursor-not-allowed disabled:opacity-50"
          />
          {isSearching && (
            <span className="text-default-400 text-xs" aria-live="polite">
              Searching…
            </span>
          )}
        </div>

        {/* ── Results dropdown ── */}
        {showResults && results.length > 0 && (
          <ul
            role="listbox"
            aria-label="Discogs search results"
            className="border-divider bg-background absolute top-full z-50 mt-1 max-h-96 w-full overflow-y-auto rounded-md border shadow-lg"
          >
            {results.map((r) => (
              <li
                key={r.discogsId}
                role="option"
                aria-selected={selected?.discogsId === r.discogsId}
              >
                <button
                  type="button"
                  onClick={() => handleSelect(r)}
                  className="hover:bg-content2 flex w-full items-center gap-3 px-3 py-2 text-left transition-colors"
                >
                  {r.thumb ? (
                    <Image
                      src={r.thumb}
                      alt=""
                      width={40}
                      height={40}
                      className="h-10 w-10 flex-shrink-0 rounded object-cover"
                      unoptimized
                    />
                  ) : (
                    <div
                      className="bg-content3 h-10 w-10 flex-shrink-0 rounded"
                      aria-hidden="true"
                    />
                  )}
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{r.title}</p>
                    <p className="text-default-500 truncate text-xs">
                      {r.artist}
                      {r.year ? ` · ${r.year}` : ""}
                    </p>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}

        {/* ── No results message ── */}
        {showResults && results.length === 0 && !isSearching && query.trim().length >= 2 && (
          <div className="border-divider bg-background absolute top-full z-50 mt-1 w-full rounded-md border px-4 py-3 text-sm shadow-lg">
            No results found for &ldquo;{query}&rdquo;
          </div>
        )}

        {/* ── Error message ── */}
        {searchError && <p className="text-danger mt-1 text-xs">{searchError}</p>}
      </div>

      {/* ── Preview card ── */}
      {selected && (
        <div className="border-divider bg-content1 max-w-xl rounded-xl border p-4">
          <div className="flex gap-4">
            {selected.coverUrl ? (
              <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg">
                <Image
                  src={selected.coverUrl}
                  alt={`${selected.title} cover art`}
                  fill
                  sizes="96px"
                  className="object-cover"
                  unoptimized
                />
              </div>
            ) : (
              <div
                className="bg-content3 text-default-400 flex h-24 w-24 flex-shrink-0 items-center justify-center rounded-lg text-xs"
                aria-label="No cover art available"
              >
                No cover
              </div>
            )}
            <div className="flex min-w-0 flex-col justify-between gap-2">
              <div>
                <p className="text-sm font-semibold">{selected.title}</p>
                <p className="text-default-500 text-sm">{selected.artist}</p>
                {selected.year && <p className="text-default-400 text-xs">{selected.year}</p>}
              </div>

              <div className="flex flex-wrap gap-2">
                {isAdmin ? (
                  <>
                    <Button
                      size="sm"
                      variant="primary"
                      isDisabled={isSubmitting}
                      onPress={() => handleSubmit("in_collection")}
                    >
                      {isSubmitting ? "Adding…" : "Add to Collection"}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      isDisabled={isSubmitting}
                      onPress={() => handleSubmit("recommended")}
                    >
                      {isSubmitting ? "Adding…" : "Recommend this Vinyl"}
                    </Button>
                  </>
                ) : (
                  <Button
                    size="sm"
                    variant="primary"
                    isDisabled={isSubmitting}
                    onPress={() => handleSubmit("recommended")}
                  >
                    {isSubmitting ? "Adding…" : "Recommend this Vinyl"}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
