import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAccount, useWriteContract, useReadContract } from "wagmi";
import { parseUnits } from "viem";
import { waitForTransactionReceipt } from "wagmi/actions";

import { lenzuAPI } from "@/services/lenzu-api";
import { agentManagerABI } from "@/lib/abis/agent-manager.abi";
import { ERC20_ABI } from "@/lib/abis/erc20.abi";
import { config } from "@/lib/wagmi";
import { Addresses } from "@/lib/addresses";

export const lenzuKeys = {
  all: ["lenzu"] as const,
  userStatus: (address: string) => [...lenzuKeys.all, "user", address] as const,
  performance: (address: string) =>
    [...lenzuKeys.all, "performance", address] as const,
  portfolio: (address: string, timeframe?: string) =>
    [...lenzuKeys.all, "portfolio", address, timeframe] as const,
  statistics: (address: string) =>
    [...lenzuKeys.all, "statistics", address] as const,
  transactions: (address: string, limit?: number) =>
    [...lenzuKeys.all, "transactions", address, limit] as const,
  pnl: (address: string) => [...lenzuKeys.all, "pnl", address] as const,
};

export function useUserStatus(
  userAddress: string | undefined,
  enabled: boolean = true,
) {
  return useQuery({
    queryKey: lenzuKeys.userStatus(userAddress || ""),
    queryFn: () => lenzuAPI.getUserInfo(userAddress!),
    enabled: enabled && !!userAddress,
    refetchInterval: 120000,
    retry: 1,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    placeholderData: (previousData) => previousData,
    staleTime: 60000,
  });
}

export function usePerformance(userAddress: string | undefined) {
  return useQuery({
    queryKey: lenzuKeys.performance(userAddress || ""),
    queryFn: () => lenzuAPI.getPerformance(userAddress!),
    enabled: !!userAddress,
    refetchInterval: 120000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    placeholderData: (previousData) => previousData,
    staleTime: 60000,
  });
}

export function usePortfolioHistory(
  userAddress: string | undefined,
  timeframe: "1h" | "24h" | "7d" | "30d" | "all" = "24h",
) {
  return useQuery({
    queryKey: lenzuKeys.portfolio(userAddress || "", timeframe),
    queryFn: () => lenzuAPI.getPortfolioHistory(userAddress!, timeframe),
    enabled: !!userAddress,
    refetchInterval: 125000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    placeholderData: (previousData) => previousData,
    staleTime: 120000,
  });
}

export function useStatistics(userAddress: string | undefined) {
  return useQuery({
    queryKey: lenzuKeys.statistics(userAddress || ""),
    queryFn: () => lenzuAPI.getUserStatistics(userAddress!),
    enabled: !!userAddress,
    refetchInterval: 120000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    placeholderData: (previousData) => previousData,
    staleTime: 60000,
  });
}

export function useTransactions(
  userAddress: string | undefined,
  limit: number = 50,
) {
  return useQuery({
    queryKey: lenzuKeys.transactions(userAddress || "", limit),
    queryFn: () => lenzuAPI.getTransactions(userAddress!, limit),
    enabled: !!userAddress,
    refetchInterval: 120000,
  });
}

export function useRegisterUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userAddress,
      enabled,
    }: {
      userAddress: string;
      enabled: boolean;
    }) => lenzuAPI.registerUser(userAddress, enabled),
    onSuccess: (_, variables) => {
      toast.success("User registered successfully!");
      queryClient.invalidateQueries({
        queryKey: lenzuKeys.userStatus(variables.userAddress),
      });
    },
    onError: (error) => {
      toast.error(`Failed to register: ${error.message}`);
    },
  });
}

export function useStartAgent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userAddress: string) => lenzuAPI.startAgent(userAddress),
    onSuccess: (_, userAddress) => {
      toast.success("Agent started!");
      queryClient.invalidateQueries({
        queryKey: lenzuKeys.userStatus(userAddress),
      });
    },
    onError: (error) => {
      toast.error(`Failed to start agent: ${error.message}`);
    },
  });
}

export function useStopAgent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userAddress: string) => lenzuAPI.stopAgent(userAddress),
    onSuccess: (_, userAddress) => {
      toast.success("Agent stopped!");
      queryClient.invalidateQueries({
        queryKey: lenzuKeys.userStatus(userAddress),
      });
    },
    onError: (error) => {
      toast.error(`Failed to stop agent: ${error.message}`);
    },
  });
}

export function useUpdateConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userAddress,
      enabled,
    }: {
      userAddress: string;
      enabled: boolean;
    }) => lenzuAPI.updateUserConfig(userAddress, enabled),
    onSuccess: (_, variables) => {
      toast.success("Configuration updated!");
      queryClient.invalidateQueries({
        queryKey: lenzuKeys.userStatus(variables.userAddress),
      });
    },
    onError: (error) => {
      toast.error(`Failed to update config: ${error.message}`);
    },
  });
}

export function useExecuteOnce() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userAddress: string) => lenzuAPI.executeOnce(userAddress),
    onSuccess: (_, userAddress) => {
      toast.success("Execution triggered!");
      queryClient.invalidateQueries({
        queryKey: lenzuKeys.userStatus(userAddress),
      });
      queryClient.invalidateQueries({
        queryKey: lenzuKeys.performance(userAddress),
      });
    },
    onError: (error) => {
      toast.error(`Execution failed: ${error.message}`);
    },
  });
}

