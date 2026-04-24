"use client";

import NextLink from "next/link";
import { Kbd } from "@heroui/react";
import { useCommandPalette } from "@/hooks/use-command-palette";

/**
 * CTA buttons on the homepage hero section.
 * Extracted as a Client Component so the server-rendered page.tsx stays lean.
 */
export function HeroActions() {
  const palette = useCommandPalette();

  return (
    <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
      <NextLink
        href="/interactive-lab"
        className="bg-primary text-primary-foreground inline-flex items-center justify-center rounded-full px-6 py-2.5 text-sm font-medium shadow-sm transition-opacity hover:opacity-90 active:opacity-75"
      >
        Explore the Interactive Lab
      </NextLink>

      <button
        type="button"
        onClick={palette.open}
        className="bg-surface text-foreground hover:bg-surface-secondary inline-flex items-center gap-2 rounded-full border border-[--border-color,oklch(0%_0_0_/_12%)] px-6 py-2.5 text-sm font-medium shadow-sm transition-colors"
      >
        Open Command Palette
        <span className="flex items-center gap-0.5">
          <Kbd className="text-xs">⌘</Kbd>
          <Kbd className="text-xs">K</Kbd>
        </span>
      </button>
    </div>
  );
}
