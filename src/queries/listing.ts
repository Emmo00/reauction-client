import { useQuery } from "@tanstack/react-query";
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
