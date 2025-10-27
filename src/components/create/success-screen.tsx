"use client";

import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import type { ListingData } from "../create-flow";

interface SuccessScreenProps {
  listingData: ListingData;
  onReset?: () => void;
  transactionHash?: `0x${string}`;
  listingId?: string;
}

export function SuccessScreen({
  listingData,
  onReset,
  transactionHash,
  listingId,
}: SuccessScreenProps) {
  const router = useRouter();

  const handleViewListing = () => {
    router.push(`/listing/${listingData.listingType}/${listingId}`);
  };

  const handleReturnHome = () => {
    router.push("/home");
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-md text-center">
        {/* Success Icon */}
        <div className="mb-6 flex justify-center">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-purple-500/20 to-purple-700/20 backdrop-blur-md">
            <CheckCircle2 className="h-12 w-12 text-purple-400" strokeWidth={2} />
          </div>
        </div>

        {/* Success Message */}
        <h1 className="mb-3 text-3xl font-bold text-white">Success!</h1>
        <p className="mb-8 text-gray-400 leading-relaxed">
          Your collectible has been listed successfully. It's now live and ready for buyers.
        </p>

        {/* Transaction Hash */}
        {transactionHash && (
          <div className="mb-6 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-4">
            <p className="text-sm text-white/60 mb-2">Transaction Hash:</p>
            <p className="text-xs font-mono text-white/80 break-all">{transactionHash}</p>
            <a
              href={`https://basescan.org/tx/${transactionHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-purple-400 hover:text-purple-300 transition-colors mt-2 inline-block"
            >
              View on BaseScan →
            </a>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button
            onClick={handleViewListing}
            className="h-12 w-full rounded-xl bg-gradient-to-r from-purple-500 to-purple-700 font-semibold text-white shadow-lg shadow-purple-500/30 transition-all hover:shadow-purple-500/50"
          >
            View Listing
          </Button>
          <Button
            onClick={handleReturnHome}
            variant="outline"
            className="h-12 w-full rounded-xl border-white/10 bg-white/5 font-semibold text-white backdrop-blur-sm hover:bg-white/10"
          >
            Return to Home
          </Button>
          {onReset && (
            <Button
              onClick={onReset}
              variant="ghost"
              className="h-12 w-full rounded-xl text-white/60 hover:text-white hover:bg-white/5"
            >
              Create Another Listing
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
