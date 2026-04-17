"use client";

import { useOverlayState } from "@heroui/react";
import type { UseOverlayStateReturn } from "@heroui/react";

/**
 * Thin wrapper around HeroUI's `useOverlayState` for the Command Palette.
 *
 * Returns the full overlay state object so:
 * - `CommandPalette` can pass it to `<Modal state={...}>` as a single source of truth
 * - `Navbar` and other components can call `state.open()` to trigger the palette
 *
 * The ⌘K / Ctrl+K keyboard shortcut is registered inside `CommandPalette` itself,
 * which is rendered once at the app root — keeping the listener lifecycle correct.
 */
export function useCommandPalette(): UseOverlayStateReturn {
  return useOverlayState();
}
