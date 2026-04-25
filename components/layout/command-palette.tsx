"use client";

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { Kbd } from "@heroui/react";
import { Home, FlaskConical, Wrench, Settings, Sun, Moon, Bot, Bell, Search } from "lucide-react";
import { useCommandPalette } from "@/hooks/use-command-palette";
import { useCareerChatDrawer } from "@/hooks/use-career-chat-drawer";
import { AutomationConsole } from "@/components/ui/automation-console";

// ─── Command Definitions ───────────────────────────────────────────────────────

type CommandCategory = "Navigate" | "Theme" | "Actions" | "Automations (Mock)";

interface Command {
  id: string;
  label: string;
  description?: string;
  category: CommandCategory;
  icon: React.ReactNode;
  action: () => void;
}

function useCommands(onOpenConsole: () => void, onOpenChat: () => void): Command[] {
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  return useMemo(
    () => [
      {
        id: "nav-home",
        label: "Go to Home",
        category: "Navigate" as const,
        icon: <Home size={16} />,
        action: () => router.push("/"),
      },
      {
        id: "nav-interactive-lab",
        label: "Go to Interactive Lab",
        description: "Live database interactions, optimistic UI, and full-stack validation",
        category: "Navigate" as const,
        icon: <FlaskConical size={16} />,
        action: () => router.push("/interactive-lab"),
      },
      {
        id: "nav-tools",
        label: "Go to Developer Utilities",
        description: "Password Generator, Cron Translator — all tracked in PostgreSQL",
        category: "Navigate" as const,
        icon: <Wrench size={16} />,
        action: () => router.push("/tools"),
      },
      {
        id: "nav-under-the-hood",
        label: "Go to Under the Hood",
        description: "Architecture, CI/CD and spec-driven process",
        category: "Navigate" as const,
        icon: <Settings size={16} />,
        action: () => router.push("/under-the-hood"),
      },
      {
        id: "toggle-theme",
        label: theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode",
        category: "Theme" as const,
        icon: theme === "dark" ? <Sun size={16} /> : <Moon size={16} />,
        action: () => setTheme(theme === "dark" ? "light" : "dark"),
      },
      {
        id: "ask-ai",
        label: "Ask my AI Career Agent",
        description: "Chat with Javier's AI about his career, projects, and tech stack",
        category: "Actions" as const,
        icon: <Bot size={16} />,
        action: onOpenChat,
      },
      {
        id: "run-slack-webhook",
        label: "Run Slack Webhook (Simulated)",
        description: "Simulates a Google Workspace automation with Slack notification",
        category: "Automations (Mock)" as const,
        icon: <Bell size={16} />,
        action: onOpenConsole,
      },
    ],
    [router, theme, setTheme, onOpenConsole, onOpenChat],
  );
}

// ─── Command Item ──────────────────────────────────────────────────────────────

interface CommandItemProps {
  command: Command;
  isHighlighted: boolean;
  onSelect: () => void;
  onMouseEnter: () => void;
}

function CommandItem({ command, isHighlighted, onSelect, onMouseEnter }: CommandItemProps) {
  return (
    <button
      type="button"
      role="option"
      aria-selected={isHighlighted}
      onClick={onSelect}
      onMouseEnter={onMouseEnter}
      className={[
        "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors",
        isHighlighted ? "bg-primary/10 text-primary" : "text-foreground hover:bg-content2",
      ].join(" ")}
    >
      <span className="bg-content2 text-default-500 flex h-8 w-8 shrink-0 items-center justify-center rounded-md">
        {command.icon}
      </span>
      <span className="flex min-w-0 flex-col">
        <span className="truncate font-medium">{command.label}</span>
        {command.description && (
          <span className="text-default-400 truncate text-xs">{command.description}</span>
        )}
      </span>
    </button>
  );
}

// ─── Command Palette ───────────────────────────────────────────────────────────

