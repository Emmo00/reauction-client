"use client";

import { ChevronLeft, MoreVertical, Clock, Zap, ArrowUpRightIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BottomNav } from "@/components/bottom-nav";
import { useCollectible } from "@/queries/casts";
import { CollectibleImage } from "@/components/collectible-image";
import { useCollectibleOwner } from "@/queries/users";
import { User } from "@neynar/nodejs-sdk/build/api";
import { sdk } from "@farcaster/miniapp-sdk";

export default function CollectiblePage({ params }: { params: any}) {
  const { hash } = params;
  const { data, error } = useCollectible(hash);
  const ownerQuery = useCollectibleOwner(hash);

  // Type guard to check if owner data is valid (not error)
  const hasValidOwnerData = (
    data: any
  ): data is { found_on_farcaster: boolean; address?: string } & Partial<User> => {
    return data && !("error" in data);
  };

  // Type guard specifically for Farcaster users
  const isFarcasterUser = (
    data: any
  ): data is { found_on_farcaster: true; username: string } & User => {
    return hasValidOwnerData(data) && data.found_on_farcaster && "username" in data;
  };

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="relative overflow-hidden rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl p-8 max-w-md w-full">
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-orange-500/10 rounded-3xl" />
          <div className="relative z-10 text-center space-y-4">
            <div className="h-16 w-16 mx-auto rounded-full bg-red-500/20 flex items-center justify-center">
              <svg
                className="h-8 w-8 text-red-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-foreground">Unable to Load Collectible</h3>
            <p className="text-sm text-muted-foreground">
              There was an error loading this collectible. Please try again later.
            </p>
            <Link href="/home">
              <Button
                variant="outline"
                className="mt-4 bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10"
              >
                Go Back Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!data || "error" in data) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="relative overflow-hidden rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl p-8 max-w-md w-full">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-3xl" />
          <div className="relative z-10 text-center space-y-6">
            <div className="h-16 w-16 mx-auto rounded-full bg-blue-500/20 flex items-center justify-center">
              <div className="animate-spin h-8 w-8 border-2 border-blue-400 border-t-transparent rounded-full" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-foreground">Loading Collectible</h3>
              <p className="text-sm text-muted-foreground">Fetching collectible data...</p>
            </div>
            <div className="flex justify-center">
              <div className="flex space-x-1">
                <div
                  className="h-2 w-2 bg-blue-400/60 rounded-full animate-pulse"
                  style={{ animationDelay: "0ms" }}
                />
                <div
                  className="h-2 w-2 bg-blue-400/60 rounded-full animate-pulse"
                  style={{ animationDelay: "150ms" }}
                />
                <div
                  className="h-2 w-2 bg-blue-400/60 rounded-full animate-pulse"
                  style={{ animationDelay: "300ms" }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-background pb-32">
        <div className="flex items-center justify-between px-4 py-4">
          <Link href="/home">
            <button className="flex h-10 w-10 items-center justify-center rounded-full bg-card">
              <ChevronLeft className="h-5 w-5" />
            </button>
          </Link>
          <h1 className="text-base font-semibold">
            #{BigInt(hash).toString().substring(0, 6)} by {data.cast.author.display_name}
          </h1>
          <button className="flex h-10 w-10 items-center justify-center rounded-full bg-card"></button>
        </div>

        <div className="px-4 space-y-4">
          <CollectibleImage cast={data} size={340} className="mx-auto" />

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-card p-4">
              <div className="mb-1 flex items-center gap-2 text-muted-foreground">
                <Zap className="h-4 w-4" />
                <span className="text-xs">Highest Bid</span>
              </div>
              <p className="text-lg font-bold text-foreground">28.14 USDC</p>
            </div>
            <div className="rounded-2xl bg-card p-4">
              <div className="mb-1 flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span className="text-xs">Ending in</span>
              </div>
              <p className="text-lg font-bold text-foreground">2h 4m 32s</p>
            </div>
          </div>

          <Tabs defaultValue="details" className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-card">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="bids">Bids</TabsTrigger>
              <TabsTrigger value="owner">Owner</TabsTrigger>
            </TabsList>
            <TabsContent value="details" className="mt-4">
              <div className="rounded-2xl bg-card p-4">
                <h3 className="mb-2 font-semibold text-foreground">Content</h3>
                <p className="text-sm text-muted-foreground">
                  {data.cast.text || "No description provided."}
                </p>
                <p className="mt-4 text-sm text-muted-foreground">
                  Created on {new Date(parseInt(data.cast.timestamp) * 1000).toLocaleDateString()}{" "}
                  at {new Date(parseInt(data.cast.timestamp) * 1000).toLocaleTimeString()}.
                </p>
                <p
                  className="mt-4 text-sm text-muted-foreground cursor-pointer hover:text-primary transition-colors"
                  onClick={() => {
                    sdk.actions.viewCast({
                      hash,
                    });
                  }}
                >
                  view cast <ArrowUpRightIcon className="inline-block h-4 w-4 mb-1" />
                </p>
              </div>
            </TabsContent>
            <TabsContent value="owner" className="mt-4">
              <div className="rounded-2xl bg-card p-4">
                {hasValidOwnerData(ownerQuery.data) ? (
                  ownerQuery.data.found_on_farcaster ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-16 w-16">
                          <AvatarImage src={ownerQuery.data.pfp_url} alt="Owner avatar" />
                          <AvatarFallback>
                            {ownerQuery.data.display_name?.substring(0, 2).toUpperCase() || "??"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <h4 className="font-semibold text-foreground">
                            {ownerQuery.data.display_name || ownerQuery.data.username}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            @{ownerQuery.data.username}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            FID: {ownerQuery.data.fid}
                          </p>
                        </div>
                      </div>
                      {ownerQuery.data.profile?.bio?.text && (
                        <div>
                          <h5 className="text-sm font-medium text-foreground mb-1">Bio</h5>
                          <p className="text-sm text-muted-foreground">
                            {ownerQuery.data.profile.bio.text}
                          </p>
                        </div>
                      )}
                      <div className="flex gap-4 text-sm">
                        <span className="text-muted-foreground">
                          <span className="font-medium text-foreground">
                            {ownerQuery.data.follower_count}
                          </span>{" "}
                          followers
                        </span>
                        <span className="text-muted-foreground">
                          <span className="font-medium text-foreground">
                            {ownerQuery.data.following_count}
                          </span>{" "}
                          following
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          if (isFarcasterUser(ownerQuery.data)) {
                            sdk.actions.viewProfile({
                              fid: ownerQuery.data.fid,
                            });
                          }
                        }}
                        className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                      >
                        View on Farcaster
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="text-center">
                        <div className="h-16 w-16 mx-auto rounded-full bg-muted flex items-center justify-center mb-3">
                          <span className="text-lg font-mono">
                            {ownerQuery.data.address?.substring(2, 4).toUpperCase() || "??"}
                          </span>
                        </div>
                        <h4 className="font-semibold text-foreground mb-1">Wallet Owner</h4>
                        <p className="text-sm text-muted-foreground">Not found on Farcaster</p>
                      </div>
                      {ownerQuery.data.address && (
                        <>
                          <div className="bg-muted/50 rounded-lg p-3">
                            <p className="text-xs text-muted-foreground mb-1">Ethereum Address</p>
                            <p className="text-sm font-mono text-foreground break-all">
                              {ownerQuery.data.address}
                            </p>
                          </div>
                          <a
                            href={`https://etherscan.io/address/${ownerQuery.data.address}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors text-center block"
                          >
                            View on Etherscan
                          </a>
                        </>
                      )}
                    </div>
                  )
                ) : ownerQuery.isLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4" />
                    <p className="text-sm text-muted-foreground">Loading owner information...</p>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-sm text-muted-foreground">
                      Unable to load owner information.
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>
            <TabsContent value="bids" className="mt-4">
              <div className="rounded-2xl bg-card p-4">
                <p className="text-sm text-muted-foreground">Bid history will be displayed here.</p>
              </div>
            </TabsContent>
          </Tabs>

          <Button size="lg" className="h-14 w-full rounded-full text-base font-semibold">
            Place Bid
            <span className="ml-2">→</span>
          </Button>
        </div>
      </div>
      <BottomNav />
    </>
  );
}
