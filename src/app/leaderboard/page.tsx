import { ChevronLeft, SlidersHorizontal } from "lucide-react"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { BottomNav } from "@/components/bottom-nav"

const topSellers = [
  { rank: 1, name: "D'EVOLs", amount: "28.24", avatar: "/placeholder.svg?height=48&width=48", following: true },
  { rank: 2, name: "Hedgies", amount: "28.12", avatar: "/placeholder.svg?height=48&width=48", following: false },
  { rank: 3, name: "Mutan Cats", amount: "27.94", avatar: "/placeholder.svg?height=48&width=48", following: false },
  { rank: 4, name: "Prime Ape", amount: "27.04", avatar: "/placeholder.svg?height=48&width=48", following: true },
  { rank: 5, name: "CloneX", amount: "26.05", avatar: "/placeholder.svg?height=48&width=48", following: true },
  { rank: 6, name: "Rebels", amount: "26.02", avatar: "/placeholder.svg?height=48&width=48", following: false },
  {
    rank: 7,
    name: "Gorilla Por Club",
    amount: "20.24",
    avatar: "/placeholder.svg?height=48&width=48",
    following: false,
  },
  { rank: 8, name: "Designer Bear", amount: "20.01", avatar: "/placeholder.svg?height=48&width=48", following: true },
  {
    rank: 9,
    name: "Wet Potato Brain",
    amount: "25.79",
    avatar: "/placeholder.svg?height=48&width=48",
    following: false,
  },
]

export default function LeaderboardPage() {
  return (
    <>
      <div className="min-h-screen bg-background pb-32">
        <div className="flex items-center justify-between px-4 py-4">
          <Link href="/home">
            <button className="flex h-10 w-10 items-center justify-center rounded-full bg-card">
              <ChevronLeft className="h-5 w-5" />
            </button>
          </Link>
          <h1 className="text-base font-semibold">Top Sellers</h1>
          <button className="flex h-10 w-10 items-center justify-center rounded-full bg-card">
            <SlidersHorizontal className="h-5 w-5" />
          </button>
        </div>

        <div className="px-4 space-y-3">
          {topSellers.map((seller) => (
            <div key={seller.rank} className="flex items-center gap-4 rounded-2xl bg-card p-4">
              <span className="text-lg font-bold text-muted-foreground w-6">{seller.rank}</span>
              <Avatar className="h-12 w-12 border-2 border-primary">
                <AvatarImage src={seller.avatar || "/placeholder.svg"} />
                <AvatarFallback>{seller.name[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">{seller.name}</p>
                <p className="text-xs text-muted-foreground">{seller.amount} USDC</p>
              </div>
              <Button
                size="sm"
                variant={seller.following ? "secondary" : "outline"}
                className="rounded-full px-4 bg-transparent"
              >
                {seller.following ? "Following" : "Follow"}
              </Button>
            </div>
          ))}
        </div>
      </div>
      <BottomNav />
    </>
  )
}
