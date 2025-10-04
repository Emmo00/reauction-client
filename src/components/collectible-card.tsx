import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import Link from "next/link"

interface CollectibleCardProps {
  id: number
  image: string
  title: string
  creator: string
  price: string
  type: "auction" | "buy-now"
}

export function CollectibleCard({ id, image, title, creator, price, type }: CollectibleCardProps) {
  return (
    <Link href={`/collectible/${id}`}>
      <Card className="group overflow-hidden transition-all hover:shadow-xl hover:shadow-primary/20">
        <CardContent className="p-0">
          {/* Image */}
          <div className="relative aspect-square overflow-hidden bg-muted">
            <Image
              src={image || "/placeholder.svg"}
              alt={title}
              fill
              className="object-cover transition-transform group-hover:scale-105"
            />
            {type === "auction" && <Badge className="absolute right-3 top-3 bg-accent">Live Auction</Badge>}
          </div>

          {/* Info */}
          <div className="space-y-3 p-4">
            <div>
              <h3 className="font-semibold text-foreground">{title}</h3>
              <p className="text-sm text-muted-foreground">{creator}</p>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-muted-foreground">{type === "auction" ? "Current Bid" : "Price"}</div>
                <div className="text-lg font-bold text-foreground">{price} USDC</div>
              </div>
              <Button size="sm" className="rounded-full">
                {type === "auction" ? "Place Bid" : "Buy Now"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
