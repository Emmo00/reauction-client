---
applyTo: '**'
---

# 🧩 Smart Contract Function Reference — `Auction`

---

## **createListing(uint256 tokenId, uint256 price)** → `uint256`

**Visibility:** `external`
**Modifiers:** `whenNotPaused`, `nonReentrant`
**Returns:** `listingId` (new listing ID)

### **Purpose**

Creates a **fixed-price listing** for an NFT owned by the caller. The NFT is transferred into the contract’s custody until purchased or cancelled.

### **Parameters**

* `tokenId`: ID of the NFT (must be owned by `msg.sender`).
* `price`: Sale price in USDC (must be ≥ `listingConfig.minListingPrice`).

### **Behavior**

1. Transfers NFT from seller to contract (`_collectNFT`).
2. Creates and stores listing metadata in `listings` mapping.
3. Emits `ListingCreated`.

### **Reverts if**

* Contract is paused.
* `price` < `listingConfig.minListingPrice`.
* Caller doesn’t own the NFT.

### **Frontend notes**

* Trigger when a user chooses **“List for Sale”**.
* Wait for transaction confirmation.
* After success, call `getListing(listingId)` to show listing details.

---

## **buyListing(uint256 listingId)**

**Visibility:** `external`
**Modifiers:** `whenNotPaused`, `nonReentrant`

### **Purpose**

Allows a buyer to purchase an active listing using USDC.

### **Parameters**

* `listingId`: ID of the listing to buy.

### **Behavior**

1. Validates listing is `Active`.
2. Transfers USDC from buyer to contract.
3. Sends protocol fee to treasury and proceeds to seller.
4. Transfers NFT to buyer.
5. Emits `ListingPurchased`.

### **Reverts if**

* Listing is not active.
* Buyer is the listing creator.
* ERC20 transfer fails (insufficient allowance/balance).

### **Frontend notes**

* Used when user clicks **“Buy Now”**.
* Ensure buyer has approved contract for USDC.
* Show loading until `ListingPurchased` event.

---

## **buyListingWithPermit(uint256 listingId, PermitData permit)**

Same as `buyListing`, but includes **gasless USDC approval** via EIP-2612.

### **Parameters**

* `listingId`: ID of the listing.
* `permit`: Struct with `{v, r, s, deadline}` and amount signature data.

### **Frontend notes**

* Use when implementing **“Buy with Permit”** (no manual token approval).
* Must prompt user to sign permit off-chain.

---

## **cancelListing(uint256 listingId)**

Cancels a listing and returns NFT to the seller.

### **Behavior**

1. Validates caller is the creator and listing is `Active`.
2. Marks listing as `Cancelled`.
3. Transfers NFT back to creator.
4. Emits `ListingCancelled`.

### **Frontend notes**

* Trigger on “Cancel Listing” button.
* Disable if user isn’t the creator.

---

## **listingState(uint256 listingId)** → `ListingState`

Returns current state of a listing (`Active`, `Purchased`, or `Cancelled`).

### **Frontend use**

* Display listing status dynamically in marketplace UI.

---

## **getListing(uint256 listingId)** → `ListingData`

Fetches full struct info for a listing.

### **Frontend use**

* Used in detail pages to display all metadata (creator, price, tokenId, etc.)

---

## **startAuction(uint256 tokenId, uint256 startAsk, uint256 duration)** → `uint256`

**Purpose:** Creates an auction for an NFT owned by the caller.

### **Parameters**

* `tokenId`: NFT to auction.
* `startAsk`: Minimum acceptable first bid.
* `duration`: Duration in seconds.

### **Behavior**

* Validates `startAsk` ≥ `minBidAmount` and duration within limits.
* Transfers NFT to contract.
* Creates auction entry and emits `AuctionStarted`.

### **Frontend notes**

* Trigger when user clicks **“Start Auction”**.
* Recommend UI field validation to prevent invalid inputs.

---

## **placeBid(uint256 auctionId, uint256 amount)**

**Purpose:** Places a bid on an active auction.

### **Parameters**

* `auctionId`: ID of auction.
* `amount`: Bid amount in USDC.

### **Behavior**

1. Uses pending withdrawal balance if available.
2. Transfers additional USDC if needed.
3. Refunds previous highest bidder.
4. Updates auction’s highest bid and bidder.
5. Emits `BidPlaced`.

