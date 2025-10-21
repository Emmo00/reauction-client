"use client";

import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ListingDetailsProps {
  onContinue: (data: { price?: string }) => void;
  onBack: () => void;
}

export function ListingDetails({ onContinue, onBack }: ListingDetailsProps) {
  const [price, setPrice] = useState("");

  const handleContinue = () => {
    onContinue({ price });
  };

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
        <h1 className="text-2xl font-bold text-white">Listing Details</h1>
      </div>

      {/* Form */}
      <div className="space-y-6">
        {/* Fixed Price */}
        <div className="space-y-2">
          <Label htmlFor="price" className="text-sm font-medium text-gray-300">
            Fixed Price
          </Label>
          <div className="relative">
            <Input
              id="price"
              type="number"
              placeholder="0.00"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="h-12 border-white/10 bg-white/5 pr-12 text-white placeholder:text-gray-500 backdrop-blur-sm focus:border-purple-500/50 focus:ring-purple-500/20"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-400">
              ETH
            </span>
          </div>
        </div>

        {/* Preview Card */}
        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-purple-500/10 to-purple-700/5 p-4 backdrop-blur-md">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-400">Preview</p>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Price:</span>
              <span className="font-medium text-white">{price || "0.00"} ETH</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Type:</span>
              <span className="font-medium text-white">Fixed Listing</span>
            </div>
          </div>
        </div>

        {/* Continue Button */}
        <Button
          onClick={handleContinue}
          disabled={!price}
          className="h-12 w-full rounded-xl bg-gradient-to-r from-purple-500 to-purple-700 font-semibold text-white shadow-lg shadow-purple-500/30 transition-all hover:shadow-purple-500/50 disabled:opacity-50"
        >
          Continue
        </Button>
      </div>
    </div>
  );
}
