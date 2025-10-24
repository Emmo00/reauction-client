"use client";

import { useState } from "react";
import { MobileHeader } from "@/components/mobile-header";
import { SearchBar } from "@/components/search-bar";
import { FilterTabs } from "@/components/filter-tabs";
import { FeaturedCard } from "@/components/featured-card";
import { BottomNav } from "@/components/bottom-nav";
import { useListings } from "@/queries/listing";
import type { Listing } from "@/types";

export default function HomePage() {
  const [listingType, setListingType] = useState<"auction" | "fixed-price" | undefined>(undefined);
  const [listings, setListings] = useState<Listing[]>([]);
  const { data, isLoading, error } = useListings({ limit: 10, page: 1, listingType });

  return (
    <>
      <div className="min-h-screen bg-background pb-32">
        <MobileHeader />

        <div className="px-4 pt-4 space-y-4">
          <SearchBar />
          <FilterTabs />
          <div>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">All</h2>
            </div>
            <div className="flex flex-col gap-2">
              {listings.map((listing) => (
                <FeaturedCard key={listing.listingId + listing.listingType} listing={listing} />
              ))}
            </div>
          </div>
        </div>
      </div>
      <BottomNav />
    </>
  );
}
