import NextLink from "next/link";

const FOOTER_LINKS = [
  { href: "/", label: "Home" },
  { href: "/interactive-lab", label: "Interactive Lab" },
  { href: "/under-the-hood", label: "Under the Hood" },
] as const;

export function Footer() {
  return (
    <footer className="mt-auto border-t border-[--border-color,oklch(0%_0_0_/_8%)]">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-6 text-sm sm:flex-row sm:px-6">
        <p className="text-muted">
          © {new Date().getFullYear()} Javier Álvarez. Built in public with{" "}
          <span aria-label="love">♥</span>.
        </p>

        <nav aria-label="Footer navigation">
          <ul className="flex items-center gap-4" role="list">
            {FOOTER_LINKS.map(({ href, label }) => (
              <li key={href}>
                <NextLink
                  href={href}
                  className="text-muted hover:text-foreground transition-colors"
                >
                  {label}
                </NextLink>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </footer>
  );
}
