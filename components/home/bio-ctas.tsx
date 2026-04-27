"use client";

import NextLink from "next/link";
import { Button } from "@heroui/react";
import { toast } from "@heroui/react";
import type { Dictionary } from "@/lib/get-dictionary";
import { LINKEDIN_PROFILE_URL } from "@/lib/social";

export function BioCtas({
  ctaCv,
  ctaLinkedIn,
  cvToastTitle,
  cvToastDescription,
}: Pick<Dictionary["bio"], "ctaCv" | "ctaLinkedIn" | "cvToastTitle" | "cvToastDescription">) {
  return (
    <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
      <Button
        variant="outline"
        className="text-foreground w-full border-teal-500/40 sm:w-auto"
        onPress={() => toast.info(cvToastTitle, { description: cvToastDescription })}
      >
        {ctaCv}
      </Button>
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
