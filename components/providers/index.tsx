"use client";

import { Toast } from "@heroui/react";
import type { ReactNode } from "react";
import { CareerChatDrawerProvider } from "@/hooks/use-career-chat-drawer";
import { ThemeProvider } from "@/hooks/use-theme";

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
 *
 * CareerChatDrawerProvider supplies open/close state; the drawer UI is mounted
 * from app/layout.tsx via <CareerChatHost /> so it stays outside <main> and
 * survives navigation (usePathname stays in sync on every route).
 */
export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider>
      <CareerChatDrawerProvider>
        {children}
        <Toast.Provider placement="bottom end" />
      </CareerChatDrawerProvider>
    </ThemeProvider>
  );
}
