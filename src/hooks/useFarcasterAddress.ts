import { useQuery } from '@tanstack/react-query';
import { FarcasterAddressAPI, farcasterAddressQueryKeys } from '@/lib/api/farcaster-address';

export function useFarcasterAddress(fid?: number) {
  const {
    data,
    isLoading: loading,
    error,
    refetch,
  } = useQuery({
    queryKey: farcasterAddressQueryKeys.byFid(fid || 0),
    queryFn: () => FarcasterAddressAPI.getFarcasterAddress(fid!),
    enabled: !!fid, // Only run query if we have an FID
    staleTime: 10 * 60 * 1000, // Consider data stale after 10 minutes (addresses change rarely)
    gcTime: 30 * 60 * 1000, // Keep in cache for 30 minutes
    retry: (failureCount, error) => {
      // Don't retry on 404 errors (invalid FID)
      if (error instanceof Error && error.message.includes('404')) {
        return false;
      }
      return failureCount < 3;
    },
  });

  return {
    address: data?.address || null,
    source: data?.source || null,
    loading,
    error: error instanceof Error ? error.message : null,
    refetch,
  };
}