export function CommandPalette() {
  const state = useCommandPalette();
  const [query, setQuery] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // ── Automation Console state ──
  const [consoleOpen, setConsoleOpen] = useState(false);
  // Incrementing runKey forces ConsoleSimulation to remount fresh each time
  const [consoleRunKey, setConsoleRunKey] = useState(0);

  const openConsole = useCallback(() => {
    setConsoleRunKey((k) => k + 1);
    setConsoleOpen(true);
  }, []);

  // ── AI Career Chat ──
  const { open: openChat } = useCareerChatDrawer();

  const commands = useCommands(openConsole, openChat);

  // ── Register global ⌘K / Ctrl+K shortcut ──
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        state.toggle();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [state]);

  // ── Auto-focus input whenever the palette opens ──
  useEffect(() => {
    if (state.isOpen) {
      requestAnimationFrame(() => {
        inputRef.current?.focus();
      });
    }
  }, [state.isOpen]);

  // ── Filter + group commands ──
  const grouped = useMemo(() => {
    const q = query.toLowerCase().trim();
    const filtered = q
      ? commands.filter(
          (c) => c.label.toLowerCase().includes(q) || c.description?.toLowerCase().includes(q),
        )
      : commands;

    const byCategory = filtered.reduce<Record<string, Command[]>>((acc, cmd) => {
      (acc[cmd.category] ??= []).push(cmd);
      return acc;
    }, {});

    return Object.entries(byCategory) as [CommandCategory, Command[]][];
  }, [commands, query]);

  const flat = useMemo(() => grouped.flatMap(([, cmds]) => cmds), [grouped]);

  // Reset highlight when query changes
  useEffect(() => {
    setHighlightedIndex(0);
  }, [query]);

  // Reset state on close
  useEffect(() => {
    if (!state.isOpen) {
      setQuery("");
      setHighlightedIndex(0);
    }
  }, [state.isOpen]);

  const handleSelect = useCallback(
    (command: Command) => {
      state.close();
      // Small delay so palette exit animation completes before the action runs
      setTimeout(() => command.action(), 80);
    },
    [state],
  );

  // ── Arrow key + Enter + Escape navigation ──
  useEffect(() => {
    if (!state.isOpen) return;

    function handleKey(e: KeyboardEvent) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setHighlightedIndex((i) => Math.min(i + 1, flat.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setHighlightedIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === "Enter" && flat[highlightedIndex]) {
        e.preventDefault();
        handleSelect(flat[highlightedIndex]);
      } else if (e.key === "Escape") {
        e.preventDefault();
        state.close();
      }
    }

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [state, flat, highlightedIndex, handleSelect]);

  return (
    <>
      {/* ── Palette overlay ── */}
      {state.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            aria-hidden="true"
            onClick={state.close}
          />

          {/* Palette panel */}
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Command palette"
            className="bg-background border-divider relative z-10 w-full max-w-lg overflow-hidden rounded-xl border shadow-2xl"
          >
            {/* ── Search Input ── */}
            <div className="border-divider flex items-center gap-3 border-b px-4 py-3">
              <Search size={16} className="text-default-400 shrink-0" aria-hidden="true" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search commands…"
                aria-label="Search commands"
                className="placeholder:text-default-400 min-w-0 flex-1 bg-transparent text-sm outline-none"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  aria-label="Clear search"
                  className="text-default-400 hover:text-foreground transition-colors"
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              )}
            </div>

            {/* ── Command List ── */}
            <div
              role="listbox"
              aria-label="Commands"
              className="max-h-[60vh] overflow-y-auto overscroll-contain p-2"
            >
              {grouped.length === 0 && (
                <p className="text-default-400 px-3 py-8 text-center text-sm">
                  No commands found for &ldquo;{query}&rdquo;
                </p>
              )}

              {grouped.map(([category, cmds]) => (
                <div key={category} className="mb-2 last:mb-0">
                  <p className="text-default-400 mb-1 px-3 text-[11px] font-semibold tracking-wider uppercase">
                    {category}
                  </p>
                  {cmds.map((cmd) => {
                    const absoluteIndex = flat.indexOf(cmd);
                    return (
                      <CommandItem
                        key={cmd.id}
                        command={cmd}
                        isHighlighted={absoluteIndex === highlightedIndex}
                        onSelect={() => handleSelect(cmd)}
                        onMouseEnter={() => setHighlightedIndex(absoluteIndex)}
                      />
                    );
                  })}
                </div>
              ))}
            </div>

            {/* ── Footer keyboard hints ── */}
            <div className="text-default-400 border-divider flex items-center gap-3 border-t px-4 py-2.5 text-xs">
              <span className="flex items-center gap-1">
                <Kbd className="text-xs">↑</Kbd>
                <Kbd className="text-xs">↓</Kbd>
                to navigate
              </span>
              <span className="flex items-center gap-1">
                <Kbd className="text-xs">↵</Kbd>
                to select
              </span>
              <span className="flex items-center gap-1">
                <Kbd className="text-xs">Esc</Kbd>
                to close
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ── Automation Console — rendered outside palette so it outlives it ── */}
      <AutomationConsole
        isOpen={consoleOpen}
        runKey={consoleRunKey}
        onClose={() => setConsoleOpen(false)}
      />
    </>
  );
}
