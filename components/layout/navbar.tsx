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

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/interactive-lab", label: "Interactive Lab" },
  { href: "/tools", label: "Tools" },
  { href: "/internal-tooling", label: "Automations" },
  { href: "/under-the-hood", label: "Under the Hood" },
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

export function Navbar() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const { isSignedIn } = useAuth();
  const palette = useCommandPalette();
  const { open: openChat } = useCareerChatDrawer();

  // next-themes resolves the theme from localStorage, which is unavailable during
  // SSR. Without this guard the aria-label and icon differ between the server
  // render and the first client render, causing a hydration mismatch.
  // We render a same-sized placeholder until after hydration is complete.
  const isClient = useIsClient();

  const isDark = isClient && theme === "dark";
  const toggleTheme = () => setTheme(isDark ? "light" : "dark");

  return (
    <header className="bg-background/80 sticky top-0 z-40 border-b border-[--border-color,oklch(0%_0_0_/_8%)] backdrop-blur-md">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* ── Logo ── */}
        <NextLink
          href="/"
          className="text-foreground text-sm font-semibold tracking-tight transition-opacity hover:opacity-70"
        >
          Javier Álvarez
          <span className="text-muted ml-1.5">/ portfolio</span>
        </NextLink>

        {/* ── Nav Links ── */}
        <ul className="hidden items-center gap-1 sm:flex" role="list">
          {NAV_LINKS.map(({ href, label }) => {
            const isActive = pathname === href;
            return (
              <li key={href}>
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
                  {label}
                </NextLink>
              </li>
            );
          })}
        </ul>

        {/* ── Right-side Actions ── */}
        <div className="flex items-center gap-2">
          {/* Auth — Clerk UserButton (signed in) or Sign In button (signed out) */}
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
                Sign In
              </button>
            </SignInButton>
          )}
          {/* AI Career Agent chat trigger */}
          <button
            type="button"
            onClick={openChat}
            className="hidden items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-teal-500 ring-1 ring-teal-500/30 transition-colors hover:bg-teal-500/10 sm:flex"
            aria-label="Chat with Javier's AI"
          >
            <Bot size={14} aria-hidden="true" />
            <span>Ask my AI</span>
          </button>
          {/* Mobile: icon-only AI chat button */}
          <Button
            variant="ghost"
            isIconOnly
            onPress={openChat}
            aria-label="Chat with Javier's AI"
            className="h-9 w-9 rounded-md text-teal-500 sm:hidden"
          >
            <Bot size={18} aria-hidden="true" />
          </Button>

          {/* Theme toggle — rendered client-side only to avoid SSR hydration mismatch */}
          {isClient ? (
            <Button
              variant="ghost"
              isIconOnly
              onPress={toggleTheme}
              aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
              className="h-9 w-9 rounded-md"
            >
              {isDark ? <SunIcon /> : <MoonIcon />}
            </Button>
          ) : (
            <div className="h-9 w-9 shrink-0" aria-hidden="true" />
          )}

          {/* Command palette trigger */}
          <button
            type="button"
            onClick={palette.open}
            className="bg-surface text-muted hover:bg-surface-secondary hover:text-foreground hidden items-center gap-2 rounded-md border border-[--border-color,oklch(0%_0_0_/_12%)] px-3 py-1.5 text-sm transition-colors sm:flex"
            aria-label="Open command palette"
          >
            <span>Search…</span>
            <span className="flex items-center gap-0.5">
              <Kbd className="text-xs">⌘</Kbd>
              <Kbd className="text-xs">K</Kbd>
            </span>
          </button>

          {/* Mobile: icon-only ⌘K button */}
          <Button
            variant="ghost"
            isIconOnly
            onPress={palette.open}
            aria-label="Open command palette"
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
        </div>
      </nav>
    </header>
  );
}
