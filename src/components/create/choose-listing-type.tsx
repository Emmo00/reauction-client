"use client";

import { ArrowLeft, Gavel, Tag } from "lucide-react";
import type { ListingType } from "@/components/create-flow";

interface ChooseListingTypeProps {
  onSelect: (type: ListingType) => void;
  onBack: () => void;
}

export function ChooseListingType({ onSelect, onBack }: ChooseListingTypeProps) {
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
        <h1 className="text-2xl font-bold text-white">Choose Listing Type</h1>
      </div>

      {/* Subtitle */}
      <p className="mb-8 text-gray-400">How do you want to sell this collectible?</p>

      {/* Listing Type Cards */}
      <div className="space-y-4">
        {/* Auction Card */}
        <button
          onClick={() => onSelect("auction")}
          className="group w-full overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-purple-500/10 to-purple-700/5 p-6 backdrop-blur-md transition-all hover:border-purple-500/50 hover:from-purple-500/20 hover:to-purple-700/10"
        >
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-purple-500/20">
              <Gavel className="h-7 w-7 text-purple-400" />
            </div>
            <div className="flex-1 text-left">
              <h3 className="mb-2 text-xl font-semibold text-white group-hover:text-purple-300">
                Auction
              </h3>
              <p className="text-sm leading-relaxed text-gray-400">
                Item is bid on until auction ends. Perfect for rare collectibles.
              </p>
            </div>
            <div className="text-gray-400 transition-transform group-hover:translate-x-1 group-hover:text-purple-400">
              →
            </div>
          </div>
        </button>

        {/* Fixed Listing Card */}
        <button
          onClick={() => onSelect("fixed")}
          className="group w-full overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-purple-500/10 to-purple-700/5 p-6 backdrop-blur-md transition-all hover:border-purple-500/50 hover:from-purple-500/20 hover:to-purple-700/10"
        >
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-purple-500/20">
              <Tag className="h-7 w-7 text-purple-400" />
            </div>
            <div className="flex-1 text-left">
              <h3 className="mb-2 text-xl font-semibold text-white group-hover:text-purple-300">
                Fixed Listing
              </h3>
              <p className="text-sm leading-relaxed text-gray-400">
                Item is sold immediately at a fixed price. Quick and simple.
              </p>
            </div>
            <div className="text-gray-400 transition-transform group-hover:translate-x-1 group-hover:text-purple-400">
              →
            </div>
          </div>
        </button>
      </div>
    </div>
  );
}
