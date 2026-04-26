"use client";

import { useState, useCallback } from "react";
import { Braces, AlertCircle, Minimize2, Maximize2, Copy, Check } from "lucide-react";
import { trackEventAction } from "@/actions/telemetry";

const PLACEHOLDER = `{"name":"Javier","role":"Software Engineer","skills":["TypeScript","Next.js","PostgreSQL"]}`;

export function JsonFormatter() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const process = useCallback((raw: string, mode: "pretty" | "minify") => {
    setError("");
    setOutput("");

    const trimmed = raw.trim();
    if (!trimmed) return;

    try {
      const parsed = JSON.parse(trimmed) as unknown;
      const formatted =
        mode === "pretty" ? JSON.stringify(parsed, null, 2) : JSON.stringify(parsed);
      setOutput(formatted);
      void trackEventAction("json_formatted");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid JSON");
    }
  }, []);

  const copy = useCallback(async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [output]);

  return (
    <div className="border-divider bg-content1 col-span-full space-y-5 rounded-2xl border p-6">
      {/* Header */}
      <div className="flex items-center gap-2.5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-500/10 ring-1 ring-teal-500/20">
          <Braces size={16} className="text-teal-400" />
        </div>
        <div>
          <p className="text-foreground font-serif text-base font-normal">
            JSON Formatter &amp; Validator
          </p>
          <p className="text-default-400 text-xs">Prettify, minify, and validate in one click</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {/* Input */}
        <div className="space-y-1.5">
          <label htmlFor="json-input" className="text-default-500 text-xs">
            Raw JSON
          </label>
          <textarea
            id="json-input"
            rows={10}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setOutput("");
              setError("");
            }}
            placeholder={PLACEHOLDER}
            spellCheck={false}
            className="border-divider bg-content2 text-foreground placeholder-default-400 w-full resize-none rounded-xl border px-4 py-2.5 font-mono text-xs transition-all outline-none focus:border-teal-500/60 focus:ring-1 focus:ring-teal-500/30"
          />

          {/* Action buttons */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => process(input, "pretty")}
              disabled={!input.trim()}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-teal-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-teal-400 disabled:opacity-40"
            >
              <Maximize2 size={13} />
              Prettify
            </button>
            <button
              type="button"
              onClick={() => process(input, "minify")}
              disabled={!input.trim()}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-teal-500/40 px-4 py-2 text-sm font-medium text-teal-400 transition-colors hover:bg-teal-500/10 disabled:opacity-40"
            >
              <Minimize2 size={13} />
              Minify
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="border-danger/40 bg-danger/5 text-danger flex items-start gap-2 rounded-xl border px-4 py-2.5 text-xs">
              <AlertCircle size={13} className="mt-0.5 shrink-0" />
              <span className="font-mono break-all">{error}</span>
            </div>
          )}
        </div>

        {/* Output */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-default-500 text-xs">Formatted output</span>
            {output && (
              <button
                type="button"
                onClick={() => void copy()}
                className="text-default-400 flex items-center gap-1 text-[11px] transition-colors hover:text-teal-400"
              >
                {copied ? <Check size={12} className="text-teal-400" /> : <Copy size={12} />}
                {copied ? "Copied!" : "Copy"}
              </button>
            )}
          </div>
          <pre
            className={[
              "h-[calc(100%-28px)] min-h-[200px] overflow-auto rounded-xl border px-4 py-3 font-mono text-xs leading-relaxed",
              output
                ? "border-teal-500/30 bg-teal-500/5 text-teal-300"
                : "border-divider bg-content2 text-default-400",
            ].join(" ")}
          >
            {output || <span className="italic">Output will appear here…</span>}
          </pre>
        </div>
      </div>
    </div>
  );
}
