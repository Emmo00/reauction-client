import { CollectibleCard } from "@/components/collectible-card"
import { Button } from "@/components/ui/button"

// Mock data for collectibles
const collectibles = [
  {
    id: 1,
    image: "/abstract-nft-purple.png",
    title: "#102 Cast Collectible",
    creator: "@vitalik",
    price: "28.04",
    type: "auction" as const,
  },
  {
    id: 2,
    image: "/digital-art-collectible-blue.jpg",
    title: "#245 GM Post",
    creator: "@dwr",
    price: "45.50",
    type: "buy-now" as const,
  },
  {
    id: 3,
    image: "/nft-collectible-green.jpg",
    title: "#089 Rare Cast",
    creator: "@jessepollak",
    price: "32.00",
    type: "auction" as const,
  },
  {
    id: 4,
    image: "/crypto-art-orange.jpg",
    title: "#512 Epic Moment",
    creator: "@balajis",
    price: "67.25",
    type: "buy-now" as const,
  },
  {
    id: 5,
    image: "/digital-collectible-pink.jpg",
    title: "#334 Special Cast",
    creator: "@naval",
    price: "19.99",
    type: "auction" as const,
  },
  {
    id: 6,
    image: "/nft-art-yellow.jpg",
    title: "#678 Golden Post",
    creator: "@punk6529",
    price: "55.00",
    type: "buy-now" as const,
  },
]

export function CollectibleGrid() {
  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Latest Listings</h2>
        <Button variant="ghost" className="text-primary">
          See All
        </Button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {collectibles.map((collectible) => (
          <CollectibleCard key={collectible.id} {...collectible} />
        ))}
      </div>
    </div>
  )
}
