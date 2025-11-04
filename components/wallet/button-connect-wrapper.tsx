"use client";

import React, { useEffect, useState } from "react";
import { useAccount } from "wagmi";

import { ConnectButton } from "@/components/ConnectButton";

export default function ButtonConnectWrapper({
  children,
  className = "",
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  const { isConnected } = useAccount();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return !isConnected ? (
    <div className={className}>
      <ConnectButton />
    </div>
  ) : (
    <>{children}</>
  );
}
