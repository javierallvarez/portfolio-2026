"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { KeyRound, AlertCircle, Clock } from "lucide-react";
import { trackEventAction } from "@/actions/telemetry";

// ─── JWT helpers (100% client-side) ──────────────────────────────────────────

function base64UrlDecode(str: string): string {
  const padded = str
    .replace(/-/g, "+")
    .replace(/_/g, "/")
    .padEnd(str.length + ((4 - (str.length % 4)) % 4), "=");
  try {
    // Handles UTF-8 characters correctly
    return decodeURIComponent(
      atob(padded)
        .split("")
        .map((c) => "%" + c.charCodeAt(0).toString(16).padStart(2, "0"))
        .join(""),
    );
  } catch {
    return atob(padded);
  }
}

interface JwtDecoded {
  header: Record<string, unknown>;
  payload: Record<string, unknown>;
  isExpired: boolean;
}

function tryDecodeJwt(token: string): JwtDecoded | null {
  const parts = token.trim().split(".");
  if (parts.length !== 3) return null;
  try {
    const header = JSON.parse(base64UrlDecode(parts[0])) as Record<string, unknown>;
    const payload = JSON.parse(base64UrlDecode(parts[1])) as Record<string, unknown>;
    const exp = typeof payload.exp === "number" ? payload.exp : null;
    return { header, payload, isExpired: exp !== null && exp * 1000 < Date.now() };
  } catch {
    return null;
  }
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function JsonBlock({ label, data }: { label: string; data: Record<string, unknown> }) {
  return (
    <div className="space-y-1.5">
      <p className="text-default-400 text-[11px] font-semibold tracking-wider uppercase">{label}</p>
      <pre className="border-divider bg-content2 overflow-x-auto rounded-xl border px-4 py-3 font-mono text-xs leading-relaxed text-teal-300">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function JwtDecoder() {
  const [token, setToken] = useState("");

  const result = useMemo(() => {
    if (!token.trim()) return undefined;
    return tryDecodeJwt(token);
  }, [token]);

  // Fire telemetry once per valid decode — no setState, so useEffect is safe
  const prevTokenRef = useRef("");
  useEffect(() => {
    if (result && token !== prevTokenRef.current) {
      prevTokenRef.current = token;
      void trackEventAction("jwt_decoded");
    }
  }, [result, token]);

  const isInvalid = token.trim().length > 0 && result === null;

  return (
    <div className="border-divider bg-content1 col-span-full space-y-5 rounded-2xl border p-6">
      {/* Header */}
      <div className="flex items-center gap-2.5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-500/10 ring-1 ring-teal-500/20">
          <KeyRound size={16} className="text-teal-400" />
        </div>
        <div>
          <p className="text-foreground font-serif text-base font-normal">JWT Decoder</p>
          <p className="text-default-400 text-xs">
            100% client-side · your token never leaves the browser
          </p>
        </div>
      </div>

      {/* Input */}
      <div className="space-y-1.5">
        <label htmlFor="jwt-input" className="text-default-500 text-xs">
          Paste your encoded JWT
        </label>
        <textarea
          id="jwt-input"
          rows={3}
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
          spellCheck={false}
          className="border-divider bg-content2 text-foreground placeholder-default-400 w-full resize-none rounded-xl border px-4 py-2.5 font-mono text-xs transition-all outline-none focus:border-teal-500/60 focus:ring-1 focus:ring-teal-500/30"
        />
      </div>

      {/* Error state */}
      {isInvalid && (
        <div className="border-danger/40 bg-danger/5 text-danger flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm">
          <AlertCircle size={14} className="shrink-0" />
          Invalid JWT — must have exactly three base64url-encoded segments separated by dots.
        </div>
      )}

      {/* Decoded output */}
      {result && (
        <div className="space-y-4">
          {result.isExpired && (
            <div className="border-warning/40 bg-warning/5 text-warning flex items-center gap-2 rounded-xl border px-4 py-2 text-sm">
              <Clock size={14} className="shrink-0" />
              This token has <strong>expired</strong> (exp:{" "}
              <code className="font-mono text-xs">
                {new Date((result.payload.exp as number) * 1000).toUTCString()}
              </code>
              )
            </div>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            <JsonBlock label="Header" data={result.header} />
            <JsonBlock label="Payload" data={result.payload} />
          </div>
        </div>
      )}
    </div>
  );
}
