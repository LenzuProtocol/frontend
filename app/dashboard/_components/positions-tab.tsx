"use client";

import React, { useState } from "react";
import { ArrowDownToLine } from "lucide-react";
import { formatUnits } from "viem";
import { useAccount } from "wagmi";
import Image from "next/image";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  useUserBalance,
  useWithdrawWETH,
  useWithdrawUSDC,
} from "@/hooks/use-lenzu";

interface PositionsTabProps {
  performance: any;
  isLoading: boolean;
}

export default function PositionsTab({
  performance,
  isLoading,
}: PositionsTabProps) {
  const { address } = useAccount();
  const [withdrawDialogOpen, setWithdrawDialogOpen] = useState(false);
  const [withdrawType, setWithdrawType] = useState<"weth" | "usdc">("weth");
  const [withdrawAmount, setWithdrawAmount] = useState("");

  const { data: userBalance } = useUserBalance(address);
  const withdrawWETH = useWithdrawWETH();
  const withdrawUSDC = useWithdrawUSDC();

  const handleWithdraw = async () => {
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) return;

    if (withdrawType === "weth") {
      await withdrawWETH.mutateAsync({ amount: withdrawAmount });
    } else {
      await withdrawUSDC.mutateAsync({ amount: withdrawAmount });
    }
    setWithdrawDialogOpen(false);
    setWithdrawAmount("");
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-48 bg-muted rounded-2xl" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const positions = [
    {
      name: "Elix Position",
      icon: "/brands/elix.png",
      active: performance?.positions?.elix_active || false,
      totalDeployed: performance?.positions?.elix_total_deployed_usd || 0,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200",
    },
    {
      name: "Tokos Lending",
      icon: "/brands/tokos.png",
      supplied: performance?.positions?.tokos_supplied || 0,
      borrowed: performance?.positions?.tokos_borrowed || 0,
      active: (performance?.positions?.tokos_supplied || 0) > 0,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
      borderColor: "border-indigo-200",
    },
  ];

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {positions.map((position, index) => {
          const Icon = position.icon;

          return (
            <div
              key={index}
              className="border-[0.5px] border-border rounded-2xl p-6 hover:bg-foreground/5 transition-colors duration-200"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Image
                      alt={position.name}
                      className="w-10 h-10 object-center rounded-full"
                      height={32}
                      src={Icon}
                      width={32}
                    />
                    <h3 className="text-lg font-semibold">{position.name}</h3>
                  </div>
                  <Badge variant={position.active ? "default" : "secondary"}>
                    {position.active ? "Active" : "Inactive"}
                  </Badge>
                </div>

                {index === 0 ? (
                  <div className="space-y-3 pt-4 border-t">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">
                        Total Deployed
                      </p>
                      <p className="text-2xl font-bold">
                        ${position.totalDeployed.toFixed(2)}
                      </p>
                    </div>
                    {performance?.apys?.elix_apy && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">
                          Current APY
                        </p>
                        <p
                          className={`text-xl font-semibold ${position.color}`}
                        >
                          {performance.apys.elix_apy.toFixed(2)}%
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3 pt-4 border-t">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">
                          Supplied
                        </p>
                        <p className="text-xl font-bold">
                          ${position.supplied.toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">
                          Borrowed
                        </p>
                        <p className="text-xl font-bold">
                          ${position.borrowed.toFixed(2)}
                        </p>
                      </div>
                    </div>
                    {performance?.apys?.tokos_apy && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">
                          Current APY
                        </p>
                        <p
                          className={`text-xl font-semibold ${position.color}`}
                        >
                          {performance.apys.tokos_apy.toFixed(2)}%
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 border-[0.5px] border-border rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Your Deposits</h3>
          <Dialog
            open={withdrawDialogOpen}
            onOpenChange={setWithdrawDialogOpen}
          >
            <DialogTrigger asChild>
              <Button className="gap-2" size="sm" variant="outline">
                <ArrowDownToLine className="h-4 w-4" />
                Withdraw
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Withdraw Funds</DialogTitle>
                <DialogDescription>
                  Withdraw your deposited tokens from the agent manager
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <Label htmlFor="token-type">Token</Label>
                  <select
                    className="w-full mt-2 p-2 border rounded-md bg-background"
                    id="token-type"
                    value={withdrawType}
                    onChange={(e) =>
                      setWithdrawType(e.target.value as "weth" | "usdc")
                    }
                  >
                    <option value="weth">WETH</option>
                    <option value="usdc">USDC</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    className="mt-2"
                    id="amount"
                    placeholder="0.00"
                    step="0.0001"
                    type="number"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Available:{" "}
                    {withdrawType === "weth"
                      ? userBalance
                        ? formatUnits((userBalance as [bigint, bigint])[0], 18)
                        : "0"
                      : userBalance
                        ? formatUnits((userBalance as [bigint, bigint])[1], 6)
                        : "0"}{" "}
                    {withdrawType.toUpperCase()}
                  </p>
                </div>
                <Button
                  className="w-full"
                  disabled={
                    withdrawWETH.isPending ||
                    withdrawUSDC.isPending ||
                    !withdrawAmount
                  }
                  onClick={handleWithdraw}
                >
                  {withdrawWETH.isPending || withdrawUSDC.isPending
                    ? "Withdrawing..."
                    : "Withdraw"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">WETH Deposited</p>
            <p className="text-2xl font-bold">
              {userBalance
                ? formatUnits((userBalance as [bigint, bigint])[0], 18)
                : "0.0000"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Managed by AI Agent
            </p>
          </div>
          <div className="p-4 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">USDC Deposited</p>
            <p className="text-2xl font-bold">
              $
              {userBalance
                ? formatUnits((userBalance as [bigint, bigint])[1], 6)
                : "0.00"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Managed by AI Agent
            </p>
          </div>
        </div>
      </div>

      {performance?.current_portfolio && (
        <div className="mt-6 border-[0.5px] border-border rounded-2xl p-6">
          <h3 className="text-lg font-semibold mb-4">Current Portfolio</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">WETH Balance</p>
              <p className="text-xl font-bold">
                {(performance.current_portfolio.weth_balance || 0).toFixed(4)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">USDC Balance</p>
              <p className="text-xl font-bold">
                ${(performance.current_portfolio.usdc_balance || 0).toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
