"use client";

import { createContext, useContext, useState, useCallback } from "react";
import type { ReactNode } from "react";

// ─── Context ──────────────────────────────────────────────────────────────────

interface CareerChatDrawerContextValue {
  open: () => void;
  close: () => void;
  isOpen: boolean;
}

const CareerChatDrawerContext = createContext<CareerChatDrawerContextValue>({
  open: () => {},
  close: () => {},
  isOpen: false,
});

// ─── Provider ─────────────────────────────────────────────────────────────────

export function CareerChatDrawerProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  return (
    <CareerChatDrawerContext.Provider value={{ open, close, isOpen }}>
      {children}
    </CareerChatDrawerContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useCareerChatDrawer(): CareerChatDrawerContextValue {
  return useContext(CareerChatDrawerContext);
}
