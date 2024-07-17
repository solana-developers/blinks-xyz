import { NavigationConfig, SiteConfig } from "@/types";

export const siteConfig: SiteConfig = {
  name: "Blinks.xyz",
  description:
    "Bring Crypto to the People with Solana Actions and Blockchain Links. " +
    "Interface with users anywhere you can post a (b)link.",
  url: "https://blinks.xyz",
  ogImage: "https://blinks.xyzog.jpg",
  links: {
    twitter: "https://twitter.com/solana_devs",
    github: "https://github.com/solana-developers/solana-actions",
    docs: "https://solana.com/docs/advanced/actions",
  },
  twitterHandle: "solana_devs",
};

export const navigationConfig: NavigationConfig = {
  mainNav: [
    {
      title: "Inspector",
      href: "/inspector",
    },
    // {
    //   title: "Developers",
    //   href: "/developers",
    // },
  ],
};
