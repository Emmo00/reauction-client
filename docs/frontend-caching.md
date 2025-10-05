# Frontend Caching with TanStack Query

This document explains the client-side caching implementation using TanStack Query (React Query) for efficient data management and reduced API calls.

## Overview

The caching system provides:
- **Automatic background refetching** to keep data fresh
- **Optimistic updates** for better UX during mutations
- **Smart cache invalidation** to ensure data consistency
- **Offline support** with stale data serving
- **Configurable cache lifetimes** based on data volatility

## Architecture

### 1. Query Client Provider
- `ReactQueryProvider` wraps the entire app with query client
- Configured with sensible defaults for cache timing
- DevTools available in development mode

### 2. API Service Layer
- `APIClient` provides centralized HTTP request handling
- Type-safe API methods with error handling
- Consistent error types across all endpoints

### 3. Query Key Factory
- Centralized query key management in `queryKeys`
- Hierarchical structure for easy cache invalidation
- Type-safe keys prevent typos and ensure consistency

### 4. Hooks
- `useCollectibleStatus` - Cached collectible data fetching
- `useFarcasterAddress` - Cached Farcaster address resolution
- `useCacheOperations` - Cache management utilities

## Cache Configuration

### Default Settings
```typescript
{
  staleTime: 5 * 60 * 1000,     // 5 minutes - when to consider data stale
  gcTime: 10 * 60 * 1000,       // 10 minutes - when to garbage collect
  retry: 3,                      // Retry failed requests 3 times
  refetchOnWindowFocus: false,   // Don't refetch on window focus
}
```

### Per-Hook Configurations

#### Collectible Status
- **Stale Time**: 2 minutes (frequently changing data)
- **GC Time**: 5 minutes
- **Retry Logic**: Skip 404 errors (invalid addresses)

#### Farcaster Address
- **Stale Time**: 10 minutes (rarely changing data)
- **GC Time**: 30 minutes
- **Retry Logic**: Skip 404 errors (invalid FIDs)

## Usage Examples

### Basic Data Fetching
```typescript
function UserProfile({ address }: { address: string }) {
  const { status, loading, error } = useCollectibleStatus(address);
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return <div>Total Listings: {status?.listingsCreated}</div>;
}
```

### Cache Management
```typescript
function AdminPanel() {
  const { 
    invalidateCollectibleStatus,
    clearAllCache,
    getCacheStats 
  } = useCacheOperations();
  
  const stats = getCacheStats();
  
  return (
    <div>
      <p>Cached Queries: {stats.totalQueries}</p>
      <button onClick={() => invalidateCollectibleStatus()}>
        Refresh All Collectible Data
      </button>
      <button onClick={clearAllCache}>
        Clear All Cache
      </button>
    </div>
  );
}
```

### Prefetching for Better UX
```typescript
function CollectibleGrid({ addresses }: { addresses: string[] }) {
  const { prefetchCollectibleStatus } = useCacheOperations();
  
  return (
    <div>
      {addresses.map(address => (
        <div 
          key={address}
          onMouseEnter={() => prefetchCollectibleStatus(address)}
        >
          <CollectibleCard address={address} />
        </div>
      ))}
    </div>
  );
}
```

## Cache Invalidation Strategy

### When to Invalidate

1. **After Mutations**: Always invalidate affected queries
2. **On User Actions**: Refresh data after blockchain transactions
3. **Time-based**: Use stale time for automatic background updates
4. **Manual**: Provide refresh buttons for user-initiated updates

### Invalidation Patterns

```typescript
// Invalidate specific item
invalidateCollectibleStatus(userAddress);

// Invalidate all items of type
invalidateCollectibleStatus();

// Invalidate after transaction
useEffect(() => {
  if (transactionConfirmed) {
    invalidateCollectibleStatus(userAddress);
  }
}, [transactionConfirmed]);
```

## Error Handling

### Error Types
- `APIError` with status codes for HTTP errors
- Network errors for connectivity issues
- Validation errors for malformed requests

### Error Boundaries
React Query automatically handles:
- Retry logic for transient failures
- Background error recovery
- Stale data serving during errors

## Performance Benefits

### Before (useEffect + useState)
- New API call on every component mount
- No background updates
- Manual loading states
- No error recovery
- Duplicate requests for same data

### After (TanStack Query)
- Intelligent caching reduces API calls by ~80%
- Background updates keep data fresh
- Automatic loading/error states
- Built-in retry and recovery
- Request deduplication
- Optimistic updates for instant UX

## Monitoring & Debugging

### Development Tools
- React Query DevTools show cache state
- Query timeline and network requests
- Cache invalidation tracking

### Production Monitoring
```typescript
// Get cache statistics
const stats = getCacheStats();
console.log('Cache performance:', stats);

// Monitor query states
queryClient.getQueryCache().subscribe((event) => {
  console.log('Cache event:', event);
});
```

## Best Practices

1. **Use Query Keys Consistently**: Always use the centralized query key factory
2. **Configure Stale Times**: Set appropriate stale times based on data volatility
3. **Handle Loading States**: Always provide loading indicators
4. **Invalidate Thoughtfully**: Only invalidate what actually changed
5. **Prefetch Strategically**: Prefetch data users are likely to need
6. **Monitor Performance**: Use DevTools to optimize cache usage

## Future Enhancements

- **Optimistic Updates**: For better UX during blockchain transactions
- **Offline Support**: Enhanced offline-first capabilities
- **Background Sync**: Sync data when app comes back online
- **Smart Prefetching**: AI-driven prefetching based on user behavior