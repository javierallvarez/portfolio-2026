"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { Toast } from "@heroui/react";
import type { ReactNode } from "react";

interface ProvidersProps {
  children: ReactNode;
}

/**
 * Root client-side provider tree.
 *
 * HeroUI v3 does not require a wrapper provider — components work standalone via CSS.
 * next-themes adds/removes the `.dark` class on <html>, which HeroUI's CSS variables
 * already map to dark-mode tokens.
 *
 * Toast.Provider must live here so toasts can be triggered from anywhere in the tree
 * via the `toast()` singleton without prop-drilling.
 */
export function Providers({ children }: ProvidersProps) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {children}
      <Toast.Provider placement="bottom end" />
    </NextThemesProvider>
  );
}
