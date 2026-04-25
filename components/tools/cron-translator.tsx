"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { Terminal, AlertCircle, CheckCircle2 } from "lucide-react";
import cronstrue from "cronstrue";
import { trackEventAction } from "@/actions/telemetry";

const EXAMPLES = ["0 12 * * *", "*/5 * * * *", "0 9 * * 1-5", "30 6 1 * *"];

function parseCron(expression: string): { description: string; error: string } {
  const trimmed = expression.trim();
  if (!trimmed) return { description: "", error: "" };
  try {
    return {
      description: cronstrue.toString(trimmed, { throwExceptionOnParseError: true }),
      error: "",
    };
  } catch {
    return { description: "", error: "Invalid cron expression" };
  }
}

export function CronTranslator() {
  const [expression, setExpression] = useState("0 12 * * *");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Derive description/error synchronously on each render — no setState in effect
  const { description, error } = useMemo(() => parseCron(expression), [expression]);

  // Side-effect: debounced telemetry when a valid translation exists
  useEffect(() => {
    if (!description) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      void trackEventAction("cron_translated");
    }, 600);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [description]);

  return (
    <div className="border-divider bg-content1 space-y-5 rounded-2xl border p-6">
      {/* Header */}
      <div className="flex items-center gap-2.5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-500/10 ring-1 ring-teal-500/20">
          <Terminal size={16} className="text-teal-400" />
        </div>
        <div>
          <p className="text-foreground font-serif text-base font-normal">Cron Translator</p>
          <p className="text-default-400 text-xs">Paste any cron expression — get plain English</p>
        </div>
      </div>

      {/* Input */}
      <div className="space-y-1.5">
        <label htmlFor="cron-input" className="text-default-500 text-xs">
          Cron expression
        </label>
        <input
          id="cron-input"
          type="text"
          value={expression}
          onChange={(e) => setExpression(e.target.value)}
          placeholder="0 12 * * *"
          spellCheck={false}
          className="border-divider bg-content2 text-foreground placeholder-default-400 w-full rounded-xl border px-4 py-2.5 font-mono text-sm transition-all outline-none focus:border-teal-500/60 focus:ring-1 focus:ring-teal-500/30"
        />
      </div>

      {/* Output */}
      <div
        className={[
          "min-h-[56px] rounded-xl border px-4 py-3 text-sm transition-colors",
          error
            ? "border-danger/40 bg-danger/5 text-danger"
            : description
              ? "border-teal-500/30 bg-teal-500/5 text-teal-300"
              : "border-divider bg-content2 text-default-400",
        ].join(" ")}
      >
        {error ? (
          <span className="flex items-center gap-1.5">
            <AlertCircle size={14} />
            {error}
          </span>
        ) : description ? (
          <span className="flex items-start gap-1.5">
            <CheckCircle2 size={14} className="mt-0.5 shrink-0" />
            {description}
          </span>
        ) : (
          <span className="italic">Translation will appear here…</span>
        )}
      </div>

      {/* Example chips */}
      <div className="space-y-1.5">
        <p className="text-default-400 text-[11px]">Try an example:</p>
        <div className="flex flex-wrap gap-2">
          {EXAMPLES.map((ex) => (
            <button
              key={ex}
              type="button"
              onClick={() => setExpression(ex)}
              className="bg-content2 text-default-500 rounded-full border border-zinc-700 px-3 py-1 font-mono text-[11px] transition-colors hover:border-teal-500/40 hover:text-teal-300"
            >
              {ex}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
