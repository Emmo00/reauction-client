"use client";

import { Loader2 } from "lucide-react";

interface LoadingSkeletonProps {
  count?: number;
}

export function ListingLoadingSkeleton({ count = 3 }: LoadingSkeletonProps) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="animate-pulse">
          <div className="relative overflow-hidden rounded-3xl bg-muted p-6">
            <div className="mb-4 aspect-square overflow-hidden rounded-2xl bg-muted-foreground/20" />
            <div className="flex items-end justify-between">
              <div className="space-y-2">
                <div className="h-3 w-20 rounded bg-muted-foreground/20" />
                <div className="h-6 w-24 rounded bg-muted-foreground/20" />
              </div>
              <div className="h-10 w-20 rounded-xl bg-muted-foreground/20" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function InlineLoader() {
  return (
    <div className="flex items-center justify-center py-8">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  );
}