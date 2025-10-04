import { ChevronLeft, MoreVertical, Clock, Zap } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BottomNav } from "@/components/bottom-nav"

export default function CollectiblePage() {
  return (
    <>
      <div className="min-h-screen bg-background pb-32">
        <div className="flex items-center justify-between px-4 py-4">
          <Link href="/home">
            <button className="flex h-10 w-10 items-center justify-center rounded-full bg-card">
              <ChevronLeft className="h-5 w-5" />
            </button>
          </Link>
          <h1 className="text-base font-semibold">#102 EVOL Chux</h1>
          <button className="flex h-10 w-10 items-center justify-center rounded-full bg-card">
          </button>
        </div>

        <div className="px-4 space-y-4">
          <div className="relative aspect-square overflow-hidden rounded-3xl bg-gradient-to-br from-yellow-400 to-yellow-500">
            <img
              src="/chucky-doll-with-halo-nft-collectible.jpg"
              alt="NFT Collectible"
              className="h-full w-full object-cover"
            />
          </div>

          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12 border-2 border-primary">
              <AvatarImage src="/placeholder.svg?height=48&width=48" />
              <AvatarFallback>DE</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground">D'EVOLs</p>
              <p className="text-xs text-muted-foreground">Owned by Zizzler</p>
            </div>
          </div>

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
              <TabsTrigger value="owners">Owner</TabsTrigger>
              <TabsTrigger value="bids">Bids</TabsTrigger>
            </TabsList>
            <TabsContent value="details" className="mt-4">
              <div className="rounded-2xl bg-card p-4">
                <h3 className="mb-2 font-semibold text-foreground">Description</h3>
                <p className="text-sm text-muted-foreground">
                  A unique digital collectible featuring the iconic character with a halo. Part of the exclusive EVOL
                  collection, this NFT represents a rare piece of digital art.
                </p>
              </div>
            </TabsContent>
            <TabsContent value="owner" className="mt-4">
              <div className="rounded-2xl bg-card p-4">
                <p className="text-sm text-muted-foreground">Owner information will be displayed here.</p>
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
  )
}
