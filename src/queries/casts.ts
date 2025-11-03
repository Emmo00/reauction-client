import { CollectiblesAPI, collectibleStatusQueryKeys } from "@/lib/api/collectibles";
import { OwnedCollectiblesResponse } from "@/types";
import { CastResponse } from "@neynar/nodejs-sdk/build/api";
import { useQuery } from "@tanstack/react-query";

export function useOwnedCollectibles({
  address,
  page,
  perPage,
}: {
  address: string | null;
  page?: number;
  perPage?: number;
}) {
  return useQuery<OwnedCollectiblesResponse>({
    enabled: !!address,
    queryKey: collectibleStatusQueryKeys.owned(address!, page!, perPage!),  
    queryFn: async () => {
      return CollectiblesAPI.getCollectiblesOwnedByAddress(address!, page, perPage);
    },
  });
}

export function useCollectible(hash: string | null) {
  return useQuery<CastResponse | { error: string }>({
    enabled: !!hash,
    queryKey: ["collectible", hash],
    queryFn: async () => {
      const response = await fetch(`/api/collectibles/${hash}`);
      if (!response.ok) throw new Error("Network response was not ok");
      return response.json();
    },
  });
}
