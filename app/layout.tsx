import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, DM_Serif_Display } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { Providers } from "@/components/providers";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { CommandPalette } from "@/components/layout/command-palette";
import { DeveloperGreeting } from "@/components/layout/developer-greeting";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const dmSerifDisplay = DM_Serif_Display({
  variable: "--font-dm-serif",
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Javier Álvarez — Software Engineering Portfolio",
    template: "%s | Javier Álvarez",
  },
  description:
    "Software Engineer at Adevinta. Spec-driven, full-stack engineering with Next.js, PostgreSQL, Drizzle ORM, and CI/CD best practices.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    /*
     * ClerkProvider must wrap <html> so Clerk's session is available to
     * every Server Component and Server Action in the tree.
     *
     * suppressHydrationWarning is required on <html> because next-themes
     * modifies the class attribute on the client, causing a mismatch with
     * the server-rendered markup.
     */
    <ClerkProvider>
      <html
        lang="en"
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} ${dmSerifDisplay.variable} h-full antialiased`}
      >
        {/*
         * Inline theme-init script runs synchronously before first paint to prevent FOUC.
         * Lives in the Server Component <head> so React never touches it — avoids the
         * React 19 "Encountered a script tag in a client component" console.error that
         * next-themes v0.4.x triggers by injecting the same script inside ThemeProvider.
         */}
        <head>
          <script
            dangerouslySetInnerHTML={{
              __html: `(function(){try{var t=localStorage.getItem('theme');var dark=t==='dark'||((!t||t==='system')&&window.matchMedia('(prefers-color-scheme:dark)').matches);document.documentElement.classList.toggle('dark',dark);}catch(e){}})()`,
            }}
          />
        </head>
        <body
          className="bg-background text-foreground flex min-h-full flex-col"
          suppressHydrationWarning
        >
          <Providers>
            <DeveloperGreeting />
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
            <CommandPalette />
          </Providers>
        </body>
      </html>
    </ClerkProvider>
  );
}
