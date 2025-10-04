"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"

const filters = ["All", "Auction", "Buy Now"]

export function FilterTabs() {
  const [active, setActive] = useState("All")

  return (
    <div className="flex gap-2 overflow-x-auto pb-2">
      {filters.map((filter) => (
        <button
          key={filter}
          onClick={() => setActive(filter)}
          className={cn(
            "whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors",
            active === filter
              ? "bg-primary text-primary-foreground"
              : "bg-card text-muted-foreground hover:text-foreground",
          )}
        >
          {filter}
        </button>
      ))}
    </div>
  )
}
