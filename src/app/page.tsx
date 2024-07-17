import { Metadata } from "next";
import Link from "next/link";

import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BookOpenTextIcon,
  CodeIcon,
  HeartHandshakeIcon,
  LightbulbIcon,
  MessageCircleHeartIcon,
  SwatchBookIcon,
} from "lucide-react";

export const metadata: Metadata = {
  alternates: {
    canonical: "/",
  },
};

//
const resourceCards: Array<{
  title: string;
  href: string;
  description: React.ReactNode;
  icon: React.ReactNode;
}> = [
  {
    href: siteConfig.links.docs,
    title: "Documentation",
    description:
      "Read the documentation and spec for Solana Actions and blinks.",
    icon: <BookOpenTextIcon strokeWidth={1.4} className="size-12" />,
  },
  {
    href: "https://www.npmjs.com/package/@solana/actions",
    title: "@solana/actions SDK",
    description: "Quickly get started building actions using the NPM package.",
    icon: <CodeIcon strokeWidth={1.4} className="size-12" />,
  },
  {
    href: "https://github.com/solana-developers/solana-actions/tree/main/examples",
    title: "Code Samples",
    description: "See example code for how to build Actions into your project.",
    icon: <SwatchBookIcon strokeWidth={1.4} className="size-12" />,
  },
  {
    href: "https://dial.to",
    title: "Dialect's Dial.to",
    description: "Use dial.to in order to test your blinks with a wallet.",
    icon: <MessageCircleHeartIcon className="size-12" />,
  },
  {
    href: "https://github.com/solana-developers/awesome-blinks",
    title: "Awesome Blinks",
    description:
      "Collection of awesome resources for blinks and live ones in the wild.",
    icon: <HeartHandshakeIcon className="size-12" />,
  },
  {
    href: "https://github.com/solana-developers/awesome-blinks/discussions/categories/ideas-for-blinks",
    title: "Ideas for Blinks",
    description: "Get inspired and see what new ideas people have for blinks.",
    icon: <LightbulbIcon className="size-12" />,
  },
];

export default function Page() {
  return (
    <>
      <section className="space-y-6 pb-8 pt-6 md:pb-12 md:pt-10 lg:py-32">
        <div className="container flex max-w-[64rem] flex-col items-center gap-4 text-center">
          {/* <Link
            href={siteConfig.links.twitter}
            className="rounded-2xl bg-muted px-4 py-1.5 text-sm font-medium"
            target="_blank"
          >
            Follow along on Twitter
          </Link> */}

          <h1 className="font-heading text-3xl sm:text-5xl md:text-6xl lg:text-7xl">
            Bring Crypto to the People with{" "}
            <span className="font-medium text-solana-gradient">
              Solana Actions
            </span>
            {" and "}
            <span className="font-medium text-solana-gradient-reverse">
              Blockchain Links
            </span>
          </h1>
          <p className="max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8">
            Interface with users anywhere you can post a (b)link.
          </p>
          <div className="space-x-4">
            <Link
              target="_blank"
              href="https://solana.com/solutions/actions"
              className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
            >
              Learn More
            </Link>
            <Link
              href={siteConfig.links.docs}
              target="_blank"
              rel="noreferrer"
              className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
            >
              Read the Docs
            </Link>
          </div>
          <div className="space-x-4">
            <Link
              href="/inspector"
              className={cn(buttonVariants({ size: "lg" }))}
            >
              Blink Inspector
            </Link>
          </div>
        </div>
      </section>
      <section
        id="resources"
        className="container space-y-6 bg-slate-50 py-8 dark:bg-transparent md:py-12 lg:py-24"
      >
        <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
          <h2 className="font-heading text-3xl leading-[1.1] sm:text-3xl md:text-6xl">
            Resources
          </h2>
          <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
            Discover the growing ecosystem of tooling and resources for Solana
            Actions and blinks.
          </p>
        </div>

        <div className="mx-auto grid justify-center gap-4 sm:grid-cols-2 md:max-w-[64rem] md:grid-cols-3">
          {resourceCards.map((item, key) => (
            <Link
              key={key}
              href={item.href}
              target={item.href.match(/^http/i) ? "_blank" : ""}
              className="group"
            >
              <Card className="group-hover:border-primary">
                <CardHeader>
                  <CardTitle className="space-y-3">
                    {item.icon}
                    <span className="block font-bold group-hover:text-pretty">
                      {item.title}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-muted-foreground">{item.description}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
        {/* <div className="mx-auto text-center md:max-w-[58rem]">
          <p className="leading-normal text-muted-foreground sm:text-lg sm:leading-7"></p>
        </div> */}
      </section>
    </>
  );
}
