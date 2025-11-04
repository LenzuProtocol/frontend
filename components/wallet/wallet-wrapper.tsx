"use client";

import React, { useEffect, useState } from "react";
import { useAccount } from "wagmi";

export default function WalletWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isConnected } = useAccount();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] w-full">
        <h1 className="text-2xl font-bold">Please connect your wallet</h1>
        <p className="mt-4 text-gray-600">
          You need to connect your wallet to access this page.
        </p>
      </div>
    );
  }

  return <React.Fragment>{children}</React.Fragment>;
}
