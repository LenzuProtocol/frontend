"use client";

import React from "react";
import {
  CheckCircle,
  XCircle,
  Loader2,
  ExternalLink,
  History,
} from "lucide-react";

import { useTransactions } from "@/hooks/use-lenzu";

interface ActivityTabProps {
  userAddress: string;
  isLoading: boolean;
}

export default function ActivityTab({
  userAddress,
  isLoading: _isLoading,
}: ActivityTabProps) {
  const { data, isLoading } = useTransactions(userAddress, 20);

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-20 bg-muted rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const transactions = data?.transactions || [];

  if (transactions.length === 0) {
    return (
      <div className="p-12 text-center">
        <History className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
        <p className="text-lg font-medium text-muted-foreground mb-2">
          No transactions yet
        </p>
        <p className="text-sm text-muted-foreground">
          Activity will appear here once the agent starts executing trades
        </p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="space-y-3">
        {transactions.map((tx: any, index: number) => (
          <div
            key={index}
            className="border-[0.5px] border-border rounded-2xl p-4 hover:bg-foreground/5 transition-colors duration-200"
          >
            <div className="flex items-start gap-4">
              <div className="mt-1">
                {tx.status === "success" ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : tx.status === "failed" ? (
                  <XCircle className="h-5 w-5 text-red-500" />
                ) : (
                  <Loader2 className="h-5 w-5 text-yellow-500 animate-spin" />
                )}
              </div>

              <div className="flex-1 space-y-2">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold">{tx.action}</p>
                    {tx.reasoning && (
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {tx.reasoning}
                      </p>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {new Date(tx.timestamp * 1000).toLocaleString()}
                  </span>
                </div>

                {tx.params && Object.keys(tx.params).length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(tx.params)
                      .slice(0, 3)
                      .map(([key, value]: [string, any]) => (
                        <span
                          key={key}
                          className="text-xs px-2 py-1 bg-muted rounded"
                        >
                          {key}:{" "}
                          {typeof value === "number"
                            ? value.toFixed(2)
                            : String(value)}
                        </span>
                      ))}
                  </div>
                )}

                {tx.tx_hash && (
                  <a
                    className="text-xs text-blue-500 hover:text-blue-600 flex items-center gap-1 w-fit"
                    href={`https://explorer.somnia.network/tx/${tx.tx_hash}`}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    View on Explorer <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
