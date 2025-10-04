import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown } from "lucide-react"
import Link from "next/link"

const topSellers = [
  {
    rank: 1,
    username: "@vitalik",
    avatar: "/placeholder.svg?height=48&width=48",
    totalEarned: "12,450.00",
    sales: 156,
    change: "+12.5%",
    trending: "up" as const,
  },
  {
    rank: 2,
    username: "@dwr",
    avatar: "/placeholder.svg?height=48&width=48",
    totalEarned: "9,820.50",
    sales: 142,
    change: "+8.3%",
    trending: "up" as const,
  },
  {
    rank: 3,
    username: "@jessepollak",
    avatar: "/placeholder.svg?height=48&width=48",
    totalEarned: "8,340.25",
    sales: 98,
    change: "+15.7%",
    trending: "up" as const,
  },
  {
    rank: 4,
    username: "@balajis",
    avatar: "/placeholder.svg?height=48&width=48",
    totalEarned: "7,125.00",
    sales: 87,
    change: "-2.1%",
    trending: "down" as const,
  },
  {
    rank: 5,
    username: "@naval",
    avatar: "/placeholder.svg?height=48&width=48",
    totalEarned: "6,890.75",
    sales: 76,
    change: "+5.4%",
    trending: "up" as const,
  },
  {
    rank: 6,
    username: "@punk6529",
    avatar: "/placeholder.svg?height=48&width=48",
    totalEarned: "6,234.50",
    sales: 71,
    change: "+3.2%",
    trending: "up" as const,
  },
  {
    rank: 7,
    username: "@cdixon",
    avatar: "/placeholder.svg?height=48&width=48",
    totalEarned: "5,678.00",
    sales: 64,
    change: "-1.5%",
    trending: "down" as const,
  },
  {
    rank: 8,
    username: "@aeyakovenko",
    avatar: "/placeholder.svg?height=48&width=48",
    totalEarned: "5,234.25",
    sales: 59,
    change: "+7.8%",
    trending: "up" as const,
  },
  {
    rank: 9,
    username: "@stani",
    avatar: "/placeholder.svg?height=48&width=48",
    totalEarned: "4,890.50",
    sales: 52,
    change: "+4.1%",
    trending: "up" as const,
  },
  {
    rank: 10,
    username: "@sandeepnailwal",
    avatar: "/placeholder.svg?height=48&width=48",
    totalEarned: "4,567.75",
    sales: 48,
    change: "+2.9%",
    trending: "up" as const,
  },
]

export function LeaderboardList() {
  return (
    <div className="space-y-3">
      {topSellers.map((seller) => (
        <Link key={seller.rank} href={`/profile/${seller.username.slice(1)}`}>
          <Card className="transition-all hover:shadow-lg hover:shadow-primary/10">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                {/* Rank */}
                <div className="flex w-12 items-center justify-center">
                  {seller.rank <= 3 ? (
                    <Badge
                      variant={seller.rank === 1 ? "default" : "secondary"}
                      className="h-8 w-8 rounded-full p-0 text-center"
                    >
                      {seller.rank}
                    </Badge>
                  ) : (
                    <span className="text-xl font-bold text-muted-foreground">{seller.rank}</span>
                  )}
                </div>

                {/* Avatar and Username */}
                <Avatar className="h-12 w-12">
                  <AvatarImage src={seller.avatar || "/placeholder.svg"} />
                  <AvatarFallback>{seller.username[1].toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="font-semibold">{seller.username}</div>
                  <div className="text-sm text-muted-foreground">{seller.sales} sales</div>
                </div>

                {/* Stats */}
                <div className="hidden text-right sm:block">
                  <div className="text-xl font-bold">{seller.totalEarned} USDC</div>
                  <div
                    className={`flex items-center justify-end gap-1 text-sm ${
                      seller.trending === "up" ? "text-green-500" : "text-red-500"
                    }`}
                  >
                    {seller.trending === "up" ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : (
                      <TrendingDown className="h-3 w-3" />
                    )}
                    {seller.change}
                  </div>
                </div>

                {/* Mobile Stats */}
                <div className="text-right sm:hidden">
                  <div className="font-bold">{seller.totalEarned}</div>
                  <div className="text-xs text-muted-foreground">USDC</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  )
}
