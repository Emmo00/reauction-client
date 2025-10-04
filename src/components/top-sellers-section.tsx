import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"

const sellers = [{ name: "Hedgies", amount: "28.124", avatar: "/placeholder.svg?height=40&width=40" }]

export function TopSellersSection() {
  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Top Sellers</h2>
        <button className="text-sm text-muted-foreground">See All</button>
      </div>

      <div className="space-y-3">
        {sellers.map((seller, i) => (
          <div key={i} className="flex items-center gap-4 rounded-2xl bg-card p-4">
            <Avatar className="h-12 w-12 border-2 border-primary">
              <AvatarImage src={seller.avatar || "/placeholder.svg"} />
              <AvatarFallback>{seller.name[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground">{seller.name}</p>
              <p className="text-xs text-muted-foreground">{seller.amount} USDC</p>
            </div>
            <Button size="sm" variant="outline" className="rounded-full px-4 bg-transparent">
              Follow
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}