export function useSetInitialDeposit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userAddress,
      amountUsd,
    }: {
      userAddress: string;
      amountUsd: number;
    }) => lenzuAPI.setInitialDeposit(userAddress, amountUsd),
    onSuccess: (_, variables) => {
      toast.success("Initial deposit set!");
      queryClient.invalidateQueries({
        queryKey: lenzuKeys.statistics(variables.userAddress),
      });
      queryClient.invalidateQueries({
        queryKey: lenzuKeys.pnl(variables.userAddress),
      });
    },
    onError: (error) => {
      toast.error(`Failed to set initial deposit: ${error.message}`);
    },
  });
}

export function useUserBalance(
  userAddress: string | undefined,
  enabled = true,
) {
  return useReadContract({
    address: Addresses.AgentManager,
    abi: agentManagerABI,
    functionName: "getUserBalance",
    args: userAddress ? [userAddress as `0x${string}`] : undefined,
    query: { enabled: enabled && !!userAddress, refetchInterval: 10000 },
  });
}

export function useTokenBalance(
  tokenAddress: `0x${string}`,
  userAddress: string | undefined,
) {
  return useReadContract({
    address: tokenAddress,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: userAddress ? [userAddress as `0x${string}`] : undefined,
    query: {
      enabled: !!userAddress,
      refetchInterval: 10000,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      placeholderData: (previousData) => previousData,
      staleTime: 30 * 1000,
    },
  });
}

export function useDepositWETH() {
  const queryClient = useQueryClient();
  const { address } = useAccount();
  const { writeContractAsync } = useWriteContract();

  return useMutation({
    mutationFn: async ({ amount }: { amount: string }) => {
      if (!address) throw new Error("Wallet not connected");

      const amountWei = parseUnits(amount, 18);

      const approveTx = await writeContractAsync({
        address: Addresses.WETH,
        abi: ERC20_ABI,
        functionName: "approve",
        args: [Addresses.AgentManager, amountWei],
      });

      const approvalReceipt = await waitForTransactionReceipt(config, {
        hash: approveTx,
      });

      if (approvalReceipt.status !== "success") {
        toast.error("WETH approval transaction failed");
      }

      const depositTx = await writeContractAsync({
        address: Addresses.AgentManager,
        abi: agentManagerABI,
        functionName: "depositWETH",
        args: [amountWei],
      });

      return depositTx;
    },
    onSuccess: () => {
      toast.success("WETH deposited successfully!");
      queryClient.invalidateQueries({ queryKey: lenzuKeys.all });
    },
    onError: (error: any) => {
      toast.error(`Deposit failed: ${error.message || "Unknown error"}`);
    },
  });
}

export function useDepositUSDC() {
  const queryClient = useQueryClient();
  const { address } = useAccount();
  const { writeContractAsync } = useWriteContract();

  return useMutation({
    mutationFn: async ({ amount }: { amount: string }) => {
      if (!address) throw new Error("Wallet not connected");

      const amountWei = parseUnits(amount, 6);

      const approveTx = await writeContractAsync({
        address: Addresses.USDC,
        abi: ERC20_ABI,
        functionName: "approve",
        args: [Addresses.AgentManager, amountWei],
      });

      const approvalReceipt = await waitForTransactionReceipt(config, {
        hash: approveTx,
      });

      if (approvalReceipt.status !== "success") {
        toast.error("USDC approval transaction failed");
      }

      const depositTx = await writeContractAsync({
        address: Addresses.AgentManager,
        abi: agentManagerABI,
        functionName: "depositUSDC",
        args: [amountWei],
      });

      return depositTx;
    },
    onSuccess: () => {
      toast.success("USDC deposited successfully!");
      queryClient.invalidateQueries({ queryKey: lenzuKeys.all });
    },
    onError: (error: any) => {
      toast.error(`Deposit failed: ${error.message || "Unknown error"}`);
    },
  });
}

export function useWithdrawWETH() {
  const queryClient = useQueryClient();
  const { writeContractAsync } = useWriteContract();

  return useMutation({
    mutationFn: async ({ amount }: { amount: string }) => {
      const amountWei = parseUnits(amount, 18);

      const tx = await writeContractAsync({
        address: Addresses.AgentManager,
        abi: agentManagerABI,
        functionName: "withdrawWETH",
        args: [amountWei],
      });

      return tx;
    },
    onSuccess: () => {
      toast.success("WETH withdrawn successfully!");
      queryClient.invalidateQueries({ queryKey: lenzuKeys.all });
    },
    onError: (error: any) => {
      toast.error(`Withdraw failed: ${error.message || "Unknown error"}`);
    },
  });
}

export function useWithdrawUSDC() {
  const queryClient = useQueryClient();
  const { writeContractAsync } = useWriteContract();

  return useMutation({
    mutationFn: async ({ amount }: { amount: string }) => {
      const amountWei = parseUnits(amount, 6);

      const tx = await writeContractAsync({
        address: Addresses.AgentManager,
        abi: agentManagerABI,
        functionName: "withdrawUSDC",
        args: [amountWei],
      });

      return tx;
    },
    onSuccess: () => {
      toast.success("USDC withdrawn successfully!");
      queryClient.invalidateQueries({ queryKey: lenzuKeys.all });
    },
    onError: (error: any) => {
      toast.error(`Withdraw failed: ${error.message || "Unknown error"}`);
    },
  });
}
