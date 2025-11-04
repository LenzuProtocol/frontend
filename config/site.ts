export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  name: "Lenzu Protocol",
  description:
    "Lenzu Protocol is a decentralized autonomous liquidity manager.",
  url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
};
