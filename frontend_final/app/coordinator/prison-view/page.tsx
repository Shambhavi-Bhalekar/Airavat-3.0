"use client"

import { useState } from "react"
import { AppHeader } from "@/components/app-header"
import { PrisonCard } from "@/components/prison-card"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { mockPrisonSummaries } from "@/lib/mock-data"
import type { PrisonSummary } from "@/lib/types"
import {
  Building2,
  Search,
  MapPin,
  Users,
  Scale,
  Clock,
  AlertTriangle,
  TrendingUp,
  Download,
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
  RefreshCw,
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type SortKey = "name" | "eligible" | "total" | "window" | "avgDetention"

const sortOptions: { key: SortKey; label: string }[] = [
  { key: "eligible", label: "Eligible Count (High → Low)" },
  { key: "total", label: "Total Undertrials" },
  { key: "window", label: "Window Closing" },
  { key: "avgDetention", label: "Avg Detention Duration" },
  { key: "name", label: "Prison Name (A → Z)" },
]

function PrisonDetailRow({ prison }: { prison: PrisonSummary }) {
  const [expanded, setExpanded] = useState(false)
  const eligiblePct = Math.round((prison.eligibleUndertrials / prison.totalUndertrials) * 100)
  const pendingPct = Math.round((prison.pendingActions / prison.eligibleUndertrials) * 100)

  return (
    <div className={cn(
      "rounded-xl border bg-white transition-all",
      expanded ? "border-[#C9A84C] shadow-sm" : "border-[#D4D0C5] hover:border-[#C9A84C]/50"
    )}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-4 p-4 text-left"
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#1B3A6B]/10">
          <Building2 className="h-5 w-5 text-[#1B3A6B]" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-semibold text-[#1B3A6B]">{prison.prisonName}</p>
            <span className="flex items-center gap-1 text-xs text-[#5A6A7A]">
              <MapPin className="h-3 w-3" />
              {prison.district}
            </span>
          </div>
          <div className="mt-1 flex items-center gap-1.5">
            <div className="flex-1 max-w-48">
              <Progress value={eligiblePct} className="h-1.5" />
            </div>
            <span className="text-xs text-[#5A6A7A]">{eligiblePct}% eligible</span>
          </div>
        </div>
        <div className="flex gap-6 items-center shrink-0">
          <div className="text-center hidden md:block">
            <p className="text-lg font-bold text-[#1B3A6B]">{prison.totalUndertrials.toLocaleString()}</p>
            <p className="text-xs text-[#5A6A7A]">Total</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-[#166534]">{prison.eligibleUndertrials}</p>
            <p className="text-xs text-[#5A6A7A]">Eligible</p>
          </div>
          <div className="text-center hidden md:block">
            <p className="text-lg font-bold text-[#B45309]">{prison.windowClosingCount}</p>
            <p className="text-xs text-[#5A6A7A]">Window</p>
          </div>
          <div className="text-center hidden lg:block">
            <p className="text-lg font-bold text-[#1B3A6B]">{prison.pendingActions}</p>
            <p className="text-xs text-[#5A6A7A]">Pending</p>
          </div>
          {expanded ? (
            <ChevronUp className="h-4 w-4 text-[#5A6A7A] shrink-0" />
          ) : (
            <ChevronDown className="h-4 w-4 text-[#5A6A7A] shrink-0" />
          )}
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-4 border-t border-[#E8E5DC] pt-4 space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-lg bg-[#F5F3EE] p-3 space-y-1">
              <p className="text-xs text-[#5A6A7A]">Eligibility Rate</p>
              <div className="flex items-end gap-2">
                <span className="text-2xl font-bold text-[#166534]">{eligiblePct}%</span>
                <span className="text-xs text-[#5A6A7A] mb-1">of undertrials</span>
              </div>
              <Progress value={eligiblePct} className="h-1.5" />
            </div>
            <div className="rounded-lg bg-[#F5F3EE] p-3 space-y-1">
              <p className="text-xs text-[#5A6A7A]">Actions Pending</p>
              <div className="flex items-end gap-2">
                <span className="text-2xl font-bold text-[#B45309]">{pendingPct}%</span>
                <span className="text-xs text-[#5A6A7A] mb-1">of eligible cases</span>
              </div>
              <Progress value={pendingPct} className="h-1.5" />
            </div>
            <div className="rounded-lg bg-[#F5F3EE] p-3 space-y-1">
              <p className="text-xs text-[#5A6A7A]">Avg Detention</p>
              <div className="flex items-end gap-2">
                <span className="text-2xl font-bold text-[#1B3A6B]">{prison.avgDetentionDays}</span>
                <span className="text-xs text-[#5A6A7A] mb-1">days</span>
              </div>
              <p className="text-xs text-[#5A6A7A]">{Math.round(prison.avgDetentionDays / 30)} months avg</p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Button size="sm" className="bg-[#1B3A6B] hover:bg-[#2A4A7B] gap-1.5 text-xs">
              <Scale className="h-3.5 w-3.5" />
              View Eligible Cases
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5 border-[#D4D0C5] text-[#1B3A6B] hover:bg-[#E8E5DC] text-xs">
              <AlertTriangle className="h-3.5 w-3.5" />
              Window Closing ({prison.windowClosingCount})
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5 border-[#D4D0C5] text-[#1B3A6B] hover:bg-[#E8E5DC] text-xs">
              <Download className="h-3.5 w-3.5" />
              Export Report
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function PrisonViewPage() {
  const [search, setSearch] = useState("")
  const [sortBy, setSortBy] = useState<SortKey>("eligible")
  const [viewMode, setViewMode] = useState<"cards" | "table">("table")

  const totalUndertrials = mockPrisonSummaries.reduce((s, p) => s + p.totalUndertrials, 0)
  const totalEligible = mockPrisonSummaries.reduce((s, p) => s + p.eligibleUndertrials, 0)
  const totalWindow = mockPrisonSummaries.reduce((s, p) => s + p.windowClosingCount, 0)
  const totalPending = mockPrisonSummaries.reduce((s, p) => s + p.pendingActions, 0)
  const overallEligiblePct = Math.round((totalEligible / totalUndertrials) * 100)

  const filtered = mockPrisonSummaries
    .filter(p =>
      !search ||
      p.prisonName.toLowerCase().includes(search.toLowerCase()) ||
      p.district.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === "name") return a.prisonName.localeCompare(b.prisonName)
      if (sortBy === "total") return b.totalUndertrials - a.totalUndertrials
      if (sortBy === "window") return b.windowClosingCount - a.windowClosingCount
      if (sortBy === "avgDetention") return b.avgDetentionDays - a.avgDetentionDays
      return b.eligibleUndertrials - a.eligibleUndertrials
    })

  return (
    <div className="flex flex-col min-h-screen bg-[#F5F3EE]">
      <AppHeader
        title="Prison View"
        subtitle={`${mockPrisonSummaries.length} prisons monitored across Uttar Pradesh`}
        syncStatus="online"
        lastSync="3 min ago"
      />

      <div className="flex-1 p-6 space-y-6">
        {/* District Summary Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-white border-[#D4D0C5]">
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#1B3A6B]/10">
                <Users className="h-5 w-5 text-[#1B3A6B]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#1B3A6B]">{totalUndertrials.toLocaleString()}</p>
                <p className="text-xs text-[#5A6A7A]">Total Undertrials</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white border-[#D4D0C5]">
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#166534]/10">
                <Scale className="h-5 w-5 text-[#166534]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#166534]">{totalEligible.toLocaleString()}</p>
                <p className="text-xs text-[#5A6A7A]">{overallEligiblePct}% Section 479 Eligible</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white border-[#D4D0C5]">
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#B45309]/10">
                <Clock className="h-5 w-5 text-[#B45309]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#B45309]">{totalWindow}</p>
                <p className="text-xs text-[#5A6A7A]">Window Closing (30d)</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white border-[#D4D0C5]">
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#B91C1C]/10">
                <AlertTriangle className="h-5 w-5 text-[#B91C1C]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#B91C1C]">{totalPending}</p>
                <p className="text-xs text-[#5A6A7A]">Actions Pending</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* District Eligibility Overview */}
        <Card className="bg-white border-[#D4D0C5]">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base text-[#1B3A6B] flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-[#C9A84C]" />
                Eligibility by Prison
              </CardTitle>
              <Button variant="outline" size="sm" className="gap-2 border-[#D4D0C5] text-[#1B3A6B] hover:bg-[#E8E5DC]">
                <Download className="h-3 w-3" />
                Export
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockPrisonSummaries.slice(0, 5).map(p => {
                const pct = Math.round((p.eligibleUndertrials / p.totalUndertrials) * 100)
                return (
                  <div key={p.prisonName} className="flex items-center gap-3">
                    <div className="w-40 shrink-0">
                      <p className="text-sm font-medium text-[#1B3A6B] truncate" title={p.prisonName}>
                        {p.prisonName.split(",")[0]}
                      </p>
                      <p className="text-xs text-[#5A6A7A]">{p.district}</p>
                    </div>
                    <div className="flex-1">
                      <Progress value={pct} className="h-2.5" />
                    </div>
                    <div className="w-28 text-right shrink-0">
                      <span className="text-sm font-semibold text-[#166534]">{p.eligibleUndertrials}</span>
                      <span className="text-xs text-[#5A6A7A]"> / {p.totalUndertrials} ({pct}%)</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Prison List */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#5A6A7A]" />
              <Input
                placeholder="Search prison or district..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9 bg-white border-[#D4D0C5] focus:border-[#1B3A6B]"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 border-[#D4D0C5] text-[#1B3A6B] hover:bg-[#E8E5DC]">
                  <SlidersHorizontal className="h-3.5 w-3.5" />
                  Sort
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-white border-[#D4D0C5]">
                {sortOptions.map(opt => (
                  <DropdownMenuItem
                    key={opt.key}
                    onClick={() => setSortBy(opt.key)}
                    className={cn("text-[#1B3A6B]", sortBy === opt.key && "font-semibold bg-[#F5F3EE]")}
                  >
                    {opt.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <div className="flex items-center rounded-lg border border-[#D4D0C5] bg-white overflow-hidden">
              <button
                onClick={() => setViewMode("table")}
                className={cn(
                  "px-3 py-1.5 text-xs font-medium transition-colors",
                  viewMode === "table" ? "bg-[#1B3A6B] text-white" : "text-[#5A6A7A] hover:bg-[#E8E5DC]"
                )}
              >
                Detailed
              </button>
              <button
                onClick={() => setViewMode("cards")}
                className={cn(
                  "px-3 py-1.5 text-xs font-medium transition-colors",
                  viewMode === "cards" ? "bg-[#1B3A6B] text-white" : "text-[#5A6A7A] hover:bg-[#E8E5DC]"
                )}
              >
                Cards
              </button>
            </div>
            <Button variant="ghost" size="sm" className="gap-1.5 text-[#1B3A6B] hover:bg-[#E8E5DC]">
              <RefreshCw className="h-3.5 w-3.5" />
              Sync All
            </Button>
          </div>

          {viewMode === "cards" ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filtered.map(p => <PrisonCard key={p.prisonName} prison={p} />)}
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map(p => <PrisonDetailRow key={p.prisonName} prison={p} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
