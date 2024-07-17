import { Metadata } from "next";
import { InspectorForm } from "@/components/inspector-form";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Inspector",
  alternates: {
    canonical: "/inspector",
  },
};

export default function Page() {
  return (
    <>
      <section className="space-y-6 pb-8 pt-6 md:pb-12 md:pt-">
        <div className="container flex max-w-[64rem] flex-col items-center gap-4 text-center">
          {/* <Link
            href={siteConfig.links.twitter}
            className="rounded-2xl bg-muted px-4 py-1.5 text-sm font-medium"
            target="_blank"
          >
            Follow along on Twitter
          </Link> */}

          <h1 className="font-heading text-3xl sm:text-5xl md:text-6xl lg:text-7xl">
            Blink Inspector
          </h1>
          <p className="max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8">
            Enter the URL of a Solana Action or Blink
          </p>
        </div>
      </section>

      <Suspense>
        <InspectorForm className="p-4" />
      </Suspense>
    </>
  );
}
