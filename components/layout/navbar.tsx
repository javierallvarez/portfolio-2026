"use client";

import NextLink from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "@/hooks/use-theme";
import { useAuth, SignInButton, UserButton } from "@clerk/nextjs";
import { Button, Kbd } from "@heroui/react";
import { Bot } from "lucide-react";
import { useCommandPalette } from "@/hooks/use-command-palette";
import { useCareerChatDrawer } from "@/hooks/use-career-chat-drawer";
import { useIsClient } from "@/hooks/use-is-client";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/get-dictionary";
import { withLocale } from "@/lib/i18n/utils";
import { LanguageSwitcher } from "@/components/layout/language-switcher";

const ROUTES: readonly { path: string; labelKey: keyof Dictionary["nav"] }[] = [
  { path: "/", labelKey: "home" },
  { path: "/interactive-lab", labelKey: "interactiveLab" },
  { path: "/tools", labelKey: "tools" },
  { path: "/internal-tooling", labelKey: "automations" },
  { path: "/under-the-hood", labelKey: "underTheHood" },
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

  const isDark = isClient && theme === "dark";
  const toggleTheme = () => setTheme(isDark ? "light" : "dark");

  return (
    <header className="bg-background/80 sticky top-0 z-40 border-b border-[--border-color,oklch(0%_0_0_/_8%)] backdrop-blur-md">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <NextLink
          href={withLocale(lang, "/")}
          className="text-foreground text-sm font-semibold tracking-tight transition-opacity hover:opacity-70"
        >
          Javier Álvarez
          <span className="text-muted ml-1.5">/ portfolio</span>
        </NextLink>

        <ul className="hidden items-center gap-1 sm:flex" role="list">
          {ROUTES.map(({ path, labelKey }) => {
            const href = withLocale(lang, path);
            const isActive = pathname === href;
            return (
              <li key={path}>
                <NextLink
                  href={href}
                  className={[
                    "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-surface text-foreground"
                      : "text-muted hover:bg-surface hover:text-foreground",
                  ].join(" ")}
                  aria-current={isActive ? "page" : undefined}
                >
                  {nav[labelKey]}
                </NextLink>
              </li>
            );
          })}
        </ul>

        <div className="flex items-center gap-2">
          <div className="hidden sm:block">
            <LanguageSwitcher nav={nav} />
          </div>
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
                className="text-muted hover:text-foreground rounded-md px-3 py-1.5 text-sm font-medium transition-colors"
              >
                {nav.signIn}
              </button>
            </SignInButton>
          )}
          <button
            type="button"
            onClick={openChat}
            className="hidden items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-teal-500 ring-1 ring-teal-500/30 transition-colors hover:bg-teal-500/10 sm:flex"
            aria-label={nav.askAiAria}
          >
            <Bot size={14} aria-hidden="true" />
            <span>{nav.askAi}</span>
          </button>
          <Button
            variant="ghost"
            isIconOnly
            onPress={openChat}
            aria-label={nav.askAiAria}
            className="h-9 w-9 rounded-md text-teal-500 sm:hidden"
          >
            <Bot size={18} aria-hidden="true" />
          </Button>

          {isClient ? (
            <Button
              variant="ghost"
              isIconOnly
              onPress={toggleTheme}
              aria-label={isDark ? nav.themeToLight : nav.themeToDark}
              className="h-9 w-9 rounded-md"
            >
              {isDark ? <SunIcon /> : <MoonIcon />}
            </Button>
          ) : (
            <div className="h-9 w-9 shrink-0" aria-hidden="true" />
          )}

          <button
            type="button"
            onClick={palette.open}
            className="bg-surface text-muted hover:bg-surface-secondary hover:text-foreground hidden items-center gap-2 rounded-md border border-[--border-color,oklch(0%_0_0_/_12%)] px-3 py-1.5 text-sm transition-colors sm:flex"
            aria-label={nav.openPalette}
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
            className="h-9 w-9 rounded-md sm:hidden"
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

          <div className="sm:hidden">
            <LanguageSwitcher nav={nav} />
          </div>
        </div>
      </nav>
    </header>
  );
}
