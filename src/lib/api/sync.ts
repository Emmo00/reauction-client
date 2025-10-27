import { QueryClient } from "@tanstack/react-query";
import { APIClient, queryKeys } from "./client";

export async function syncListings(
  queryClient?: QueryClient,
): Promise<void> {
  try {
    // Add a 1-second delay before syncing
    await new Promise<void>((resolve) => setTimeout(resolve, 1000));

    // Call the sync endpoint
    await APIClient.post("/cron/sync-listings");

    // Invalidate the listings queries to force refetch
    if (queryClient) {
      // Invalidate all listings-related queries (both regular and infinite queries)
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: queryKeys.listings.all,
        }),
        // Also refetch any active queries to get fresh data immediately
        queryClient.refetchQueries({
          queryKey: queryKeys.listings.all,
          type: "active",
        }),
      ]);

      console.log("Listings synced and queries invalidated");
    }
  } catch (error) {
    console.error("Error syncing listings:", error);
    throw error; // Re-throw to allow callers to handle the error
  }
}
