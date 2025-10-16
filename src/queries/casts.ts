import { OwnedCollectibles, OwnedCollectiblesResponse } from "@/types/collectible-status";
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
    queryKey: ["ownedCollectibles", address, page, perPage],
    queryFn: async () => {
      const response = await fetch(
        `/api/collectibles/owned/${address}?page=${page}&perPage=${perPage}`
      );
      if (!response.ok) throw new Error("Network response was not ok");
      return response.json();
    },
  });
}
