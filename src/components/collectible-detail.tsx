"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import { Clock, TrendingUp } from "lucide-react"
import { BidList } from "@/components/bid-list"
import { PlaceBidButton } from "@/components/place-bid-button"

interface CollectibleDetailProps {
  id: string
}

// Mock data
const collectibleData = {
  id: "1",
  image: "/abstract-nft-purple.png",
  title: "#102 Cast Collectible – GM Post",
  creator: "@vitalik",
  creatorAvatar: "/placeholder.svg?height=40&width=40",
  currentBid: "28.14",
  timeLeft: "2h 4m 32s",
  type: "auction" as const,
  description:
    "A rare collectible from an iconic GM post on Farcaster. This NFT represents a moment in decentralized social history.",
  metadata: {
    contract: "0x1234...5678",
    tokenId: "102",
    blockchain: "Base",
  },
}

export function CollectibleDetail({ id }: CollectibleDetailProps) {
  const isAuction = collectibleData.type === "auction"

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      {/* Left Column - Image */}
      <div className="space-y-4">
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <div className="relative aspect-square bg-muted">
              <Image
                src={collectibleData.image || "/placeholder.svg"}
                alt={collectibleData.title}
                fill
                className="object-cover"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right Column - Details */}
      <div className="space-y-6">
        {/* Title and Creator */}
        <div>
          <h1 className="mb-2 text-3xl font-bold text-balance">{collectibleData.title}</h1>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Owned by</span>
            <Avatar className="h-6 w-6">
              <AvatarImage src={collectibleData.creatorAvatar || "/placeholder.svg"} />
              <AvatarFallback>V</AvatarFallback>
            </Avatar>
            <span className="font-semibold text-primary">{collectibleData.creator}</span>
          </div>
        </div>

        {/* Auction/Sale Info Card */}
        <Card className="border-primary/20 bg-card/50">
          <CardContent className="p-6">
            {isAuction ? (
              <>
                {/* Auction Info */}
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <div className="text-sm text-muted-foreground">Highest Bid</div>
                    <div className="text-3xl font-bold text-foreground">{collectibleData.currentBid} USDC</div>
                  </div>
                  <Badge variant="secondary" className="gap-1">
                    <TrendingUp className="h-3 w-3" />
                    Live
                  </Badge>
                </div>

                {/* Countdown */}
                <div className="mb-6 flex items-center gap-2 rounded-lg bg-muted/50 p-3">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Ending in {collectibleData.timeLeft}</span>
                </div>

                {/* Place Bid Button */}
                <PlaceBidButton currentBid={collectibleData.currentBid} />
              </>
            ) : (
              <>
                {/* Buy Now Info */}
                <div className="mb-4">
                  <div className="text-sm text-muted-foreground">Fixed Price</div>
                  <div className="text-3xl font-bold text-foreground">{collectibleData.currentBid} USDC</div>
                </div>

                {/* Buy Now Button */}
                <Button size="lg" className="w-full rounded-xl">
                  Buy Now
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="owner">Owner</TabsTrigger>
            <TabsTrigger value="bids">Bids</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4 pt-4">
            <div>
              <h3 className="mb-2 font-semibold">Description</h3>
              <p className="text-pretty text-muted-foreground">{collectibleData.description}</p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold">Metadata</h3>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Contract</span>
                  <span className="font-mono">{collectibleData.metadata.contract}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Token ID</span>
                  <span className="font-mono">{collectibleData.metadata.tokenId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Blockchain</span>
                  <span>{collectibleData.metadata.blockchain}</span>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="owner" className="pt-4">
            <div className="flex items-center gap-4 rounded-lg border border-border p-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src={collectibleData.creatorAvatar || "/placeholder.svg"} />
                <AvatarFallback>V</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="font-semibold">{collectibleData.creator}</div>
                <div className="text-sm text-muted-foreground">24 collectibles owned</div>
              </div>
              <Button variant="outline" size="sm">
                View Profile
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="bids" className="pt-4">
            <BidList />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
