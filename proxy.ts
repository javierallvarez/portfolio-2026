import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { defaultLocale, isLocale, type Locale } from "@/lib/i18n/config";

const KNOWN_PATH_FIRST_SEGMENT = new Set([
  "tools",
  "interactive-lab",
  "internal-tooling",
  "under-the-hood",
]);

function getPreferredLocale(request: NextRequest): Locale {
  const header = request.headers.get("accept-language");
  if (!header) return defaultLocale;
  const primary = header.split(",")[0]?.trim().toLowerCase() ?? "";
  if (primary.startsWith("en")) return "en";
  return defaultLocale;
}

/**
 * Prefix bare paths with `/es` or `/en` so marketing and app routes always
 * render under `app/[lang]/`. Returns null when the request should continue.
 */
function localeRedirect(request: NextRequest): NextResponse | null {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/ingest") ||
    pathname.startsWith("/sign-in") ||
    pathname.startsWith("/sign-up") ||
    pathname.startsWith("/sso-callback") ||
    pathname.match(/\.(ico|png|jpg|jpeg|svg|webp|gif|txt|xml|json|webmanifest)$/i)
  ) {
    return null;
  }

  const segments = pathname.split("/").filter(Boolean);
  const first = segments[0];

  if (first && isLocale(first)) {
    return null;
  }

  const locale = getPreferredLocale(request);
  const url = request.nextUrl.clone();

  if (segments.length === 0) {
    url.pathname = `/${locale}`;
    return NextResponse.redirect(url);
  }

  if (first && KNOWN_PATH_FIRST_SEGMENT.has(first)) {
    url.pathname = `/${locale}/${segments.join("/")}`;
    return NextResponse.redirect(url);
  }

  url.pathname = `/${locale}`;
  return NextResponse.redirect(url);
}

/**
 * Next.js 16 uses `proxy.ts` (export `proxy`) instead of `middleware.ts`.
 * Clerk session sync runs here; locale detection runs first so `/tools` becomes
 * `/es/tools` or `/en/tools` before the request hits the app router.
 */
export const proxy = clerkMiddleware((_auth, request) => {
  const redirect = localeRedirect(request);
  if (redirect) return redirect;
  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
