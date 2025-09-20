import type { Metadata } from "next";
import Image from "next/image";
import { Space_Grotesk as SpaceGrotesk } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { ModeToggle } from "@/components/mode-toggle";
import { cn } from "@/lib/utils";

const spaceGrotesk = SpaceGrotesk({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "CodeAtlas",
  description: "Company-tagged DSA problems for interview prep.",
  icons: {
    icon: "/icon.svg",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn("min-h-screen bg-background font-sans antialiased", spaceGrotesk.variable)}>
        <ThemeProvider>
          <div className="relative flex min-h-screen flex-col bg-grid">
            <header className="border-b border-border bg-card/70 backdrop-blur-sm">
              <div className="container flex flex-col gap-2 py-3 sm:py-4 md:flex-row md:items-end md:justify-between">
                <div className="flex items-start gap-2 sm:items-center">
                  <Image
                    src="/icon.svg"
                    alt="CodeAtlas icon"
                    width={28}
                    height={28}
                    className="mt-0.5 shrink-0 sm:mt-0"
                    priority
                  />
                  <div>
                    <h1 className="text-xl font-bold tracking-tight sm:text-2xl md:text-3xl">CodeAtlas</h1>
                    <p className="text-sm text-muted-foreground">
                      Company-tagged DSA problems for focused prep.
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground md:justify-end md:text-right">
                  <p className="hidden md:block">
                    Built with Next.js &amp; shadcn/ui · Deploy on Vercel
                  </p>
                  <ModeToggle />
                </div>
              </div>
            </header>
            <main className="flex-1">{children}</main>
            <footer className="border-t border-border bg-card/70 py-6 text-center text-xs text-muted-foreground">
              Data sourced from the open-source repository
              {" "}
              <a
                href="https://github.com/liquidslr/leetcode-company-wise-problems"
                className="font-medium text-primary underline-offset-4 hover:underline"
              >
                liquidslr/leetcode-company-wise-problems
              </a>
              .
            </footer>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
