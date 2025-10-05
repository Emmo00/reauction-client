import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useCacheOperations } from './useCacheOperations';

/**
 * Hook for managing cache lifecycle in a Farcaster Mini App context
 */
export function useMiniAppCaching() {
  const queryClient = useQueryClient();
  const { invalidateCollectibleStatus, prefetchCollectibleStatus } = useCacheOperations();

  // Invalidate cache when mini app becomes visible (user switches back to app)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // App became visible - refresh stale data
        queryClient.invalidateQueries({
          predicate: (query) => {
            // Invalidate queries that are marked as stale
            // This is safer than trying to access query.options.staleTime
            return query.isStale();
          },
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [queryClient]);

  // Prefetch user's own data when app loads
  const prefetchUserData = (userAddress: string) => {
    if (userAddress) {
      prefetchCollectibleStatus(userAddress);
    }
  };

  // Clear cache when user disconnects wallet
  const handleWalletDisconnect = () => {
    queryClient.clear();
  };

  // Batch invalidate related data after blockchain transaction
  const invalidateAfterTransaction = (userAddress: string, affectedAddresses?: string[]) => {
    // Always invalidate user's own data
    invalidateCollectibleStatus(userAddress);
    
    // Invalidate other affected addresses
    if (affectedAddresses) {
      affectedAddresses.forEach(address => {
        invalidateCollectibleStatus(address);
      });
    }
  };

  return {
    prefetchUserData,
    handleWalletDisconnect,
    invalidateAfterTransaction,
  };
}