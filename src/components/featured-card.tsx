"use client";

import { DollarSign, Zap } from "lucide-react";
import { Button } from "./ui/button";
import Link from "next/link";
import type { Listing } from "@/types";
import { CollectibleImage } from "./collectible-image";
import { unitsToUSDC } from "@/lib/utils";
import { useRouter } from "next/navigation";

export function FeaturedCard({ listing }: { listing: Listing }) {
  const router = useRouter();

  return (
    <div className="relative overflow-hidden rounded-3xl bg-linear-to-b from-black to-secondary px-6 pt-6 pb-2">
      <CollectibleImage
        size={300}
        cast={listing.cast}
        className="mx-auto cursor-pointer"
        borderRadius={30}
        onClick={() => router.push(`/listing/${listing.listingType}/${listing.listingId}`)}
      />

      <div className="flex items-center gap-2 justify-between pt-2">
        <div>
          <div className="mb-1 flex items-center gap-2 text-white/80">
            {listing.listingType == "auction" && <Zap className="h-4 w-4" />}
            {listing.listingType == "fixed-price" && <DollarSign className="h-4 w-4" />}
            <span className="text-xs">
              {listing.listingType == "auction" ? "Current Bid" : "Price"}
            </span>
          </div>
          <p className="text-xl font-bold text-white">
            {unitsToUSDC(
              listing.listingType == "auction" ? listing.highestBid || "0" : listing.price || "0"
            )}{" "}
            USDC
          </p>
        </div>
        <Link
          href={`/listing/${listing.listingType}/${listing.listingId}`}
          className="cursor-pointer"
        >
          <Button
            size="sm"
            className="cursor-pointer rounded-full bg-white px-6 text-sm font-semibold text-black hover:bg-white/90"
          >
            {listing.listingType == "auction" ? "Place Bid" : "Buy Now"}
          </Button>
        </Link>
      </div>
    </div>
  );
}
