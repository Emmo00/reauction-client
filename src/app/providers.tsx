"use client";

import dynamic from "next/dynamic";
import { MiniAppProvider } from "@neynar/react";
import { ReactQueryProvider } from "@/components/providers/ReactQueryProvider";
import { ANALYTICS_ENABLED, RETURN_URL } from "@/lib/constants";

const WagmiProvider = dynamic(() => import("@/components/providers/WagmiProvider"), {
  ssr: false,
});

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ReactQueryProvider>
      <WagmiProvider>
        <MiniAppProvider
          analyticsEnabled={ANALYTICS_ENABLED}
          backButtonEnabled={true}
          returnUrl={RETURN_URL}
        >
          {children}
        </MiniAppProvider>
      </WagmiProvider>
    </ReactQueryProvider>
  );
}
