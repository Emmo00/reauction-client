import { useState, useEffect, useCallback } from 'react';
import { OwnedCollectibles } from '@/types/collectible-status';

interface UseOwnedCollectiblesParams {
  page?: number;
  perPage?: number;
}

interface UseOwnedCollectiblesReturn {
  data: OwnedCollectibles | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  clearCache: () => Promise<void>;
  nextPage: () => void;
  previousPage: () => void;
  goToPage: (page: number) => void;
  currentPage: number;
  setPerPage: (perPage: number) => void;
}

export function useOwnedCollectibles(
  address: string, 
  params: UseOwnedCollectiblesParams = {}
): UseOwnedCollectiblesReturn {
  const [data, setData] = useState<OwnedCollectibles | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(params.page || 1);
  const [perPage, setPerPageState] = useState(params.perPage || 12);

  const fetchOwnedCollectibles = useCallback(async (page: number = currentPage, itemsPerPage: number = perPage) => {
    if (!address) return;

    setLoading(true);
    setError(null);

    try {
      const url = new URL(`/api/collectibles/owned/${address}`, window.location.origin);
      url.searchParams.set('page', page.toString());
      url.searchParams.set('perPage', itemsPerPage.toString());

      const response = await fetch(url.toString());
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || `HTTP error! status: ${response.status}`);
      }

      if (result.success) {
        setData(result.data);
      } else {
        throw new Error(result.error || 'Failed to fetch owned collectibles');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      console.error('Error fetching owned collectibles:', err);
    } finally {
      setLoading(false);
    }
  }, [address, currentPage, perPage]);

  const clearCache = useCallback(async () => {
    if (!address) return;

    try {
      const response = await fetch(`/api/collectibles/owned/${address}/cache`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to clear cache');
      }

      console.log('Cache cleared successfully');
      // Refetch data after clearing cache
      await fetchOwnedCollectibles();
    } catch (err) {
      console.error('Error clearing cache:', err);
      throw err;
    }
  }, [address, fetchOwnedCollectibles]);

  const refetch = useCallback(async () => {
    await fetchOwnedCollectibles();
  }, [fetchOwnedCollectibles]);

  const nextPage = useCallback(() => {
    if (data?.pagination?.hasNextPage) {
      const newPage = currentPage + 1;
      setCurrentPage(newPage);
      fetchOwnedCollectibles(newPage, perPage);
    }
  }, [data?.pagination?.hasNextPage, currentPage, perPage, fetchOwnedCollectibles]);

  const previousPage = useCallback(() => {
    if (data?.pagination?.hasPreviousPage) {
      const newPage = currentPage - 1;
      setCurrentPage(newPage);
      fetchOwnedCollectibles(newPage, perPage);
    }
  }, [data?.pagination?.hasPreviousPage, currentPage, perPage, fetchOwnedCollectibles]);

  const goToPage = useCallback((page: number) => {
    if (page >= 1 && page <= (data?.pagination?.totalPages || 1)) {
      setCurrentPage(page);
      fetchOwnedCollectibles(page, perPage);
    }
  }, [data?.pagination?.totalPages, perPage, fetchOwnedCollectibles]);

  const setPerPage = useCallback((newPerPage: number) => {
    setPerPageState(newPerPage);
    setCurrentPage(1); // Reset to first page when changing per page
    fetchOwnedCollectibles(1, newPerPage);
  }, [fetchOwnedCollectibles]);

  useEffect(() => {
    if (address) {
      fetchOwnedCollectibles();
    }
  }, [address]); // Only trigger on address change, not on other dependencies

  return {
    data,
    loading,
    error,
    refetch,
    clearCache,
    nextPage,
    previousPage,
    goToPage,
    currentPage,
    setPerPage,
  };
}