### **Reverts if**

* Auction not active.
* Caller is the auction creator.
* Bid < minimum required increment.

### **Frontend notes**

* Display **current highest bid** and enforce min increment.
* Show “Bid successful” message and optionally pending refund notice.

---

## **placeBidWithPermit(uint256 auctionId, uint256 amount, PermitData permit)**

Same as `placeBid` but allows using EIP-2612 permit (no prior USDC approval).

---

## **settleAuction(uint256 auctionId)**

**Purpose:** Finalizes an ended auction, distributes funds, and transfers NFT.

### **Behavior**

* If there’s a winner:

  * Transfers protocol fee to treasury and remainder to creator.
  * Sends NFT to winner.
* If no bids:

  * Returns NFT to creator.
* Marks auction as `Settled`.
* Emits `AuctionSettled`.

### **Frontend notes**

* Trigger “Settle Auction” after it ends.
* Show “Auction Settled” confirmation.

---

## **batchSettleAuction(uint256[] auctionIds)**

**Purpose:** Settles multiple auctions in one transaction.
Same behavior as `settleAuction`, executed in a loop.

### **Frontend notes**

* Useful for admin dashboards or batch settlement tools.

---

## **cancelAuction(uint256 auctionId)**

Cancels an active auction (only by creator).
Refunds highest bidder if any and returns NFT.

### **Frontend notes**

* Used when creator cancels before any bids or manually ends.

---

## **auctionState(uint256 auctionId)** → `AuctionState`

Returns computed state (`Active`, `Ended`, `Settled`, `Cancelled`).

---

## **getAuction(uint256 auctionId)** → `AuctionData`

Returns full auction struct with dynamic state computed.

### **Frontend use**

* For auction details pages (creator, highest bid, end time, etc.)

---

## **setTreasury(address _treasury)**

**Owner-only.**
Sets the address that receives protocol fees.

### **Frontend notes**

* Used in admin panel or deployment script.

---

## **setAuctionConfig(AuctionConfig config)**

**Owner-only.**
Updates global auction parameters:

* `minBidAmount`, `minBidIncrementBps`, `min/maxDuration`, etc.

### **Frontend notes**

* Should only be called by protocol admin through backend dashboard.

---

## **setListingConfig(ListingConfig config)**

**Owner-only.**
Updates global listing parameters (min price, fee rate).

---

## **pause() / unpause()**

Temporarily disables or enables all external actions.

### **Frontend notes**

* Reflect “Protocol paused” state (disable interactions, show alert).

---

## **withdraw()**

**Purpose:** Withdraw refundable balance from failed/outbid auctions.

### **Behavior**

* Reads `pendingWithdrawals[msg.sender]`.
* Transfers funds to user.
* Emits `AuctionRefundWithdrawn`.

### **Frontend notes**

* UI: “Withdraw pending refunds” button.
* Display `getPendingWithdrawal(address)` balance before enabling.

---

## **getPendingWithdrawal(address user)** → `uint256`

Returns amount available for refund withdrawal.

### **Frontend use**

* Show user’s withdrawable balance in dashboard.

---

# ⚙️ Integration Summary

| Action          | Function                               | Input                             | Event                    | Notes                 |
| --------------- | -------------------------------------- | --------------------------------- | ------------------------ | --------------------- |
| List NFT        | `createListing`                        | `tokenId`, `price`                | `ListingCreated`         | Moves NFT to contract |
| Buy NFT         | `buyListing` / `buyListingWithPermit`  | `listingId`                       | `ListingPurchased`       | Transfers NFT + funds |
| Cancel listing  | `cancelListing`                        | `listingId`                       | `ListingCancelled`       | Returns NFT           |
| Start auction   | `startAuction`                         | `tokenId`, `startAsk`, `duration` | `AuctionStarted`         | NFT locked            |
| Place bid       | `placeBid` / `placeBidWithPermit`      | `auctionId`, `amount`             | `BidPlaced`              | Refunds old bidder    |
| Settle auction  | `settleAuction` / `batchSettleAuction` | IDs                               | `AuctionSettled`         | Sends NFT + funds     |
| Cancel auction  | `cancelAuction`                        | `auctionId`                       | `AuctionCancelled`       | Returns NFT           |
| Withdraw refund | `withdraw`                             | —                                 | `AuctionRefundWithdrawn` | Sends USDC to user    |
