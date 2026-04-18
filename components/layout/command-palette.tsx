"use client";

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { Modal, SearchField, Kbd, toast } from "@heroui/react";
import { useCommandPalette } from "@/hooks/use-command-palette";

// ─── Command Definitions ───────────────────────────────────────────────────────

type CommandCategory = "Navigate" | "Theme" | "Actions";

interface Command {
  id: string;
  label: string;
  description?: string;
  category: CommandCategory;
  icon: string;
  action: () => void;
}

function useCommands(): Command[] {
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  return useMemo(
    () => [
      {
        id: "nav-home",
        label: "Go to Home",
        category: "Navigate" as const,
        icon: "🏠",
        action: () => router.push("/"),
      },
      {
        id: "nav-movies",
        label: "Go to Movies",
        description: "Browse and manage the movie collection",
        category: "Navigate" as const,
        icon: "🎬",
        action: () => router.push("/movies"),
      },
      {
        id: "nav-under-the-hood",
        label: "Go to Under the Hood",
        description: "Architecture, CI/CD and spec-driven process",
        category: "Navigate" as const,
        icon: "⚙️",
        action: () => router.push("/under-the-hood"),
      },
      {
        id: "toggle-theme",
        label: theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode",
        category: "Theme" as const,
        icon: theme === "dark" ? "☀️" : "🌙",
        action: () => setTheme(theme === "dark" ? "light" : "dark"),
      },
      {
        id: "download-cv",
        label: "Download CV",
        description: "Get the latest resume",
        category: "Actions" as const,
        icon: "📄",
        action: () => {
          toast.info("CV download coming soon — check back after JAG-005!");
        },
      },
    ],
    [router, theme, setTheme],
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
        isHighlighted ? "bg-primary/10 text-primary" : "text-foreground hover:bg-surface-secondary",
      ].join(" ")}
    >
      <span className="bg-surface flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-base">
        {command.icon}
      </span>
      <span className="flex min-w-0 flex-col">
        <span className="truncate font-medium">{command.label}</span>
        {command.description && (
          <span className="text-muted truncate text-xs">{command.description}</span>
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
  const listRef = useRef<HTMLDivElement>(null);
  const commands = useCommands();

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
      // Small delay so modal exit animation completes before navigation
      setTimeout(() => command.action(), 80);
    },
    [state],
  );

  // Arrow key + Enter navigation within the palette
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
      }
    }

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [state.isOpen, flat, highlightedIndex, handleSelect]);

  return (
    <Modal state={state}>
      <Modal.Backdrop isDismissable />
      <Modal.Container placement="top" size="lg" className="mt-[10vh]">
        <Modal.Dialog aria-label="Command palette">
          {/* ── Search Input ── */}
          <div className="border-b border-[--border-color,oklch(0%_0_0_/_8%)] p-3">
            <SearchField
              aria-label="Search commands"
              value={query}
              onChange={setQuery}
              autoFocus
              fullWidth
            >
              <SearchField.Group>
                <SearchField.SearchIcon />
                <SearchField.Input placeholder="Search commands…" className="text-sm" />
                {query && <SearchField.ClearButton />}
              </SearchField.Group>
            </SearchField>
          </div>

          {/* ── Command List ── */}
          <div
            ref={listRef}
            role="listbox"
            aria-label="Commands"
            className="max-h-[60vh] overflow-y-auto overscroll-contain p-2"
          >
            {grouped.length === 0 && (
              <p className="text-muted px-3 py-8 text-center text-sm">
                No commands found for &ldquo;{query}&rdquo;
              </p>
            )}

            {grouped.map(([category, cmds]) => (
              <div key={category} className="mb-2 last:mb-0">
                <p className="text-muted mb-1 px-3 text-[11px] font-semibold tracking-wider uppercase">
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
          <div className="text-muted flex items-center gap-3 border-t border-[--border-color,oklch(0%_0_0_/_8%)] px-4 py-2.5 text-xs">
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
        </Modal.Dialog>
      </Modal.Container>
    </Modal>
  );
}
