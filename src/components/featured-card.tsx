import { Heart, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"

export function FeaturedCard() {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-red-500 to-red-600 p-6">
      <button className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
        <Heart className="h-5 w-5 text-white" />
      </button>

      <div className="mb-4 aspect-square overflow-hidden rounded-2xl">
        <img src="/person-in-black-mask-nft-collectible.jpg" alt="Featured NFT" className="h-full w-full object-cover" />
      </div>

      <div className="flex items-end justify-between">
        <div>
          <div className="mb-1 flex items-center gap-2 text-white/80">
            <Zap className="h-4 w-4" />
            <span className="text-xs">Current Bid</span>
          </div>
          <p className="text-xl font-bold text-white">28.04 USDC</p>
        </div>
        <Button size="sm" className="rounded-full bg-white px-6 text-sm font-semibold text-black hover:bg-white/90">
          Place Bid
        </Button>
      </div>
    </div>
  )
}
