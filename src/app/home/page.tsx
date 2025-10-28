"use client";

import { useState, useCallback, useEffect } from "react";
import { MobileHeader } from "@/components/mobile-header";
import { SearchBar } from "@/components/search-bar";
import { FilterTabs } from "@/components/filter-tabs";
import { FeaturedCard } from "@/components/featured-card";
import { BottomNav } from "@/components/bottom-nav";
import { ListingLoadingSkeleton, InlineLoader } from "@/components/loading-skeleton";
import { ErrorState } from "@/components/error-state";
import { useInfiniteListings } from "@/queries/listing";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { useDebounce } from "@/hooks/useDebounce";
import type { Listing } from "@/types";

export default function HomePage() {
  const [listingType, setListingType] = useState<"auction" | "fixed-price" | undefined>(undefined);
  
  const {
    data,
    error,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
    isRefetching
  } = useInfiniteListings({
    limit: 10,
    listingType,
  });

  const loadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage && !isRefetching) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, isRefetching, fetchNextPage]);

  const { observerRef, setNotFetching } = useInfiniteScroll(loadMore, {
    enabled: hasNextPage && !isLoading && !error
  });

  // Reset scroll detection when new data is loaded
  useEffect(() => {
    if (!isFetchingNextPage) {
      setNotFetching();
    }
  }, [isFetchingNextPage, setNotFetching]);

  // Flatten all pages into a single array of listings
  const allListings: Listing[] = data?.pages.flatMap(page => page.listings) || [];

  // Handle filter change - reset to first page with debounce
  const debouncedFilterChange = useDebounce((newListingType: "auction" | "fixed-price" | undefined) => {
    if (newListingType !== listingType) {
      setListingType(newListingType);
    }
  }, 300);

  const handleFilterChange = useCallback((newListingType: "auction" | "fixed-price" | undefined) => {
    debouncedFilterChange(newListingType);
  }, [debouncedFilterChange]);

  // Handle retry with optional refresh
  const handleRetry = useCallback(() => {
    refetch();
  }, [refetch]);

  if (isLoading) {
    return (
      <>
        <div className="min-h-screen bg-background pb-32">
          <MobileHeader />
          <div className="px-4 pt-2 space-y-4">
            <SearchBar />
            <FilterTabs />
            <div>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-foreground">All</h2>
              </div>
              <ListingLoadingSkeleton count={5} />
            </div>
          </div>
        </div>
        <BottomNav />
      </>
    );
  }

  if (error) {
    return (
      <>
        <div className="min-h-screen bg-background pb-32">
          <MobileHeader />
          <div className="px-4 pt-4 space-y-4">
            <SearchBar />
            <FilterTabs />
            <ErrorState 
              error={error as Error}
              onRetry={handleRetry}
              title="Failed to load listings"
              description="We couldn't load the listings. Please check your connection and try again."
            />
          </div>
        </div>
        <BottomNav />
      </>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-background pb-32">
        <MobileHeader />

        <div className="px-4 pt-4 space-y-4">
          <SearchBar />
          <FilterTabs onFilterChange={handleFilterChange} />
          <div>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">
                {listingType === "auction" ? "Auctions" :
                 listingType === "fixed-price" ? "Fixed Price" : "All"}
                {isRefetching && (
                  <span className="ml-2 text-xs text-muted-foreground">(refreshing...)</span>
                )}
              </h2>
              {allListings.length > 0 && (
                <span className="text-sm text-muted-foreground">
                  {allListings.length} listing{allListings.length !== 1 ? 's' : ''}
                </span>
              )}
            </div>
            
            {allListings.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="text-muted-foreground space-y-3">
                  <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-lg font-medium">No listings found</p>
                    <p className="text-sm mt-1">
                      {listingType ? 
                        `No ${listingType === "auction" ? "auctions" : "fixed-price listings"} are available right now.` :
                        "No listings are available right now."
                      }
                    </p>
                    <p className="text-xs mt-2 text-muted-foreground/80">
                      Check back later or try a different filter.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {allListings.map((listing, index) => {
                  try {
                    return (
                      <FeaturedCard 
                        key={`${listing.listingId}-${listing.listingType}-${index}`} 
                        listing={listing} 
                      />
                    );
                  } catch (error) {
                    console.error(`Error rendering listing ${listing.listingId}:`, error);
                    return (
                      <div key={`error-${listing.listingId}-${index}`} className="p-4 bg-muted/50 rounded-lg">
                        <p className="text-sm text-muted-foreground">Failed to load listing</p>
                      </div>
                    );
                  }
                })}
                
                {/* Infinite scroll trigger */}
                {hasNextPage && (
                  <div ref={observerRef} className="h-20 flex items-center justify-center">
                    {isFetchingNextPage && <InlineLoader />}
                  </div>
                )}
                
                {/* End of results indicator */}
                {!hasNextPage && allListings.length > 0 && (
                  <div className="flex items-center justify-center py-8">
                    <div className="text-center text-muted-foreground">
                      <p className="text-sm">You've reached the end</p>
                      <p className="text-xs mt-1">No more listings to load</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      <BottomNav />
    </>
  );
}
