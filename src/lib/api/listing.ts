import { APIClient, queryKeys } from "./client";
import type { Listing } from "@/types";

/**
 * API service for listing endpoints
 */
export class ListingAPI {
  static async fetchListings({
    limit,
    page,
    listingType,
  }: {
    limit: number;
    page: number;
    listingType?: "auction" | "fixed-price";
  }) {
    const params = new URLSearchParams();
    params.append("limit", limit.toString());
    params.append("page", page.toString());
    if (listingType) {
      params.append("listingType", listingType);
    }

    return APIClient.get<{ listings: Listing[]; totalCount: number; hasMore: boolean }>(
      `/listings?${params.toString()}`
    );
  }
}

export const listingQueryKeys = queryKeys.listings;
