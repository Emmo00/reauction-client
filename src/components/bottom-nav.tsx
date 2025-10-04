"use client"

import { Home, Plus, Trophy, User } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

export function BottomNav() {
  const pathname = usePathname()

  const navItems = [
    { icon: Home, label: "Home", href: "/home" },
    { icon: Plus, label: "Create", href: "/create", isSpecial: true },
    { icon: Trophy, label: "Leaderboard", href: "/leaderboard" },
    { icon: User, label: "Profile", href: "/profile/me" },
  ]

  return (
    <nav className="fixed bottom-4 left-4 right-4 z-50">
      <div className="glass mx-auto max-w-md rounded-3xl px-6 py-3">
        <div className="flex items-center justify-around">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href

            if (item.isSpecial) {
              return (
                <Link key={item.href} href={item.href}>
                  <button className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-110">
                    <Icon className="h-6 w-6" />
                  </button>
                </Link>
              )
            }

            return (
              <Link key={item.href} href={item.href}>
                <button
                  className={cn(
                    "flex h-12 w-12 items-center justify-center rounded-full transition-colors",
                    isActive ? "text-primary" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <Icon className="h-6 w-6" />
                </button>
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
