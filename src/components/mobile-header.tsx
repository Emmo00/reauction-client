"use client";

import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import sdk from "@farcaster/miniapp-sdk";
import { MiniAppContext } from "@farcaster/miniapp-core/dist/context";
import { useAccount, useConnect } from "wagmi";
import farcasterMiniApp from "@farcaster/miniapp-wagmi-connector";
import { truncateAddress } from "@/lib/truncateAddress";

export function MobileHeader() {
  const [context, setContext] = useState<MiniAppContext | null>(null);

  useEffect(() => {
    async function waitForContext() {
      setContext(await sdk.context);
    }

    waitForContext();
  }, []);

  const { address: userAddressData, isConnected, isConnecting } = useAccount();
  const { connect } = useConnect();

  if (!isConnected && !isConnecting) {
    connect({ connector: farcasterMiniApp() });
  }

  return (
    <div className="flex items-center justify-between px-4 py-4">
      <div className="flex items-center gap-3">
        <Avatar className="h-10 w-10 border-2 border-primary">
          <AvatarImage src={context?.user.pfpUrl} />
          <AvatarFallback>{context?.user.username?.charAt(0) ?? "U"}</AvatarFallback>
        </Avatar>
        <div>
          <p className="text-sm text-foreground">@{context?.user.username}</p>
          <p className="text-xs text-muted-foreground">{truncateAddress(userAddressData!, 12)}</p>
        </div>
      </div>
      <button className="flex h-10 w-10 items-center justify-center rounded-full bg-card">
        <img src="/icon.svg" alt="icon" className="h-8 w-8" />
      </button>
    </div>
  );
}
