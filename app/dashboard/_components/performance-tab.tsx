"use client";

import React from "react";
import { TrendingUp, Activity } from "lucide-react";

interface PerformanceTabProps {
  performance: any;
  statistics: any;
  isLoading: boolean;
}

export default function PerformanceTab({
  performance,
  statistics,
  isLoading,
}: PerformanceTabProps) {
  if (isLoading) {
    return (
      <div className="p-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-24 bg-muted rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const metrics = [
    {
      label: "Daily Change",
      value: `${performance?.daily_change_usd >= 0 ? "+" : ""}$${Math.abs(performance?.daily_change_usd || 0).toFixed(2)}`,
      subValue: `${performance?.daily_change_percentage >= 0 ? "+" : ""}${(performance?.daily_change_percentage || 0).toFixed(2)}%`,
      color:
        (performance?.daily_change_usd || 0) >= 0
          ? "text-green-600"
          : "text-red-600",
      icon: TrendingUp,
    },
    {
      label: "Avg Health Factor",
      value: (performance?.average_health_factor || 0).toFixed(2),
      subValue: `Min: ${(performance?.min_health_factor || 0).toFixed(2)}`,
      color: "text-blue-600",
      icon: Activity,
    },
    {
      label: "Total Iterations",
      value: performance?.total_iterations || 0,
      subValue: `${statistics?.successful_actions || 0} successful`,
      color: "text-emerald-600",
      icon: Activity,
    },
  ];

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;

          return (
            <div
              key={index}
              className="border-[0.5px] border-border rounded-2xl p-5 hover:bg-foreground/5 transition-colors duration-200"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {metric.label}
                  </span>
                  <Icon className={`h-4 w-4 ${metric.color}`} />
                </div>
                <div>
                  <div className={`text-3xl font-bold ${metric.color}`}>
                    {metric.value}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {metric.subValue}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
