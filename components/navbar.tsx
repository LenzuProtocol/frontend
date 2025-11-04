"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import React from "react";

import FallbackImage from "./fallback-image";
import { Skeleton } from "./ui/skeleton";
import { ConnectButtonCustom } from "./wallet/connect-button-custom";

import { ConnectButton } from "@/components/ConnectButton";

function NavbarSkeleton() {
  return <Skeleton className="h-10 w-32 rounded-lg" />;
}

export default function Navbar() {
  const { isConnected, isConnecting } = useAccount();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  return (
    <div className="w-full border-b sticky top-0 z-40 bg-background">
      <div className="flex items-center justify-between px-5 py-3">
        <div className="flex items-center gap-6">
          <Link className="flex items-center gap-3" href={"/"}>
            <FallbackImage
              alt="Logo"
              className="object-contain w-10 h-10 cursor-pointer"
              height={120}
              src="/logo-white.png"
              width={120}
            />
            <span className="hidden sm:block text-2xl font-semibold cursor-pointer hover:text-muted-foreground transition-colors whitespace-nowrap">
              Lenzu Protocol
            </span>
          </Link>

          <Link className="mt-1" href={"/faucet"}>
            <span className="text-lg text-neutral-400 font-medium hover:text-white transition-colors">
              Faucet
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-3">
          {isConnecting ? (
            <NavbarSkeleton />
          ) : isConnected ? (
            <ConnectButtonCustom />
          ) : (
            <ConnectButton />
          )}
        </div>
      </div>
    </div>
  );
}
