import { apiClient } from "@/lib/api-client";

export interface UserStatus {
  user_address: string;
  enabled: boolean;
  running: boolean;
  iteration_count: number;
  last_iteration: number | null;
  last_sensor_data: SensorData | null;
  last_decision: Decision | null;
}

export interface SensorData {
  wallet_balance_stt: number;
  weth_balance: number;
  usdc_balance: number;
  elix_position: ElixPosition;
  tokos_position: TokosPosition;
  health_factor: number;
}

export interface ElixPosition {
  kandel_address: string;
  is_active: boolean;
  weth_deployed: number;
  usdc_deployed: number;
}

export interface TokosPosition {
  supplied: number;
  borrowed: number;
}

export interface Decision {
  reasoning: string;
  actions: Action[];
}

export interface Action {
  action: string;
  params: Record<string, any>;
}

export interface PortfolioSnapshot {
  timestamp: number;
  stt_balance: number;
  weth_balance: number;
  usdc_balance: number;
  total_value_usd: number;
  elix_active: boolean;
  health_factor: number;
}

export interface PerformanceMetrics {
  user_address: string;
  total_pnl_usd: number;
  total_pnl_percentage: number;
  daily_change_usd: number;
  daily_change_percentage: number;
  current_portfolio: {
    stt_balance: number;
    weth_balance: number;
    usdc_balance: number;
    total_value_usd: number;
    health_factor: number;
  };
  average_health_factor: number;
  min_health_factor: number;
  positions: {
    elix_active: boolean;
    elix_total_deployed_usd: number;
    tokos_supplied: number;
    tokos_borrowed: number;
  };
  apys: {
    elix_apy: number | null;
    tokos_apy: number | null;
  };
  avg_gain_per_tx: number;
  total_iterations: number;
  total_actions_executed: number;
  successful_actions: number;
  failed_actions: number;
  success_rate: number;
  total_gas_used: number;
  total_gas_cost_usd: number;
}

export interface Transaction {
  timestamp: number;
  action: string;
  params: Record<string, any>;
  tx_hash: string | null;
  status: string;
  reasoning: string;
}

export interface UserTransactions {
  user_address: string;
  transaction_count: number;
  transactions: Transaction[];
}

export interface UserStatistics {
  user_address: string;
  initial_deposit_usd: number;
  current_value_usd: number;
  total_pnl_usd: number;
  total_pnl_percentage: number;
  total_iterations: number;
  total_actions_executed: number;
  successful_actions: number;
  failed_actions: number;
  success_rate: number;
  total_gas_used: number;
  total_gas_cost_usd: number;
  total_runtime_seconds: number;
  last_active: number | null;
  snapshot_count: number;
  transaction_count: number;
}

export const lenzuAPI = {
  registerUser: async (userAddress: string, enabled: boolean = true) => {
    return apiClient.post("/users/register", {
      user_address: userAddress,
      enabled,
    });
  },

  getUserInfo: async (userAddress: string): Promise<UserStatus> => {
    return apiClient.get(`/users/${userAddress}/status`);
  },

  updateUserConfig: async (userAddress: string, enabled: boolean) => {
    return apiClient.post(`/users/${userAddress}/config`, { enabled });
  },

  startAgent: async (userAddress: string) => {
    return apiClient.post(`/users/${userAddress}/agent/start`);
  },

  stopAgent: async (userAddress: string) => {
    return apiClient.post(`/users/${userAddress}/agent/stop`);
  },

  executeOnce: async (userAddress: string) => {
    return apiClient.post(`/users/${userAddress}/execute-once`);
  },

  getPortfolioHistory: async (
    userAddress: string,
    timeframe: "1h" | "24h" | "7d" | "30d" | "all" = "24h",
  ) => {
    return apiClient.get(
      `/users/${userAddress}/portfolio-history?timeframe=${timeframe}`,
    );
  },

  setInitialDeposit: async (userAddress: string, amountUsd: number) => {
    return apiClient.post(`/users/${userAddress}/set-initial-deposit`, {
      amount_usd: amountUsd,
    });
  },

  getUserStatistics: async (userAddress: string): Promise<UserStatistics> => {
    return apiClient.get(`/users/${userAddress}/statistics`);
  },

  getPerformance: async (userAddress: string): Promise<PerformanceMetrics> => {
    return apiClient.get(`/users/${userAddress}/performance`);
  },

  getTransactions: async (
    userAddress: string,
    limit: number = 50,
  ): Promise<UserTransactions> => {
    return apiClient.get(`/users/${userAddress}/transactions?limit=${limit}`);
  },

  getGlobalStatistics: async () => {
    return apiClient.get("/statistics/global");
  },
};
