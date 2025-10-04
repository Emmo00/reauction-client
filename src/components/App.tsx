"use client";

import Link from "next/link";
import FaultyTerminal from "@/components/FaultyTerminal";
import { Button } from "@/components/ui/button";
import { ArrowRightIcon, ChevronRight } from "lucide-react";

export default function LandingPage() {
  return (
    <>
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

        <div className="absolute px-4 bottom-8 mb:left-1/2 mb:-translate-x-1/2 md:relative md:top-1/2 md:left-auto md:transform-none md:-translate-y-1/2 mb-8 space-y-4 md:text-center">
          <h1 className="text-balance font-sans text-5xl font-bold leading-tight tracking-tight text-white">
            Resell and Auction
            <br /> Your Cast
            <br />
            Collectibles
          </h1>

          <p className="text-pretty font-sans leading-relaxed text-gray-200">
            Give your collectibles a second life. Earn by reselling or auctioning your Farcaster
            NFTs.
          </p>

          <Link href="/home">
            <Button size="lg" className="h-12 rounded-full px-8 text-base font-semibold">
              Get Started <ChevronRight className="ml-2 h-4 w-4" />
              <ChevronRight className="h-4 w-4 -ml-2" />
              <ChevronRight className="h-4 w-4 -ml-2" />
            </Button>
          </Link>
        </div>
      </main>
    </>
  );
}
