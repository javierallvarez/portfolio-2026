import Image from "next/image";
import type { Metadata } from "next";
import { PrintPdfButton } from "@/components/cv/print-pdf-button";
import type { Locale } from "@/lib/i18n/config";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/get-dictionary";
import { GITHUB_PROFILE_URL, LINKEDIN_PROFILE_URL } from "@/lib/social";
import { withLocale } from "@/lib/i18n/utils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang: raw } = await params;
  const lang: Locale = isLocale(raw) ? raw : "es";
  const dict = await getDictionary(lang);
  const { metaTitle, metaDescription } = dict.pages.cv;
  return {
    title: metaTitle,
    description: metaDescription,
  };
}

function LinkedInLogo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"
      />
    </svg>
  );
}

function GitHubLogo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.014-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.091-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.376.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.447-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0 0 22 12.017C22 6.484 17.522 2 12 2Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

const socialIconLinkClass =
  "border-divider bg-content2 text-default-600 hover:text-teal-500 focus-visible:ring-offset-background inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border transition-colors hover:border-teal-500/40 hover:bg-teal-500/10 focus-visible:ring-2 focus-visible:ring-teal-500/60 focus-visible:ring-offset-2 print:border-neutral-400 print:text-neutral-800 print:hover:bg-transparent";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-10 first:mt-0 print:break-inside-avoid">
      <h2 className="gradient-heading border-divider mb-4 border-b pb-2 font-serif text-xl font-semibold tracking-tight print:border-neutral-300">
        {title}
      </h2>
      {children}
    </section>
  );
}

export default async function CvPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: raw } = await params;
  const lang: Locale = isLocale(raw) ? raw : "es";
  const dict = await getDictionary(lang);
  const cv = dict.pages.cv;
  const homeHref = withLocale(lang, "/");

  return (
    <article
      id="cv-document"
      className="text-foreground mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16 print:max-w-none print:bg-white print:py-0 print:text-neutral-900 print:shadow-none"
    >
      <header className="flex flex-col gap-6 border-b border-[--border-color,oklch(0%_0_0_/_12%)] pb-8 sm:flex-row sm:items-start sm:justify-between print:border-neutral-300 print:pb-6">
        <div className="flex min-w-0 flex-1 flex-col gap-4 sm:flex-row sm:items-start sm:gap-6">
          <div className="border-divider relative mx-auto h-32 w-32 shrink-0 overflow-hidden rounded-2xl border shadow-sm sm:mx-0 sm:h-36 sm:w-36 print:h-28 print:w-28 print:border-neutral-300">
            <Image
              src="/javi-avatar.png"
              alt={cv.avatarAlt}
              width={144}
              height={144}
              priority
              className="h-full w-full object-cover"
            />
          </div>
          <div className="min-w-0 flex-1 text-center sm:text-left print:text-left">
            <h1 className="gradient-heading font-serif text-3xl font-semibold tracking-tight sm:text-4xl print:text-2xl">
              {cv.name}
            </h1>
            <p className="text-muted mt-1 text-lg print:text-base print:text-neutral-700">
              {cv.role}
            </p>
            <p className="text-default-500 mt-3 max-w-xl text-sm leading-relaxed print:text-xs print:text-neutral-600">
              {cv.tagline}
            </p>
          </div>
        </div>
        <div className="flex flex-col items-stretch gap-2 sm:items-end print:items-end">
          <PrintPdfButton label={cv.printPdf} className="w-full border-teal-500/40 sm:w-auto" />
          <div className="flex flex-wrap justify-center gap-2 sm:justify-end print:justify-end">
            <a
              href={LINKEDIN_PROFILE_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={cv.linkedinLabel}
              className={socialIconLinkClass}
            >
              <LinkedInLogo className="h-5 w-5" />
            </a>
            <a
              href={GITHUB_PROFILE_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={cv.githubLabel}
              className={socialIconLinkClass}
            >
              <GitHubLogo className="h-5 w-5" />
            </a>
            <a
              href={homeHref}
              className="text-muted inline-flex items-center justify-center rounded-lg border border-transparent px-3 py-1.5 text-sm font-medium underline-offset-2 hover:underline print:border print:border-neutral-400 print:text-neutral-800 print:no-underline"
            >
              {cv.portfolioLabel}
            </a>
          </div>
        </div>
      </header>

      <Section title={cv.experienceTitle}>
        <div className="print:break-inside-avoid">
          <p className="text-foreground font-semibold print:text-black">{cv.experienceCompany}</p>
          <p className="text-muted text-sm print:text-neutral-700">{cv.experienceRole}</p>
          <p className="text-default-400 mt-0.5 text-xs print:text-neutral-600">
            {cv.experiencePeriod}
          </p>
          <ul className="text-default-600 mt-4 list-disc space-y-2 pl-5 text-sm leading-relaxed print:text-neutral-800">
            {cv.experienceBullets.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </Section>

      <Section title={cv.skillsTitle}>
        <p className="text-default-600 mb-4 text-sm leading-relaxed print:text-neutral-800">
          {cv.skillsIntro}
        </p>
        <ul className="space-y-3">
          {cv.skillGroups.map((g) => (
            <li key={g.name} className="print:break-inside-avoid">
              <span className="text-foreground text-sm font-semibold print:text-black">
                {g.name}
              </span>
              <span className="text-default-600 text-sm print:text-neutral-800"> — {g.items}</span>
            </li>
          ))}
        </ul>
      </Section>

      <Section title={cv.projectsTitle}>
        <ul className="space-y-4">
          {cv.projects.map((p) => (
            <li key={p.name} className="print:break-inside-avoid">
              <p className="text-foreground font-medium print:text-black">{p.name}</p>
              <p className="text-default-600 mt-1 text-sm leading-relaxed print:text-neutral-800">
                {p.body}
              </p>
            </li>
          ))}
        </ul>
      </Section>

      <Section title={cv.personalTitle}>
        <div className="text-default-600 space-y-3 text-sm leading-relaxed print:text-neutral-800">
          {cv.personalParagraphs.map((para) => (
            <p key={para}>{para}</p>
          ))}
        </div>
      </Section>
    </article>
  );
}
