import type { NewVinyl } from "@/lib/db/schema";

/**
 * Shared test fixtures for vinyl-related tests.
 * Used across Playwright E2E tests and any future unit/integration tests.
 */
export const testVinyls: NewVinyl[] = [
  {
    title: "Kind of Blue",
    artist: "Miles Davis",
    year: 1959,
    status: "in_collection",
  },
  {
    title: "The Dark Side of the Moon",
    artist: "Pink Floyd",
    year: 1973,
    status: "in_collection",
  },
  {
    title: "Blue",
    artist: "Joni Mitchell",
    year: 1971,
    status: "recommended",
  },
];

export const invalidVinylFixtures = {
  emptyTitle: { title: "", artist: "Test Artist", year: 2020, status: "recommended" as const },
  futureYear: { title: "Test", artist: "Test Artist", year: 2099, status: "recommended" as const },
  invalidStatus: { title: "Test", artist: "Test Artist", year: 2020, status: "invalid" },
  xssTitle: {
    title: '<script>alert("xss")</script>',
    artist: "Test Artist",
    year: 2020,
    status: "recommended" as const,
  },
};
