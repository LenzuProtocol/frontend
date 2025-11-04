/**
 * Custom hooks for managing cryptocurrency price data
 */

import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useCallback } from "react";

import priceAPI, { TokenPriceData } from "@/services/price-api";

const PRICE_KEYS = {
  all: ["prices"] as const,
  lists: () => [...PRICE_KEYS.all, "list"] as const,
  list: (filters: string) => [...PRICE_KEYS.lists(), { filters }] as const,
  details: () => [...PRICE_KEYS.all, "detail"] as const,
  detail: (symbol: string) => [...PRICE_KEYS.details(), symbol] as const,
  history: (symbol: string, timeframe: string) =>
    [...PRICE_KEYS.all, "history", symbol, timeframe] as const,
  portfolio: (balances: string) =>
    [...PRICE_KEYS.all, "portfolio", balances] as const,
};

/**
 * Hook to fetch price for a single token
 */
export function useTokenPrice(symbol: string, enabled: boolean = true) {
  return useQuery({
    queryKey: PRICE_KEYS.detail(symbol.toUpperCase()),
    queryFn: () => priceAPI.getTokenPrice(symbol),
    enabled: enabled && !!symbol,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchInterval: 60 * 1000,
    retry: 1,
    retryDelay: 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    placeholderData: (previousData) => previousData,
  });
}

/**
 * Hook to fetch prices for all tracked tokens
 */
export function useAllPrices(enabled: boolean = true) {
  return useQuery({
    queryKey: PRICE_KEYS.lists(),
    queryFn: () => priceAPI.getAllPrices(),
    enabled,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchInterval: 60 * 1000,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

/**
 * Hook to fetch price history for a token
 */
export function usePriceHistory(
  symbol: string,
  timeframe: "1h" | "24h" | "7d" | "30d" = "24h",
  enabled: boolean = true,
) {
  return useQuery({
    queryKey: PRICE_KEYS.history(symbol.toUpperCase(), timeframe),
    queryFn: () => priceAPI.getPriceHistory(symbol, timeframe),
    enabled: enabled && !!symbol,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
    retry: 2,
  });
}

/**
 * Hook to calculate portfolio value
 */
export function usePortfolioValue(
  balances: Record<string, number>,
  enabled: boolean = true,
) {
  const balancesKey = JSON.stringify(balances);

  return useQuery({
    queryKey: PRICE_KEYS.portfolio(balancesKey),
    queryFn: () => priceAPI.calculatePortfolioValue(balances),
    enabled: enabled && Object.keys(balances).length > 0,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchInterval: 30 * 1000,
    retry: 2,
  });
}

/**
 * Hook to force price updates
 */
export function useForcePriceUpdate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: priceAPI.forcePriceUpdate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRICE_KEYS.all });
    },
  });
}

/**
 * Hook that provides formatted price information
 */
export function useFormattedPrice(symbol: string, enabled: boolean = true) {
  const { data: priceData, ...query } = useTokenPrice(symbol, enabled);

  const cachedPrice = priceAPI.getCachedPrice(symbol);
  const displayData = priceData || cachedPrice;

  const formatted = displayData
    ? {
        price: priceAPI.formatPrice(displayData.price_usd),
        rawPrice: displayData.price_usd,
        change: displayData.price_change_24h
          ? priceAPI.formatPriceChange(displayData.price_change_24h)
          : null,
        rawChange: displayData.price_change_24h,
        isPositive: (displayData.price_change_24h || 0) >= 0,
        marketCap: displayData.market_cap
          ? priceAPI.formatPrice(displayData.market_cap, 0)
          : null,
        volume24h: displayData.volume_24h
          ? priceAPI.formatPrice(displayData.volume_24h, 0)
          : null,
        lastUpdated: new Date(displayData.last_updated * 1000),
      }
    : null;

  return {
    ...query,
    data: priceData,
    formatted,
  };
}

/**
 * Hook for getting multiple token prices at once
 */
export function useMultipleTokenPrices(
  symbols: string[],
  enabled: boolean = true,
) {
  const { data: allPrices, ...query } = useAllPrices(enabled);

  const filteredPrices = allPrices
    ? Object.fromEntries(
        symbols
          .map((symbol) => [
            symbol.toUpperCase(),
            allPrices[symbol.toUpperCase()],
          ])
          .filter(([, price]) => price !== undefined),
      )
    : {};

  return {
    ...query,
    data: filteredPrices,
  };
}

/**
 * Hook that provides immediate cached price (no loading state)
 */
export function useCachedPrice(symbol: string): TokenPriceData | null {
  return priceAPI.getCachedPrice(symbol);
}

/**
 * Hook for portfolio statistics with formatted values
 */
export function usePortfolioStats(
  balances: Record<string, number>,
  enabled: boolean = true,
) {
  const { data: portfolio, ...query } = usePortfolioValue(balances, enabled);

  const stats = portfolio
    ? {
        totalValue: priceAPI.formatPrice(portfolio.total_value_usd),
        rawTotalValue: portfolio.total_value_usd,
        tokens: Object.entries(portfolio.tokens).map(([symbol, data]) => ({
          symbol,
          balance: data.balance,
          price: priceAPI.formatPrice(data.price_usd),
          value: priceAPI.formatPrice(data.value_usd),
          percentage: data.percentage,
          rawPrice: data.price_usd,
          rawValue: data.value_usd,
        })),
        timestamp: portfolio.timestamp,
      }
    : null;

  return {
    ...query,
    data: portfolio,
    stats,
  };
}

/**
 * Hook to refresh specific price data
 */
export function useRefreshPrice() {
  const queryClient = useQueryClient();

  const refreshPrice = useCallback(
    (symbol: string) => {
      queryClient.invalidateQueries({
        queryKey: PRICE_KEYS.detail(symbol.toUpperCase()),
      });
    },
    [queryClient],
  );

  const refreshAllPrices = useCallback(() => {
    queryClient.invalidateQueries({
      queryKey: PRICE_KEYS.all,
    });
  }, [queryClient]);

  return {
    refreshPrice,
    refreshAllPrices,
  };
}

/**
 * Hook to get price change indicator (up/down/neutral)
 */
export function usePriceIndicator(symbol: string) {
  const { data: priceData } = useTokenPrice(symbol);

  if (!priceData?.price_change_24h) {
    return "neutral";
  }

  return priceData.price_change_24h > 0 ? "up" : "down";
}

export const formatPrice = priceAPI.formatPrice;
export const formatPriceChange = priceAPI.formatPriceChange;
