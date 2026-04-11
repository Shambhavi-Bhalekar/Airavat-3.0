"use client"

import { Wifi, WifiOff, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"

interface AppHeaderProps {
  title: string
  subtitle?: string
  syncStatus?: "online" | "offline" | "syncing"
  lastSync?: string
  onMenuClick?: () => void
}

export function AppHeader({
  title,
  subtitle,
  syncStatus = "online",
  lastSync,
}: AppHeaderProps) {
  return (
    <header className="flex h-14 sm:h-16 items-center justify-between border-b border-border bg-white px-4 sm:px-6 gap-2">
      {/* Title — pushed right on mobile to leave space for the fixed hamburger */}
      <div className="flex flex-col min-w-0 pl-12 lg:pl-0">
        <h1 className="text-base sm:text-lg font-semibold text-[#1B3A6B] truncate">
          {title}
        </h1>
        {subtitle && (
          <p className="text-xs sm:text-sm text-[#5A6A7A] truncate hidden sm:block">
            {subtitle}
          </p>
        )}
      </div>

      <div className="flex items-center gap-2 sm:gap-4 shrink-0">
        {/* Sync Status — compact on mobile */}
        <div className="flex items-center gap-1.5 rounded-lg bg-[#F5F3EE] px-2 sm:px-3 py-1.5 border border-[#D4D0C5]">
          {syncStatus === "online" ? (
            <Wifi className="h-3.5 w-3.5 text-[#166534]" />
          ) : syncStatus === "syncing" ? (
            <Wifi className="h-3.5 w-3.5 animate-pulse text-[#B45309]" />
          ) : (
            <WifiOff className="h-3.5 w-3.5 text-[#B91C1C]" />
          )}
          <span className="text-xs text-[#5A6A7A] hidden sm:inline">
            {syncStatus === "online"
              ? "Synced"
              : syncStatus === "syncing"
              ? "Syncing..."
              : "Offline"}
          </span>
          {lastSync && syncStatus === "online" && (
            <span className="text-xs text-[#5A6A7A] hidden lg:inline">
              {lastSync}
            </span>
          )}
        </div>


      </div>
    </header>
  )
}
