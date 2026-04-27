"use client";

import NextLink from "next/link";
import { useParams, usePathname } from "next/navigation";
import type { Locale } from "@/lib/i18n/config";
import { isLocale } from "@/lib/i18n/config";
import { stripLocale, withLocale } from "@/lib/i18n/utils";
import type { Dictionary } from "@/lib/get-dictionary";

type NavDict = Dictionary["nav"];

export function LanguageSwitcher({ nav }: { nav: NavDict }) {
  const pathname = usePathname();
  const params = useParams();
  const raw = params.lang;
  const current: Locale = typeof raw === "string" && isLocale(raw) ? raw : "es";
  const logicalPath = stripLocale(pathname);

  return (
    <div
      className="border-divider flex items-center rounded-md border text-xs font-semibold"
      role="group"
      aria-label={nav.languageSwitcherAria}
    >
      <NextLink
        href={withLocale("es", logicalPath)}
        className={[
          "rounded-l-[5px] px-2 py-1 transition-colors",
          current === "es" ? "bg-surface text-foreground" : "text-muted hover:text-foreground",
        ].join(" ")}
        aria-current={current === "es" ? "true" : undefined}
      >
        {nav.languageEs}
      </NextLink>
      <span className="bg-divider h-3 w-px shrink-0" aria-hidden="true" />
      <NextLink
        href={withLocale("en", logicalPath)}
        className={[
          "rounded-r-[5px] px-2 py-1 transition-colors",
          current === "en" ? "bg-surface text-foreground" : "text-muted hover:text-foreground",
        ].join(" ")}
        aria-current={current === "en" ? "true" : undefined}
      >
        {nav.languageEn}
      </NextLink>
    </div>
  );
}
