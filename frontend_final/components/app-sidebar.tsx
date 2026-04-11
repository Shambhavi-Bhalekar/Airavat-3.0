"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Users,
  Building2,
  FileText,
  BarChart3,
  Bell,
  Settings,
  Scale,
  Shield,
  AlertTriangle,
  Clock,
  UserCheck,
  MessageSquare,
  FilePlus,
} from "lucide-react"

interface NavItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge?: number
}

const paralegalNav: NavItem[] = [
  { title: "Dashboard", href: "/paralegal", icon: LayoutDashboard },
  { title: "Case Queue", href: "/paralegal/case-queue", icon: Scale, badge: 187 },
  { title: "Window Closing", href: "/paralegal/window-closing", icon: Clock, badge: 45 },
  { title: "Lawyer Review", href: "/paralegal/lawyer-review", icon: UserCheck, badge: 23 },
  { title: "Family Updates", href: "/paralegal/family-updates", icon: MessageSquare },
  { title: "New Case Entry", href: "/paralegal/case-entry", icon: FilePlus },
]

const coordinatorNav: NavItem[] = [
  { title: "Dashboard", href: "/coordinator", icon: LayoutDashboard },
  { title: "Prison View", href: "/coordinator/prison-view", icon: Building2 },
  { title: "Analytics", href: "/coordinator/analytics", icon: BarChart3 },
  { title: "Reports", href: "/coordinator/reports", icon: FileText },
]

interface AppSidebarProps {
  role: 'paralegal' | 'coordinator'
  alerts?: number
}

export function AppSidebar({ role, alerts = 0 }: AppSidebarProps) {
  const pathname = usePathname()
  const navItems = role === 'paralegal' ? paralegalNav : coordinatorNav

  return (
    <aside className="flex h-screen w-64 flex-col bg-[#1B3A6B] text-white border-r border-[#2A4A7B]">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b border-[#2A4A7B] px-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#C9A84C]">
          <Shield className="h-5 w-5 text-[#1B3A6B]" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-semibold tracking-tight text-white">JusticeGrid</span>
          <span className="text-xs text-white/70">
            {role === 'paralegal' ? 'Paralegal Workstation' : 'UTRC Coordinator'}
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto p-4">
        <div className="mb-2 px-3 text-xs font-medium uppercase tracking-wider text-white/50">
          Main Menu
        </div>
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== `/${role}` && pathname.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
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
                <span className={cn(
                  "flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-medium",
                  isActive 
                    ? "bg-[#C9A84C] text-[#1B3A6B]" 
                    : "bg-[#2A4A7B] text-white/70"
                )}>
                  {item.badge}
                </span>
              )}
            </Link>
          )
        })}

        <div className="mb-2 mt-6 px-3 text-xs font-medium uppercase tracking-wider text-white/50">
          System
        </div>
        <Link
          href={`/${role}/alerts`}
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
            pathname.includes('/alerts')
              ? "bg-[#2A4A7B] text-white"
              : "text-white/70 hover:bg-[#2A4A7B]/50 hover:text-white"
          )}
        >
          <Bell className="h-4 w-4 shrink-0" />
          <span className="flex-1">Alerts</span>
          {alerts > 0 && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#B91C1C] px-1.5 text-xs font-medium text-white">
              {alerts}
            </span>
          )}
        </Link>
        <Link
          href={`/${role}/settings`}
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
            pathname.includes('/settings')
              ? "bg-[#2A4A7B] text-white"
              : "text-white/70 hover:bg-[#2A4A7B]/50 hover:text-white"
          )}
        >
          <Settings className="h-4 w-4 shrink-0" />
          <span className="flex-1">Settings</span>
        </Link>
      </nav>

      {/* Footer */}
      <div className="border-t border-[#2A4A7B] p-4">
        <div className="flex items-center gap-3 rounded-lg bg-[#2A4A7B]/50 px-3 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#C9A84C] text-[#1B3A6B] text-sm font-medium">
            {role === 'paralegal' ? 'PK' : 'SC'}
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-white">
              {role === 'paralegal' ? 'Priya Kumari' : 'Suresh Chandra'}
            </span>
            <span className="text-xs text-white/70">
              {role === 'paralegal' ? 'DLSA Lucknow' : 'UTRC Coordinator'}
            </span>
          </div>
        </div>
      </div>
    </aside>
  )
}
