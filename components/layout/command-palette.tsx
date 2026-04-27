"use client";

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "@/hooks/use-theme";
import { Kbd } from "@heroui/react";
import {
  Home,
  FlaskConical,
  Wrench,
  Settings,
  Sun,
  Moon,
  Bot,
  Bell,
  Search,
  Cog,
} from "lucide-react";
import { useCommandPalette } from "@/hooks/use-command-palette";
import { useCareerChatDrawer } from "@/hooks/use-career-chat-drawer";
import { AutomationConsole } from "@/components/ui/automation-console";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/get-dictionary";
import { withLocale } from "@/lib/i18n/utils";

// ─── Command Definitions ───────────────────────────────────────────────────────

interface Command {
  id: string;
  label: string;
  description?: string;
  category: string;
  icon: React.ReactNode;
  action: () => void;
}

function useCommands(
  lang: Locale,
  dict: Dictionary["commandPalette"],
  onOpenConsole: () => void,
  onOpenChat: () => void,
): Command[] {
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  return useMemo(
    () => [
      {
        id: "nav-home",
        label: dict.nav.home,
        category: dict.categories.navigate,
        icon: <Home size={16} />,
        action: () => router.push(withLocale(lang, "/")),
      },
      {
        id: "nav-interactive-lab",
        label: dict.nav.interactiveLab,
        description: dict.nav.interactiveLabDesc,
        category: dict.categories.navigate,
        icon: <FlaskConical size={16} />,
        action: () => router.push(withLocale(lang, "/interactive-lab")),
      },
      {
        id: "nav-tools",
        label: dict.nav.tools,
        description: dict.nav.toolsDesc,
        category: dict.categories.navigate,
        icon: <Wrench size={16} />,
        action: () => router.push(withLocale(lang, "/tools")),
      },
      {
        id: "nav-internal-tooling",
        label: dict.nav.internalTooling,
        description: dict.nav.internalToolingDesc,
        category: dict.categories.navigate,
        icon: <Cog size={16} />,
        action: () => router.push(withLocale(lang, "/internal-tooling")),
      },
      {
        id: "nav-under-the-hood",
        label: dict.nav.underTheHood,
        description: dict.nav.underTheHoodDesc,
        category: dict.categories.navigate,
        icon: <Settings size={16} />,
        action: () => router.push(withLocale(lang, "/under-the-hood")),
      },
      {
        id: "toggle-theme",
        label: theme === "dark" ? dict.themeLight : dict.themeDark,
        category: dict.categories.theme,
        icon: theme === "dark" ? <Sun size={16} /> : <Moon size={16} />,
        action: () => setTheme(theme === "dark" ? "light" : "dark"),
      },
      {
        id: "ask-ai",
        label: dict.askAi,
        description: dict.askAiDesc,
        category: dict.categories.actions,
        icon: <Bot size={16} />,
        action: onOpenChat,
      },
      {
        id: "run-slack-webhook",
        label: dict.slackWebhook,
        description: dict.slackWebhookDesc,
        category: dict.categories.automations,
        icon: <Bell size={16} />,
        action: onOpenConsole,
      },
    ],
    [router, theme, setTheme, onOpenConsole, onOpenChat, lang, dict],
  );
}

const LISTBOX_ID = "command-palette-listbox";
const optionDomId = (commandId: string) => `palette-opt-${commandId}`;

// ─── Command Item ──────────────────────────────────────────────────────────────

interface CommandItemProps {
  command: Command;
  isActive: boolean;
  onSelect: () => void;
  onMouseEnter: () => void;
}

