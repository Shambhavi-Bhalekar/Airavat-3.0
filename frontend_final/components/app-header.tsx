"use client"

import { Bell, Search, Globe, Wifi, WifiOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface AppHeaderProps {
  title: string
  subtitle?: string
  syncStatus?: 'online' | 'offline' | 'syncing'
  lastSync?: string
}

const languages = [
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'हिन्दी' },
  { code: 'mr', name: 'मराठी' },
  { code: 'bn', name: 'বাংলা' },
  { code: 'te', name: 'తెలుగు' },
  { code: 'ta', name: 'தமிழ்' },
]

export function AppHeader({ title, subtitle, syncStatus = 'online', lastSync }: AppHeaderProps) {
  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-white px-6">
      <div className="flex flex-col">
        <h1 className="text-lg font-semibold text-[#1B3A6B]">{title}</h1>
        {subtitle && (
          <p className="text-sm text-[#5A6A7A]">{subtitle}</p>
        )}
      </div>

      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#5A6A7A]" />
          <Input
            placeholder="Search cases, prisoners..."
            className="w-64 bg-[#F5F3EE] pl-9 border-[#D4D0C5] focus:border-[#1B3A6B]"
          />
        </div>

        {/* Sync Status */}
        <div className="flex items-center gap-2 rounded-lg bg-[#F5F3EE] px-3 py-1.5 border border-[#D4D0C5]">
          {syncStatus === 'online' ? (
            <Wifi className="h-4 w-4 text-[#166534]" />
          ) : syncStatus === 'syncing' ? (
            <Wifi className="h-4 w-4 animate-pulse text-[#B45309]" />
          ) : (
            <WifiOff className="h-4 w-4 text-[#B91C1C]" />
          )}
          <span className="text-xs text-[#5A6A7A]">
            {syncStatus === 'online' ? 'Synced' : syncStatus === 'syncing' ? 'Syncing...' : 'Offline'}
          </span>
          {lastSync && syncStatus === 'online' && (
            <span className="text-xs text-[#5A6A7A]">
              {lastSync}
            </span>
          )}
        </div>

        {/* Language Selector */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9 text-[#1B3A6B] hover:bg-[#F5F3EE]">
              <Globe className="h-4 w-4" />
              <span className="sr-only">Select language</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-white border-[#D4D0C5]">
            {languages.map((lang) => (
              <DropdownMenuItem key={lang.code} className="text-[#1B3A6B]">
                {lang.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative h-9 w-9 text-[#1B3A6B] hover:bg-[#F5F3EE]">
          <Bell className="h-4 w-4" />
          <span className="absolute right-1.5 top-1.5 flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#C9A84C] opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-[#C9A84C]"></span>
          </span>
          <span className="sr-only">Notifications</span>
        </Button>
      </div>
    </header>
  )
}
