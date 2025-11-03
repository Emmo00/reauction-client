"use client";

import { useState } from "react";
import { X, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { getAuctionContractAddress } from "@/lib/constants";
import auctionAbi from "@/abis/auction.json";

interface AdminActionDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  action: "cancelListing" | "cancelAuction" | "settleAuction";
  itemId: string;
  itemType: "auction" | "fixed-price";
  onSuccess?: () => void;
}

const ActionConfig = {
  cancelListing: {
    title: "Cancel Listing",
    description: "Are you sure you want to cancel this listing? The NFT will be returned to you.",
    buttonText: "Cancel Listing",
    successMessage: "Listing cancelled successfully! The NFT has been returned to you.",
    functionName: "cancelListing",
  },
  cancelAuction: {
    title: "Cancel Auction",
    description: "Are you sure you want to cancel this auction? Any bids will be refunded.",
    buttonText: "Cancel Auction",
    successMessage: "Auction cancelled successfully! All bids have been refunded.",
    functionName: "cancelAuction",
  },
  settleAuction: {
    title: "Settle Auction",
    description: "This will finalize the auction and transfer the NFT to the winner.",
    buttonText: "Settle Auction",
    successMessage: "Auction settled successfully! The NFT has been transferred to the winner.",
    functionName: "settleAuction",
  },
};

export function AdminActionDrawer({
  isOpen,
  onClose,
  action,
  itemId,
  itemType,
  onSuccess,
}: AdminActionDrawerProps) {
  const [currentStep, setCurrentStep] = useState<"confirm" | "processing" | "success">("confirm");
  const config = ActionConfig[action];

  const { writeContract, data: hash, isPending, error } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const handleConfirm = async () => {
    try {
      setCurrentStep("processing");
      await writeContract({
        address: getAuctionContractAddress() as `0x${string}`,
        abi: auctionAbi,
        functionName: config.functionName,
        args: [BigInt(itemId)],
      });
    } catch (error) {
      console.error("Transaction failed:", error);
      setCurrentStep("confirm");
    }
  };

  // Handle transaction success
  if (isSuccess && currentStep === "processing") {
    setCurrentStep("success");
    if (onSuccess) {
      onSuccess();
    }
  }

  const handleClose = () => {
    setCurrentStep("confirm");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm flex items-end">
      <div className="w-full bg-card/90 backdrop-blur-xl border-t border-white/20 rounded-t-3xl p-6 space-y-6 animate-in slide-in-from-bottom-2 duration-300 shadow-2xl">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">{config.title}</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            className="h-8 w-8 rounded-full hover:bg-white/10 backdrop-blur-sm border border-white/10"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {currentStep === "confirm" && (
          <>
            <div className="rounded-2xl bg-orange-500/10 backdrop-blur-sm border border-orange-500/20 p-4">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-full bg-orange-500/20 backdrop-blur-sm flex items-center justify-center shrink-0 border border-orange-500/30">
                  <AlertTriangle className="h-5 w-5 text-orange-400" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-medium text-foreground">Confirm Action</h3>
                  <p className="text-sm text-muted-foreground">
                    {config.description}
                  </p>
                </div>
              </div>
            </div>

            {error && (
              <div className="rounded-2xl bg-red-500/10 backdrop-blur-sm border border-red-500/20 p-4">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-full bg-red-500/20 backdrop-blur-sm flex items-center justify-center shrink-0 border border-red-500/30">
                    <AlertTriangle className="h-5 w-5 text-red-400" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-medium text-foreground">Transaction Failed</h3>
                    <p className="text-sm text-muted-foreground">
                      {error.message || "An error occurred while processing the transaction."}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleClose}
                className="flex-1 bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10 transition-all duration-200"
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirm}
                disabled={isPending}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white transition-all duration-200 backdrop-blur-sm"
              >
                {isPending ? "Processing..." : config.buttonText}
              </Button>
            </div>
          </>
        )}

        {currentStep === "processing" && (
          <div className="text-center space-y-4 py-8">
            <div className="h-16 w-16 mx-auto rounded-full bg-blue-500/20 backdrop-blur-sm border border-blue-500/30 flex items-center justify-center">
              <div className="h-8 w-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">Processing Transaction</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {isConfirming ? "Confirming transaction..." : "Waiting for signature..."}
              </p>
            </div>
          </div>
        )}

        {currentStep === "success" && (
          <div className="text-center space-y-4 py-8">
            <div className="h-16 w-16 mx-auto rounded-full bg-green-500/20 backdrop-blur-sm border border-green-500/30 flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8 text-green-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">Success!</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {config.successMessage}
              </p>
            </div>
            <Button
              onClick={handleClose}
              className="bg-green-600 hover:bg-green-700 text-white transition-all duration-200 backdrop-blur-sm"
            >
              Done
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}