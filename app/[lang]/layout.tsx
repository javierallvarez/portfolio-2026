import { notFound } from "next/navigation";
import type { Locale } from "@/lib/i18n/config";
import { isLocale, locales } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/get-dictionary";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { CommandPalette } from "@/components/layout/command-palette";
import { DeveloperGreeting } from "@/components/layout/developer-greeting";
import { CareerChatHost } from "@/components/ai/career-chat-host";
import { SetHtmlLang } from "@/components/layout/set-html-lang";

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export default async function LangLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}>) {
  const { lang: langParam } = await params;
  if (!isLocale(langParam)) notFound();
  const lang = langParam as Locale;
  const dict = await getDictionary(lang);

  return (
    <>
      <SetHtmlLang lang={lang} />
      <DeveloperGreeting />
      <Navbar nav={dict.nav} lang={lang} />
      <main className="flex-1">{children}</main>
      <Footer footer={dict.footer} lang={lang} />
      <CommandPalette dict={dict.commandPalette} lang={lang} />
      <CareerChatHost />
    </>
  );
}
