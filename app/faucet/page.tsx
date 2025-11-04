import type { Metadata } from "next";

import React from "react";

import Faucet from "./_components/faucet";

export const metadata: Metadata = {
  title: "USDC Faucet | Lenzu",
  description: "Get free testnet USDC for Somnia Testnet network",
};

export default function FaucetPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <Faucet />
    </div>
  );
}
