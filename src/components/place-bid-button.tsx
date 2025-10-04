"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"

interface PlaceBidButtonProps {
  currentBid: string
}

export function PlaceBidButton({ currentBid }: PlaceBidButtonProps) {
  const [bidAmount, setBidAmount] = useState("")
  const minBid = (Number.parseFloat(currentBid) + 0.5).toFixed(2)

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="lg" className="w-full rounded-xl">
          Place Bid
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Place Your Bid</DialogTitle>
          <DialogDescription>Enter your bid amount in USDC. Minimum bid: {minBid} USDC</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="bid-amount">Bid Amount</Label>
            <div className="relative">
              <Input
                id="bid-amount"
                type="number"
                placeholder={minBid}
                value={bidAmount}
                onChange={(e) => setBidAmount(e.target.value)}
                className="pr-16"
                step="0.01"
                min={minBid}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">USDC</span>
            </div>
          </div>
          <div className="rounded-lg bg-muted p-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Current Bid</span>
              <span className="font-semibold">{currentBid} USDC</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Your Bid</span>
              <span className="font-semibold">{bidAmount || "0.00"} USDC</span>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" className="w-full">
            Confirm Bid
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
