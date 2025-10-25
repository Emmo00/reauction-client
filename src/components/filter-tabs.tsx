"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"

const filters = [
  { label: "All", value: undefined },
  { label: "Auction", value: "auction" as const },
  { label: "Buy Now", value: "fixed-price" as const }
]

interface FilterTabsProps {
  onFilterChange?: (filter: "auction" | "fixed-price" | undefined) => void;
}

export function FilterTabs({ onFilterChange }: FilterTabsProps) {
  const [active, setActive] = useState("All")

  const handleFilterClick = (filter: typeof filters[0]) => {
    setActive(filter.label);
    onFilterChange?.(filter.value);
  };

  return (
    <div className="flex gap-2 overflow-x-auto pb-2">
      {filters.map((filter) => (
        <button
          key={filter.label}
          onClick={() => handleFilterClick(filter)}
          className={cn(
            "whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors",
            active === filter.label
              ? "bg-primary text-primary-foreground"
              : "bg-card text-muted-foreground hover:text-foreground",
          )}
        >
          {filter.label}
        </button>
      ))}
    </div>
  )
}
