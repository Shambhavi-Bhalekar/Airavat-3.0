"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Building2,
  FileText,
  BarChart3,
  Bell,
  Settings,
  Scale,
  Shield,
  Clock,
  UserCheck,
  MessageSquare,
  FilePlus,
  X,
  Menu,
  LogOut,
} from "lucide-react"

interface NavItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge?: number
}

const paralegalNav: NavItem[] = [
  { title: "Dashboard", href: "/paralegal", icon: LayoutDashboard },
  { title: "New Case Entry", href: "/paralegal/case-entry", icon: FilePlus },
]

const coordinatorNav: NavItem[] = [
  { title: "Dashboard", href: "/coordinator", icon: LayoutDashboard },
]

interface AppSidebarProps {
  role: "paralegal" | "coordinator"
  alerts?: number
}

function SidebarContent({
  role,
  alerts,
  onClose,
}: AppSidebarProps & { onClose?: () => void }) {
  const pathname = usePathname()
  const navItems = role === "paralegal" ? paralegalNav : coordinatorNav

  return (
    <aside className="flex h-full w-64 flex-col bg-[#1B3A6B] text-white border-r border-[#2A4A7B]">
      {/* Logo */}
      <div className="flex h-16 items-center justify-between border-b border-[#2A4A7B] px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#C9A84C]">
            <Shield className="h-5 w-5 text-[#1B3A6B]" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold tracking-tight text-white">
              JusticeGrid
            </span>
            <span className="text-xs text-white/70">
              {role === "paralegal" ? "Paralegal Workstation" : "UTRC Coordinator"}
            </span>
          </div>
        </div>
        {/* Close button visible only on mobile */}
        {onClose && (
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-white/70 hover:bg-[#2A4A7B] hover:text-white transition-colors lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto p-4">
        <div className="mb-2 px-3 text-xs font-medium uppercase tracking-wider text-white/50">
          Main Menu
        </div>
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== `/${role}` && pathname.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-[#2A4A7B] text-white"
                  : "text-white/70 hover:bg-[#2A4A7B]/50 hover:text-white"
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              <span className="flex-1">{item.title}</span>
              {item.badge && (
                <span
                  className={cn(
                    "flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-medium",
                    isActive
                      ? "bg-[#C9A84C] text-[#1B3A6B]"
                      : "bg-[#2A4A7B] text-white/70"
                  )}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          )
        })}


      </nav>

      {/* Footer */}
      <div className="border-t border-[#2A4A7B] p-4">
        <div className="flex items-center gap-3 rounded-lg bg-[#2A4A7B]/50 px-3 py-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#C9A84C] text-[#1B3A6B] text-sm font-medium">
            {role === "paralegal" ? "PK" : "SC"}
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-sm font-medium text-white truncate">
              {role === "paralegal" ? "Priya Kumari" : "Suresh Chandra"}
            </span>
            <span className="text-xs text-white/70 truncate">
              {role === "paralegal" ? "DLSA Lucknow" : "UTRC Coordinator"}
            </span>
          </div>
          <Link
            href="/login"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-white/70 hover:bg-[#1B3A6B] hover:text-white transition-colors"
            title="Log Out"
          >
            <LogOut className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </aside>
  )
}

export function AppSidebar({ role, alerts = 0 }: AppSidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      {/* Mobile hamburger trigger — shown as a floating button, used from AppHeader */}
      {/* Desktop: always visible */}
      <div className="hidden lg:flex h-screen shrink-0">
        <SidebarContent role={role} alerts={alerts} />
      </div>

      {/* Mobile: drawer overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileOpen(false)}
          />
          {/* Drawer */}
          <div className="absolute left-0 top-0 h-full">
            <SidebarContent
              role={role}
              alerts={alerts}
              onClose={() => setMobileOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Mobile hamburger button (fixed to top-left when sidebar is closed) */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed left-4 top-4 z-40 flex h-10 w-10 items-center justify-center rounded-lg bg-[#1B3A6B] text-white shadow-lg lg:hidden"
        aria-label="Open sidebar"
      >
        <Menu className="h-5 w-5" />
      </button>
    </>
  )
}
