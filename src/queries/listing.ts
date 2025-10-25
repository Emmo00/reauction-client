import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { ListingAPI, listingQueryKeys } from "@/lib/api/listing";

export function useListings({
  limit,
  page,
  listingType,
}: {
  limit: number;
  page: number;
  listingType?: "auction" | "fixed-price";
}) {
  return useQuery({
    queryKey: listingQueryKeys.byType({ limit, page, listingType }),
    queryFn: () => ListingAPI.fetchListings({ limit, page, listingType }),
    staleTime: 5 * 60 * 1000, // Consider data stale after 5 minutes
    gcTime: 15 * 60 * 1000, // Keep in cache for 15 minutes
  });
}

export function useInfiniteListings({
  limit = 10,
  listingType,
}: {
  limit?: number;
  listingType?: "auction" | "fixed-price";
}) {
  return useInfiniteQuery({
    queryKey: listingQueryKeys.infinite({ limit, listingType }),
    queryFn: ({ pageParam = 1 }) => 
      ListingAPI.fetchListings({ 
        limit, 
        page: pageParam, 
        listingType 
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      // If the last page has fewer items than the limit, we've reached the end
      if (!lastPage.hasMore || lastPage.listings.length < limit) {
        return undefined;
      }
      return allPages.length + 1;
    },
    staleTime: 5 * 60 * 1000, // Consider data stale after 5 minutes
    gcTime: 15 * 60 * 1000, // Keep in cache for 15 minutes
  });
}

export function useListing({
  id,
  type,
}: {
  id: string;
  type: "auction" | "fixed-price";
}) {
  return useQuery({
    queryKey: listingQueryKeys.byId({ id, type }),
    queryFn: () => ListingAPI.fetchListingById({ id, type }),
    staleTime: 2 * 60 * 1000, // Consider data stale after 2 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
    enabled: !!id && !!type, // Only run query if both id and type are provided
  });
}
