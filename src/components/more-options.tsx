"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Settings, X, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MoreOptionsProps {
  listingType: "auction" | "fixed-price";
  itemId: string;
  isCreator: boolean;
  listingStatus?: string;
  auctionEndTime?: string;
  onCancelListing?: () => void;
  onCancelAuction?: () => void;
  onSettleAuction?: () => void;
}

export function MoreOptions({
  listingType,
  itemId,
  isCreator,
  listingStatus,
  auctionEndTime,
  onCancelListing,
  onCancelAuction,
  onSettleAuction,
}: MoreOptionsProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Don't show if user is not the creator
  if (!isCreator) {
    return null;
  }

  // Helper to check if auction has ended
  const isAuctionEnded = auctionEndTime && Date.now() > new Date(auctionEndTime).getTime();

  // Helper to check if actions are available
  const canCancelListing = listingType === "fixed-price" && listingStatus === "active";
  const canCancelAuction = listingType === "auction" && listingStatus === "active";
  const canSettleAuction = listingType === "auction" && 
    (listingStatus === "ended" || (listingStatus === "active" && isAuctionEnded));

  // Don't show if no actions are available
  if (!canCancelListing && !canCancelAuction && !canSettleAuction) {
    return null;
  }

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="rounded-2xl bg-card/80 backdrop-blur-sm border border-white/10 overflow-hidden shadow-lg">
      <button
        onClick={toggleExpanded}
        className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-all duration-200"
      >
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-orange-500/20 backdrop-blur-sm flex items-center justify-center border border-orange-500/30">
            <Settings className="h-5 w-5 text-orange-400" />
          </div>
          <div className="text-left">
            <h3 className="font-medium text-foreground">More Options</h3>
            <p className="text-sm text-muted-foreground">
              {listingType === "auction" ? "Auction" : "Listing"} management options
            </p>
          </div>
        </div>
        <div className="h-8 w-8 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center transition-transform duration-200">
          {isExpanded ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground transition-transform duration-200" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform duration-200" />
          )}
        </div>
      </button>

      {isExpanded && (
        <div className="px-4 pb-4 space-y-3 animate-in slide-in-from-top-2 duration-300 border-t border-white/10">
          <div className="h-4" /> {/* Spacer */}
          
          {/* Fixed Price Listing Actions */}
          {listingType === "fixed-price" && canCancelListing && (
            <Button
              onClick={onCancelListing}
              variant="outline"
              className="w-full justify-start gap-3 h-12 bg-red-500/10 backdrop-blur-sm border-red-500/20 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-all duration-200"
            >
              <X className="h-4 w-4" />
              Cancel Listing
            </Button>
          )}

          {/* Auction Actions */}
          {listingType === "auction" && (
            <>
              {canSettleAuction && (
                <Button
                  onClick={onSettleAuction}
                  variant="outline"
                  className="w-full justify-start gap-3 h-12 bg-green-500/10 backdrop-blur-sm border-green-500/20 hover:bg-green-500/20 text-green-400 hover:text-green-300 transition-all duration-200"
                >
                  <Clock className="h-4 w-4" />
                  Settle Auction
                </Button>
              )}
              
              {canCancelAuction && (
                <Button
                  onClick={onCancelAuction}
                  variant="outline"
                  className="w-full justify-start gap-3 h-12 bg-red-500/10 backdrop-blur-sm border-red-500/20 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-all duration-200"
                >
                  <X className="h-4 w-4" />
                  Cancel Auction
                </Button>
              )}
            </>
          )}

          {/* Status message if no actions available */}
          {!canCancelListing && !canCancelAuction && !canSettleAuction && (
            <div className="p-3 rounded-xl bg-muted/30 backdrop-blur-sm border border-white/10 text-center">
              <p className="text-sm text-muted-foreground">
                No management actions available at this time
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}