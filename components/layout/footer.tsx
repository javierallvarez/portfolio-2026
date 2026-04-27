import NextLink from "next/link";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/get-dictionary";
import { withLocale } from "@/lib/i18n/utils";

const FOOTER_PATHS = ["/", "/cv", "/interactive-lab", "/under-the-hood"] as const;

type FooterDict = Dictionary["footer"];

export function Footer({ footer, lang }: { footer: FooterDict; lang: Locale }) {
  const year = new Date().getFullYear();
  const labels: Record<(typeof FOOTER_PATHS)[number], string> = {
    "/": footer.home,
    "/cv": footer.cv,
    "/interactive-lab": footer.interactiveLab,
    "/under-the-hood": footer.underTheHood,
  };

  return (
    <footer className="mt-auto border-t border-[--border-color,oklch(0%_0_0_/_8%)] print:hidden">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-6 text-sm sm:flex-row sm:px-6">
        <p className="text-muted">
          {footer.copyrightLead} {year} {footer.copyrightMid}{" "}
          <span aria-label={footer.copyrightHeartAria}>♥</span>.
        </p>

        <nav aria-label="Footer navigation">
          <ul className="flex items-center gap-4" role="list">
            {FOOTER_PATHS.map((path) => (
              <li key={path}>
                <NextLink
                  href={withLocale(lang, path)}
                  className="text-muted hover:text-foreground transition-colors"
                >
                  {labels[path]}
                </NextLink>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </footer>
  );
}
