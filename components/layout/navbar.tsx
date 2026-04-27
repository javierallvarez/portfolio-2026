"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import NextLink from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "@/hooks/use-theme";
import { useAuth, SignInButton, UserButton } from "@clerk/nextjs";
import { Button, Kbd } from "@heroui/react";
import { Bot, Menu, X } from "lucide-react";
import { useCommandPalette } from "@/hooks/use-command-palette";
import { useCareerChatDrawer } from "@/hooks/use-career-chat-drawer";
import { useIsClient } from "@/hooks/use-is-client";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/get-dictionary";
import { withLocale } from "@/lib/i18n/utils";
import { LanguageSwitcher } from "@/components/layout/language-switcher";

const PRIORITY_NAV: readonly { path: string; labelKey: keyof Dictionary["nav"] }[] = [
  { path: "/interactive-lab", labelKey: "interactiveLab" },
  { path: "/tools", labelKey: "tools" },
  { path: "/internal-tooling", labelKey: "automations" },
  { path: "/under-the-hood", labelKey: "underTheHood" },
] as const;

const DRAWER_NAV_LINKS: readonly { path: string; labelKey: keyof Dictionary["nav"] }[] = [
  { path: "/", labelKey: "home" },
  { path: "/cv", labelKey: "cv" },
  ...PRIORITY_NAV,
] as const;

function SunIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
    </svg>
  );
}

