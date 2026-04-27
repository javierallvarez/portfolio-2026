import type { Locale } from "./config";

/** Prefix a path (e.g. `/tools`) with the active locale segment. */
export function withLocale(locale: Locale, path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  if (normalized === "/") return `/${locale}`;
  return `/${locale}${normalized}`;
}

/**
 * Strip the leading `/es` or `/en` from a pathname for locale-agnostic routing
 * (e.g. active nav, AI path context).
 */
export function stripLocale(pathname: string): string {
  const match = pathname.match(/^\/(es|en)(?=\/|$)/);
  if (!match) return pathname;
  const rest = pathname.slice(match[0].length);
  if (rest === "" || rest === "/") return "/";
  return rest.startsWith("/") ? rest : `/${rest}`;
}
