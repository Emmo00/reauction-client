"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Share2, MoreVertical } from "lucide-react"
import { CollectibleCard } from "@/components/collectible-card"
import { ActivityList } from "@/components/activity-list"

interface UserProfileProps {
  username: string
}

// Mock data
const profileData = {
  username: "@vitalik",
  avatar: "/placeholder.svg?height=120&width=120",
  bio: "Ethereum co-founder. Building the future of decentralized systems.",
  stats: {
    collected: 156,
    selling: 12,
    totalVolume: "12,450.00",
  },
}

const collectedItems = [
  {
    id: 1,
    image: "/abstract-nft-purple.png",
    title: "#102 Cast Collectible",
    creator: "@dwr",
    price: "28.04",
    type: "auction" as const,
  },
  {
    id: 2,
    image: "/digital-art-collectible-blue.jpg",
    title: "#245 GM Post",
    creator: "@jessepollak",
    price: "45.50",
    type: "buy-now" as const,
  },
  {
    id: 3,
    image: "/nft-collectible-green.jpg",
    title: "#089 Rare Cast",
    creator: "@balajis",
    price: "32.00",
    type: "auction" as const,
  },
  {
    id: 4,
    image: "/crypto-art-orange.jpg",
    title: "#512 Epic Moment",
    creator: "@naval",
    price: "67.25",
    type: "buy-now" as const,
  },
]

const sellingItems = [
  {
    id: 5,
    image: "/digital-collectible-pink.jpg",
    title: "#334 Special Cast",
    creator: "@vitalik",
    price: "19.99",
    type: "auction" as const,
  },
  {
    id: 6,
    image: "/nft-art-yellow.jpg",
    title: "#678 Golden Post",
    creator: "@vitalik",
    price: "55.00",
    type: "buy-now" as const,
  },
]

export function UserProfile({ username }: UserProfileProps) {
  return (
    <div className="space-y-8">
      {/* Profile Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col items-center gap-6 md:flex-row">
            {/* Avatar */}
            <Avatar className="h-24 w-24 md:h-32 md:w-32">
              <AvatarImage src={profileData.avatar || "/placeholder.svg"} />
              <AvatarFallback className="text-2xl">V</AvatarFallback>
            </Avatar>

            {/* Info */}
            <div className="flex-1 text-center md:text-left">
              <div className="mb-2 flex items-center justify-center gap-2 md:justify-start">
                <h1 className="text-2xl font-bold">{profileData.username}</h1>
                <Badge variant="secondary">Verified</Badge>
              </div>
              <p className="mb-4 text-pretty text-muted-foreground">{profileData.bio}</p>

              {/* Stats */}
              <div className="flex flex-wrap justify-center gap-6 md:justify-start">
                <div>
                  <div className="text-2xl font-bold text-primary">{profileData.stats.collected}</div>
                  <div className="text-sm text-muted-foreground">Collected</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary">{profileData.stats.selling}</div>
                  <div className="text-sm text-muted-foreground">Selling</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary">{profileData.stats.totalVolume}</div>
                  <div className="text-sm text-muted-foreground">USDC Volume</div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button variant="outline" size="icon">
                <Share2 className="h-5 w-5" />
              </Button>
              <Button variant="outline" size="icon">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="collected" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="collected">Collected</TabsTrigger>
          <TabsTrigger value="selling">Selling</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="collected" className="pt-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {collectedItems.map((item) => (
              <CollectibleCard key={item.id} {...item} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="selling" className="pt-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {sellingItems.map((item) => (
              <CollectibleCard key={item.id} {...item} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="activity" className="pt-6">
          <ActivityList />
        </TabsContent>
      </Tabs>
    </div>
  )
}
