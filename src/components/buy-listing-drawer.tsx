"use client";

import { useState, useEffect } from "react";
import { Check, X, Loader2, DollarSign, ShoppingCart, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import {
  useAccount,
  useConnect,
  useWaitForTransactionReceipt,
  useWriteContract,
  useReadContract,
} from "wagmi";
import { farcasterMiniApp } from "@farcaster/miniapp-wagmi-connector";
import auctionAbi from "@/abis/auction.json";
import { getAuctionContractAddress, getChain, getUSDCContractAddress } from "@/lib/constants";
import { unitsToUSDC } from "@/lib/utils";
import { parseUnits, formatUnits } from "viem";
import { syncListings } from "@/lib/api/sync";
import { useQueryClient } from "@tanstack/react-query";

// Standard ERC20 ABI for approve and balanceOf functions
const ERC20_ABI = [
  {
    name: "approve",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    name: "balanceOf",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const;

interface BuyListingDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  listingId: string;
  price: string;
  tokenId: string;
  onSuccess?: (transactionHash: string) => void;
}

type TransactionStep = 1 | 2 | 3; // 1: Approve USDC, 2: Buy Listing, 3: Success

export function BuyListingDrawer({
  isOpen,
  onClose,
  listingId,
  price,
  tokenId,
}: BuyListingDrawerProps) {
  const [currentStep, setCurrentStep] = useState<TransactionStep>(3);
  const [approvalTxHash, setApprovalTxHash] = useState<string | null>(null);
  const [buyTxHash, setBuyTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { isConnected, address, isConnecting } = useAccount();
  const { connectAsync, connect, connectors } = useConnect();
  const queryClient = useQueryClient();

  // Read USDC balance
  const { data: usdcBalance, isLoading: isBalanceLoading } = useReadContract({
    address: getUSDCContractAddress() as `0x${string}`,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && isConnected,
      refetchInterval: 10000, // Refetch every 10 seconds
    },
  });

  // Calculate required amount and check if user has sufficient balance
  const hasInsufficientFunds = usdcBalance !== undefined && BigInt(usdcBalance) < BigInt(price);
  const formattedBalance = usdcBalance ? unitsToUSDC(BigInt(usdcBalance).toString()) : "0";

  // Error message helper
  const getErrorMessage = (error: any): string => {
    if (error?.shortMessage) {
      return error.shortMessage;
    }
    if (error?.message) {
      return error.message;
    }
    if (typeof error === "string") {
      return error;
    }
    return "An unexpected error occurred. Please try again.";
  };

  // USDC Approval transaction
  const {
    writeContract: writeApproval,
    data: approvalHash,
    error: approvalError,
    isPending: isApprovalPending,
  } = useWriteContract();

  const {
    isLoading: isApprovalConfirming,
    isSuccess: isApprovalConfirmed,
    error: approvalConfirmationError,
  } = useWaitForTransactionReceipt({
    confirmations: 2,
    hash: approvalHash,
  });

  // Buy Listing transaction
  const {
    writeContract: writeBuy,
    data: buyHash,
    error: buyError,
    isPending: isBuyPending,
  } = useWriteContract();

  const {
    isLoading: isBuyConfirming,
    isSuccess: isBuyConfirmed,
    error: buyConfirmationError,
    data: buyReceipt,
  } = useWaitForTransactionReceipt({
    hash: buyHash,
    confirmations: 2,
  });

  // Handle approval confirmation
  useEffect(() => {
    if (isApprovalConfirmed && approvalHash) {
      setApprovalTxHash(approvalHash);
      setCurrentStep(2);
    }
  }, [isApprovalConfirmed, approvalHash]);

  // Handle buy confirmation
  useEffect(() => {
    if (isBuyConfirmed && buyHash) {
      setBuyTxHash(buyHash);
      setCurrentStep(3);

      // Sync listings to refresh the data
      try {
        syncListings(queryClient);
      } catch (e) {
        console.error("Error syncing listings:", e);
      }
    }
  }, [isBuyConfirmed, buyHash, queryClient]);

  // Handle errors
  useEffect(() => {
    if (approvalError || approvalConfirmationError) {
      setError(getErrorMessage(approvalError || approvalConfirmationError));
    } else if (buyError || buyConfirmationError) {
      setError(getErrorMessage(buyError || buyConfirmationError));
    }
  }, [approvalError, approvalConfirmationError, buyError, buyConfirmationError]);

  const handleApproveUSDC = async () => {
    try {
      setError(null);
      console.log("Starting approval process...");

      await connectAsync({ connector: farcasterMiniApp() });

      console.log("Connection status:", { isConnected, address, isConnecting });

      // Check for insufficient funds
      if (hasInsufficientFunds) {
        const errorMsg = `Insufficient USDC balance. You need ${unitsToUSDC(
          price
        )} USDC but only have ${parseFloat(formattedBalance).toFixed(2)} USDC.`;
        console.error("Insufficient funds:", errorMsg);
        setError(errorMsg);
        return;
      }

      const usdcAddress = getUSDCContractAddress();
      const auctionAddress = getAuctionContractAddress();
      const chain = getChain();

      console.log("Contract addresses:", { usdcAddress, auctionAddress, chainId: chain.id });
      console.log("Approval params:", {
        price,
        priceAsBigInt: BigInt(price),
        account: address,
      });

      if (!address) {
        throw new Error("No wallet address available");
      }

      if (!usdcAddress || !auctionAddress) {
        throw new Error("Contract addresses not available");
      }

      writeApproval({
        address: usdcAddress as `0x${string}`,
        abi: ERC20_ABI,
        functionName: "approve",
        args: [auctionAddress as `0x${string}`, BigInt(price)],
      });

      console.log("Approval transaction sent successfully");
    } catch (e) {
      console.error("Error in handleApproveUSDC:", e);
      setError(getErrorMessage(e));
    }
  };

  const handleBuyListing = async () => {
    try {
      setError(null);

      const auctionAddress = getAuctionContractAddress();

      await connectAsync({ connector: farcasterMiniApp() });

      console.log("Buying listing with params:", {
        address: auctionAddress as `0x${string}`,
        abi: auctionAbi,
        functionName: "buyListing",
        args: [BigInt(listingId)],
      });

      writeBuy({
        address: auctionAddress as `0x${string}`,
        abi: auctionAbi,
        functionName: "buyListing",
        args: [BigInt(listingId)],
      });
    } catch (e) {
      console.error("Error buying listing:", e);
      setError(getErrorMessage(e));
    }
  };

  const handleClose = () => {
    setCurrentStep(1);
    setApprovalTxHash(null);
    setBuyTxHash(null);
    setError(null);
    onClose();
  };

  const getStepStatus = (step: TransactionStep) => {
    if (step < currentStep) return "completed";
    if (step === currentStep) return "active";
    return "pending";
  };

  const isLoading = isApprovalPending || isApprovalConfirming || isBuyPending || isBuyConfirming;

  // Add defensive checks to prevent crashes
  if (!price || price === "0") {
    console.error("Invalid price provided to BuyListingDrawer:", price);
    return null;
  }

  try {
    // Test if price conversion works
    const testPrice = unitsToUSDC(price);
    if (!testPrice || testPrice === "NaN") {
      console.error("Price conversion failed:", price);
      return null;
    }
  } catch (e) {
    console.error("Error converting price:", e);
    return null;
  }

  try {
    return (
      <Drawer open={isOpen} onOpenChange={handleClose}>
        <DrawerContent className="bg-background border-white/10">
          <DrawerHeader className="text-center">
            <DrawerTitle className="text-xl font-semibold text-foreground">
              {currentStep === 3 ? "Purchase Successful!" : "Complete Purchase"}
            </DrawerTitle>
            <DrawerDescription className="text-muted-foreground hidden">
              {currentStep === 3
                ? "Your collectible purchase has been completed"
                : `Purchase collectible for ${unitsToUSDC(price || "0")} USDC`}
            </DrawerDescription>
          </DrawerHeader>

          <div className="px-6 pb-6">
            {/* Transaction Steps */}
            {currentStep < 3 && (
              <div className="space-y-4 mb-6">
                {/* Step 1: Approve USDC */}
                <div
                  className={`rounded-2xl p-4 border transition-all ${
                    getStepStatus(1) === "completed"
                      ? "bg-green-500/10 border-green-500/20"
                      : getStepStatus(1) === "active"
                      ? "bg-primary/40 border-primary/50"
                      : "bg-card border-white/10"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-full border ${
                        getStepStatus(1) === "completed"
                          ? "bg-green-500/20 border-green-500"
                          : getStepStatus(1) === "active"
                          ? "bg-primary/50 border-primary"
                          : "bg-muted border-muted-foreground"
                      }`}
                    >
                      {getStepStatus(1) === "completed" ? (
                        <Check className="h-4 w-4 text-green-400" />
                      ) : getStepStatus(1) === "active" &&
                        (isApprovalPending || isApprovalConfirming) ? (
                        <Loader2 className="h-4 w-4 text-blue-400 animate-spin" />
                      ) : (
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-foreground">Approve USDC</h3>
                      <p className="text-sm text-muted-foreground">
                        Allow contract to spend {unitsToUSDC(price)} USDC
                      </p>
                    </div>
                  </div>
                </div>

                {/* Step 2: Buy Listing */}
                <div
                  className={`rounded-2xl p-4 border transition-all ${
                    getStepStatus(2) === "completed"
                      ? "bg-green-500/10 border-green-500/20"
                      : getStepStatus(2) === "active"
                      ? "bg-primary/50 border-primary/50"
                      : "bg-card border-white/10"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-full border ${
                        getStepStatus(2) === "completed"
                          ? "bg-green-500/20 border-green-500"
                          : getStepStatus(2) === "active"
                          ? "bg-primary/50 border-primary"
                          : "bg-muted border-muted-foreground"
                      }`}
                    >
                      {getStepStatus(2) === "completed" ? (
                        <Check className="h-4 w-4 text-green-400" />
                      ) : getStepStatus(2) === "active" && (isBuyPending || isBuyConfirming) ? (
                        <Loader2 className="h-4 w-4 text-blue-400 animate-spin" />
                      ) : (
                        <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-foreground">Complete Purchase</h3>
                      <p className="text-sm text-muted-foreground">
                        Transfer collectible to your wallet
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Balance Display */}
            {currentStep < 3 && address && (
              <div className="rounded-2xl bg-card border border-white/10 p-4 mb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Wallet className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-foreground">Your USDC Balance</span>
                  </div>
                  <div className="text-right">
                    {isBalanceLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    ) : (
                      <div className="space-y-1">
                        <p
                          className={`text-sm font-semibold ${
                            hasInsufficientFunds ? "text-red-400" : "text-foreground"
                          }`}
                        >
                          {formattedBalance} USDC
                        </p>
                        {hasInsufficientFunds && (
                          <p className="text-xs text-red-400">Need {unitsToUSDC(price)} USDC</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Error Display */}
            {error && (
              <div className="rounded-2xl bg-red-500/10 border border-red-500/20 p-4 mb-4">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setError(null)}
                    aria-label="Dismiss error"
                    className="p-1 rounded-full hover:bg-red-500/10 focus:outline-none focus:ring-2 focus:ring-red-400"
                  >
                    <X className="h-5 w-5 text-red-400 shrink-0" />
                  </button>
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              </div>
            )}

            {/* Success Message */}
            {currentStep === 3 && (
              <div className="text-center space-y-4">
                <div className="h-16 w-16 mx-auto rounded-full bg-green-500/20 flex items-center justify-center">
                  <Check className="h-8 w-8 text-green-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Collectible Purchased!
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    The collectible has been transferred to your wallet.
                  </p>
                </div>
                {buyTxHash && (
                  <div className="bg-card rounded-2xl p-4">
                    <p className="text-sm text-muted-foreground mb-2">Transaction Hash:</p>
                    <p className="text-xs font-mono text-foreground break-all">{buyTxHash}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          <DrawerFooter>
            {currentStep === 1 && (
              <div className="space-y-2">
                <Button
                  onClick={handleApproveUSDC}
                  disabled={isLoading || hasInsufficientFunds || isBalanceLoading || isConnecting}
                  className="w-full h-12 rounded-full bg-primary text-primary-foreground font-semibold disabled:opacity-50"
                >
                  {isApprovalPending || isApprovalConfirming ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>
                        {isApprovalPending ? "Approve USDC..." : "Confirming Approval..."}
                      </span>
                    </div>
                  ) : hasInsufficientFunds ? (
                    "Insufficient USDC Balance"
                  ) : (
                    `Approve ${unitsToUSDC(price)} USDC`
                  )}
                </Button>
                <DrawerClose asChild>
                  <Button variant="outline" className="w-full h-12 rounded-full">
                    Cancel
                  </Button>
                </DrawerClose>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-2">
                <Button
                  onClick={handleBuyListing}
                  disabled={isBuyPending || isBuyConfirming}
                  className="w-full h-12 rounded-full bg-primary text-primary-foreground font-semibold disabled:opacity-50"
                >
                  {isBuyPending || isBuyConfirming ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>{isBuyPending ? "Purchasing..." : "Confirming Purchase..."}</span>
                    </div>
                  ) : (
                    "Confirm Buy"
                  )}
                </Button>
                <DrawerClose asChild>
                  <Button variant="outline" className="w-full h-12 rounded-full">
                    Cancel
                  </Button>
                </DrawerClose>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-2">
                <Button
                  onClick={handleClose}
                  className="w-full h-12 rounded-full bg-primary text-primary-foreground font-semibold"
                >
                  Done
                </Button>
              </div>
            )}
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
  } catch (error) {
    console.error("Error rendering BuyListingDrawer:", error);
    return (
      <Drawer open={isOpen} onOpenChange={handleClose}>
        <DrawerContent className="bg-background border-white/10">
          <DrawerHeader className="text-center">
            <DrawerTitle className="text-xl font-semibold text-foreground">Error</DrawerTitle>
          </DrawerHeader>
          <div className="px-6 pb-6">
            <div className="rounded-2xl bg-red-500/10 border border-red-500/20 p-4">
              <p className="text-sm text-red-400">
                An error occurred while loading the purchase dialog. Please try again.
              </p>
            </div>
          </div>
          <DrawerFooter>
            <Button onClick={handleClose} variant="outline" className="w-full h-12 rounded-full">
              Close
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
  }
}
