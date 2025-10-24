import { useQuery } from "@tanstack/react-query";
import { FarcasterAddressAPI, farcasterAddressQueryKeys } from "@/lib/api/farcaster-address";

export function useFarcasterAddress(fid?: number) {
  return useQuery({
    queryKey: farcasterAddressQueryKeys.byFid(fid || 0),
    queryFn: () => FarcasterAddressAPI.getFarcasterAddress(fid!),
    enabled: !!fid, // Only run query if we have an FID
    staleTime: 10 * 60 * 1000, // Consider data stale after 10 minutes (addresses change rarely)
    gcTime: 30 * 60 * 1000, // Keep in cache for 30 minutes
  });
}
