"use client";

/**
 * Minimal theme provider that replaces next-themes.
 *
 * Why: next-themes v0.4.x renders a <script> element inside a React client
 * component to prevent theme flash (FOUC). React 19 emits a console.error for
 * any inline <script> rendered inside a client component. We solve FOUC
 * separately by placing a synchronous inline script in the Server Component
 * <head> in app/layout.tsx — so this module only needs to manage reactive state.
 *
 * Implementation uses `useSyncExternalStore` (the React-blessed API for
 * external stores) to avoid the react-hooks/set-state-in-effect lint error.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export type Theme = "light" | "dark" | "system";

interface ThemeContextValue {
  /** The stored preference: "light" | "dark" | "system" */
  theme: Theme;
  /** The resolved, actually-applied theme: "light" | "dark" */
  resolvedTheme: "light" | "dark";
  setTheme: (theme: Theme) => void;
}

// ─── External store ───────────────────────────────────────────────────────────
// Module-level singleton so all consumers share the same state without a React
// state layer (which would require setState-in-effect to initialise from localStorage).

let _listeners: Array<() => void> = [];

function _subscribe(listener: () => void): () => void {
  _listeners = [..._listeners, listener];
  return () => {
    _listeners = _listeners.filter((l) => l !== listener);
  };
}

function _emit(): void {
  for (const l of _listeners) l();
}

function _readStored(): Theme {
  try {
    return (localStorage.getItem("theme") as Theme | null) ?? "system";
  } catch {
    return "system";
  }
}

function _systemPrefers(): "light" | "dark" {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function _resolve(t: Theme): "light" | "dark" {
  return t === "system" ? _systemPrefers() : t;
}

function _applyClass(resolved: "light" | "dark"): void {
  document.documentElement.classList.toggle("dark", resolved === "dark");
}

// ─── Context ──────────────────────────────────────────────────────────────────

const ThemeContext = createContext<Pick<ThemeContextValue, "setTheme">>({
  setTheme: () => undefined,
});

// ─── Provider ─────────────────────────────────────────────────────────────────

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Listen for cross-tab storage events and OS preference changes so all
  // useSyncExternalStore subscribers re-render when external state changes.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === "theme") _emit();
    };
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onMedia = () => {
      if (_readStored() === "system") {
        _applyClass(_systemPrefers());
        _emit();
      }
    };

    window.addEventListener("storage", onStorage);
    mq.addEventListener("change", onMedia);
    return () => {
      window.removeEventListener("storage", onStorage);
      mq.removeEventListener("change", onMedia);
    };
  }, []);

  const setTheme = useCallback((next: Theme) => {
    try {
      localStorage.setItem("theme", next);
    } catch {
      /* storage unavailable */
    }
    _applyClass(_resolve(next));
    _emit();
  }, []);

  const ctx = useMemo(() => ({ setTheme }), [setTheme]);

  return <ThemeContext.Provider value={ctx}>{children}</ThemeContext.Provider>;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/** Drop-in replacement for next-themes' useTheme — same shape, no script injection. */
export function useTheme(): ThemeContextValue {
  const { setTheme } = useContext(ThemeContext);

  // useSyncExternalStore gives us tearing-safe reads from localStorage.
  // getServerSnapshot returns "system" so SSR and client initial render match.
  const theme = useSyncExternalStore(_subscribe, _readStored, () => "system" as Theme);

  const resolvedTheme = useSyncExternalStore(
    _subscribe,
    () => _resolve(_readStored()),
    () => "dark" as const, // matches the FOUC script's dark-first assumption
  );

  return { theme, resolvedTheme, setTheme };
}
