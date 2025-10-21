"use client";

import { useState } from "react";
import { ChooseCollectible } from "@/components/create/choose-collectible";
import { ChooseListingType } from "@/components/create/choose-listing-type";
import { AuctionDetails } from "@/components/create/auction-details";
import { ListingDetails } from "@/components/create/listing-details";
import { ReviewConfirm } from "@/components/create/review-confirm";
import { SuccessScreen } from "@/components/create/success-screen";
import { CastResponse } from "@neynar/nodejs-sdk/build/api";

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
  const [listingData, setListingData] = useState<ListingData>({
    collectible: null,
    listingType: null,
  });

  const updateListingData = (data: Partial<ListingData>) => {
    setListingData((prev) => ({ ...prev, ...data }));
  };

  const nextStep = () => setStep((prev) => prev + 1);
  const prevStep = () => setStep((prev) => prev - 1);
  const resetFlow = () => {
    setStep(1);
    setListingData({ collectible: null, listingType: null });
  };

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
          onConfirm={nextStep}
          onBack={prevStep}
          onEdit={(editStep) => setStep(editStep)}
        />
      )}
      {step === 5 && <SuccessScreen listingData={listingData} />}
    </div>
  );
}