function CommandItem({ command, isActive, onSelect, onMouseEnter }: CommandItemProps) {
  return (
    <button
      type="button"
      id={optionDomId(command.id)}
      role="option"
      aria-selected={isActive}
      onClick={onSelect}
      onMouseEnter={onMouseEnter}
      className={[
        "focus-visible:ring-offset-background flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors outline-none focus-visible:ring-2 focus-visible:ring-teal-500/60 focus-visible:ring-offset-2",
        isActive
          ? "bg-zinc-100 text-zinc-900 ring-1 ring-teal-500/25 dark:bg-zinc-800 dark:text-zinc-100"
          : "text-foreground hover:bg-content2 focus-visible:bg-content2",
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

export function CommandPalette({
  dict,
  lang,
}: {
  dict: Dictionary["commandPalette"];
  lang: Locale;
}) {
  const state = useCommandPalette();
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const activeIndexRef = useRef(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // ── Automation Console state ──
  const [consoleOpen, setConsoleOpen] = useState(false);
  const [consoleRunKey, setConsoleRunKey] = useState(0);

  const openConsole = useCallback(() => {
    setConsoleRunKey((k) => k + 1);
    setConsoleOpen(true);
  }, []);

  const { open: openChat } = useCareerChatDrawer();

  const commands = useCommands(lang, dict, openConsole, openChat);

  useEffect(() => {
    activeIndexRef.current = activeIndex;
  }, [activeIndex]);

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

    return Object.entries(byCategory) as [string, Command[]][];
  }, [commands, query]);

  const flat = useMemo(() => grouped.flatMap(([, cmds]) => cmds), [grouped]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  useEffect(() => {
    if (flat.length === 0) {
      setActiveIndex(0);
      return;
    }
    setActiveIndex((i) => Math.min(Math.max(i, 0), flat.length - 1));
  }, [flat]);

  useEffect(() => {
    if (!state.isOpen) {
      setQuery("");
      setActiveIndex(0);
    }
  }, [state.isOpen]);

  const handleSelect = useCallback(
    (command: Command) => {
      state.close();
      setTimeout(() => command.action(), 80);
    },
    [state],
  );

  // Keep highlighted row in view when moving with keyboard
  useEffect(() => {
    if (!state.isOpen || flat.length === 0) return;
    const cmd = flat[activeIndex];
    if (!cmd) return;
    const el = document.getElementById(optionDomId(cmd.id));
    el?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [activeIndex, flat, state.isOpen]);

  /** Capture on the dialog so arrows / Enter run before the input’s default caret movement. */
  const handlePaletteKeyDownCapture = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        if (flat.length === 0) return;
        setActiveIndex((i) => Math.min(i + 1, flat.length - 1));
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        if (flat.length === 0) return;
        setActiveIndex((i) => Math.max(i - 1, 0));
        return;
      }
      if (e.key === "Enter") {
        const idx = activeIndexRef.current;
        const cmd = flat[idx];
        if (cmd) {
          e.preventDefault();
          handleSelect(cmd);
        }
        return;
      }
      if (e.key === "Escape") {
        e.preventDefault();
        state.close();
      }
    },
    [flat, handleSelect, state],
  );

  const activeDescendantId =
    flat.length > 0 && flat[activeIndex] ? optionDomId(flat[activeIndex].id) : undefined;

  return (
    <>
      {state.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            aria-hidden="true"
            onClick={state.close}
          />

          <div
            role="dialog"
            aria-modal="true"
            aria-label={dict.ariaLabel}
            onKeyDownCapture={handlePaletteKeyDownCapture}
            className="bg-background border-divider relative z-10 w-full max-w-lg overflow-hidden rounded-xl border shadow-2xl"
          >
            <div className="border-divider flex items-center gap-3 border-b px-4 py-3">
              <Search size={16} className="text-default-400 shrink-0" aria-hidden="true" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={dict.searchPlaceholder}
                role="combobox"
                aria-expanded
                aria-controls={LISTBOX_ID}
                aria-autocomplete="list"
                aria-activedescendant={activeDescendantId}
                aria-label={dict.searchAria}
                className="placeholder:text-default-400 focus-visible:ring-offset-background min-w-0 flex-1 bg-transparent text-sm outline-none focus-visible:ring-2 focus-visible:ring-teal-500/50 focus-visible:ring-offset-2"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  aria-label={dict.clearAria}
                  className="text-default-400 hover:text-foreground focus-visible:ring-offset-background rounded-md p-1 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-teal-500/50 focus-visible:ring-offset-2"
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

            <div
              id={LISTBOX_ID}
              role="listbox"
              aria-label="Commands"
              className="max-h-[60vh] overflow-y-auto overscroll-contain p-2"
            >
              {grouped.length === 0 && (
                <p className="text-default-400 px-3 py-8 text-center text-sm" role="status">
                  {dict.noResults} &ldquo;{query}&rdquo;
                </p>
              )}

              {grouped.map(([category, cmds], catIdx) => (
                <div
                  key={category}
                  role="group"
                  aria-labelledby={`palette-cat-${catIdx}`}
                  className="mb-2 last:mb-0"
                >
                  <p
                    id={`palette-cat-${catIdx}`}
                    className="text-default-400 mb-1 px-3 text-[11px] font-semibold tracking-wider uppercase"
                  >
                    {category}
                  </p>
                  {cmds.map((cmd) => {
                    const absoluteIndex = flat.indexOf(cmd);
                    return (
                      <CommandItem
                        key={cmd.id}
                        command={cmd}
                        isActive={absoluteIndex === activeIndex}
                        onSelect={() => handleSelect(cmd)}
                        onMouseEnter={() => setActiveIndex(absoluteIndex)}
                      />
                    );
                  })}
                </div>
              ))}
            </div>

            <div className="text-default-400 border-divider flex items-center gap-3 border-t px-4 py-2.5 text-xs">
              <span className="flex items-center gap-1">
                <Kbd className="text-xs">↑</Kbd>
                <Kbd className="text-xs">↓</Kbd>
                {dict.footerNavigate}
              </span>
              <span className="flex items-center gap-1">
                <Kbd className="text-xs">↵</Kbd>
                {dict.footerSelect}
              </span>
              <span className="flex items-center gap-1">
                <Kbd className="text-xs">Esc</Kbd>
                {dict.footerClose}
              </span>
            </div>
          </div>
        </div>
      )}

      <AutomationConsole
        isOpen={consoleOpen}
        runKey={consoleRunKey}
        onClose={() => setConsoleOpen(false)}
      />
    </>
  );
}
