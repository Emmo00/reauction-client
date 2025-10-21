import { Grid3x3 } from "lucide-react";
import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import sdk from "@farcaster/miniapp-sdk";
import { MiniAppContext } from "@farcaster/miniapp-core/dist/context";
import { useAccount } from "wagmi";
import { useCollectibleStatus } from "@/queries/useCollectibleStatus";

export function MobileHeader() {
  const [context, setContext] = useState<MiniAppContext | null>(null);

  useEffect(() => {
    async function waitForContext() {
      setContext(await sdk.context);
    }

    waitForContext();
  }, []);

  const { address: userAddressData, isConnected } = useAccount();

  // Get the collectible status using the wallet address
  const {
    status,
    loading: statusLoading,
    error: statusError,
  } = useCollectibleStatus(userAddressData || undefined);

  return (
    <div className="flex items-center justify-between px-4 py-4">
      <div className="flex items-center gap-3">
        <Avatar className="h-10 w-10 border-2 border-primary">
          <AvatarImage src={context?.user.pfpUrl} />
          <AvatarFallback>{context?.user.username?.charAt(0) ?? "U"}</AvatarFallback>
        </Avatar>
        <div>
          <p className="text-sm font-semibold text-foreground">{context?.user.displayName}</p>
          <p className="text-xs text-muted-foreground">{status?.castsSold} Sold</p>
        </div>
      </div>
      <button className="flex h-10 w-10 items-center justify-center rounded-full bg-card">
        {/* <Grid3x3 className="h-5 w-5" /> */}
      </button>
    </div>
  );
}
