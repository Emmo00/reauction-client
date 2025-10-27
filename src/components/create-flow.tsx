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
import collectibleAbi from "@/abis/collectible.json";
import {
  getAuctionContractAddress,
  getCollectibleContractAddress,
  USDC_DECIMALS,
} from "@/lib/constants";
import { AlertTriangle, X, Loader2, Check, Shield, Gavel } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { syncListings } from "@/lib/api/sync";
import { useQueryClient } from "@tanstack/react-query";

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
  duration?: string;
};

export function CreateFlow() {
  const [step, setStep] = useState(1);
  const [hasSignedTransaction, setHasSignedTransaction] = useState(false);
  const [currentError, setCurrentError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalStep, setModalStep] = useState<1 | 2>(1);
  const [approvalTxHash, setApprovalTxHash] = useState<`0x${string}` | null>(null);
  const [listingData, setListingData] = useState<ListingData>({
    collectible: null,
    listingType: null,
  });
  const [newListingId, setNewListingId] = useState<string | null>(null);

  // Query client for invalidating/refetching data
  const queryClient = useQueryClient();

  // Main transaction hook (for listing/auction creation)
  const { writeContract, data: hash, error } = useWriteContract();
  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    error: confirmationError,
    data: transactionReceipt,
  } = useWaitForTransactionReceipt({
    confirmations: 2,
    hash,
  });

  // Approval transaction hook
  const {
    writeContract: writeApproval,
    data: approvalHash,
    error: approvalError,
  } = useWriteContract();
  const {
    isLoading: isApprovingConfirming,
    isSuccess: isApprovalConfirmed,
    error: approvalConfirmationError,
  } = useWaitForTransactionReceipt({
    hash: approvalHash,
  });

  const { isConnected, address } = useAccount();
  const { connect, connectAsync } = useConnect();

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
    setIsModalOpen(false);
    setModalStep(1);
    setApprovalTxHash(null);
    setListingData({ collectible: null, listingType: null });
  };

  const clearError = () => {
    setCurrentError(null);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalStep(1);
    setApprovalTxHash(null);
    setCurrentError(null);
  };

  const getErrorMessage = (error: any): string => {
    console.log("errorrrr", error);
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
    console.log("cast hash", listingData.collectible?.cast?.cast.hash!);

    console.log("hash to bit int", BigInt(listingData.collectible?.cast?.cast.hash!));

    console.log("continue");

    console.log("listing data", listingData);

    const contractAddress = getAuctionContractAddress();
    writeContract({
      address: contractAddress as `0x${string}`,
      abi: auctionAbi,
      functionName: "startAuction",
      args: [
        BigInt(listingData.collectible?.cast?.cast.hash!),
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
        parseFloat(listingData.price || "0") * 10 ** USDC_DECIMALS,
      ],
    });
  }

  function handleApproveNFT() {
    const collectibleAddress = getCollectibleContractAddress();
    const auctionAddress = getAuctionContractAddress();
    const tokenId = listingData.collectible?.cast?.cast.hash!;

    writeApproval({
      address: collectibleAddress as `0x${string}`,
      abi: collectibleAbi,
      functionName: "approve",
      args: [auctionAddress as `0x${string}`, BigInt(tokenId)],
    });
  }

  async function handleReviewSubmission() {
    try {
      setCurrentError(null); // Clear any previous errors

      await connectAsync({ connector: farcasterFrame() });

      console.log("user address", address, isConnected);

      // Validate listing data
      if (!listingData.collectible?.cast?.cast.hash) {
        setCurrentError(
          "Invalid collectible selected. Please go back and select a valid collectible."
        );
        return;
      }

      // Open modal and start the 2-step process
      setIsModalOpen(true);
      setModalStep(1);
    } catch (e) {
      console.error("Error starting listing process:", e);
      setCurrentError(getErrorMessage(e));
    }
  }

  async function proceedWithListing() {
    try {
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

  // Handle approval transaction states
  useEffect(() => {
    if (isApprovalConfirmed && modalStep === 1) {
      setApprovalTxHash(approvalHash as `0x${string}`);
      setModalStep(2);
      // Now proceed with the actual listing
      proceedWithListing();
    }
  }, [isApprovalConfirmed, modalStep]);

  useEffect(() => {
    if (approvalError) {
      setCurrentError(getErrorMessage(approvalError));
    }
  }, [approvalError]);

  // Handle main transaction confirmation
  useEffect(() => {
    console.log("transaction receipt: ", transactionReceipt);
    if (
      isConfirmed &&
      hasSignedTransaction &&
      !isConfirming &&
      modalStep === 2 &&
      transactionReceipt
    ) {
      setCurrentError(null); // Clear any errors on success
      setIsModalOpen(false);

      // Extract listing ID from transaction receipt
      try {
        // For auction creation, look for AuctionStarted event
        // For listing creation, look for ListingCreated event
        const eventName =
          listingData.listingType === "auction" ? "AuctionStarted" : "ListingCreated";

        // Find the relevant event in the logs
        const relevantLog = transactionReceipt.logs.find((log) => {
          try {
            // For auctions, the first parameter is the auction ID
            // For listings, the first parameter is the listing ID
            return log.topics.length > 0; // Basic check for event logs
          } catch (e) {
            return false;
          }
        });

        if (relevantLog && relevantLog.topics.length > 1) {
          // The listing/auction ID is typically in the first indexed parameter (topics[1])
          const idHex = relevantLog.topics[1];
          const listingId = BigInt(idHex!).toString();
          setNewListingId(listingId);
          console.log(`${eventName} ID:`, listingId);
        } else {
          console.warn("Could not extract listing ID from transaction receipt");
        }
      } catch (e) {
        console.error("Error extracting listing ID:", e);
      }

      try {
        syncListings(queryClient);
      } catch (e) {
        console.error("Error syncing listings:", e);
      }

      nextStep();
    }
  }, [
    isConfirmed,
    isConfirming,
    hasSignedTransaction,
    modalStep,
    queryClient,
    hash,
    transactionReceipt,
    listingData.listingType,
  ]);

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
            <div className="absolute inset-0 bg-linear-to-r from-red-500/5 to-orange-500/5 rounded-2xl" />
            <div className="relative z-10 p-4 flex items-start gap-3">
              <div className="shrink-0">
                <AlertTriangle className="h-5 w-5 text-red-400 mt-0.5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-red-200 font-medium mb-1">Error</p>
                <p className="text-sm text-red-100/80 leading-relaxed">{currentError}</p>
              </div>
              <button
                onClick={clearError}
                className="shrink-0 p-1 rounded-lg hover:bg-red-500/10 transition-colors"
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
        <SuccessScreen listingData={listingData} onReset={resetFlow} transactionHash={hash} listingId={newListingId} />
      )}

      {/* 2-Step Transaction Modal */}
      <Dialog open={isModalOpen} onOpenChange={closeModal}>
        <DialogContent className="sm:max-w-md">
          <div className="relative overflow-hidden rounded-2xl bg-slate-900/95 backdrop-blur-xl border border-slate-700/50">
            <div className="absolute inset-0 bg-linear-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10" />

            <div className="relative z-10 p-6">
              <DialogHeader className="text-center mb-6">
                <DialogTitle className="text-xl font-semibold text-slate-200 mb-2">
                  {modalStep === 1 ? "Approve NFT Transfer" : "Create Listing"}
                </DialogTitle>
                <p className="text-sm text-slate-400">
                  {modalStep === 1
                    ? "First, approve the contract to transfer your NFT"
                    : "Now creating your listing on the marketplace"}
                </p>
              </DialogHeader>

              <div className="space-y-4">
                {/* Step indicators */}
                <div className="flex items-center justify-center space-x-4 mb-6">
                  <div
                    className={`flex items-center space-x-2 ${
                      modalStep >= 1 ? "text-blue-400" : "text-slate-500"
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                        modalStep >= 1
                          ? "border-blue-400 bg-blue-400/20"
                          : "border-slate-500 bg-slate-500/20"
                      }`}
                    >
                      {isApprovalConfirmed ? (
                        <Check className="w-4 h-4" />
                      ) : modalStep === 1 ? (
                        <span className="text-sm font-medium">1</span>
                      ) : (
                        <span className="text-sm font-medium">1</span>
                      )}
                    </div>
                    <span className="text-sm font-medium">Approve</span>
                  </div>

                  <div className={`w-8 h-0.5 ${modalStep >= 2 ? "bg-blue-400" : "bg-slate-600"}`} />

                  <div
                    className={`flex items-center space-x-2 ${
                      modalStep >= 2 ? "text-blue-400" : "text-slate-500"
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                        modalStep >= 2
                          ? "border-blue-400 bg-blue-400/20"
                          : "border-slate-500 bg-slate-500/20"
                      }`}
                    >
                      {isConfirmed ? (
                        <Check className="w-4 h-4" />
                      ) : modalStep === 2 ? (
                        <span className="text-sm font-medium">2</span>
                      ) : (
                        <span className="text-sm font-medium">2</span>
                      )}
                    </div>
                    <span className="text-sm font-medium">Create</span>
                  </div>
                </div>

                {/* Step 1: Approval */}
                {modalStep === 1 && (
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 mx-auto rounded-full bg-slate-800/50 flex items-center justify-center">
                      <Shield className="w-8 h-8 text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-slate-200 mb-2">
                        NFT Approval Required
                      </h3>
                      <p className="text-sm text-slate-400 mb-4">
                        Allow the marketplace to transfer your collectible when someone purchases
                        it.
                      </p>
                      <Button
                        onClick={handleApproveNFT}
                        disabled={isApprovingConfirming}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        {isApprovingConfirming ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Approving...
                          </>
                        ) : (
                          "Approve NFT Transfer"
                        )}
                      </Button>
                    </div>
                  </div>
                )}

                {/* Step 2: Create Listing */}
                {modalStep === 2 && (
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 mx-auto rounded-full bg-slate-800/50 flex items-center justify-center">
                      <Gavel className="w-8 h-8 text-green-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-slate-200 mb-2">
                        Creating Your Listing
                      </h3>
                      <p className="text-sm text-slate-400 mb-4">
                        {listingData.listingType === "auction"
                          ? "Starting your auction on the marketplace..."
                          : "Creating your fixed-price listing..."}
                      </p>
                      {approvalTxHash && (
                        <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 mb-4">
                          <div className="flex items-center gap-2 text-green-400 mb-1">
                            <Check className="w-4 h-4" />
                            <span className="text-sm font-medium">NFT Approved</span>
                          </div>
                          <p className="text-xs text-green-300/70">
                            Transaction: {approvalTxHash.slice(0, 10)}...{approvalTxHash.slice(-8)}
                          </p>
                        </div>
                      )}
                      {isConfirming && (
                        <div className="flex items-center justify-center text-blue-400">
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          <span className="text-sm">Processing transaction...</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Cancel button */}
                <div className="flex justify-center pt-4">
                  <Button
                    onClick={closeModal}
                    variant="ghost"
                    size="sm"
                    className="text-slate-400 hover:text-slate-200"
                    disabled={isApprovingConfirming || isConfirming}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
