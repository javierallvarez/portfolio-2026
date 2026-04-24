"use client";

import { useOptimistic, useTransition } from "react";
import type { Vinyl } from "@/lib/db/schema";

type OptimisticAction =
  | { type: "add"; vinyl: Vinyl }
  | { type: "delete"; id: string }
  | { type: "update"; vinyl: Partial<Vinyl> & { id: string } };

function vinylsReducer(state: Vinyl[], action: OptimisticAction): Vinyl[] {
  switch (action.type) {
    case "add":
      return [action.vinyl, ...state];
    case "delete":
      return state.filter((v) => v.id !== action.id);
    case "update":
      return state.map((v) => (v.id === action.vinyl.id ? { ...v, ...action.vinyl } : v));
  }
}

/**
 * Manages optimistic UI state for the vinyl list.
 *
 * Optimistic updates are applied immediately on action dispatch, then
 * automatically reconciled when the Server Action resolves.
 *
 * @param initialVinyls - The server-fetched initial list of vinyls
 */
export function useVinyls(initialVinyls: Vinyl[]) {
  const [isPending, startTransition] = useTransition();
  const [optimisticVinyls, dispatchOptimistic] = useOptimistic(initialVinyls, vinylsReducer);

  return {
    vinyls: optimisticVinyls,
    isPending,
    startTransition,
    dispatchOptimistic,
  };
}
