"use client";

import { ChevronLeft, MoreVertical } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BottomNav } from "@/components/bottom-nav";
import { useState, useEffect } from "react";
import sdk from "@farcaster/miniapp-sdk";
import { MiniAppContext } from "@farcaster/miniapp-core/dist/context";
import { useFarcasterAddress } from "@/queries/farcaster";
import { useCollectibleStatus } from "@/queries/collectibles";
import { useOwnedCollectibles } from "@/queries/casts";
import { CastResponse } from "@neynar/nodejs-sdk/build/api";
import { CollectibleImage } from "@/components/collectible-image";
import { useAccount, useConnect } from "wagmi";
import { farcasterFrame } from "@farcaster/miniapp-wagmi-connector";

export default function ProfilePage() {
  const [context, setContext] = useState<MiniAppContext | null>(null);
  const [collectibles, setCollectibles] = useState<CastResponse[]>([]);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(12);

  const { address: userAddressData, isConnected } = useAccount();
  const { connect, connectors } = useConnect();

  // Auto-connect to Farcaster wallet
  useEffect(() => {
    if (!isConnected) {
      connect({ connector: farcasterFrame() });
    }
  }, [isConnected, connect]);

  // Get the collectible status using the wallet address
  const {
    status,
    loading: statusLoading,
    error: statusError,
  } = useCollectibleStatus(userAddressData || undefined);
  const {
    data: collectiblesData,
    isLoading: collectiblesLoading,
    error: collectiblesError,
  } = useOwnedCollectibles({ address: userAddressData ?? null, page, perPage });

  useEffect(() => {
    async function waitForContext() {
      setContext(await sdk.context);
    }
    waitForContext();
  }, []);

  useEffect(() => {
    if (collectiblesData && "data" in collectiblesData) {
      // Reset collectibles when new data comes in (for profile page, we want to show current page data)
      setCollectibles(collectiblesData.data.map((collectible) => collectible.cast) || []);
    }
  }, [collectiblesData]);

  const isLoading = statusLoading || collectiblesLoading;
  const hasError = statusError || collectiblesError;
  return (
    <>
      <div className="min-h-screen bg-background pb-32">
        <div className="flex items-center justify-between px-4 py-4">
          <Link href="/home">
            <button className="flex h-10 w-10 items-center justify-center rounded-full bg-card">
              <ChevronLeft className="h-5 w-5" />
            </button>
          </Link>
          <h1 className="text-base font-semibold">Profile</h1>
          <button className="flex h-10 w-10 items-center justify-center rounded-full bg-card">
            {/* <MoreVertical className="h-5 w-5" /> */}
          </button>
        </div>

        <div className="px-4 space-y-6">
          <div className="flex flex-col items-center text-center">
            <Avatar className="h-24 w-24 border-4 border-primary mb-4">
              <AvatarImage src={context?.user?.pfpUrl} />
              <AvatarFallback>{context?.user?.username?.charAt(0) ?? "U"}</AvatarFallback>
            </Avatar>
            <h2 className="text-xl font-bold text-foreground">{context?.user?.displayName}</h2>
            <p className="text-sm text-muted-foreground mb-4">@{context?.user?.username}</p>

            <div className="grid grid-cols-4 gap-2 w-full max-w-sm mb-4">
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {isLoading ? "..." : hasError ? "?" : status?.castsOwned ?? 0}
                </p>
                <p className="text-xs text-muted-foreground">Collection</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {isLoading ? "..." : hasError ? "?" : status?.castsBeingSold ?? 0}
                </p>
                <p className="text-xs text-muted-foreground">Selling</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {isLoading ? "..." : hasError ? "?" : status?.castsSold ?? 0}
                </p>
                <p className="text-xs text-muted-foreground">Sold</p>
              </div>
            </div>

            {/* Debug info - remove in production */}
            {statusError && (
              <div className="text-xs text-red-500 mt-2 p-2 bg-red-50 rounded">
                {statusError && <div>Status Error: {statusError}</div>}
                {userAddressData && <div>Address: {userAddressData}</div>}
              </div>
            )}
          </div>

          <Tabs defaultValue="collection" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-card">
              <TabsTrigger value="collection">Collection</TabsTrigger>
              <TabsTrigger value="selling">Selling</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
            </TabsList>
            <TabsContent value="collection" className="mt-4">
              <div className="grid grid-cols-2 gap-3">
                {collectibles.map((item) => (
                  <Link key={item.cast.hash} href={`/collectible/${item.cast.hash}`}>
                    <div className="overflow-hidden rounded-2xl bg-card">
                      <CollectibleImage cast={item} size={167} />
                      <div className="p-3">
                        <p className="text-sm font-semibold text-foreground">
                          #{BigInt(item.cast.hash).toString().substring(0, 6)} by{" "}
                          {item.cast.author.display_name}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </TabsContent>
            <TabsContent value="selling" className="mt-4">
              <div className="rounded-2xl bg-card p-8 text-center">
                <p className="text-sm text-muted-foreground">No items currently for sale</p>
              </div>
            </TabsContent>
            <TabsContent value="activity" className="mt-4">
              <div className="rounded-2xl bg-card p-8 text-center">
                <p className="text-sm text-muted-foreground">No recent activity</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <BottomNav />
    </>
  );
}
