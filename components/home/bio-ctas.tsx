"use client";

import NextLink from "next/link";
import type { Dictionary } from "@/lib/get-dictionary";
import { LINKEDIN_PROFILE_URL } from "@/lib/social";
import { PrintPdfButton } from "@/components/cv/print-pdf-button";

export function BioCtas({ ctaCv, ctaLinkedIn }: Pick<Dictionary["bio"], "ctaCv" | "ctaLinkedIn">) {
  return (
    <div className="flex flex-col items-center gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-center">
      <PrintPdfButton label={ctaCv} className="w-full border-teal-500/40 sm:w-auto" />
      <NextLink
        href={LINKEDIN_PROFILE_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex h-10 w-full items-center justify-center rounded-lg bg-teal-500 px-4 text-sm font-medium text-white shadow-sm transition-colors hover:bg-teal-400 sm:w-auto"
      >
        {ctaLinkedIn}
      </NextLink>
    </div>
  );
}
