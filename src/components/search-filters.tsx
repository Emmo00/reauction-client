"use client"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"
import { useState } from "react"

const filters = ["All", "Auctions", "Buy Now", "Trending", "Following"]

export function SearchFilters() {
  const [activeFilter, setActiveFilter] = useState("All")

  return (
    <div className="mb-8 space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search collectible or creator..." className="h-12 rounded-xl pl-10 pr-4" />
      </div>

      {/* Filter Tags */}
      <div className="flex flex-wrap gap-2">
        {filters.map((filter) => (
          <Button
            key={filter}
            variant={activeFilter === filter ? "default" : "secondary"}
            size="sm"
            className="rounded-full"
            onClick={() => setActiveFilter(filter)}
          >
            {filter}
          </Button>
        ))}
      </div>
    </div>
  )
}
