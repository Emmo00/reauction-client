import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowUpRight, ArrowDownRight, Gavel, ShoppingCart } from "lucide-react"

const activities = [
  {
    type: "sale",
    title: "Sold #678 Golden Post",
    amount: "55.00",
    buyer: "@alice",
    time: "2 hours ago",
    icon: ArrowUpRight,
  },
  {
    type: "purchase",
    title: "Purchased #245 GM Post",
    amount: "45.50",
    seller: "@jessepollak",
    time: "5 hours ago",
    icon: ArrowDownRight,
  },
  {
    type: "bid",
    title: "Placed bid on #102 Cast Collectible",
    amount: "28.14",
    time: "1 day ago",
    icon: Gavel,
  },
  {
    type: "listing",
    title: "Listed #334 Special Cast",
    amount: "19.99",
    time: "2 days ago",
    icon: ShoppingCart,
  },
  {
    type: "sale",
    title: "Sold #512 Epic Moment",
    amount: "67.25",
    buyer: "@bob",
    time: "3 days ago",
    icon: ArrowUpRight,
  },
  {
    type: "purchase",
    title: "Purchased #089 Rare Cast",
    amount: "32.00",
    seller: "@balajis",
    time: "5 days ago",
    icon: ArrowDownRight,
  },
]

export function ActivityList() {
  return (
    <div className="space-y-3">
      {activities.map((activity, index) => {
        const Icon = activity.icon
        const isPositive = activity.type === "sale"
        const isNegative = activity.type === "purchase"

        return (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                {/* Icon */}
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full ${
                    isPositive
                      ? "bg-green-500/10 text-green-500"
                      : isNegative
                        ? "bg-red-500/10 text-red-500"
                        : "bg-primary/10 text-primary"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </div>

                {/* Details */}
                <div className="flex-1">
                  <div className="font-semibold">{activity.title}</div>
                  <div className="text-sm text-muted-foreground">
                    {"buyer" in activity && `to ${activity.buyer} · `}
                    {"seller" in activity && `from ${activity.seller} · `}
                    {activity.time}
                  </div>
                </div>

                {/* Amount */}
                <div className="text-right">
                  <div className="font-bold">{activity.amount} USDC</div>
                  <Badge variant="secondary" className="mt-1">
                    {activity.type}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
