import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function LandingPage() {
  return (
    <>
      <main className="relative min-h-screen overflow-hidden bg-background">
        <div className="absolute inset-0 opacity-20">
          <div className="grid grid-cols-3 gap-3 p-4">
            {[
              "/abstract-nft-purple.png",
              "/digital-art-collectible-blue.jpg",
              "/nft-collectible-green.jpg",
              "/crypto-art-orange.jpg",
              "/abstract-nft-purple.png",
              "/digital-art-collectible-blue.jpg",
              "/nft-collectible-green.jpg",
              "/crypto-art-orange.jpg",
              "/abstract-nft-purple.png",
            ].map((img, i) => (
              <div key={i} className="aspect-square overflow-hidden rounded-2xl">
                <img
                  src={img || "/placeholder.svg"}
                  alt=""
                  className="h-full w-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 py-16 text-center">
          <h1 className="mb-4 text-balance text-4xl font-bold leading-tight text-foreground">
            Exclusive
            <br />
            Digital
            <br />
            Collectibles
          </h1>

          <p className="mb-8 max-w-xs text-pretty text-sm text-muted-foreground">
            NFT has a value that can be called an asset that has a unique code.
          </p>

          <Link href="/home">
            <Button size="lg" className="h-12 rounded-full px-8 text-base font-semibold">
              Get Started
              <span className="ml-2">→</span>
            </Button>
          </Link>
        </div>
      </main>
    </>
  );
}
