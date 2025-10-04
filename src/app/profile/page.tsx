import { ChevronLeft, MoreVertical } from "lucide-react"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { BottomNav } from "@/components/bottom-nav"

const collectibles = [
  { id: 1, image: "/abstract-nft-purple.png", name: "Purple Abstract", price: "12.5" },
  { id: 2, image: "/digital-art-collectible-blue.jpg", name: "Blue Digital", price: "8.2" },
  { id: 3, image: "/nft-collectible-green.jpg", name: "Green NFT", price: "15.8" },
  { id: 4, image: "/crypto-art-orange.jpg", name: "Orange Crypto", price: "22.1" },
]

export default function ProfilePage() {
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
              <AvatarImage src="/placeholder.svg?height=96&width=96" />
              <AvatarFallback>HP</AvatarFallback>
            </Avatar>
            <h2 className="text-xl font-bold text-foreground">Halo Pamaddog</h2>
            <p className="text-sm text-muted-foreground mb-4">@halopamaddog</p>
            <p className="text-sm text-muted-foreground max-w-xs mb-4">
              Digital artist and NFT collector. Creating unique pieces for the metaverse.
            </p>

            <div className="grid grid-cols-3 gap-6 w-full max-w-sm mb-4">
              <div>
                <p className="text-2xl font-bold text-foreground">142</p>
                <p className="text-xs text-muted-foreground">Collected</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">28</p>
                <p className="text-xs text-muted-foreground">Selling</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">1.2K</p>
                <p className="text-xs text-muted-foreground">Followers</p>
              </div>
            </div>
          </div>

          <Tabs defaultValue="collected" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-card">
              <TabsTrigger value="collected">Collected</TabsTrigger>
              <TabsTrigger value="selling">Selling</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
            </TabsList>
            <TabsContent value="collected" className="mt-4">
              <div className="grid grid-cols-2 gap-3">
                {collectibles.map((item) => (
                  <Link key={item.id} href={`/collectible/${item.id}`}>
                    <div className="overflow-hidden rounded-2xl bg-card">
                      <div className="aspect-square overflow-hidden">
                        <img
                          src={item.image || "/placeholder.svg"}
                          alt={item.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="p-3">
                        <p className="text-sm font-semibold text-foreground">{item.name}</p>
                        <p className="text-xs text-muted-foreground">{item.price} USDC</p>
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
  )
}
