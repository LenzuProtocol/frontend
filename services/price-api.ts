/**
 * Price Oracle API Client
 *
 * Service for fetching cryptocurrency prices from the agent backend
 */

interface TokenPriceData {
  coingecko_id: string;
  price_usd: number;
  market_cap?: number;
  volume_24h?: number;
  price_change_24h?: number;
  last_updated: number;
}

interface PriceResponse {
  status: "success" | "error";
  symbol?: string;
  price_data?: TokenPriceData;
  message?: string;
}

interface AllPricesResponse {
  status: "success" | "error";
  timestamp: number;
  prices: Record<string, TokenPriceData>;
}

interface PriceHistoryPoint {
  symbol: string;
  price_usd: number;
  timestamp: number;
  interval_type: string;
}

interface PriceHistoryResponse {
  status: "success" | "error";
  symbol: string;
  timeframe: string;
  data_points: number;
  history: PriceHistoryPoint[];
}

interface PortfolioValue {
  balance: number;
  price_usd: number;
  value_usd: number;
  percentage: number;
}

interface PortfolioResponse {
  status: "success" | "error";
  portfolio: {
    total_value_usd: number;
    tokens: Record<string, PortfolioValue>;
    timestamp: number;
  };
}

const FALLBACK_PRICES = {
  ETH: 3500,
  WETH: 3500,
  USDC: 1,
  USDT: 1,
  BTC: 35000,
};

class PriceAPI {
  private baseURL: string;
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private cacheTTL = 5 * 60 * 1000;

  constructor(baseURL: string = "http://localhost:8000") {
    this.baseURL = baseURL;

    this.initializeFallbackPrices();
  }

  private initializeFallbackPrices() {
    Object.entries(FALLBACK_PRICES).forEach(([symbol, price]) => {
      const fallbackData = {
        status: "success",
        price_data: {
          coingecko_id: symbol.toLowerCase(),
          price_usd: price,
          last_updated: Date.now() / 1000,
        },
      };

      this.cache.set(`/prices/${symbol}`, {
        data: fallbackData,
        timestamp: Date.now() - (this.cacheTTL - 1000),
      });
    });
  }

  private getCacheKey(endpoint: string, params?: string): string {
    return params ? `${endpoint}?${params}` : endpoint;
  }

  private isValidCache(key: string): boolean {
    const cached = this.cache.get(key);

    if (!cached) return false;

    return Date.now() - cached.timestamp < this.cacheTTL;
  }

  private async fetchWithCache<T>(
    endpoint: string,
    params?: string,
    skipCache = false,
  ): Promise<T> {
    const cacheKey = this.getCacheKey(endpoint, params);

    if (!skipCache && this.isValidCache(cacheKey)) {
      return this.cache.get(cacheKey)!.data;
    }

    const url = params
      ? `${this.baseURL}${endpoint}?${params}`
      : `${this.baseURL}${endpoint}`;

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (!skipCache) {
        this.cache.set(cacheKey, {
          data,
          timestamp: Date.now(),
        });
      }

      return data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get current price for a specific token
   */
  async getTokenPrice(symbol: string): Promise<TokenPriceData | null> {
    try {
      const response = await this.fetchWithCache<PriceResponse>(
        `/prices/${symbol.toUpperCase()}`,
      );

      if (response.status === "success" && response.price_data) {
        return response.price_data;
      }

      return null;
    } catch {
      return null;
    }
  }

  /**
   * Get current prices for all tracked tokens
   */
  async getAllPrices(): Promise<Record<string, TokenPriceData>> {
    try {
      const response = await this.fetchWithCache<AllPricesResponse>("/prices");

      if (response.status === "success") {
        return response.prices;
      }

      return {};
    } catch {
      return {};
    }
  }

  /**
   * Get price history for a token
   */
  async getPriceHistory(
    symbol: string,
    timeframe: "1h" | "24h" | "7d" | "30d" = "24h",
  ): Promise<PriceHistoryPoint[]> {
    try {
      const response = await this.fetchWithCache<PriceHistoryResponse>(
        `/prices/${symbol.toUpperCase()}/history`,
        `timeframe=${timeframe}`,
      );

      if (response.status === "success") {
        return response.history;
      }

      return [];
    } catch {
      return [];
    }
  }

  /**
   * Calculate portfolio value in USD
   */
  async calculatePortfolioValue(balances: Record<string, number>): Promise<{
    total_value_usd: number;
    tokens: Record<string, PortfolioValue>;
    timestamp: number;
  } | null> {
    try {
      const response = await fetch(
        `${this.baseURL}/prices/calculate-portfolio`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ balances }),
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: PortfolioResponse = await response.json();

      if (data.status === "success") {
        return data.portfolio;
      }

      return null;
    } catch {
      return null;
    }
  }

  /**
   * Force price update (useful for dev/testing)
   */
  async forcePriceUpdate(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseURL}/prices/update`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        return false;
      }

      const data = await response.json();

      this.clearCache();

      return data.status === "success";
    } catch {
      return false;
    }
  }

  /**
   * Clear price cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get cached price if available (for immediate responses)
   */
  getCachedPrice(symbol: string): TokenPriceData | null {
    const upperSymbol = symbol.toUpperCase();
    const cacheKey = `/prices/${upperSymbol}`;
    const cached = this.cache.get(cacheKey);

    if (cached) {
      return cached.data.price_data || null;
    }

    const fallbackPrice =
      FALLBACK_PRICES[upperSymbol as keyof typeof FALLBACK_PRICES];

    if (fallbackPrice) {
      return {
        coingecko_id: upperSymbol.toLowerCase(),
        price_usd: fallbackPrice,
        last_updated: Date.now() / 1000,
      };
    }

    return null;
  }

  /**
   * Format price for display
   */
  formatPrice(price: number, decimals: number = 2): string {
    if (price === 0) return "$0.00";
    if (price < 0.01) return "<$0.01";
    if (price >= 1000000) return `$${(price / 1000000).toFixed(1)}M`;
    if (price >= 1000) return `$${(price / 1000).toFixed(1)}K`;

    return `$${price.toFixed(decimals)}`;
  }

  /**
   * Format price change percentage
   */
  formatPriceChange(change: number): string {
    const sign = change >= 0 ? "+" : "";

    return `${sign}${change.toFixed(2)}%`;
  }
}

export const priceAPI = new PriceAPI();
export default priceAPI;

export type { TokenPriceData, PriceHistoryPoint, PortfolioValue };
