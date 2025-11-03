import { useQuery } from "@tanstack/react-query";
import { CollectiblesAPI, collectibleStatusQueryKeys } from "@/lib/api/collectibles";
import { CollectibleStatus } from "@/types";

export function useCollectibleStatus(address?: string) {
  const {
    data: status,
    isLoading: loading,
    error,
    refetch,
  } = useQuery({
    queryKey: collectibleStatusQueryKeys.status(address || ""),
    queryFn: () => CollectiblesAPI.getCollectibleStatus(address!),
    enabled: !!address, // Only run query if we have an address
    staleTime: 2 * 60 * 1000, // Consider data stale after 2 minutes
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
    retry: (failureCount, error) => {
      // Don't retry on 404 errors (invalid address)
      if (error instanceof Error && error.message.includes("404")) {
        return false;
      }
      return failureCount < 3;
    },
  });

  return {
    status: status as CollectibleStatus | null,
    loading,
    error: error instanceof Error ? error.message : null,
    refetch,
  };
}
