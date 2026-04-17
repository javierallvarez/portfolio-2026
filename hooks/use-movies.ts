"use client";

import { useOptimistic, useTransition } from "react";
import type { Movie } from "@/lib/db/schema";

type OptimisticAction =
  | { type: "add"; movie: Movie }
  | { type: "delete"; id: string }
  | { type: "update"; movie: Partial<Movie> & { id: string } };

function moviesReducer(state: Movie[], action: OptimisticAction): Movie[] {
  switch (action.type) {
    case "add":
      return [action.movie, ...state];
    case "delete":
      return state.filter((m) => m.id !== action.id);
    case "update":
      return state.map((m) => (m.id === action.movie.id ? { ...m, ...action.movie } : m));
  }
}

/**
 * Manages optimistic UI state for the movie list.
 *
 * Optimistic updates are applied immediately on action dispatch, then
 * automatically reconciled when the Server Action resolves.
 *
 * @param initialMovies - The server-fetched initial list of movies
 */
export function useMovies(initialMovies: Movie[]) {
  const [isPending, startTransition] = useTransition();
  const [optimisticMovies, dispatchOptimistic] = useOptimistic(initialMovies, moviesReducer);

  return {
    movies: optimisticMovies,
    isPending,
    startTransition,
    dispatchOptimistic,
  };
}
