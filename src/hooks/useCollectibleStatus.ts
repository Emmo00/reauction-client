import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { CollectibleStatus, CollectibleStatusResponse } from '@/types/collectible-status';

export function useCollectibleStatus(address?: string) {
  const [status, setStatus] = useState<CollectibleStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { address: connectedAddress } = useAccount();
  
  // Use provided address or fall back to connected wallet address
  const targetAddress = address || connectedAddress;

  useEffect(() => {
    if (!targetAddress) {
      setStatus(null);
      setError(null);
      return;
    }

    const fetchStatus = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`/api/collectible-status/${targetAddress}`);
        const data: CollectibleStatusResponse = await response.json();
        
        if (!response.ok) {
          throw new Error('error' in data ? data.error : 'Failed to fetch collectible status');
        }
        
        if ('error' in data) {
          throw new Error(data.error);
        }
        
        setStatus(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
        setStatus(null);
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
  }, [targetAddress]);

  return {
    status,
    loading,
    error,
    refetch: () => {
      if (targetAddress) {
        setLoading(true);
        setError(null);
        // Re-trigger the effect by updating a dependency
      }
    }
  };
}