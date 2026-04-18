import type { NewMovie } from "@/lib/db/schema";

/**
 * Shared test fixtures for movie-related tests.
 * Used across Playwright E2E tests and any future unit/integration tests.
 */
export const testMovies: NewMovie[] = [
  {
    title: "Inception",
    director: "Christopher Nolan",
    year: 2010,
    genre: "sci-fi",
    synopsis: "A thief who steals corporate secrets through dream-sharing technology.",
    rating: 9,
  },
  {
    title: "The Godfather",
    director: "Francis Ford Coppola",
    year: 1972,
    genre: "drama",
    synopsis: "The aging patriarch of an organized crime dynasty transfers control to his son.",
    rating: 10,
  },
  {
    title: "Spirited Away",
    director: "Hayao Miyazaki",
    year: 2001,
    genre: "animation",
    synopsis: "A young girl wanders into a world ruled by gods, witches, and spirits.",
    rating: 10,
  },
];

export const invalidMovieFixtures = {
  emptyTitle: { title: "", director: "Test", year: 2020, genre: "drama" as const },
  futurYear: { title: "Test", director: "Test", year: 2099, genre: "drama" as const },
  invalidRating: {
    title: "Test",
    director: "Test",
    year: 2020,
    genre: "drama" as const,
    rating: 11,
  },
  xssTitle: {
    title: '<script>alert("xss")</script>',
    director: "Test",
    year: 2020,
    genre: "drama" as const,
  },
};
