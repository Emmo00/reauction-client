import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { collectibleStatusQueryKeys } from '@/lib/api/collectible-status';
import { farcasterAddressQueryKeys } from '@/lib/api/farcaster-address';

/**
 * Hook for managing cached data operations
 */
export function useCacheOperations() {
  const queryClient = useQueryClient();

  const invalidateCollectibleStatus = (address?: string) => {
    if (address) {
      // Invalidate specific address
      queryClient.invalidateQueries({
        queryKey: collectibleStatusQueryKeys.byAddress(address),
      });
    } else {
      // Invalidate all collectible status queries
      queryClient.invalidateQueries({
        queryKey: collectibleStatusQueryKeys.all,
      });
    }
  };

  const invalidateFarcasterAddress = (fid?: number) => {
    if (fid) {
      // Invalidate specific FID
      queryClient.invalidateQueries({
        queryKey: farcasterAddressQueryKeys.byFid(fid),
      });
    } else {
      // Invalidate all Farcaster address queries
      queryClient.invalidateQueries({
        queryKey: farcasterAddressQueryKeys.all,
      });
    }
  };

  const prefetchCollectibleStatus = async (address: string) => {
    await queryClient.prefetchQuery({
      queryKey: collectibleStatusQueryKeys.byAddress(address),
      queryFn: () => fetch(`/api/collectible-status/${address}`).then(res => res.json()),
      staleTime: 2 * 60 * 1000, // 2 minutes
    });
  };

  const prefetchFarcasterAddress = async (fid: number) => {
    await queryClient.prefetchQuery({
      queryKey: farcasterAddressQueryKeys.byFid(fid),
      queryFn: () => fetch(`/api/farcaster-address/${fid}`).then(res => res.json()),
      staleTime: 10 * 60 * 1000, // 10 minutes
    });
  };

  const setCollectibleStatusData = (address: string, data: any) => {
    queryClient.setQueryData(collectibleStatusQueryKeys.byAddress(address), data);
  };

  const setFarcasterAddressData = (fid: number, data: any) => {
    queryClient.setQueryData(farcasterAddressQueryKeys.byFid(fid), data);
  };

  // Clear all cache data
  const clearAllCache = () => {
    queryClient.clear();
  };

  // Get cache statistics
  const getCacheStats = () => {
    const cache = queryClient.getQueryCache();
    return {
      totalQueries: cache.getAll().length,
      collectibleStatusQueries: cache.findAll({ queryKey: collectibleStatusQueryKeys.all }).length,
      farcasterAddressQueries: cache.findAll({ queryKey: farcasterAddressQueryKeys.all }).length,
    };
  };

  return {
    invalidateCollectibleStatus,
    invalidateFarcasterAddress,
    prefetchCollectibleStatus,
    prefetchFarcasterAddress,
    setCollectibleStatusData,
    setFarcasterAddressData,
    clearAllCache,
    getCacheStats,
  };
}

/**
 * Hook for optimistic updates when user performs actions
 */
export function useOptimisticCollectibleUpdates() {
  const queryClient = useQueryClient();

  const updateAfterListing = useMutation({
    mutationFn: async ({ address, tokenId, price }: { address: string; tokenId: string; price: string }) => {
      // This would be the actual API call to create a listing
      const response = await fetch('/api/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tokenId, price }),
      });
      return response.json();
    },
    onMutate: async ({ address }) => {
      // Cancel outgoing refetches so they don't overwrite our optimistic update
      await queryClient.cancelQueries({ queryKey: ['collectible-status', address] });

      // Snapshot the previous value
      const previousData = queryClient.getQueryData(['collectible-status', address]);

      // Optimistically update to the new value
      queryClient.setQueryData(['collectible-status', address], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          // Update the data optimistically
          listingsCreated: old.listingsCreated + 1,
        };
      });

      return { previousData };
    },
    onError: (err, newData, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousData) {
        queryClient.setQueryData(['collectible-status', newData.address], context.previousData);
      }
    },
    onSettled: (data, error, variables) => {
      // Always refetch after error or success to ensure we have the latest data
      queryClient.invalidateQueries({ queryKey: ['collectible-status', variables.address] });
    },
  });

  return {
    updateAfterListing,
  };
}