"use client";

import React from "react";
import { useAccount } from "wagmi";
import { Loader2, Activity, Bot, Info } from "lucide-react";
import { toast } from "sonner";

import { OnboardingFlow } from "./onboarding-flow";
import PerformanceTab from "./performance-tab";
import PositionsTab from "./positions-tab";
import ActivityTab from "./activity-tab";

import {
  useUserStatus,
  usePerformance,
  useStatistics,
  useStartAgent,
  useStopAgent,
  useUserBalance,
} from "@/hooks/use-lenzu";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function Dashboard() {
  const { address, isConnected, isConnecting } = useAccount();
  const userAddress = address as HexAddress;

  const {
    data: userStatus,
    isLoading: statusLoading,
    error: statusError,
  } = useUserStatus(userAddress);
  const { data: performance, isLoading: perfLoading } =
    usePerformance(userAddress);
  const { data: statistics, isLoading: statsLoading } =
    useStatistics(userAddress);
  const { data: userBalance } = useUserBalance(userAddress);

  const startAgent = useStartAgent();
  const stopAgent = useStopAgent();

  const handleStartAgent = async () => {
    try {
      await startAgent.mutateAsync(userAddress);
      toast.success("Agent started successfully!");
    } catch (error: any) {
      toast.error(error?.message || "Failed to start agent");
    }
  };

  const handleStopAgent = async () => {
    try {
      await stopAgent.mutateAsync(userAddress);
      toast.success("Agent stopped successfully!");
    } catch (error: any) {
      toast.error(error?.message || "Failed to stop agent");
    }
  };

  if (isConnecting) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-neutral-400">Checking wallet connection...</p>
        </div>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <Card className="bg-neutral-900 border-border max-w-md w-full">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold text-white mb-4">
              Connect Your Wallet
            </h2>
            <p className="text-neutral-400">
              Please connect your wallet to access the Lenzu dashboard
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (statusLoading) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-neutral-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const hasInsufficientFunds =
    userBalance && Array.isArray(userBalance)
      ? (userBalance[0] as bigint) < BigInt("1000000000000000") &&
        (userBalance[1] as bigint) < BigInt("1000000")
      : false;

  const isNotRegistered = !statusLoading && (statusError || !userStatus);

  if ((isNotRegistered || hasInsufficientFunds) && !statusLoading) {
    return (
      <OnboardingFlow
        userAddress={userAddress}
        onComplete={() => window.location.reload()}
      />
    );
  }

  const formatUSD = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatPercent = (value: number) => {
    return `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;
  };

  return (
    <TooltipProvider>
      <div className="container mx-auto px-4 py-8 max-w-7xl w-full">
        <div className="space-y-8 w-full">
          <div className="flex items-center justify-between w-full">
            <div>
              <h1 className="text-3xl font-bold">Lenzu Dashboard</h1>
              <p className="text-muted-foreground mt-1">
                AI-Powered Autonomous Liquidity Management
              </p>
            </div>
            <div className="flex gap-2">
              {userStatus?.running ? (
                <Button
                  className="gap-2"
                  disabled={stopAgent.isPending}
                  variant="outline"
                  onClick={handleStopAgent}
                >
                  <Activity className="h-4 w-4 animate-pulse text-green-500" />
                  {stopAgent.isPending ? "Stopping..." : "Agent Running"}
                </Button>
              ) : (
                <Button
                  className="gap-2"
                  disabled={startAgent.isPending}
                  variant="default"
                  onClick={handleStartAgent}
                >
                  {startAgent.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Bot className="h-4 w-4" />
                  )}
                  {startAgent.isPending ? "Starting..." : "Start Agent"}
                </Button>
              )}
            </div>
          </div>

          <div className="flex flex-wrap justify-between gap-4 lg:gap-6">
            <div className="flex flex-col gap-2 p-4 sm:bg-transparent">
              <div className="flex items-center gap-1">
                <span className="text-sm text-muted-foreground">
                  Total Value
                </span>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="w-3 h-3 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Total portfolio value across all positions</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <span className="text-3xl sm:text-4xl lg:text-5xl leading-none">
                {formatUSD(
                  performance?.current_portfolio?.total_value_usd || 0,
                )}
              </span>
            </div>

            <div className="flex flex-col gap-2 p-4 sm:bg-transparent">
              <div className="flex items-center gap-1">
                <span className="text-sm text-muted-foreground">Total PnL</span>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="w-3 h-3 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Total profit/loss since initial deposit</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <div className="flex flex-col gap-1">
                <span
                  className={`text-3xl sm:text-4xl lg:text-5xl leading-none ${
                    (performance?.total_pnl_usd || 0) >= 0
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {formatUSD(performance?.total_pnl_usd || 0)}
                </span>
                <span className="text-sm text-muted-foreground">
                  {formatPercent(performance?.total_pnl_percentage || 0)}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-2 p-4 sm:bg-transparent">
              <div className="flex items-center gap-1">
                <span className="text-sm text-muted-foreground">
                  Health Factor
                </span>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="w-3 h-3 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Current lending position health factor</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <span
                className={`text-3xl sm:text-4xl lg:text-5xl leading-none ${
                  (performance?.current_portfolio?.health_factor || 0) > 1.5
                    ? "text-green-600"
                    : (performance?.current_portfolio?.health_factor || 0) > 1.2
                      ? "text-yellow-600"
                      : "text-red-600"
                }`}
              >
                {(performance?.current_portfolio?.health_factor || 0).toFixed(
                  2,
                )}
              </span>
            </div>

            <div className="flex flex-col gap-2 p-4 sm:bg-transparent">
              <div className="flex items-center gap-1">
                <span className="text-sm text-muted-foreground">
                  Success Rate
                </span>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="w-3 h-3 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Agent's transaction success rate</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <span className="text-3xl sm:text-4xl lg:text-5xl leading-none">
                {((statistics?.success_rate || 0) * 100).toFixed(1)}%
              </span>
            </div>
          </div>

          <div className="border-[0.5px] rounded-2xl">
            <Tabs defaultValue="positions">
              <TabsList className="flex gap-3 px-5 py-3">
                <TabsTrigger value="positions">Positions</TabsTrigger>
                <TabsTrigger value="performance">Performance</TabsTrigger>
                <TabsTrigger value="activity">Activity</TabsTrigger>
              </TabsList>

              <TabsContent className="space-y-4" value="performance">
                <PerformanceTab
                  isLoading={perfLoading || statsLoading}
                  performance={performance}
                  statistics={statistics}
                />
              </TabsContent>

              <TabsContent className="space-y-4" value="positions">
                <PositionsTab
                  isLoading={perfLoading}
                  performance={performance}
                />
              </TabsContent>

              <TabsContent className="space-y-4" value="activity">
                <ActivityTab
                  isLoading={perfLoading}
                  userAddress={userAddress}
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
