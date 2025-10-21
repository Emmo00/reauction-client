"use client";

import { useState, useEffect } from "react";
import { ChooseCollectible } from "@/components/create/choose-collectible";
import { ChooseListingType } from "@/components/create/choose-listing-type";
import { AuctionDetails } from "@/components/create/auction-details";
import { ListingDetails } from "@/components/create/listing-details";
import { ReviewConfirm } from "@/components/create/review-confirm";
import { SuccessScreen } from "@/components/create/success-screen";
import { CastResponse } from "@neynar/nodejs-sdk/build/api";
import { useAccount, useConnect, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { farcasterFrame } from "@farcaster/miniapp-wagmi-connector";
import auctionAbi from "@/abis/auction.json";
import { getAuctionContractAddress, USDC_DECIMALS } from "@/lib/constants";
import { AlertTriangle, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export type ListingType = "auction" | "fixed" | null;
export type Collection = {
  id: string;
  name: string;
  image: string;
  itemsOwned: number;
  cast?: CastResponse; // Add optional cast data for collectibles
};

export type ListingData = {
  collectible: Collection | null;
  listingType: ListingType;
  price?: string;
  startingPrice?: string;
  duration?: string;
};

export function CreateFlow() {
  const [step, setStep] = useState(1);
  const [hasSignedTransaction, setHasSignedTransaction] = useState(false);
  const [currentError, setCurrentError] = useState<string | null>(null);
  const [listingData, setListingData] = useState<ListingData>({
    collectible: null,
    listingType: null,
  });

  const { writeContract, data: hash, error } = useWriteContract();
  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    error: confirmationError,
  } = useWaitForTransactionReceipt({
    hash,
  });
  const { isConnected } = useAccount();
  const { connect } = useConnect();

  const updateListingData = (data: Partial<ListingData>) => {
    setListingData((prev) => ({ ...prev, ...data }));
  };

  const nextStep = () => {
    setCurrentError(null); // Clear errors when moving forward
    setStep((prev) => prev + 1);
  };

  const prevStep = () => {
    setCurrentError(null); // Clear errors when moving backward
    setStep((prev) => prev - 1);
  };

  const resetFlow = () => {
    setStep(1);
    setCurrentError(null);
    setHasSignedTransaction(false);
    setListingData({ collectible: null, listingType: null });
  };

  const clearError = () => {
    setCurrentError(null);
  };

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

  function handleCreateAuction() {
    const contractAddress = getAuctionContractAddress();
    writeContract({
      address: contractAddress as `0x${string}`,
      abi: auctionAbi,
      functionName: "startAuction",
      args: [
        BigInt(listingData.collectible?.cast?.cast.hash!),
        parseFloat(listingData.startingPrice ?? "0") * 10 ** USDC_DECIMALS,
        Number(listingData.duration) * 24 * 60 * 60,
      ],
    });
  }

  function handleCreateListing() {
    const contractAddress = getAuctionContractAddress();
    writeContract({
      address: contractAddress as `0x${string}`,
      abi: auctionAbi,
      functionName: "createListing",
      args: [
        BigInt(listingData.collectible?.cast?.cast.hash!),
        parseFloat(listingData.startingPrice ?? "0") * 10 ** USDC_DECIMALS,
      ],
    });
  }

  function handleReviewSubmission() {
    try {
      setCurrentError(null); // Clear any previous errors

      if (!isConnected) {
        connect({ connector: farcasterFrame() });
        return;
      }

      // Validate listing data
      if (!listingData.collectible?.cast?.cast.hash) {
        setCurrentError(
          "Invalid collectible selected. Please go back and select a valid collectible."
        );
        return;
      }

      switch (listingData.listingType) {
        case "auction":
          handleCreateAuction();
          break;
        case "fixed":
          if (!listingData.price) {
            setCurrentError("Please set a price for your listing.");
            return;
          }
          handleCreateListing();
          break;
        default:
          setCurrentError("Please select a listing type.");
          return;
      }

      setHasSignedTransaction(true);
    } catch (e) {
      console.error("Error creating listing:", e);
      setCurrentError(getErrorMessage(e));
    }
  }

  // Handle transaction confirmation
  useEffect(() => {
    if (isConfirmed && hasSignedTransaction && !isConfirming) {
      setCurrentError(null); // Clear any errors on success
      nextStep();
    }
  }, [isConfirmed, isConfirming, hasSignedTransaction]);

  // Handle transaction and confirmation errors
  useEffect(() => {
    if (error) {
      setCurrentError(getErrorMessage(error));
      setHasSignedTransaction(false);
    }
  }, [error]);

  useEffect(() => {
    if (confirmationError) {
      setCurrentError(`Transaction failed: ${getErrorMessage(confirmationError)}`);
      setHasSignedTransaction(false);
    }
  }, [confirmationError]);

  return (
    <div className="min-h-screen pb-24">
      {/* Error Display */}
      {currentError && (
        <div className="fixed top-4 left-4 right-4 z-50">
          <div className="relative overflow-hidden rounded-2xl bg-red-500/10 backdrop-blur-xl border border-red-500/20 shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-orange-500/5 rounded-2xl" />
            <div className="relative z-10 p-4 flex items-start gap-3">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-5 w-5 text-red-400 mt-0.5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-red-200 font-medium mb-1">Error</p>
                <p className="text-sm text-red-100/80 leading-relaxed">{currentError}</p>
              </div>
              <button
                onClick={clearError}
                className="flex-shrink-0 p-1 rounded-lg hover:bg-red-500/10 transition-colors"
              >
                <X className="h-4 w-4 text-red-300" />
              </button>
            </div>
            <div className="px-4 pb-4">
              <Button
                onClick={clearError}
                variant="outline"
                size="sm"
                className="bg-red-500/10 border-red-500/20 text-red-200 hover:bg-red-500/20"
              >
                Dismiss
              </Button>
            </div>
          </div>
        </div>
      )}

      {step === 1 && (
        <ChooseCollectible
          onSelect={(collectible) => {
            updateListingData({ collectible });
            nextStep();
          }}
        />
      )}
      {step === 2 && (
        <ChooseListingType
          onSelect={(type) => {
            updateListingData({ listingType: type });
            nextStep();
          }}
          onBack={prevStep}
        />
      )}
      {step === 3 && listingData.listingType === "auction" && (
        <AuctionDetails
          onContinue={(data) => {
            updateListingData(data);
            nextStep();
          }}
          onBack={prevStep}
        />
      )}
      {step === 3 && listingData.listingType === "fixed" && (
        <ListingDetails
          onContinue={(data) => {
            updateListingData(data);
            nextStep();
          }}
          onBack={prevStep}
        />
      )}
      {step === 4 && (
        <ReviewConfirm
          listingData={listingData}
          onConfirm={handleReviewSubmission}
          onBack={prevStep}
          onEdit={(editStep) => setStep(editStep)}
          isLoading={isConfirming}
          error={currentError}
        />
      )}
      {step === 5 && (
        <SuccessScreen listingData={listingData} onReset={resetFlow} transactionHash={hash} />
      )}
    </div>
  );
}
