import React from 'react';
import { useOwnedCollectibles } from '@/hooks/useOwnedCollectibles';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Loader2, ChevronLeft, ChevronRight, RefreshCw, Trash2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface OwnedCollectiblesListProps {
  address: string;
}

export function OwnedCollectiblesList({ address }: OwnedCollectiblesListProps) {
  const { 
    data, 
    loading, 
    error, 
    refetch, 
    clearCache,
    nextPage,
    previousPage,
    goToPage,
    currentPage,
    setPerPage
  } = useOwnedCollectibles(address);

  const handleClearCache = async () => {
    try {
      await clearCache();
    } catch (error) {
      console.error('Failed to clear cache:', error);
    }
  };

  const renderPagination = () => {
    if (!data?.pagination || data.pagination.totalPages <= 1) return null;

    const { pagination } = data;
    const pages = [];
    
    // Show up to 5 page numbers around current page
    const startPage = Math.max(1, pagination.page - 2);
    const endPage = Math.min(pagination.totalPages, pagination.page + 2);

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <Button
          key={i}
          variant={i === pagination.page ? "default" : "outline"}
          size="sm"
          onClick={() => goToPage(i)}
          disabled={loading}
        >
          {i}
        </Button>
      );
    }

    return (
      <div className="flex items-center justify-between mt-4">
        <div className="text-sm text-muted-foreground">
          Showing {((pagination.page - 1) * pagination.perPage) + 1} to{' '}
          {Math.min(pagination.page * pagination.perPage, pagination.totalItems)} of{' '}
          {pagination.totalItems} collectibles
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={previousPage}
            disabled={!pagination.hasPreviousPage || loading}
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </Button>
          
          <div className="flex gap-1">
            {pages}
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={nextPage}
            disabled={!pagination.hasNextPage || loading}
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Owned Collectibles</CardTitle>
          <div className="flex items-center gap-2">
            <Select
              value={data?.pagination?.perPage.toString() || "12"}
              onValueChange={(value) => setPerPage(parseInt(value))}
              disabled={loading}
            >
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="6">6</SelectItem>
                <SelectItem value="12">12</SelectItem>
                <SelectItem value="24">24</SelectItem>
                <SelectItem value="48">48</SelectItem>
              </SelectContent>
            </Select>
            
            <Button
              variant="outline"
              size="sm"
              onClick={refetch}
              disabled={loading}
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearCache}
              disabled={loading}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {loading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin mr-2" />
            Loading owned collectibles...
          </div>
        )}

        {error && (
          <div className="text-red-500 p-4 bg-red-50 rounded-md">
            <strong>Error:</strong> {error}
          </div>
        )}

        {data && !loading && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-medium">Address:</span>
              <Badge variant="outline" className="font-mono text-xs">
                {data.address}
              </Badge>
              {data.cached && (
                <Badge variant="secondary">Cached</Badge>
              )}
              <span className="text-sm text-muted-foreground">
                Page {data.pagination?.page || 1} of {data.pagination?.totalPages || 1}
              </span>
            </div>

            {data.tokenIds.length > 0 ? (
              <div>
                <h4 className="font-medium mb-3">
                  Token IDs ({data.pagination?.totalItems || data.count} total, showing {data.count})
                </h4>
                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-12 gap-2">
                  {data.tokenIds.map((tokenId) => (
                    <Badge key={tokenId} variant="outline" className="text-center justify-center">
                      {tokenId}
                    </Badge>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-gray-500 italic py-8 text-center">
                No collectibles found on this page
              </div>
            )}

            {data.collectibleContract && (
              <div className="text-xs text-gray-500 space-y-1 pt-4 border-t">
                <div>Collectible Contract: <span className="font-mono">{data.collectibleContract}</span></div>
                {data.queryTime && (
                  <div>Query Time: {new Date(data.queryTime).toLocaleString()}</div>
                )}
              </div>
            )}

            {renderPagination()}
          </div>
        )}
      </CardContent>
    </Card>
  );
}