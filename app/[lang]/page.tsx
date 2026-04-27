import { Wrench, Bot, ShieldCheck } from "lucide-react";
import { BioCtas } from "@/components/home/bio-ctas";
import type { Locale } from "@/lib/i18n/config";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/get-dictionary";

export default async function HomePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: raw } = await params;
  const lang: Locale = isLocale(raw) ? raw : "es";
  const dict = await getDictionary(lang);
  const { bio, hero } = dict;

  const featureIcons = {
    internal: <Wrench size={22} className="text-teal-400" />,
    ai: <Bot size={22} className="text-teal-400" />,
    security: <ShieldCheck size={22} className="text-teal-400" />,
  } as const;

  const featureKeys = ["internal", "ai", "security"] as const;

  return (
    <div className="relative isolate overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 [background:radial-gradient(ellipse_80%_50%_at_50%_-20%,oklch(65%_0.18_270_/_12%),transparent)]"
      />

      <section className="mx-auto max-w-5xl px-6 pt-16 pb-20 sm:pt-28 sm:pb-24">
        <div className="flex flex-col items-center text-center">
          <h1 className="home-hero-headline mb-6 max-w-4xl bg-gradient-to-r from-zinc-900 to-zinc-500 bg-clip-text text-5xl font-black tracking-tighter text-balance text-transparent md:text-6xl lg:text-7xl dark:from-zinc-100 dark:to-zinc-500">
            {hero.headline}
          </h1>
          <p className="mb-4 max-w-2xl text-2xl font-semibold text-zinc-700 md:text-3xl dark:text-zinc-300">
            {hero.subheadline}
          </p>
          <p className="mb-8 max-w-2xl text-lg text-pretty text-zinc-600 md:text-xl dark:text-zinc-400">
            {hero.description}
          </p>
          <div className="flex justify-center">
            <BioCtas ctaCv={bio.ctaCv} ctaLinkedIn={bio.ctaLinkedIn} />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 pb-24">
        <div className="grid gap-4 sm:grid-cols-3">
          {featureKeys.map((key) => {
            const card = dict.features[key];
            return (
              <div
                key={key}
                className="bg-surface rounded-2xl border border-[--border-color,oklch(0%_0_0_/_8%)] p-6 shadow-sm"
              >
                <div className="mb-3">{featureIcons[key]}</div>
                <h3 className="text-foreground mb-2 font-semibold">{card.title}</h3>
                <p className="text-muted text-sm leading-relaxed">{card.description}</p>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
