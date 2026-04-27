import Image from "next/image";
import { Wrench, Bot, ShieldCheck } from "lucide-react";
import { BioCtas } from "@/components/home/bio-ctas";
import type { Locale } from "@/lib/i18n/config";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/get-dictionary";

export default async function HomePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: raw } = await params;
  const lang: Locale = isLocale(raw) ? raw : "es";
  const dict = await getDictionary(lang);
  const { bio } = dict;

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

      <section className="mx-auto max-w-5xl px-6 pt-16 pb-20 sm:pt-24">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,280px)_1fr] lg:items-start lg:gap-16">
          <div className="flex justify-center lg:justify-start">
            <div className="relative aspect-square w-[min(100%,280px)] shrink-0 overflow-hidden rounded-full border-4 border-teal-400/35 shadow-[0_20px_50px_-12px_oklch(0.2_0.08_200_/_0.35)] ring-1 ring-teal-500/20">
              <Image
                src="/javier-avatar.png"
                alt={bio.avatarAlt}
                width={280}
                height={280}
                priority
                className="aspect-square h-full w-full object-cover"
              />
            </div>
          </div>

          <div className="min-w-0 text-center lg:text-left">
            <h1 className="gradient-heading font-serif text-4xl font-normal tracking-tight sm:text-5xl">
              {bio.greeting}
            </h1>
            <p className="text-muted mt-2 text-base font-medium sm:text-lg">{bio.headlineRole}</p>
            <div className="text-muted mx-auto mt-6 max-w-2xl space-y-4 text-base leading-relaxed sm:text-lg lg:mx-0">
              <p>{bio.p1}</p>
              <p>{bio.p2}</p>
              <p>{bio.petFamily}</p>
              <p className="text-foreground/90">{bio.p3}</p>
            </div>
            <div className="flex justify-center lg:justify-start">
              <BioCtas
                ctaCv={bio.ctaCv}
                ctaLinkedIn={bio.ctaLinkedIn}
                cvToastTitle={bio.cvToastTitle}
                cvToastDescription={bio.cvToastDescription}
              />
            </div>
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
