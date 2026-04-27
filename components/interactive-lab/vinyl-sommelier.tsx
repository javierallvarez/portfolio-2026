"use client";

import { useState, useRef, useCallback } from "react";
import { Sparkles, SendHorizontal, Loader2, Disc3 } from "lucide-react";

const SUGGESTIONS = [
  "cooking something ambitious on a Sunday afternoon",
  "debugging a gnarly bug at midnight",
  "reading on a rainy day",
  "having friends over for drinks",
  "a long drive with nowhere to be",
  "trying to focus and get into flow",
];

export function VinylSommelier() {
  const [mood, setMood] = useState("");
  const [recommendation, setRecommendation] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const abortRef = useRef<AbortController | null>(null);

  const ask = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isLoading) return;

      // Cancel any in-flight request
      abortRef.current?.abort();
      abortRef.current = new AbortController();

      setIsLoading(true);
      setRecommendation("");
      setError("");

      try {
        const res = await fetch("/api/sommelier", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ mood: trimmed }),
          signal: abortRef.current.signal,
        });

        if (!res.body) throw new Error("No response body");

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let accumulated = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          accumulated += decoder.decode(value, { stream: true });
          setRecommendation(accumulated);
        }
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") return;
        setError("Something went wrong reaching the sommelier. Try again!");
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading],
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void ask(mood);
  };

  const applySuggestion = (s: string) => {
    setMood(s);
    void ask(s);
  };

  return (
    <section
      className="space-y-5 rounded-2xl border border-teal-500/20 bg-gradient-to-br from-teal-500/5 via-transparent to-cyan-500/5 p-6"
      aria-label="Vinyl Sommelier"
    >
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-500/10 ring-1 ring-teal-500/20">
          <Sparkles size={18} className="text-teal-400" aria-hidden="true" />
        </div>
        <div>
          <h2 className="text-foreground font-serif text-lg font-normal">
            Ask the Vinyl Sommelier
          </h2>
          <p className="text-default-500 mt-0.5 text-sm">
            Tell the AI what you&apos;re doing or how you&apos;re feeling, and it will pick the
            perfect record from my collection for you.
          </p>
        </div>
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={mood}
          onChange={(e) => setMood(e.target.value)}
          placeholder="e.g. cooking on a Sunday afternoon…"
          disabled={isLoading}
          className="border-divider bg-content2 text-foreground placeholder-default-400 min-w-0 flex-1 rounded-xl border px-4 py-2.5 text-sm transition-all outline-none focus:border-teal-500/60 focus:ring-1 focus:ring-teal-500/30 disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={!mood.trim() || isLoading}
          className="flex shrink-0 items-center gap-1.5 rounded-xl bg-teal-500 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-teal-400 disabled:opacity-40"
          aria-label="Get recommendation"
        >
          {isLoading ? (
            <Loader2 size={16} className="animate-spin" aria-hidden="true" />
          ) : (
            <SendHorizontal size={16} aria-hidden="true" />
          )}
          <span className="hidden sm:inline">Ask</span>
        </button>
      </form>

      {/* Suggestion chips */}
      {!recommendation && !isLoading && (
        <div className="flex flex-wrap gap-2">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => applySuggestion(s)}
              className="rounded-full border border-teal-500/20 bg-teal-500/5 px-3 py-1 text-xs text-teal-400 transition-colors hover:bg-teal-500/10"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Error */}
      {error && <p className="text-danger text-sm">{error}</p>}

      {/* Streaming recommendation */}
      {(recommendation || isLoading) && (
        <div className="space-y-2 rounded-xl border border-teal-500/20 bg-teal-500/5 p-4">
          <div className="flex items-center gap-2 text-xs font-semibold tracking-widest text-teal-500/70 uppercase">
            <Disc3 size={13} className={isLoading ? "animate-spin" : ""} aria-hidden="true" />
            Sommelier&apos;s Pick
          </div>
          <p className="text-foreground text-sm leading-relaxed whitespace-pre-wrap">
            {recommendation}
            {isLoading && (
              <span className="ml-0.5 inline-block h-4 w-0.5 animate-pulse bg-teal-400 align-middle" />
            )}
          </p>
        </div>
      )}
    </section>
  );
}
