import React, { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { formatUnits } from "viem";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  useRegisterUser,
  useSetInitialDeposit,
  useDepositWETH,
  useDepositUSDC,
  useTokenBalance,
  useUserStatus,
} from "@/hooks/use-lenzu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GridScan } from "@/components/GridScan";
import { Addresses } from "@/lib/addresses";

interface OnboardingFlowProps {
  userAddress: string;
  onComplete: () => void;
}

export function OnboardingFlow({
  userAddress,
  onComplete,
}: OnboardingFlowProps) {
  const registerMutation = useRegisterUser();

  const { data: existingUserStatus } = useUserStatus(userAddress, true);
  const isRegistered =
    !!existingUserStatus && !(existingUserStatus as any).status;

  const [step, setStep] = useState<"register" | "deposit">("register");

  React.useEffect(() => {
    if (isRegistered) setStep("deposit");
  }, [isRegistered]);
  const [wethAmount, setWethAmount] = useState("");
  const [usdcAmount, setUsdcAmount] = useState("");
  const [depositTab, setDepositTab] = useState<"weth" | "usdc">("usdc");
  const depositWETH = useDepositWETH();
  const depositUSDC = useDepositUSDC();
  const setInitialDeposit = useSetInitialDeposit();

  const { data: wethBalance } = useTokenBalance(Addresses.WETH, userAddress);
  const { data: usdcBalance } = useTokenBalance(Addresses.USDC, userAddress);

  const handleRegister = async () => {
    try {
      if (isRegistered) {
        setStep("deposit");

        return;
      }

      await registerMutation.mutateAsync({
        userAddress,
        enabled: true,
      });
      toast.success("Registration successful!");
      setStep("deposit");
    } catch (error: any) {
      toast.error(error?.message || "Registration failed");
    }
  };

  const handleDepositWETH = async () => {
    if (!wethAmount || parseFloat(wethAmount) <= 0) {
      toast.error("Please enter a valid amount");

      return;
    }

    if (parseFloat(wethAmount) < 0.001) {
      toast.error("Minimum deposit is 0.001 WETH to start the agent");

      return;
    }

    try {
      await depositWETH.mutateAsync({ amount: wethAmount });
      const usdValue = parseFloat(wethAmount) * 2000;

      await setInitialDeposit.mutateAsync({ userAddress, amountUsd: usdValue });
      toast.success("WETH deposited! You can now start the agent.");
      onComplete();
    } catch (error: any) {
      toast.error(error?.message || "Deposit failed");
    }
  };

  const handleDepositUSDC = async () => {
    if (!usdcAmount || parseFloat(usdcAmount) <= 0) {
      toast.error("Please enter a valid amount");

      return;
    }

    if (parseFloat(usdcAmount) < 1) {
      toast.error("Minimum deposit is 1 USDC to start the agent");

      return;
    }

    try {
      await depositUSDC.mutateAsync({ amount: usdcAmount });
      await setInitialDeposit.mutateAsync({
        userAddress,
        amountUsd: parseFloat(usdcAmount),
      });
      toast.success("USDC deposited! You can now start the agent.");
      onComplete();
    } catch (error: any) {
      toast.error(error?.message || "Deposit failed");
    }
  };

  return (
    <div className="relative h-full flex-1 flex items-center justify-center px-4">
      <div className="fixed inset-0 w-screen h-screen z-0">
        <GridScan
          enablePost
          bloomIntensity={0.6}
          chromaticAberration={0.002}
          gridScale={0.1}
          lineThickness={1}
          linesColor="#392e4e"
          noiseIntensity={0.01}
          scanColor="#FF9FFC"
          scanOpacity={0.4}
          sensitivity={0.55}
        />
      </div>

      <Card className="w-full max-w-lg bg-black/50 border-border z-10">
        <CardHeader>
          <CardTitle className="text-2xl text-white text-center">
            Welcome to Lenzu
          </CardTitle>
          <CardDescription className="text-neutral-400 text-center">
            {step === "register"
              ? isRegistered
                ? "Welcome back! Let's fund your AI agent account"
                : "Let's get you set up with your AI agent account"
              : "Deposit either WETH or USDC to enable your AI agent"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {step === "register" ? (
            <>
              <Button
                className="w-full h-20 text-2xl mt-5"
                disabled={registerMutation.isPending}
                onClick={handleRegister}
              >
                {registerMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    starting...
                  </>
                ) : (
                  <>{isRegistered ? "Continue to Deposit" : "Let's Go"}</>
                )}
              </Button>
            </>
          ) : (
            <>
              <div className="space-y-4 mt-5">
                <Tabs
                  value={depositTab}
                  onValueChange={(v) => setDepositTab(v as "weth" | "usdc")}
                >
                  <TabsList className="grid w-full grid-cols-2 gap-5">
                    <TabsTrigger value="usdc">USDC</TabsTrigger>
                    <TabsTrigger value="weth">WETH</TabsTrigger>
                  </TabsList>

                  <TabsContent className="space-y-4 mt-4" value="weth">
                    <div>
                      <Label className="text-white" htmlFor="weth">
                        Deposit WETH
                      </Label>
                      <Input
                        className="mt-2 bg-neutral-800 border-border text-white h-14 text-2xl"
                        id="weth"
                        placeholder="0.001 (minimum)"
                        step="0.0001"
                        type="number"
                        value={wethAmount}
                        onChange={(e) => setWethAmount(e.target.value)}
                      />
                      <p className="text-xs text-neutral-400 mt-2">
                        Balance:{" "}
                        {wethBalance
                          ? formatUnits(wethBalance as bigint, 18)
                          : "0"}{" "}
                        WETH
                      </p>
                    </div>

                    <div className="flex gap-3">
                      <Button
                        className="w-full h-20 text-2xl mt-5"
                        disabled={
                          depositWETH.isPending ||
                          !wethAmount ||
                          Number(wethBalance) < Number(wethAmount)
                        }
                        onClick={handleDepositWETH}
                      >
                        {depositWETH.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Depositing...
                          </>
                        ) : (
                          <>Deposit & Start Agent</>
                        )}
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent className="space-y-4 mt-4" value="usdc">
                    <div>
                      <Label className="text-white" htmlFor="usdc">
                        Deposit USDC
                      </Label>
                      <Input
                        className="mt-2 bg-neutral-800 border-border text-white h-14 text-2xl"
                        id="usdc"
                        placeholder="1.00 (minimum)"
                        step="0.01"
                        type="number"
                        value={usdcAmount}
                        onChange={(e) => setUsdcAmount(e.target.value)}
                      />
                      <p className="text-xs text-neutral-400 mt-2">
                        Balance:{" "}
                        {usdcBalance
                          ? formatUnits(usdcBalance as bigint, 6)
                          : "0"}{" "}
                        USDC
                      </p>
                    </div>

                    <div className="flex gap-3">
                      <Button
                        className="w-full h-20 text-2xl mt-5"
                        disabled={
                          depositUSDC.isPending ||
                          !usdcAmount ||
                          Number(usdcBalance) < Number(usdcAmount)
                        }
                        onClick={handleDepositUSDC}
                      >
                        {depositUSDC.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Depositing...
                          </>
                        ) : (
                          <>Deposit & Start Agent</>
                        )}
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>

                <div className="p-4 bg-neutral-800/50 rounded-lg border border-border">
                  <p className="text-xs text-neutral-400 mb-2">
                    ⚠️ Go faucet page to get WETH and USDC tokens.
                  </p>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
