import { cache } from "react";
import type { Locale } from "@/lib/i18n/config";
import en from "@/dictionaries/en.json";
import es from "@/dictionaries/es.json";

export type Dictionary = typeof en;

const dictionaries: Record<Locale, Dictionary> = {
  en,
  es,
};

export const getDictionary = cache(async (locale: Locale): Promise<Dictionary> => {
  return dictionaries[locale];
});
