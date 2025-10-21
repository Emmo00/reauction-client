"use client";

import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface AuctionDetailsProps {
  onContinue: (data: { startingPrice?: string; duration?: string }) => void;
  onBack: () => void;
}

export function AuctionDetails({ onContinue, onBack }: AuctionDetailsProps) {
  const [startingPrice, setStartingPrice] = useState("");
  const [duration, setDuration] = useState("3");

  const handleContinue = () => {
    onContinue({ startingPrice, duration });
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
        <h1 className="text-2xl font-bold text-white">Auction Details</h1>
      </div>

      {/* Form */}
      <div className="space-y-6">
        {/* Duration */}
        <div className="space-y-2">
          <Label htmlFor="duration" className="text-sm font-medium text-gray-300">
            Duration
          </Label>
          <div className="grid grid-cols-3 gap-3">
            {["1", "3", "7"].map((days) => (
              <button
                key={days}
                onClick={() => setDuration(days)}
                className={`rounded-xl border py-3 text-sm font-medium transition-all ${
                  duration === days
                    ? "border-purple-500 bg-purple-500/20 text-purple-300"
                    : "border-white/10 bg-white/5 text-gray-400 hover:border-white/20 hover:bg-white/10"
                }`}
              >
                {days} {days === "1" ? "day" : "days"}
              </button>
            ))}
          </div>
        </div>
        {/* Starting Price */}
        <div className="space-y-2">
          <Label htmlFor="startingPrice" className="text-sm font-medium text-gray-300">
            Starting Price (Optional) 
          </Label>
          <div className="relative">
            <Input
              id="startingPrice"
              type="number"
              placeholder="0.00"
              value={startingPrice}
              onChange={(e) => setStartingPrice(e.target.value)}
              className="h-12 border-white/10 bg-white/5 pr-12 text-white placeholder:text-gray-500 backdrop-blur-sm focus:border-purple-500/50 focus:ring-purple-500/20"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-400">
              USDC
            </span>
          </div>
        </div>

        {/* Preview Card */}
        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-purple-500/10 to-purple-700/5 p-4 backdrop-blur-md">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-400">Preview</p>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Starting Price:</span>
              <span className="font-medium text-white">{startingPrice || "No minimum"} USDC</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Duration:</span>
              <span className="font-medium text-white">
                {duration} {duration === "1" ? "day" : "days"}
              </span>
            </div>
          </div>
        </div>

        {/* Continue Button */}
        <Button
          onClick={handleContinue}
          className="h-12 w-full rounded-xl bg-gradient-to-r from-purple-500 to-purple-700 font-semibold text-white shadow-lg shadow-purple-500/30 transition-all hover:shadow-purple-500/50"
        >
          Continue
        </Button>
      </div>
    </div>
  );
}
