import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";

import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";
import { MainNav } from "@/components/main-nav";
import { SiteFooter } from "@/components/site-footer";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeModeToggle } from "@/components/theme-mode-toggle";
import { navigationConfig, siteConfig } from "@/config/site";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    template: `${siteConfig.name} - %s`,
    default: `${siteConfig.name} - Interface with users anywhere you can post a (b)link.`,
  },
  openGraph: {
    images: "/og-image.jpg",
  },
  twitter: {
    card: "summary_large_image",
    creator: siteConfig.twitterHandle,
  },
  description: siteConfig.description,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <div className="flex min-h-screen flex-col">
            <header className="container z-40 bg-background">
              <div className="flex h-20 items-center justify-between py-6">
                <MainNav items={navigationConfig.mainNav} />

                <nav className="flex items-center gap-2">
                  <Button asChild>
                    <Link
                      target="_blank"
                      href={siteConfig.links.docs}
                      className={cn(
                        buttonVariants({ variant: "default", size: "sm" }),
                        "px-4",
                      )}
                    >
                      Read the Docs
                    </Link>
                  </Button>

                  <ThemeModeToggle />
                </nav>
              </div>
            </header>
            <main className="flex-1">{children}</main>
            <SiteFooter />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
