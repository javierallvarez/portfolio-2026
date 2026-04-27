import { Wrench, Bot, ShieldCheck } from "lucide-react";
import { HeroActions } from "@/components/hero-actions";
import type { Locale } from "@/lib/i18n/config";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/get-dictionary";
import { withLocale } from "@/lib/i18n/utils";

export default async function HomePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: raw } = await params;
  const lang: Locale = isLocale(raw) ? raw : "es";
  const dict = await getDictionary(lang);
  const labHref = withLocale(lang, "/interactive-lab");

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
        className="pointer-events-none absolute inset-0 -z-10 [background:radial-gradient(ellipse_80%_50%_at_50%_-20%,oklch(65%_0.18_270_/_15%),transparent)]"
      />

      <section className="mx-auto flex max-w-4xl flex-col items-center px-6 pt-20 pb-24 text-center sm:pt-32">
        <h1 className="text-foreground font-serif text-4xl font-normal tracking-tight sm:text-6xl lg:text-7xl">
          {dict.hero.titleLead}{" "}
          <span className="bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
            {dict.hero.titleAccent}
          </span>
        </h1>

        <p className="text-muted mt-6 max-w-2xl text-lg leading-relaxed sm:text-xl">
          {dict.hero.subtitleBefore}{" "}
          <span className="text-foreground font-medium">{dict.hero.subtitleCompany}</span>.{" "}
          {dict.hero.subtitleAfter}
        </p>

        <HeroActions
          labHref={labHref}
          exploreLabel={dict.hero.exploreLab}
          openPaletteLabel={dict.hero.openPalette}
        />

        <div className="mt-12 flex flex-wrap justify-center gap-2">
          {dict.hero.chips.map((tech) => (
            <span
              key={tech}
              className="bg-surface text-muted rounded-full px-3 py-1 text-xs font-medium ring-1 ring-[--border-color,oklch(0%_0_0_/_8%)]"
            >
              {tech}
            </span>
          ))}
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
