import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { SyncSnapshotService } from "@/services/syncSnapshot";
import { getAuctionContractAddress } from "@/lib/constants";
import { ListingService } from "@/services/listing";
import { getFarcasterCastByHash, getFarcasterUserByWalletAddress } from "@/lib/neynar";
import { getContractEvents, decodeEvent } from "@/lib/etherscan";

export async function POST(_: NextRequest) {
  try {
    await connectToDatabase();

    // get cached block time from last synced listing for auctions
    // get cached block time from last synced listing for listings
    const syncSnapshot = await SyncSnapshotService.getSnapshot();

    console.log("Current sync snapshot:", syncSnapshot);

    if (syncSnapshot?.listingSyncLock) {
      console.log("Sync is already in progress. Exiting.");
      return NextResponse.json({ message: "Sync is already in progress." }, { status: 200 });
    }

    await SyncSnapshotService.lockListingSync();

    const lastSyncedListingsBlockNumber = syncSnapshot?.lastListingSyncedBlockNumber ?? 0;

    // fetch AuctionStarted events after this time
    // fetch AuctionSettled events after this time
    // fetch AuctionCancelled events after this time
    // fetch ListingCreated events after this time
    // fetch ListingPurchased events after this time
    // fetch ListingCancelled events after this time
    const events = await getContractEvents(
      getAuctionContractAddress(),
      lastSyncedListingsBlockNumber + 1
    );

    console.log("events", events);

    const newEvents = decodeEvent("auction", events.result as any);

    console.log("New events fetched:", newEvents);

    // go through list of auction events and update listings db accordingly
    // go through list of fixed listing events and update listings db accordingly
    for (const event of newEvents) {
      console.log(`Processing event:`, event);

      const { eventName, args, timeStamp } = event;
      const block_timestamp = new Date(parseInt(timeStamp!, 16) * 1000).toISOString();

      if (eventName === "AuctionStarted") {
        if (await ListingService.auctionExists(args?.auctionId)) continue;

        // create new listing
        const castHash = BigInt(args?.tokenId!).toString(16);
        console.log("cast hash", castHash);
        const cast = (await getFarcasterCastByHash(castHash))!;
        await ListingService.createListing({
          listingId: args?.auctionId!,
          tokenId: args?.tokenId!,
          listingType: "auction",
          listingStatus: "active",
          creator: args?.creator!,
          cast,
          auctionStarted: false,
          auctionEndTime: new Date(Number(args?.endTime!) * 1000).toISOString(),
          listingCreatedAt: block_timestamp!,
        });
      }

      if (eventName === "AuctionSettled") {
        // mark listing as sold
        await ListingService.updateAuctionListing(args?.auctionId!, {
          listingStatus: "sold",
          highestBid: args?.amount!,
          buyer: (await getFarcasterUserByWalletAddress(args?.winner!)) || {
            address: args?.winner!,
          },
        });
      }

      if (eventName === "AuctionCancelled") {
        // mark listing as cancelled
        await ListingService.updateAuctionListing(args?.auctionId!, {
          listingStatus: "cancelled",
        });
      }

      // update highest bid price by fetching the BidPlaced events for each active auction (after last synced time)
      if (eventName === "BidPlaced") {
        await ListingService.updateAuctionListing(args?.auctionId!, {
          highestBid: args?.amount!,
          auctionStarted: true,
        });

        await ListingService.addBidToListing(
          args?.auctionId!,
          (await getFarcasterUserByWalletAddress(args?.bidder!)) || {
            address: args?.bidder!,
          },
          args?.amount!
        );
      }

      if (eventName === "AuctionExtended") {
        await ListingService.updateAuctionListing(args?.auctionId, {
          auctionEndTime: new Date(args?.newEndTime! * 1000).toISOString(),
        });
      }

      // go through list of listing events and update listings db accordingly
      if (eventName === "ListingCreated") {
        if (await ListingService.fixedListingExists(args?.listingId)) continue;
        // create new listing
        await ListingService.createListing({
          listingId: args?.listingId!,
          tokenId: args?.tokenId!,
          listingType: "fixed-price",
          listingStatus: "active",
          creator: args?.creator!,
          price: args?.price!,
          cast: (await getFarcasterCastByHash(BigInt(args?.tokenId!).toString(16)))!,
          auctionStarted: true,
          listingCreatedAt: block_timestamp!,
        });
      }

      if (eventName === "ListingPurchased") {
        // mark listing as sold
        await ListingService.updateFixedPriceListing(args?.listingId!, {
          listingStatus: "sold",
          buyer: (await getFarcasterUserByWalletAddress(args?.buyer!)) || {
            address: args?.buyer!,
          },
        });
      }

      if (eventName === "ListingCancelled") {
        // mark listing as cancelled
        await ListingService.updateFixedPriceListing(args?.listingId!, {
          listingStatus: "cancelled",
        });
      }
    }

    console.log("Listings updated based on new events.");

    // update last synced block number
    const latestBlockNumber = newEvents.reduce((latest, event) => {
      const eventBlockNumber = parseInt(event.blockNumber!, 16);
      return eventBlockNumber > latest ? eventBlockNumber : latest;
    }, lastSyncedListingsBlockNumber);

    if (latestBlockNumber > lastSyncedListingsBlockNumber) {
      console.log("Updating last synced block number to:", latestBlockNumber);

      await SyncSnapshotService.updateLastListingSyncedBlockNumber(latestBlockNumber);
    }

    console.log("Sync snapshot updated.");

    // Prepare response with tracking information
    const response: any = {
      message: "Listings synced successfully.",
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("Error syncing listings:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  } finally {
    // unlock sync
    await SyncSnapshotService.unlockListingSync();
  }
}
