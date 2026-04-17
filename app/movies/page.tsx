import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Movie Collection",
  description:
    "Browse and manage a curated movie collection. Demonstrates Optimistic UI, Skeleton Loaders, Zod validation, and Server Actions with PostgreSQL.",
};

/**
 * Movies Page — JAG-XXX (to be fully implemented)
 *
 * Demonstrates:
 * - Server-rendered movie list (fetched via Server Action / Drizzle)
 * - Optimistic UI for add/delete/update via useOptimistic
 * - Skeleton loaders via Suspense boundaries
 * - Toast notifications for action feedback
 * - Zod validation on both client (form) and server (action)
 * - XSS sanitization via DOMPurify before DB write
 */
export default function MoviesPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-16">
      <h1 className="text-4xl font-bold tracking-tight">Movie Collection</h1>
      <p className="text-default-500 mt-4 text-lg">
        Add, edit, and curate movies. Powered by PostgreSQL + Drizzle + Server Actions.
      </p>
      <div className="border-default-200 text-default-400 mt-12 rounded-xl border border-dashed p-8 text-center">
        🚧 Full CRUD UI coming in JAG-XXX
      </div>
    </div>
  );
}
