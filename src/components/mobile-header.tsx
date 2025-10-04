import { Grid3x3 } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function MobileHeader() {
  return (
    <div className="flex items-center justify-between px-4 py-4">
      <div className="flex items-center gap-3">
        <Avatar className="h-10 w-10 border-2 border-primary">
          <AvatarImage src="/placeholder.svg?height=40&width=40" />
          <AvatarFallback>HP</AvatarFallback>
        </Avatar>
        <div>
          <p className="text-sm font-semibold text-foreground">Halo Pamaddog</p>
          <p className="text-xs text-muted-foreground">0 Upload</p>
        </div>
      </div>
      <button className="flex h-10 w-10 items-center justify-center rounded-full bg-card">
        {/* <Grid3x3 className="h-5 w-5" /> */}
      </button>
    </div>
  )
}
