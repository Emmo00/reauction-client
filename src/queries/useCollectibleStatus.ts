import { useQuery } from '@tanstack/react-query';
import { useAccount } from 'wagmi';
import { CollectibleStatus } from '@/types/collectible-status';
import { CollectibleStatusAPI, collectibleStatusQueryKeys } from '@/lib/api/collectible-status';

export function useCollectibleStatus(address?: string) {
  const { address: connectedAddress } = useAccount();
  
  // Use provided address or fall back to connected wallet address
  const targetAddress = address;

  const {
    data: status,
    isLoading: loading,
    error,
    refetch,
  } = useQuery({
    queryKey: collectibleStatusQueryKeys.byAddress(targetAddress || ''),
    queryFn: () => CollectibleStatusAPI.getCollectibleStatus(targetAddress!),
    enabled: !!targetAddress, // Only run query if we have an address
    staleTime: 2 * 60 * 1000, // Consider data stale after 2 minutes
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
    retry: (failureCount, error) => {
      // Don't retry on 404 errors (invalid address)
      if (error instanceof Error && error.message.includes('404')) {
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