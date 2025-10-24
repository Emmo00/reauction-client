import { DollarSign, Zap } from "lucide-react";
import { Button } from "./ui/button";
import Link from "next/link";
import type { Listing } from "@/types";
import { CollectibleImage } from "./collectible-image";

export function FeaturedCard({ listing }: { listing: Listing }) {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-red-500 to-red-600 p-6">
      <div className="mb-4 aspect-square overflow-hidden rounded-2xl">
        <CollectibleImage size={144} cast={listing.cast} className="h-full w-full object-cover" />
      </div>

      <div className="flex items-end justify-between">
        <div>
          <div className="mb-1 flex items-center gap-2 text-white/80">
            {listing.listingType == "auction" && <Zap className="h-4 w-4" />}
            {listing.listingType == "fixed-price" && <DollarSign className="h-4 w-4" />}
            <span className="text-xs">
              {listing.listingType == "auction" ? "Current Bid" : "Buy Now"}
            </span>
          </div>
          <p className="text-xl font-bold text-white">
            {listing.listingType == "auction" ? listing.highestBid : listing.price} USDC
          </p>
        </div>
        <Link href="/collectible/102" className="cursor-pointer">
          <Button
            size="sm"
            className="cursor-pointer rounded-full bg-white px-6 text-sm font-semibold text-black hover:bg-white/90"
          >
            Place Bid
          </Button>
        </Link>
      </div>
    </div>
  );
}
