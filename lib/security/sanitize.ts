/**
 * Lightweight, zero-dependency string sanitizer for Server Actions.
 *
 * Why not isomorphic-dompurify?
 * DOMPurify depends on jsdom in Node.js, and jsdom's html-encoding-sniffer
 * pulls @exodus/bytes which is ESM-only — incompatible with the CJS require()
 * calls that still exist in that dependency chain. The result is a fatal
 * ERR_REQUIRE_ESM at runtime in the Next.js Node.js server runtime.
 *
 * For plain-text fields (artist name, album title, cover URL) we only need to:
 *   1. Strip HTML tags so stored strings never contain markup.
 *   2. Remove null bytes.
 * Drizzle ORM already uses parameterised queries (SQL injection is not a risk),
 * and Next.js escapes JSX output by default (stored text → safe rendering).
 * Zod `.trim()` + type validation runs before this step.
 */

/**
 * Strips HTML tags and null bytes from a string, preserving text content.
 * Equivalent to DOMPurify({ ALLOWED_TAGS: [], KEEP_CONTENT: true }).
 */
export function sanitizeString(input: string): string {
  return (
    input
      // Remove complete script/style blocks including their content
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
      // Strip remaining HTML tags, keeping inner text
      .replace(/<[^>]*>/g, "")
      // Remove null bytes
      .replace(/\0/g, "")
      .trim()
  );
}

/**
 * Sanitizes all string values in a plain object recursively.
 * Non-string values are passed through unchanged.
 */
export function sanitizeObject<T extends Record<string, unknown>>(obj: T): T {
  return Object.fromEntries(
    Object.entries(obj).map(([key, value]) => {
      if (typeof value === "string") return [key, sanitizeString(value)];
      if (value !== null && typeof value === "object" && !Array.isArray(value)) {
        return [key, sanitizeObject(value as Record<string, unknown>)];
      }
      return [key, value];
    }),
  ) as T;
}
