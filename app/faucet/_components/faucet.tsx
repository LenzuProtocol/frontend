"use client";

import React, { useState } from "react";
import { Droplet, Loader2, AlertTriangle } from "lucide-react";
import {
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
  useChainId,
} from "wagmi";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { formatUnits } from "viem";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTokenBalance } from "@/hooks/use-lenzu";
import { useTokenPrice } from "@/hooks/use-prices";
import { PriceText } from "@/components/price-display";
import { formatNumber } from "@/lib/helper/number";
import { Addresses } from "@/lib/addresses";
import { ERC20_ABI } from "@/lib/abis/erc20.abi";
const USDC_ADDRESS = Addresses.USDC;
const WETH_ADDRESS = Addresses.WETH;

const TOKENS = {
  USDC: {
    address: USDC_ADDRESS,
    symbol: "USDC",
    decimals: 6,
    name: "USD Coin",
    icon: "/images/token/usdc.webp",
    faucetAmount: 10000,
  },
  WETH: {
    address: WETH_ADDRESS,
    symbol: "WETH",
    decimals: 18,
    name: "Wrapped Ethereum",
    icon: "/images/token/weth.webp",
    faucetAmount: 10,
  },
} as const;

type TokenType = keyof typeof TOKENS;

const SOMNIA_TESTNET_CHAIN_ID = 50312;

