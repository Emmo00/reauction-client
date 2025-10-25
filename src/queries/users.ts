import { BulkUsersByAddressResponse, User } from "@neynar/nodejs-sdk/build/api";
import { useQuery } from "@tanstack/react-query";
import { FarcasterAddressAPI } from "@/lib/api/farcaster-address";
import { queryKeys } from "@/lib/api/client";

export function useCollectibleOwner(hash: string) {
  return useQuery<({ found_on_farcaster: boolean; address?: string } & Partial<User>) | { error: string }>({
    enabled: !!hash,
    queryKey: ["collectibleOwner", hash],
    queryFn: async () => {
      const response = await fetch(`/api/collectibles/${hash}/owner`);
      if (!response.ok) throw new Error("Network response was not ok");
      return response.json();
    },
  });
}

export function useFarcasterUserByAddress(address: string) {
  return useQuery<({ found_on_farcaster: boolean; address?: string } & Partial<User>) | { error: string }>({
    enabled: !!address,
    queryKey: queryKeys.farcasterAddress.userByAddress(address),
    queryFn: () => FarcasterAddressAPI.getFarcasterUserByAddress(address),
    staleTime: 1000 * 60 * 5, // 5 minutes - user data doesn't change frequently
    gcTime: 1000 * 60 * 30, // 30 minutes - keep in cache longer
  });
}
