import * as React from "react";

import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";
import { ThemeModeToggle } from "@/components/theme-mode-toggle";
import { Button, buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import { EyeIcon } from "lucide-react";

export function SiteFooter({ className }: React.HTMLAttributes<HTMLElement>) {
  return (
    <footer className={cn(className)}>
      <div className="container flex flex-col items-center justify-between gap-4 py-10 md:h-24 md:flex-row md:py-0">
        <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
          <EyeIcon strokeWidth={1.4} className="hidden md:block" />
          <p className="text-center text-sm leading-loose md:text-left">
            Maintained by{" "}
            <a
              href={siteConfig.links.twitter}
              target="_blank"
              rel="noreferrer"
              className="font-medium underline underline-offset-4"
            >
              @solana_devs
            </a>
            {/* . Source code is available on{" "}
            <a
              href={siteConfig.links.github}
              target="_blank"
              rel="noreferrer"
              className="font-medium underline underline-offset-4"
            >
              GitHub
            </a>
            . */}
          </p>
        </div>
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
    </footer>
  );
}
