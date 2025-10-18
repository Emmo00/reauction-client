import { BulkUsersByAddressResponse, User } from "@neynar/nodejs-sdk/build/api";
import { useQuery } from "@tanstack/react-query";

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
