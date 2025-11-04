import { useBalance } from "wagmi";
import { formatUnits } from "viem";

import { Addresses } from "@/lib/addresses";

export const USDC_ADDRESS = Addresses.USDC as `0x${string}`;

export function useUsdcBalance(address?: `0x${string}`) {
  const balance = useBalance({
    address,
    token: USDC_ADDRESS,
    query: {
      refetchInterval: 10000,
      staleTime: 30000,
      enabled: !!address,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      placeholderData: (previousData) => previousData,
    },
  });

  return {
    ...balance,
    data: balance.data
      ? formatUnits(balance.data.value, balance.data.decimals)
      : "0",
  };
}

export function formatUsdcBalance(
  balance: string | number,
  decimals = 2,
): string {
  const num = typeof balance === "string" ? parseFloat(balance) : balance;

  if (isNaN(num)) return "0.00";
  if (num === 0) return "0.00";
  if (num < 0.01) return "<0.01";
  if (num < 1) return num.toFixed(Math.min(decimals + 1, 4));
  if (num < 1000) return num.toFixed(decimals);

  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + "M";
  if (num >= 1_000) return (num / 1_000).toFixed(1) + "K";

  return num.toFixed(decimals);
}
