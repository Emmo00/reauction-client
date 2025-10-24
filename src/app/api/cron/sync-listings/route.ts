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
        contract_address = '${auctionContractAddress}' AND
        block_timestamp > toDateTime64('${lastSyncedAuctionBlockTime}', 3)
    `;

    const newEvents = (await executeCoinbaseqlQuery(newEventsQuery)).result;

    // go through list of auction events and update listings db accordingly
    // go throught list of listing events and update listings db accordingly
    for (const event of newEvents) {
      const { event_name, parameters } = event;

      if (event_name === "AuctionStarted") {
        // create new listing
        ListingService.createListing({
          listingId: Number(parameters?.auctionId),
          tokenId: Number(parameters?.tokenId),
          listingType: "auction",
          listingStatus: "active",
          creator: parameters?.creator!,
          price: BigInt(parameters?.startAsk!),
          highestBid: BigInt(parameters?.highestBid!),
          cast: (await getFarcasterCastByHash(Number(parameters?.tokenId!).toString(16)))!,
          auctionStarted: false,
          endTime: parameters?.endTime!,
        });
      }

      if (event_name === "AuctionSettled") {
        // mark listing as sold
        ListingService.updateAuctionListing(Number(parameters?.auctionId), {
          listingStatus: "sold",
          highestBid: BigInt(parameters?.amount!),
          buyer: (await getFarcasterUserByWalletAddress(parameters?.winner!)) || {
            address: parameters?.winner!,
          },
        });
      }

      if (event_name === "AuctionCancelled") {
        // mark listing as cancelled
        ListingService.updateAuctionListing(Number(parameters?.auctionId), {
          listingStatus: "cancelled",
        });
      }

      // update highest bid price by fetching the BidPlaced events for each active auction (after last synced time)
      if (event_name === "BidPlaced") {
        ListingService.updateAuctionListing(Number(parameters?.auctionId), {
          highestBid: BigInt(parameters?.amount!),
        });

        ListingService.addBidToListing(
          Number(parameters?.auctionId),
          (await getFarcasterUserByWalletAddress(parameters?.bidder!)) || {
            address: parameters?.bidder!,
          },
          BigInt(parameters?.amount!)
        );
      }

      // go through list of listing events and update listings db accordingly
      if (event_name === "ListingCreated") {
        // create new listing
        ListingService.createListing({
          listingId: Number(parameters?.listingId),
          tokenId: Number(parameters?.tokenId),
          listingType: "fixed-price",
          listingStatus: "active",
          creator: parameters?.creator!,
          price: BigInt(parameters?.startAsk!),
          cast: (await getFarcasterCastByHash(Number(parameters?.tokenId!).toString(16)))!,
          auctionStarted: false,
        });
      }

      if (event_name === "ListingPurchased") {
        // mark listing as sold
        ListingService.updateFixedPriceListing(Number(parameters?.listingId), {
          listingStatus: "sold",
          buyer: (await getFarcasterUserByWalletAddress(parameters?.buyer!)) || {
            address: parameters?.buyer!,
          },
        });
      }

      if (event_name === "ListingCancelled") {
        // mark listing as cancelled
        ListingService.updateFixedPriceListing(Number(parameters?.listingId), {
          listingStatus: "cancelled",
        });
      }
    }

    // update last synced block time
    const latestBlockTime = newEvents.reduce((latest, event) => {
      const eventTime = new Date(event.block_timestamp!).getTime();
      return eventTime > latest ? eventTime : latest;
    }, new Date(lastSyncedAuctionBlockTime).getTime());

    if (latestBlockTime > new Date(lastSyncedAuctionBlockTime).getTime()) {
      await SyncSnapshotService.updateSnapshot({
        lastSyncedBlockTimeStamp: new Date(latestBlockTime)
          .toISOString()
          .replace("T", " ")
          .replace("Z", "")
          .split(".")[0], // "2025-09-08 08:23:43"
      });
    }

    return NextResponse.json({ message: "Listings synced successfully." }, { status: 200 });
  } catch (error) {
    console.error("Error syncing listings:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  } finally {
    // unlock sync
    await SyncSnapshotService.unlockSync();
  }
}
