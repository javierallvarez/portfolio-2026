"use client";

import { useId } from "react";
import NextLink from "next/link";
import { useParams, usePathname } from "next/navigation";
import type { Locale } from "@/lib/i18n/config";
import { isLocale } from "@/lib/i18n/config";
import { stripLocale, withLocale } from "@/lib/i18n/utils";
import type { Dictionary } from "@/lib/get-dictionary";

type NavDict = Dictionary["nav"];

function SpainFlag({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 3 2"
      className={className}
      aria-hidden="true"
    >
      <rect width="3" height="0.5" y="0" fill="#c60b1e" />
      <rect width="3" height="1" y="0.5" fill="#ffc400" />
      <rect width="3" height="0.5" y="1.5" fill="#c60b1e" />
    </svg>
  );
}

function UkFlag({ className, clipPathId }: { className?: string; clipPathId: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 60 30"
      className={className}
      aria-hidden="true"
    >
      <clipPath id={clipPathId}>
        <path d="M0 0v30h60V0z" />
      </clipPath>
      <path d="M0 0v30h60V0z" fill="#012169" />
      <path
        d="M0 0l60 30m0-30L0 30"
        stroke="#fff"
        strokeWidth="6"
        clipPath={`url(#${clipPathId})`}
      />
      <path
        d="M0 0l60 30m0-30L0 30"
        stroke="#c8102e"
        strokeWidth="4"
        clipPath={`url(#${clipPathId})`}
      />
      <path d="M30 0v30M0 15h60" stroke="#fff" strokeWidth="10" clipPath={`url(#${clipPathId})`} />
      <path
        d="M30 0v30M0 15h60"
        stroke="#c8102e"
        strokeWidth="6"
        clipPath={`url(#${clipPathId})`}
      />
    </svg>
  );
}

export function LanguageSwitcher({ nav }: { nav: NavDict }) {
  const pathname = usePathname();
  const params = useParams();
  const raw = params.lang;
  const current: Locale = typeof raw === "string" && isLocale(raw) ? raw : "es";
  const logicalPath = stripLocale(pathname);
  const ukClipId = useId().replace(/:/g, "");

  const linkBase =
    "flex h-9 w-9 items-center justify-center rounded-md border transition-colors outline-none focus-visible:ring-2 focus-visible:ring-teal-500/50";

  return (
    <div
      className="border-divider flex items-center gap-0.5 rounded-md border p-0.5"
      role="group"
      aria-label={nav.languageSwitcherAria}
    >
      <NextLink
        href={withLocale("es", logicalPath)}
        aria-label={nav.languageEsAria}
        aria-current={current === "es" ? "true" : undefined}
        className={[
          linkBase,
          current === "es"
            ? "bg-surface text-foreground border-teal-500/50"
            : "text-muted hover:bg-surface hover:text-foreground border-transparent hover:border-[--border-color,oklch(0%_0_0_/_12%)]",
        ].join(" ")}
      >
        <SpainFlag className="h-4 w-6 rounded-[2px] shadow-sm" />
      </NextLink>
      <NextLink
        href={withLocale("en", logicalPath)}
        aria-label={nav.languageEnAria}
        aria-current={current === "en" ? "true" : undefined}
        className={[
          linkBase,
          current === "en"
            ? "bg-surface text-foreground border-teal-500/50"
            : "text-muted hover:bg-surface hover:text-foreground border-transparent hover:border-[--border-color,oklch(0%_0_0_/_12%)]",
        ].join(" ")}
      >
        <UkFlag className="h-4 w-[1.35rem] rounded-[2px] shadow-sm" clipPathId={ukClipId} />
      </NextLink>
    </div>
  );
}
