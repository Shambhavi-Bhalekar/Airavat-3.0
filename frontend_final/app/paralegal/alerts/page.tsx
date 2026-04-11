"use client"

import { useState } from "react"
import { AppHeader } from "@/components/app-header"
import { AlertCard } from "@/components/alert-card"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { mockAlerts } from "@/lib/mock-data"
import type { SystemAlert } from "@/lib/types"
import {
  Bell,
  BellOff,
  CheckCheck,
  AlertTriangle,
  Clock,
  Shield,
  User,
  Scale,
  Filter,
  TrendingDown,
  ChevronDown,
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const alertTypeConfig: Record<SystemAlert["type"], { icon: React.ComponentType<{ className?: string }>; color: string; bg: string; label: string }> = {
  eligibility_window: { icon: Scale, color: "text-[#166534]", bg: "bg-[#166534]/10", label: "Eligibility Window" },
  stale_data: { icon: Clock, color: "text-[#B45309]", bg: "bg-[#B45309]/10", label: "Stale Data" },
  family_notification: { icon: User, color: "text-[#1B3A6B]", bg: "bg-[#1B3A6B]/10", label: "Family Notification" },
  surety_blocked: { icon: Shield, color: "text-[#7C3AED]", bg: "bg-[#7C3AED]/10", label: "Surety Blocked" },
  court_pattern: { icon: AlertTriangle, color: "text-[#B91C1C]", bg: "bg-[#B91C1C]/10", label: "Court Pattern" },
}

const severityConfig: Record<SystemAlert["severity"], { label: string; color: string; bg: string }> = {
  critical: { label: "Critical", color: "text-[#B91C1C]", bg: "bg-[#B91C1C]" },
  warning: { label: "Warning", color: "text-[#B45309]", bg: "bg-[#B45309]" },
  info: { label: "Info", color: "text-[#1B3A6B]", bg: "bg-[#1B3A6B]" },
}

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<SystemAlert[]>(mockAlerts)
  const [filterSeverity, setFilterSeverity] = useState<"all" | SystemAlert["severity"]>("all")
  const [filterType, setFilterType] = useState<"all" | SystemAlert["type"]>("all")
  const [showAcknowledged, setShowAcknowledged] = useState(false)

  const handleAcknowledge = (id: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, acknowledged: true } : a))
  }

  const handleAcknowledgeAll = () => {
    setAlerts(prev => prev.map(a => ({ ...a, acknowledged: true })))
  }

  const filtered = alerts.filter(a => {
    if (!showAcknowledged && a.acknowledged) return false
    if (filterSeverity !== "all" && a.severity !== filterSeverity) return false
    if (filterType !== "all" && a.type !== filterType) return false
    return true
  })

  const unacknowledgedCount = alerts.filter(a => !a.acknowledged).length
  const criticalCount = alerts.filter(a => a.severity === "critical" && !a.acknowledged).length
  const warningCount = alerts.filter(a => a.severity === "warning" && !a.acknowledged).length

  return (
    <div className="flex flex-col min-h-screen bg-[#F5F3EE]">
      <AppHeader
        title="Alerts"
        subtitle={`${unacknowledgedCount} active alerts requiring attention`}
        syncStatus="online"
        lastSync="1 min ago"
      />

      <div className="flex-1 p-6 space-y-6">
        {/* Alert Summary */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card
            className={cn(
              "bg-white border-[#D4D0C5] cursor-pointer transition-all hover:shadow-sm",
              filterSeverity === "all" && filterType === "all" && "ring-2 ring-[#1B3A6B]"
            )}
            onClick={() => { setFilterSeverity("all"); setFilterType("all") }}
          >
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1B3A6B]/10">
                <Bell className="h-5 w-5 text-[#1B3A6B]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#1B3A6B]">{unacknowledgedCount}</p>
                <p className="text-xs text-[#5A6A7A]">Active Alerts</p>
              </div>
            </CardContent>
          </Card>
          <Card
            className={cn(
              "bg-white border-[#D4D0C5] cursor-pointer transition-all hover:shadow-sm",
              filterSeverity === "critical" && "ring-2 ring-[#B91C1C]"
            )}
            onClick={() => setFilterSeverity(filterSeverity === "critical" ? "all" : "critical")}
          >
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#B91C1C]/10">
                <AlertTriangle className="h-5 w-5 text-[#B91C1C]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#B91C1C]">{criticalCount}</p>
                <p className="text-xs text-[#5A6A7A]">Critical</p>
              </div>
            </CardContent>
          </Card>
          <Card
            className={cn(
              "bg-white border-[#D4D0C5] cursor-pointer transition-all hover:shadow-sm",
              filterSeverity === "warning" && "ring-2 ring-[#B45309]"
            )}
            onClick={() => setFilterSeverity(filterSeverity === "warning" ? "all" : "warning")}
          >
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#B45309]/10">
                <Clock className="h-5 w-5 text-[#B45309]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#B45309]">{warningCount}</p>
                <p className="text-xs text-[#5A6A7A]">Warnings</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white border-[#D4D0C5]">
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#166534]/10">
                <TrendingDown className="h-5 w-5 text-[#166534]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#166534]">{alerts.filter(a => a.acknowledged).length}</p>
                <p className="text-xs text-[#5A6A7A]">Acknowledged</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Alert Type Legend */}
        <Card className="bg-white border-[#D4D0C5]">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-[#1B3A6B]">Alert Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {Object.entries(alertTypeConfig).map(([type, cfg]) => {
                const Icon = cfg.icon
                const count = alerts.filter(a => a.type === type && !a.acknowledged).length
                return (
                  <button
                    key={type}
                    onClick={() => setFilterType(filterType === type ? "all" : type as SystemAlert["type"])}
                    className={cn(
                      "flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium border transition-all",
                      filterType === type
                        ? "bg-[#1B3A6B] text-white border-[#1B3A6B]"
                        : `${cfg.bg} ${cfg.color} border-transparent hover:border-current`
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {cfg.label}
                    <span className={cn(
                      "rounded-full px-1.5 py-0.5 text-xs",
                      filterType === type ? "bg-white/20" : "bg-white/50"
                    )}>
                      {count}
                    </span>
                  </button>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Main Alerts List */}
        <div className="space-y-4">
          {/* Toolbar */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-[#1B3A6B]">
                {filtered.length} {showAcknowledged ? "total" : "active"} alerts
              </span>
              <button
                onClick={() => setShowAcknowledged(!showAcknowledged)}
                className={cn(
                  "text-xs rounded-full px-2.5 py-1 transition-colors",
                  showAcknowledged
                    ? "bg-[#1B3A6B] text-white"
                    : "bg-[#E8E5DC] text-[#5A6A7A] hover:bg-[#D4D0C5]"
                )}
              >
                {showAcknowledged ? "Hiding resolved" : "Show resolved"}
              </button>
            </div>
            {unacknowledgedCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                className="gap-2 border-[#D4D0C5] text-[#166534] hover:bg-[#166534]/10"
                onClick={handleAcknowledgeAll}
              >
                <CheckCheck className="h-3.5 w-3.5" />
                Acknowledge All
              </Button>
            )}
          </div>

          {/* Critical Alerts First */}
          {filtered.filter(a => a.severity === "critical").length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-[#B91C1C] animate-pulse" />
                <p className="text-xs font-semibold uppercase tracking-wider text-[#B91C1C]">Critical – Immediate Action Required</p>
              </div>
              <div className="space-y-2">
                {filtered.filter(a => a.severity === "critical").map(alert => (
                  <div key={alert.id} className="rounded-xl border border-[#B91C1C]/30 overflow-hidden">
                    <AlertCard alert={alert} onAcknowledge={() => handleAcknowledge(alert.id)} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Warning Alerts */}
          {filtered.filter(a => a.severity === "warning").length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-[#B45309]" />
                <p className="text-xs font-semibold uppercase tracking-wider text-[#B45309]">Warnings</p>
              </div>
              <div className="space-y-2">
                {filtered.filter(a => a.severity === "warning").map(alert => (
                  <AlertCard key={alert.id} alert={alert} onAcknowledge={() => handleAcknowledge(alert.id)} />
                ))}
              </div>
            </div>
          )}

          {/* Info Alerts */}
          {filtered.filter(a => a.severity === "info").length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-[#1B3A6B]" />
                <p className="text-xs font-semibold uppercase tracking-wider text-[#5A6A7A]">Informational</p>
              </div>
              <div className="space-y-2">
                {filtered.filter(a => a.severity === "info").map(alert => (
                  <AlertCard key={alert.id} alert={alert} onAcknowledge={() => handleAcknowledge(alert.id)} />
                ))}
              </div>
            </div>
          )}

          {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <BellOff className="h-12 w-12 text-[#D4D0C5] mb-4" />
              <p className="text-[#1B3A6B] font-medium">No alerts match the current filters</p>
              <p className="text-sm text-[#5A6A7A] mt-1">All critical items have been addressed</p>
            </div>
          )}
        </div>

        {/* Notification Settings Card */}
        <Card className="bg-white border-[#D4D0C5]">
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-[#1B3A6B] flex items-center gap-2">
              <Bell className="h-4 w-4 text-[#C9A84C]" />
              Notification Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            {[
              { label: "Eligibility window opening (≤7 days)", checked: true },
              { label: "Data stale alerts (≥48h)", checked: true },
              { label: "Family notification failures", checked: false },
              { label: "Surety barrier alerts", checked: true },
              { label: "Court pattern anomalies", checked: false },
              { label: "Critical priority case updates", checked: true },
            ].map(item => (
              <label key={item.label} className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  defaultChecked={item.checked}
                  className="h-4 w-4 accent-[#1B3A6B]"
                />
                <span className="text-sm text-[#5A6A7A] group-hover:text-[#1B3A6B] transition-colors">{item.label}</span>
              </label>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
