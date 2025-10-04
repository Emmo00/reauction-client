"use client";

import { MobileHeader } from "@/components/mobile-header";
import { SearchBar } from "@/components/search-bar";
import { FilterTabs } from "@/components/filter-tabs";
import { FeaturedCard } from "@/components/featured-card";
import { TopSellersSection } from "@/components/top-sellers-section";
import { BottomNav } from "@/components/bottom-nav";

export default function HomePage() {
  return (
    <>
      <div className="min-h-screen bg-background pb-32">
        <MobileHeader />

        <div className="px-4 pt-4 space-y-4">
          <SearchBar />
          <FilterTabs />

          <div>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">All</h2>
              <button className="text-sm text-muted-foreground">See All</button>
            </div>
            <div className="flex flex-col gap-2">
              <FeaturedCard />
              <FeaturedCard />
            </div>
          </div>

          {/* <TopSellersSection /> TODO */}
        </div>
      </div>
      <BottomNav />
    </>
  );
}
