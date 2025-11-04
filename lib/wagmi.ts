import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { somniaTestnet } from "viem/chains";

export const config = getDefaultConfig({
  appName: "Lenzu Protocol",
  projectId:
    process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || "YOUR_PROJECT_ID",
  chains: [somniaTestnet],
  ssr: true,
});
