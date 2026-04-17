import DOMPurify from "isomorphic-dompurify";

/**
 * Sanitizes a string to prevent XSS attacks by stripping all HTML tags
 * and dangerous attributes.
 *
 * Uses isomorphic-dompurify which works in both Node.js and browser contexts,
 * making it safe to call from Server Actions and client components alike.
 */
export function sanitizeString(input: string): string {
  // ALLOW_DATA_ATTR: false prevents data-* attribute injection
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [], // Strip all HTML — we only want plain text
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true,
  });
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
