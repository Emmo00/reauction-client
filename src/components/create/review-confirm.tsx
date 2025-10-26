"use client";

import { ArrowLeft, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ListingData } from "@/components/create-flow";
import { CollectibleImage } from "../collectible-image";

interface ReviewConfirmProps {
  listingData: ListingData;
  onConfirm: () => void;
  onBack: () => void;
  onEdit: (step: number) => void;
  isLoading?: boolean;
  error?: string | null;
}

export function ReviewConfirm({
  listingData,
  onConfirm,
  onBack,
  onEdit,
  isLoading = false,
  error,
}: ReviewConfirmProps) {
  const { collectible, listingType, price, duration } = listingData;

  return (
    <div className="min-h-screen px-6 py-8">
      {/* Header */}
      <div className="mb-8 flex items-center gap-4">
        <button
          onClick={onBack}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm transition-colors hover:bg-white/20"
        >
          <ArrowLeft className="h-5 w-5 text-white" />
        </button>
        <h1 className="text-2xl font-bold text-white">Review & Confirm</h1>
      </div>

      {/* Summary Cards */}
      <div className="space-y-4">
        {/* Collection */}
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md">
          <div className="flex items-center justify-between border-b border-white/10 p-4">
            <h3 className="text-sm font-medium text-gray-400">Collection</h3>
            <button
              onClick={() => onEdit(1)}
              className="flex items-center gap-1 text-sm text-purple-400 transition-colors hover:text-purple-300"
            >
              <Edit2 className="h-3 w-3" />
              Edit
            </button>
          </div>
          <div className="flex flex-col justify-center items-center gap-2 p-4">
            <div className="w-full justify-center rounded-lg">
              {collectible?.cast && (
                <CollectibleImage cast={collectible.cast} size={290} className="w-full m-auto" />
              )}
            </div>
            <h3 className="font-semibold text-white text-sm group-hover:text-purple-300">
              #
              {collectible?.cast?.cast.hash
                ? BigInt(collectible.cast.cast.hash).toString().substring(0, 6)
                : "Unknown"}{" "}
              by {collectible?.cast?.cast.author.display_name || "Unknown Author"}
            </h3>
            <p className="text-sm text-gray-400 overflow-hidden w-full break-words">
              {collectible?.cast?.cast?.text ?? "Unknown"}
            </p>
          </div>
        </div>

        {/* Listing Type */}
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md">
          <div className="flex items-center justify-between border-b border-white/10 p-4">
            <h3 className="text-sm font-medium text-gray-400">Listing Type</h3>
            <button
              onClick={() => onEdit(2)}
              className="flex items-center gap-1 text-sm text-purple-400 transition-colors hover:text-purple-300"
            >
              <Edit2 className="h-3 w-3" />
              Edit
            </button>
          </div>
          <div className="p-4">
            <p className="font-medium capitalize text-white">
              {listingType === "auction" ? "Auction" : "Fixed Listing"}
            </p>
          </div>
        </div>

        {/* Pricing Details */}
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md">
          <div className="flex items-center justify-between border-b border-white/10 p-4">
            <h3 className="text-sm font-medium text-gray-400">Details</h3>
            <button
              onClick={() => onEdit(3)}
              className="flex items-center gap-1 text-sm text-purple-400 transition-colors hover:text-purple-300"
            >
              <Edit2 className="h-3 w-3" />
              Edit
            </button>
          </div>
          <div className="space-y-3 p-4">
            {listingType === "auction" ? (
              <div className="flex justify-between">
                <span className="text-gray-400">Duration:</span>
                <span className="font-medium text-white">
                  {duration} {duration === "1" ? "day" : "days"}
                </span>
              </div>
            ) : (
              <div className="flex justify-between">
                <span className="text-gray-400">Price:</span>
                <span className="font-medium text-white">{price} USDC</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Listing Button */}
      <div className="mt-8">
        <Button
          onClick={onConfirm}
          disabled={isLoading}
          className="h-14 w-full rounded-xl bg-gradient-to-r from-purple-500 to-purple-700 text-lg font-semibold text-white shadow-lg shadow-purple-500/30 transition-all hover:shadow-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <div className="flex items-center gap-3">
              <div className="animate-spin h-5 w-5 border-2 border-white/30 border-t-white rounded-full" />
              <span>
                Creating {listingData.listingType === "auction" ? "Auction" : "Listing"}...
              </span>
            </div>
          ) : (
            `Create ${listingData.listingType === "auction" ? " Auction" : "Listing"}`
          )}
        </Button>
      </div>
    </div>
  );
}
