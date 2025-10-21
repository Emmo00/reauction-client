"use client";

import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import type { ListingData } from "../create-flow";

interface SuccessScreenProps {
  listingData: ListingData;
}

export function SuccessScreen({ listingData }: SuccessScreenProps) {
  const router = useRouter();

  const handleViewListing = () => {
    router.push("/collectible/" + listingData.collectible?.cast?.cast.hash);
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
        </div>
      </div>
    </div>
  );
}
