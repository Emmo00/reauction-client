import { useState, useEffect } from 'react';

interface FarcasterAddressResult {
  fid: number;
  address: string;
  source: 'farcaster_primary' | 'neynar_verified' | 'neynar_custody';
}

export function useFarcasterAddress(fid?: number) {
  const [address, setAddress] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<string | null>(null);

  useEffect(() => {
    if (!fid) {
      setAddress(null);
      setError(null);
      setSource(null);
      return;
    }

    const fetchAddress = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`/api/farcaster-address/${fid}`);
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch wallet address');
        }
        
        setAddress(data.address);
        setSource(data.source);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
        setAddress(null);
        setSource(null);
      } finally {
        setLoading(false);
      }
    };

    fetchAddress();
  }, [fid]);

  return {
    address,
    loading,
    error,
    source,
  };
}