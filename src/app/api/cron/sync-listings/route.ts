import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { SyncSnapshotService } from "@/services/syncSnapshot";
import { getAuctionContractAddress, getCoinbaseQLSchema } from "@/lib/constants";
import { executeCoinbaseqlQuery } from "@/lib/coinbaseql";
import { ListingService } from "@/services/listing";
import { getFarcasterCastByHash, getFarcasterUserByWalletAddress } from "@/lib/neynar";

export async function POST(_: NextRequest) {
  try {
    await connectToDatabase();

    // get cached block time from last synced listing for auctions
    // get cached block time from last synced listing for listings
    const syncSnapshot = await SyncSnapshotService.getSnapshot();

    console.log("Current sync snapshot:", syncSnapshot);

    if (syncSnapshot?.syncLock) {
      console.log("Sync is already in progress. Exiting.");
      return NextResponse.json({ message: "Sync is already in progress." }, { status: 200 });
    }

    await SyncSnapshotService.lockSync();

    const lastSyncedAuctionBlockTime =
      syncSnapshot?.lastSyncedBlockTimeStamp ?? "2025-09-08 08:23:43";

    // fetch AuctionStarted events after this time
    // fetch AuctionSettled events after this time
    // fetch AuctionCancelled events after this time
    // fetch ListingCreated events after this time
    // fetch ListingPurchased events after this time
    // fetch ListingCancelled events after this time
    const schema = getCoinbaseQLSchema();
    const auctionContractAddress = getAuctionContractAddress().toLowerCase();
    const newEventsQuery = `
      SELECT
        event_name,
        parameters,
        block_timestamp
      FROM ${schema}.events
      WHERE
        address = '${auctionContractAddress}' AND
        block_timestamp > toDateTime64('${lastSyncedAuctionBlockTime}', 3)
    `;

    const newEvents = (await executeCoinbaseqlQuery(newEventsQuery)).result ?? [];

    console.log("New events fetched:", newEvents);

    // go through list of auction events and update listings db accordingly
    // go throught list of listing events and update listings db accordingly
    for (const event of newEvents) {
      const { event_name, parameters } = event;

      if (event_name === "AuctionStarted") {
        // create new listing
        const castHash = BigInt(parameters?.tokenId!).toString(16);
        console.log("cast hash", castHash);
        const cast = (await getFarcasterCastByHash(castHash))!;

        console.log("fetched cast", cast);

        await ListingService.createListing({
          listingId: parameters?.auctionId!,
          tokenId: parameters?.tokenId!,
          listingType: "auction",
          listingStatus: "active",
          creator: parameters?.creator!,
          price: parameters?.startAsk!,
          highestBid: parameters?.startAsk!,
          cast,
          auctionStarted: false,
          endTime: parameters?.endTime!,
        });
      }

      if (event_name === "AuctionSettled") {
        // mark listing as sold
        await ListingService.updateAuctionListing(parameters?.auctionId!, {
          listingStatus: "sold",
          highestBid: parameters?.amount!,
          buyer: (await getFarcasterUserByWalletAddress(parameters?.winner!)) || {
            address: parameters?.winner!,
          },
        });
      }

      if (event_name === "AuctionCancelled") {
        // mark listing as cancelled
        await ListingService.updateAuctionListing(parameters?.auctionId!, {
          listingStatus: "cancelled",
        });
      }

      // update highest bid price by fetching the BidPlaced events for each active auction (after last synced time)
      if (event_name === "BidPlaced") {
        await ListingService.updateAuctionListing(parameters?.auctionId!, {
          highestBid: parameters?.amount!,
          auctionStarted: true,
        });

        await ListingService.addBidToListing(
          parameters?.auctionId!,
          (await getFarcasterUserByWalletAddress(parameters?.bidder!)) || {
            address: parameters?.bidder!,
          },
          parameters?.amount!
        );
      }

      // go through list of listing events and update listings db accordingly
      if (event_name === "ListingCreated") {
        // create new listing
        await ListingService.createListing({
          listingId: parameters?.listingId!,
          tokenId: parameters?.tokenId!,
          listingType: "fixed-price",
          listingStatus: "active",
          creator: parameters?.creator!,
          price: parameters?.startAsk!,
          cast: (await getFarcasterCastByHash(BigInt(parameters?.tokenId!).toString(16)))!,
          auctionStarted: true,
        });
      }

      if (event_name === "ListingPurchased") {
        // mark listing as sold
        await ListingService.updateFixedPriceListing(parameters?.listingId!, {
          listingStatus: "sold",
          buyer: (await getFarcasterUserByWalletAddress(parameters?.buyer!)) || {
            address: parameters?.buyer!,
          },
        });
      }

      if (event_name === "ListingCancelled") {
        // mark listing as cancelled
        await ListingService.updateFixedPriceListing(parameters?.listingId!, {
          listingStatus: "cancelled",
        });
      }
    }

    console.log("Listings updated based on new events.");

    // update last synced block time
    const latestBlockTime = newEvents.reduce((latest, event) => {
      const eventTime = new Date(event.block_timestamp!).getTime();
      return eventTime > latest ? eventTime : latest;
    }, new Date(lastSyncedAuctionBlockTime).getTime());

    if (latestBlockTime > new Date(lastSyncedAuctionBlockTime).getTime()) {
      console.log("Updating last synced block time to:", new Date(latestBlockTime).toISOString());

      await SyncSnapshotService.updateSnapshot({
        lastSyncedBlockTimeStamp: new Date(latestBlockTime)
          .toISOString()
          .replace("T", " ")
          .replace("Z", "")
          .split(".")[0], // "2025-09-08 08:23:43"
      });
    }

    console.log("Sync snapshot updated.");

    return NextResponse.json({ message: "Listings synced successfully." }, { status: 200 });
  } catch (error) {
    console.error("Error syncing listings:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  } finally {
    // unlock sync
    await SyncSnapshotService.unlockSync();
  }
}
