"use client";

/**
 * Site Navbar — JAG-XXX (to be implemented)
 *
 * Planned features:
 * - Logo / name on the left
 * - Navigation links: Home, Movies, Under the Hood
 * - Theme toggle button (sun/moon)
 * - Cmd+K hint badge to open Command Palette
 */

export function Navbar() {
  // TODO (JAG-XXX): Implement Navbar
  return (
    <header className="border-b border-divider bg-background/80 backdrop-blur-md">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <span className="font-semibold tracking-tight">JAG Portfolio</span>
        <span className="text-xs text-default-400">⌘K</span>
      </nav>
    </header>
  );
}
