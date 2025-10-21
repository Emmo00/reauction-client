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
import { getAuctionContractAddress } from "@/lib/constants";

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

  const nextStep = () => setStep((prev) => prev + 1);
  const prevStep = () => setStep((prev) => prev - 1);
  const resetFlow = () => {
    setStep(1);
    setListingData({ collectible: null, listingType: null });
  };

  function handleCreateAuction() {
    const contractAddress = getAuctionContractAddress();
    writeContract({
      address: contractAddress as `0x${string}`,
      abi: auctionAbi,
      functionName: "startAuction",
      args: [
        BigInt(listingData.collectible?.cast?.cast.hash!),
        listingData.startingPrice ?? 0,
        listingData.duration ?? 0,
      ],
    });
  }

  function handleCreateListing() {
    const contractAddress = getAuctionContractAddress();
    writeContract({
      address: contractAddress as `0x${string}`,
      abi: auctionAbi,
      functionName: "createListing",
      args: [BigInt(listingData.collectible?.cast?.cast.hash!), listingData.price ?? 0],
    });
  }

  function handleReviewSubmission() {
    try {
      if (!isConnected) {
        connect({ connector: farcasterFrame() });
      }

      switch (listingData.listingType) {
        case "auction":
          handleCreateAuction();
          break;
        case "fixed":
          handleCreateListing();
          break;
        default:
          break;
      }

      setHasSignedTransaction(true);
    } catch (e) {
      console.error("Error creating listing:", e);
    } finally {
      setListingData({ collectible: null, listingType: null });
    }
  }

  useEffect(() => {
    if (isConfirmed && hasSignedTransaction && !isConfirming) {
      nextStep();
    }
  }, [isConfirmed, isConfirming, hasSignedTransaction]);

  return (
    <div className="min-h-screen pb-24">
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
        />
      )}
      {step === 5 && <SuccessScreen listingData={listingData} />}
    </div>
  );
}
