import { Button } from "@/components/ui/button"
import { ArrowLeft, MoreVertical } from "lucide-react"
import Link from "next/link"

export function CollectibleHeader() {
  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm">
      <div className="container mx-auto flex items-center justify-between px-4 py-4">
        <Link href="/explore">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>

        <Link href="/" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-primary" />
          <span className="text-xl font-bold">Reauction</span>
        </Link>

        <Button variant="ghost" size="icon">
          <MoreVertical className="h-5 w-5" />
        </Button>
      </div>
    </header>
  )
}
