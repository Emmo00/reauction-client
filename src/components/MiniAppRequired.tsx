"use client";

import FaultyTerminal from "@/components/FaultyTerminal";
import { Button } from "@/components/ui/button";
import { ChevronRight, Smartphone } from "lucide-react";

export default function MiniAppRequired() {
  const handleOpenMiniApp = () => {
    window.open("https://farcaster.xyz/miniapps/lsmeGFwc2SiN/reauction", "_blank");
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-background">
      <div className="absolute inset-0">
        <div className="relative h-full w-full opacity-25">
          <FaultyTerminal
            className=""
            style={{}}
            scale={1.5}
            gridMul={[2, 1]}
            digitSize={1.2}
            timeScale={1}
            pause={false}
            scanlineIntensity={1}
            glitchAmount={1}
            flickerAmount={1}
            noiseAmp={1}
            chromaticAberration={0}
            dither={0}
            curvature={0}
            tint="#ae3bb0"
            mouseReact={true}
            mouseStrength={0.5}
            pageLoadAnimation={false}
            brightness={1}
          />
        </div>
      </div>

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4">
        <div className="max-w-md text-center space-y-6">
          <div className="flex justify-center">
            <div className="rounded-full bg-purple-500/20 p-4 backdrop-blur-sm border border-purple-500/20">
              <Smartphone className="h-8 w-8 text-purple-400" />
            </div>
          </div>

          <div className="space-y-4">
            <h1 className="text-3xl font-bold text-white">
              Reauction is a Farcaster Mini App
            </h1>
            <p className="text-gray-300 leading-relaxed">
              Reauction only exists as a mini app on Farcaster for now. To access the full experience 
              and start trading your cast collectibles, please visit us through the Farcaster app.
            </p>
          </div>

          <div className="space-y-4">
            <Button 
              onClick={handleOpenMiniApp}
              size="lg" 
              className="w-full h-12 rounded-full px-8 text-base font-semibold bg-purple-600 hover:bg-purple-700"
            >
              Open Reauction Mini App
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
            
            <p className="text-sm text-gray-400">
              This will open Farcaster where you can access the Reauction mini app
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}