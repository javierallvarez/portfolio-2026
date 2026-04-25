"use client";

import { useState, useCallback } from "react";
import { RefreshCw, Copy, Check, Lock } from "lucide-react";
import { trackEventAction } from "@/actions/telemetry";

const UPPERCASE = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const LOWERCASE = "abcdefghijklmnopqrstuvwxyz";
const NUMBERS = "0123456789";
const SYMBOLS = "!@#$%^&*()-_=+[]{}|;:,.<>?";

function generatePassword(
  length: number,
  opts: { upper: boolean; numbers: boolean; symbols: boolean },
): string {
  let charset = LOWERCASE;
  if (opts.upper) charset += UPPERCASE;
  if (opts.numbers) charset += NUMBERS;
  if (opts.symbols) charset += SYMBOLS;

  const array = new Uint32Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, (n) => charset[n % charset.length]).join("");
}

export function PasswordGenerator() {
  const [length, setLength] = useState(20);
  const [upper, setUpper] = useState(true);
  const [numbers, setNumbers] = useState(true);
  const [symbols, setSymbols] = useState(true);
  const [password, setPassword] = useState(() =>
    generatePassword(20, { upper: true, numbers: true, symbols: true }),
  );
  const [copied, setCopied] = useState(false);

  const generate = useCallback(() => {
    const pw = generatePassword(length, { upper, numbers, symbols });
    setPassword(pw);
    void trackEventAction("password_generated");
  }, [length, upper, numbers, symbols]);

  const copy = useCallback(async () => {
    await navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [password]);

  return (
    <div className="border-divider bg-content1 space-y-5 rounded-2xl border p-6">
      {/* Header */}
      <div className="flex items-center gap-2.5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-500/10 ring-1 ring-teal-500/20">
          <Lock size={16} className="text-teal-400" />
        </div>
        <div>
          <p className="text-foreground font-serif text-base font-normal">Password Generator</p>
          <p className="text-default-400 text-xs">Cryptographically secure · client-side only</p>
        </div>
      </div>

      {/* Output */}
      <div className="border-divider bg-content2 flex items-center gap-2 rounded-xl border px-4 py-3">
        <code className="text-foreground min-w-0 flex-1 truncate font-mono text-sm">
          {password}
        </code>
        <button
          type="button"
          onClick={() => void copy()}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-colors hover:bg-teal-500/10"
          aria-label="Copy password"
        >
          {copied ? (
            <Check size={14} className="text-teal-400" />
          ) : (
            <Copy size={14} className="text-default-400" />
          )}
        </button>
      </div>

      {/* Length slider */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-default-500">Length</span>
          <span className="font-mono font-semibold text-teal-400">{length}</span>
        </div>
        <input
          type="range"
          min={8}
          max={64}
          value={length}
          onChange={(e) => setLength(Number(e.target.value))}
          className="w-full accent-teal-400"
          aria-label="Password length"
        />
        <div className="text-default-400 flex justify-between text-[10px]">
          <span>8</span>
          <span>64</span>
        </div>
      </div>

      {/* Toggles */}
      <div className="flex flex-wrap gap-3">
        {[
          { label: "Uppercase", value: upper, set: setUpper },
          { label: "Numbers", value: numbers, set: setNumbers },
          { label: "Symbols", value: symbols, set: setSymbols },
        ].map(({ label, value, set }) => (
          <label key={label} className="flex cursor-pointer items-center gap-2 text-sm select-none">
            <input
              type="checkbox"
              checked={value}
              onChange={(e) => set(e.target.checked)}
              className="accent-teal-400"
            />
            <span className="text-default-500">{label}</span>
          </label>
        ))}
      </div>

      {/* Generate button */}
      <button
        type="button"
        onClick={generate}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-teal-500 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-teal-400"
      >
        <RefreshCw size={14} />
        Generate
      </button>
    </div>
  );
}
