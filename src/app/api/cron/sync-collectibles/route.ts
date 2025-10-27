import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { SyncSnapshotService } from "@/services/syncSnapshot";
import { getCollectibleContractAddress } from "@/lib/constants";
import { CollectibleService } from "@/services/collectibles";
import { getFarcasterCastByHash, getFarcasterUserByWalletAddress } from "@/lib/neynar";
import { getContractEvents, decodeEvent } from "@/lib/etherscan";

export async function POST(_: NextRequest) {
  try {
    await connectToDatabase();

    const syncSnapshot = await SyncSnapshotService.getSnapshot();

    console.log("Current sync snapshot:", syncSnapshot);

    if (syncSnapshot?.collectibleSyncLock) {
      console.log("Sync is already in progress. Exiting.");
      return NextResponse.json({ message: "Sync is already in progress." }, { status: 200 });
    }

    await SyncSnapshotService.lockCollectibleSync();

    const lastSyncedCollectiblesBlockNumber = syncSnapshot?.lastCollectibleSyncedBlockNumber ?? 0;

    // fetch Mint events after this time
    // fetch Transfer events after this time
    const events = await getContractEvents(
      getCollectibleContractAddress(),
      lastSyncedCollectiblesBlockNumber + 1
    );

    console.log("events", events);

    const newEvents = decodeEvent("collectible", events.result as any);

    console.log("New events fetched:", newEvents);

    // go through list of collectible events and update collectibles db accordingly
    for (const event of newEvents) {
      console.log(`Processing event:`, event);

      const { eventName, args } = event;

      if (eventName === "Mint") {
        const { to, tokenId, fid } = args;

        if (await CollectibleService.collectibleExists(tokenId)) {
          await CollectibleService.deleteCollectible(tokenId);
        }

        const castHash = BigInt(args.tokenId).toString(16);

        console.log("Cast hash for missing collectible on transfer:", castHash);
        const cast = (await getFarcasterCastByHash(`0x${castHash}`))!;
        console.log("cast", cast);

        if (!cast) {
          console.warn(
            `Cast not found for tokenId ${args.tokenId} during Transfer event processing. Skipping collectible creation.`
          );
          continue;
        }

        // create new collectible entry
        await CollectibleService.createCollectible({
          tokenId,
          owner: to,
          cast,
        });
      }
      if (eventName === "Transfer") {
        // update collectible ownership
        if (await CollectibleService.collectibleExists(args.tokenId)) {
          await CollectibleService.updateCollectible(args.tokenId, {
            owner: args.to,
          });
        } else {
          const castHash = BigInt(args.tokenId).toString(16);

          console.log("Cast hash for missing collectible on transfer:", castHash);
          const cast = (await getFarcasterCastByHash(`0x${castHash}`))!;
          console.log("cast", cast);

          if (!cast) {
            console.warn(
              `Cast not found for tokenId ${args.tokenId} during Transfer event processing. Skipping collectible creation.`
            );
            continue;
          }

          // create new collectible entry
          await CollectibleService.createCollectible({
            tokenId: args.tokenId,
            owner: args.to,
            cast,
          });
        }
      }
    }

    console.log("Collectibles updated based on new events.");

    // update last synced block number
    const latestBlockNumber = newEvents.reduce((latest, event) => {
      const eventBlockNumber = parseInt(event.blockNumber!, 16);
      return eventBlockNumber > latest ? eventBlockNumber : latest;
    }, lastSyncedCollectiblesBlockNumber);

    if (latestBlockNumber > lastSyncedCollectiblesBlockNumber) {
      console.log("Updating last synced block number to:", latestBlockNumber);

      await SyncSnapshotService.updateLastCollectibleSyncedBlockNumber(latestBlockNumber);
    }

    console.log("Sync snapshot updated.");

    // Prepare response with tracking information
    const response: any = {
      message: "Collectibles synced successfully.",
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("Error syncing collectibles:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  } finally {
    // unlock sync
    await SyncSnapshotService.unlockCollectibleSync();
  }
}