export default function Faucet() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const [selectedToken, setSelectedToken] = useState<TokenType>("USDC");
  const [canClaim, setCanClaim] = useState(true);
  const [cooldownTime, setCooldownTime] = useState(0);
  const queryClient = useQueryClient();

  const isCorrectNetwork = chainId === SOMNIA_TESTNET_CHAIN_ID;
  const currentToken = TOKENS[selectedToken];

  const {
    data: tokenBalance,
    isLoading: balanceLoading,
    refetch,
  } = useTokenBalance(currentToken.address as `0x${string}`, address);

  const balance = tokenBalance
    ? formatUnits(tokenBalance as bigint, currentToken.decimals)
    : "0";

  const { data: usdcPrice, isLoading: usdcPriceLoading } =
    useTokenPrice("USDC");
  const { data: wethPrice, isLoading: wethPriceLoading } = useTokenPrice("ETH");

  const getCurrentTokenPrice = () => {
    if (selectedToken === "USDC") {
      return usdcPrice?.price_usd || 1;
    } else {
      return wethPrice?.price_usd || 2000;
    }
  };

  const currentTokenPrice = getCurrentTokenPrice();
  const isPriceLoading =
    selectedToken === "USDC" ? usdcPriceLoading : wethPriceLoading;

  const {
    data: hash,
    writeContract,
    isPending: isWritePending,
  } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
    confirmations: 1,
    query: {
      enabled: Boolean(hash),
      refetchInterval: 1500,
      staleTime: 0,
    },
  });

  const isPending = isWritePending || isConfirming;

  React.useEffect(() => {
    if (!isSuccess) return;

    const t = setTimeout(() => {
      queryClient.invalidateQueries({
        predicate: (q) => String(q.queryKey[0]).includes("balance"),
      });
      refetch();
    }, 500);

    toast.success(`Successfully claimed ${currentToken.symbol}!`, {
      description: `${currentToken.faucetAmount} ${currentToken.symbol} has been added to your wallet`,
    });

    setCanClaim(false);
    setCooldownTime(3600);

    return () => clearTimeout(t);
  }, [isSuccess, refetch, queryClient, currentToken.symbol, selectedToken]);

  React.useEffect(() => {
    const checkCooldown = async () => {
      if (!address) return;

      setCanClaim(true);
      setCooldownTime(0);
    };

    checkCooldown();
  }, [selectedToken, address]);

  const handleMint = async () => {
    if (!isConnected) {
      toast.error("Please connect your wallet first");

      return;
    }

    if (!address) {
      toast.error("Wallet address not found");

      return;
    }

    if (!canClaim) {
      toast.error("Faucet cooldown active", {
        description: `Please wait ${Math.ceil(cooldownTime / 60)} minutes before claiming again.`,
      });

      return;
    }

    try {
      toast.info(
        `Claiming ${currentToken.faucetAmount} ${currentToken.symbol} from faucet...`,
        {
          description: "Please confirm the transaction in your wallet",
        },
      );

      writeContract({
        address: currentToken.address as `0x${string}`,
        abi: ERC20_ABI,
        functionName: "faucet",
      });
    } catch (error: any) {
      let errorMessage = `Failed to mint ${currentToken.symbol}`;
      let errorDescription = "Please try again";

      if (error.message?.includes("rejected")) {
        errorMessage = "Transaction rejected";
        errorDescription = "You rejected the transaction in your wallet";
      } else if (error.message?.includes("insufficient")) {
        errorMessage = "Insufficient funds";
        errorDescription = "You don't have enough ETH to pay for gas";
      } else if (error.message?.includes("mint")) {
        errorMessage = "Mint function not available";
        errorDescription = `This ${currentToken.symbol} contract may not support public minting. Please contact support.`;
      }

      toast.error(errorMessage, {
        description: errorDescription,
      });
    }
  };

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <div className="flex flex-wrap justify-between gap-4 lg:gap-6">
        <div className="flex flex-col gap-2 p-4 sm:bg-transparent">
          <span className="text-sm text-muted-foreground">
            Your {currentToken.symbol} Balance
          </span>
          <span className="text-3xl sm:text-4xl lg:text-5xl leading-none capitalize">
            {balanceLoading ? (
              <span className="text-muted-foreground">Loading...</span>
            ) : (
              `${formatNumber(parseFloat(balance || "0"))} ${currentToken.symbol}`
            )}
          </span>
        </div>

        <div className="flex flex-col gap-2 p-4 sm:bg-transparent">
          <span className="text-sm text-muted-foreground">Network</span>
          <span className="text-3xl sm:text-4xl lg:text-5xl leading-none">
            Somnia Testnet
          </span>
        </div>
      </div>

      <Tabs
        className="w-full"
        value={selectedToken}
        onValueChange={(value) => setSelectedToken(value as TokenType)}
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger className="flex items-center gap-2 p-4" value="USDC">
            <div className="flex items-center gap-2">
              <img alt="USDC" className="w-4 h-4" src={TOKENS.USDC.icon} />
              <div className="flex flex-col items-start">
                <span className="font-medium">USDC</span>
                <PriceText
                  className="text-xs text-muted-foreground"
                  fallbackPrice={1}
                  symbol="USDC"
                />
              </div>
            </div>
          </TabsTrigger>
          <TabsTrigger className="flex items-center gap-2 p-4" value="WETH">
            <div className="flex items-center gap-2">
              <img alt="WETH" className="w-4 h-4" src={TOKENS.WETH.icon} />
              <div className="flex flex-col items-start">
                <span className="font-medium">WETH</span>
                <PriceText
                  className="text-xs text-muted-foreground"
                  fallbackPrice={2000}
                  symbol="ETH"
                />
              </div>
            </div>
          </TabsTrigger>
        </TabsList>

        <TabsContent className="mt-6" value={selectedToken}>
          <div className="border-[0.5px] border-border rounded-4xl">
            <div className="p-6">
              {!isConnected ? (
                <div className="text-center py-12">
                  <Droplet className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <p className="text-lg font-medium text-muted-foreground mb-2">
                    Connect Your Wallet
                  </p>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto">
                    Please connect your wallet to Somnia Testnet to use the
                    faucet and mint testnet tokens
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-6">
                  <div className="text-center py-8">
                    <div className="flex items-center justify-center gap-3 mb-4">
                      <img
                        alt={currentToken.symbol}
                        className="w-8 h-8 object-cover rounded-full"
                        src={currentToken.icon}
                      />
                      <div>
                        <div className="text-3xl font-bold">
                          {currentToken.faucetAmount} {currentToken.symbol}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          ~$
                          {(
                            currentToken.faucetAmount * currentTokenPrice
                          ).toFixed(2)}
                          {isPriceLoading && (
                            <span className="text-xs ml-1 opacity-75">
                              (loading...)
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Fixed amount per faucet claim • 1 hour cooldown
                    </p>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
                    <span className="text-sm text-muted-foreground">
                      Current Balance
                    </span>
                    <span className="font-medium">
                      {balanceLoading && !balance
                        ? "Loading..."
                        : balance
                          ? `${parseFloat(balance).toFixed(selectedToken === "WETH" ? 4 : 2)} ${currentToken.symbol}`
                          : `0 ${currentToken.symbol}`}
                      {balanceLoading && balance && (
                        <span className="opacity-50 ml-1">↻</span>
                      )}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {isConnected && !isCorrectNetwork && (
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            <p className="font-semibold text-yellow-500">Wrong Network</p>
          </div>
          <p className="text-sm text-muted-foreground">
            Please switch to Somnia Testnet (Chain ID: 50312) to use this
            faucet. Current network: Chain ID {chainId}
          </p>
        </div>
      )}

      {isConnected && isCorrectNetwork && (
        <>
          <Button
            className="w-full h-14 text-lg font-semibold rounded-3xl"
            disabled={isPending || !canClaim || !isCorrectNetwork}
            size="lg"
            onClick={handleMint}
          >
            {isPending ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                {isWritePending ? "Confirming..." : "Minting..."}
              </>
            ) : (
              <>
                <Droplet className="w-5 h-5 mr-2" />
                Claim {currentToken.faucetAmount} {currentToken.symbol}
              </>
            )}
          </Button>

          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 space-y-3">
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold">Note:</span> These are testnet{" "}
              {currentToken.symbol} tokens for Somnia Testnet only. These tokens
              have no real value and are meant for testing purposes.
            </p>
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold">Alternative:</span> If the mint
              function is not available, you can contact us to get test tokens.
            </p>
          </div>
        </>
      )}

      <div className="border-[0.5px] border-border rounded-4xl">
        <div className="px-5 py-4 border-b border-border">
          <h3 className="text-lg font-semibold">How to Use</h3>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 font-semibold">
              1
            </div>
            <div>
              <h4 className="font-semibold mb-1">Connect Your Wallet</h4>
              <p className="text-sm text-muted-foreground">
                Connect your wallet to Somnia Testnet
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 font-semibold">
              2
            </div>
            <div>
              <h4 className="font-semibold mb-1">
                Select Token & Enter Amount
              </h4>
              <p className="text-sm text-muted-foreground">
                Choose between USDC or WETH, then enter the amount you want to
                mint
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 font-semibold">
              3
            </div>
            <div>
              <h4 className="font-semibold mb-1">Click Mint</h4>
              <p className="text-sm text-muted-foreground">
                Confirm the transaction in your wallet and receive your testnet
                tokens
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="text-center text-sm text-muted-foreground">
        <p>
          {currentToken.symbol} Token Contract: {currentToken.address}
        </p>
        <p className="mt-1">Network: Somnia Testnet (Chain ID: 50312)</p>
      </div>
    </div>
  );
}