export function Navbar({ nav, lang }: { nav: Dictionary["nav"]; lang: Locale }) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const { isSignedIn } = useAuth();
  const palette = useCommandPalette();
  const { open: openChat } = useCareerChatDrawer();
  const isClient = useIsClient();
  const [navDrawerOpen, setNavDrawerOpen] = useState(false);
  const [portalReady, setPortalReady] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setPortalReady(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const isDark = isClient && theme === "dark";
  const toggleTheme = () => setTheme(isDark ? "light" : "dark");
  const homeHref = withLocale(lang, "/");
  const isHome = pathname === homeHref;

  useEffect(() => {
    const id = requestAnimationFrame(() => setNavDrawerOpen(false));
    return () => cancelAnimationFrame(id);
  }, [pathname]);

  useEffect(() => {
    if (!navDrawerOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setNavDrawerOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [navDrawerOpen]);

  const drawer =
    portalReady && navDrawerOpen
      ? createPortal(
          <>
            <button
              type="button"
              className="fixed inset-0 z-[105] bg-black/45 backdrop-blur-[2px] print:hidden"
              aria-label={nav.closeMenuAria}
              onClick={() => setNavDrawerOpen(false)}
            />
            <aside
              id="site-nav-drawer"
              className="border-border bg-background fixed inset-y-0 right-0 z-[115] flex min-h-0 w-[min(100%,18rem)] flex-col border-l shadow-2xl print:hidden"
              role="dialog"
              aria-modal="true"
              aria-label={nav.menu}
            >
              <div className="border-border flex shrink-0 items-center justify-between border-b px-4 py-3">
                <p className="text-foreground text-sm font-semibold">{nav.menu}</p>
                <Button
                  variant="ghost"
                  isIconOnly
                  onPress={() => setNavDrawerOpen(false)}
                  aria-label={nav.closeMenuAria}
                  className="focus-visible:ring-offset-background h-9 w-9 rounded-md focus-visible:ring-2 focus-visible:ring-teal-500/60 focus-visible:ring-offset-2"
                >
                  <X size={18} aria-hidden="true" />
                </Button>
              </div>
              <nav
                className="flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto p-2"
                aria-label={nav.menu}
              >
                {DRAWER_NAV_LINKS.map(({ path, labelKey }) => {
                  const href = withLocale(lang, path);
                  const isActive = pathname === href;
                  return (
                    <NextLink
                      key={path}
                      href={href}
                      onClick={() => setNavDrawerOpen(false)}
                      className={[
                        "focus-visible:ring-offset-background rounded-lg px-3 py-2.5 text-sm font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-teal-500/60 focus-visible:ring-offset-2",
                        isActive
                          ? "bg-surface text-foreground"
                          : "text-muted hover:bg-surface hover:text-foreground",
                      ].join(" ")}
                      aria-current={isActive ? "page" : undefined}
                    >
                      {nav[labelKey]}
                    </NextLink>
                  );
                })}
              </nav>
            </aside>
          </>,
          document.body,
        )
      : null;

  return (
    <>
      <header className="bg-background/80 sticky top-0 z-40 border-b border-[--border-color,oklch(0%_0_0_/_8%)] backdrop-blur-md print:hidden">
        <nav
          className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-2 px-4 sm:gap-3 sm:px-6"
          aria-label="Primary"
        >
          <NextLink
            href={homeHref}
            aria-current={isHome ? "page" : undefined}
            className="text-foreground focus-visible:ring-offset-background min-w-0 shrink-0 rounded-md text-sm font-semibold tracking-tight transition-opacity outline-none hover:opacity-70 focus-visible:ring-2 focus-visible:ring-teal-500/60 focus-visible:ring-offset-2"
          >
            <span className="truncate">Javier Álvarez</span>
            <span className="text-muted ml-1.5 hidden sm:inline">/ portfolio</span>
          </NextLink>

          <div className="flex min-w-0 shrink-0 items-center gap-1 sm:gap-2">
            {isSignedIn ? (
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: "h-8 w-8",
                  },
                }}
              />
            ) : (
              <SignInButton mode="modal">
                <button
                  type="button"
                  className="text-muted hover:text-foreground focus-visible:ring-offset-background max-w-[4.5rem] truncate rounded-md px-2 py-1.5 text-xs font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-teal-500/60 focus-visible:ring-offset-2 sm:max-w-none sm:px-3 sm:text-sm"
                >
                  {nav.signIn}
                </button>
              </SignInButton>
            )}
            <button
              type="button"
              onClick={openChat}
              className="focus-visible:ring-offset-background hidden items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-teal-500 ring-1 ring-teal-500/30 transition-colors outline-none hover:bg-teal-500/10 focus-visible:ring-2 focus-visible:ring-teal-500/60 focus-visible:ring-offset-2 lg:flex"
              aria-label={nav.askAiAria}
            >
              <Bot size={14} aria-hidden="true" />
              <span className="max-w-[7rem] truncate xl:max-w-none">{nav.askAi}</span>
            </button>
            <Button
              variant="ghost"
              isIconOnly
              onPress={openChat}
              aria-label={nav.askAiAria}
              className="focus-visible:ring-offset-background h-9 w-9 shrink-0 rounded-md text-teal-500 focus-visible:ring-2 focus-visible:ring-teal-500/60 focus-visible:ring-offset-2 lg:hidden"
            >
              <Bot size={18} aria-hidden="true" />
            </Button>

            {isClient ? (
              <Button
                variant="ghost"
                isIconOnly
                onPress={toggleTheme}
                aria-label={isDark ? nav.themeToLight : nav.themeToDark}
                className="focus-visible:ring-offset-background h-9 w-9 shrink-0 rounded-md focus-visible:ring-2 focus-visible:ring-teal-500/60 focus-visible:ring-offset-2"
              >
                {isDark ? <SunIcon /> : <MoonIcon />}
              </Button>
            ) : (
              <div className="h-9 w-9 shrink-0" aria-hidden="true" />
            )}

            <button
              type="button"
              onClick={palette.open}
              className="bg-surface text-muted hover:bg-surface-secondary hover:text-foreground focus-visible:ring-offset-background hidden items-center gap-2 rounded-md border border-[--border-color,oklch(0%_0_0_/_12%)] px-3 py-1.5 text-sm transition-colors outline-none focus-visible:ring-2 focus-visible:ring-teal-500/60 focus-visible:ring-offset-2 sm:flex"
              aria-label={nav.openPalette}
              aria-keyshortcuts="Meta+K Control+K"
            >
              <span>{nav.search}</span>
              <span className="flex items-center gap-0.5">
                <Kbd className="text-xs">⌘</Kbd>
                <Kbd className="text-xs">K</Kbd>
              </span>
            </button>

            <Button
              variant="ghost"
              isIconOnly
              onPress={palette.open}
              aria-label={nav.openPaletteMobileAria}
              aria-keyshortcuts="Meta+K Control+K"
              className="focus-visible:ring-offset-background h-9 w-9 shrink-0 rounded-md focus-visible:ring-2 focus-visible:ring-teal-500/60 focus-visible:ring-offset-2 sm:hidden"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
            </Button>

            <LanguageSwitcher nav={nav} />

            <Button
              variant="ghost"
              isIconOnly
              onPress={() => setNavDrawerOpen(true)}
              aria-label={nav.menuOpenAria}
              aria-expanded={navDrawerOpen}
              aria-controls={navDrawerOpen ? "site-nav-drawer" : undefined}
              className="focus-visible:ring-offset-background h-9 w-9 shrink-0 rounded-md focus-visible:ring-2 focus-visible:ring-teal-500/60 focus-visible:ring-offset-2"
            >
              <Menu size={18} aria-hidden="true" />
            </Button>
          </div>
        </nav>
      </header>
      {drawer}
    </>
  );
}
