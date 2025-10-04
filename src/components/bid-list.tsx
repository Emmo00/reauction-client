import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const bids = [
  { user: "@alice", avatar: "/placeholder.svg?height=32&width=32", amount: "28.14", time: "2 min ago" },
  { user: "@bob", avatar: "/placeholder.svg?height=32&width=32", amount: "27.50", time: "15 min ago" },
  { user: "@charlie", avatar: "/placeholder.svg?height=32&width=32", amount: "26.00", time: "1 hour ago" },
  { user: "@diana", avatar: "/placeholder.svg?height=32&width=32", amount: "25.00", time: "3 hours ago" },
]

export function BidList() {
  return (
    <div className="space-y-3">
      {bids.map((bid, index) => (
        <div key={index} className="flex items-center justify-between rounded-lg border border-border p-3">
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={bid.avatar || "/placeholder.svg"} />
              <AvatarFallback>{bid.user[1].toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <div className="font-semibold">{bid.user}</div>
              <div className="text-xs text-muted-foreground">{bid.time}</div>
            </div>
          </div>
          <div className="text-right">
            <div className="font-bold">{bid.amount} USDC</div>
          </div>
        </div>
      ))}
    </div>
  )
}
