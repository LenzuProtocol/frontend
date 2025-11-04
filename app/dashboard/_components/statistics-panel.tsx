import React from "react";
import { BarChart3, TrendingUp, Activity, Percent } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface StatisticsPanelProps {
  data?: {
    totalTransactions?: number;
    successRate?: number;
    avgGain?: number;
    elixAPY?: number;
    tokosAPY?: number;
    totalGasFees?: string;
    avgExecutionTime?: number;
  };
  isLoading?: boolean;
}

export function StatisticsPanel({ data, isLoading }: StatisticsPanelProps) {
  const stats = [
    {
      icon: Activity,
      label: "Total Transactions",
      value: data?.totalTransactions ?? 0,
      color: "text-blue-500",
    },
    {
      icon: Percent,
      label: "Success Rate",
      value: `${data?.successRate ?? 0}%`,
      color: "text-green-500",
    },
    {
      icon: TrendingUp,
      label: "Avg Gain per TX",
      value: data?.avgGain
        ? `${data.avgGain > 0 ? "+" : ""}${data.avgGain.toFixed(2)}%`
        : "0%",
      color:
        data?.avgGain && data.avgGain > 0
          ? "text-green-500"
          : "text-neutral-400",
    },
    {
      icon: BarChart3,
      label: "Elix APY",
      value: data?.elixAPY ? `${data.elixAPY.toFixed(2)}%` : "-",
      color: "text-purple-500",
    },
    {
      icon: BarChart3,
      label: "Tokos APY",
      value: data?.tokosAPY ? `${data.tokosAPY.toFixed(2)}%` : "-",
      color: "text-indigo-500",
    },
    {
      icon: Activity,
      label: "Total Gas Fees",
      value: data?.totalGasFees ?? "0 STM",
      color: "text-orange-500",
    },
  ];

  return (
    <Card className="bg-neutral-900 border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-purple-500" />
          <span className="text-white">Performance Statistics</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon;

            return (
              <div
                key={index}
                className="p-4 bg-neutral-800 rounded-lg border border-border"
              >
                {isLoading ? (
                  <>
                    <Skeleton className="h-4 w-4 mb-2" />
                    <Skeleton className="h-4 w-20 mb-1" />
                    <Skeleton className="h-6 w-16" />
                  </>
                ) : (
                  <>
                    <Icon className={`h-4 w-4 mb-2 ${stat.color}`} />
                    <p className="text-xs text-neutral-400 mb-1">
                      {stat.label}
                    </p>
                    <p className={`text-lg font-bold ${stat.color}`}>
                      {stat.value}
                    </p>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
