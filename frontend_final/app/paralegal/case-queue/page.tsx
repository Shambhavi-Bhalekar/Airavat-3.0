"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { AppHeader } from "@/components/app-header"
import { CaseCard } from "@/components/case-card"
import { StatusBadge } from "@/components/status-badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { mockCases } from "@/lib/mock-data"
import {
  Search,
  Filter,
  ArrowUpDown,
  Scale,
  Clock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  LayoutGrid,
  List,
  SlidersHorizontal,
  ChevronDown,
  RefreshCw,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import type { CaseStatus } from "@/lib/types"

type SortKey = "priority" | "date" | "detention" | "name"
type ViewMode = "grid" | "list"

const filterTabs = [
  { key: "all", label: "All Cases", icon: Scale, count: mockCases.length },
  {
    key: "eligible_now",
    label: "Eligible",
    icon: CheckCircle2,
    count: mockCases.filter(c => c.eligibility.status === "eligible_now").length,
    color: "text-[#166534]",
    bg: "bg-[#166534]/10",
  },
  {
    key: "window_closing",
    label: "Window Closing",
    icon: Clock,
    count: mockCases.filter(c => c.eligibility.status === "window_closing").length,
    color: "text-[#B45309]",
    bg: "bg-[#B45309]/10",
  },
  {
    key: "lawyer_review_required",
    label: "Lawyer Review",
    icon: AlertTriangle,
    count: mockCases.filter(c => c.eligibility.status === "lawyer_review_required" || c.eligibility.requiresLawyerReview).length,
    color: "text-[#1B3A6B]",
    bg: "bg-[#1B3A6B]/10",
  },
  {
    key: "identity_mismatch",
    label: "Identity Issues",
    icon: XCircle,
    count: mockCases.filter(c => c.eligibility.status === "identity_mismatch").length,
    color: "text-[#B91C1C]",
    bg: "bg-[#B91C1C]/10",
  },
]

const sortOptions: { key: SortKey; label: string }[] = [
  { key: "priority", label: "Priority Score" },
  { key: "detention", label: "Detention Duration" },
  { key: "date", label: "Last Action Date" },
  { key: "name", label: "Prisoner Name" },
]

export default function CaseQueuePage() {
  const router = useRouter()
  const [activeFilter, setActiveFilter] = useState("all")
  const [sortBy, setSortBy] = useState<SortKey>("priority")
  const [viewMode, setViewMode] = useState<ViewMode>("grid")
  const [search, setSearch] = useState("")
  const [showFilters, setShowFilters] = useState(false)
  const [filterFirstTime, setFilterFirstTime] = useState<string>("all")
  const [filterDocuments, setFilterDocuments] = useState<string>("all")

  const filtered = useMemo(() => {
    return mockCases
      .filter(c => {
        // Status filter
        if (activeFilter !== "all") {
          if (activeFilter === "lawyer_review_required") {
            if (!c.eligibility.requiresLawyerReview && c.eligibility.status !== "lawyer_review_required") return false
          } else {
            if (c.eligibility.status !== activeFilter) return false
          }
        }
        // Search filter
        if (search) {
          const q = search.toLowerCase()
          if (!c.prisonerName.toLowerCase().includes(q) &&
              !c.caseNumber.toLowerCase().includes(q) &&
              !c.prison.toLowerCase().includes(q) &&
              !c.district.toLowerCase().includes(q)) return false
        }
        // Additional filters
        if (filterFirstTime === "yes" && !c.isFirstTimeOffender) return false
        if (filterFirstTime === "no" && c.isFirstTimeOffender) return false
        if (filterDocuments === "ready" && !c.documentsPresent) return false
        if (filterDocuments === "missing" && c.documentsPresent) return false
        return true
      })
      .sort((a, b) => {
        if (sortBy === "priority") return a.priorityRank - b.priorityRank
        if (sortBy === "detention") return b.eligibility.detentionServed - a.eligibility.detentionServed
        if (sortBy === "name") return a.prisonerName.localeCompare(b.prisonerName)
        return new Date(b.lastActionDate).getTime() - new Date(a.lastActionDate).getTime()
      })
  }, [activeFilter, sortBy, search, filterFirstTime, filterDocuments])

  return (
    <div className="flex flex-col min-h-screen bg-[#F5F3EE]">
      <AppHeader
        title="Case Queue"
        subtitle={`${filtered.length} cases • Sorted by ${sortOptions.find(s => s.key === sortBy)?.label}`}
        syncStatus="online"
        lastSync="2 min ago"
      />

      <div className="flex-1 p-6 space-y-5">
        {/* Search & Controls Bar */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#5A6A7A]" />
            <Input
              placeholder="Search by name, case no., prison, district..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 bg-white border-[#D4D0C5] focus:border-[#1B3A6B]"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2 border-[#D4D0C5] text-[#1B3A6B] hover:bg-[#E8E5DC]">
                <ArrowUpDown className="h-3.5 w-3.5" />
                Sort: {sortOptions.find(s => s.key === sortBy)?.label}
                <ChevronDown className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-white border-[#D4D0C5]">
              {sortOptions.map(opt => (
                <DropdownMenuItem
                  key={opt.key}
                  onClick={() => setSortBy(opt.key)}
                  className={cn("text-[#1B3A6B]", sortBy === opt.key && "font-semibold")}
                >
                  {opt.label}
                  {sortBy === opt.key && <CheckCircle2 className="ml-auto h-3.5 w-3.5 text-[#166534]" />}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "gap-2 border-[#D4D0C5] text-[#1B3A6B] hover:bg-[#E8E5DC]",
              showFilters && "bg-[#1B3A6B] text-white border-[#1B3A6B]"
            )}
            onClick={() => setShowFilters(!showFilters)}
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            Filters
          </Button>
          <div className="flex items-center rounded-lg border border-[#D4D0C5] bg-white overflow-hidden">
            <button
              className={cn(
                "flex h-8 w-8 items-center justify-center transition-colors",
                viewMode === "grid" ? "bg-[#1B3A6B] text-white" : "text-[#5A6A7A] hover:bg-[#E8E5DC]"
              )}
              onClick={() => setViewMode("grid")}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              className={cn(
                "flex h-8 w-8 items-center justify-center transition-colors",
                viewMode === "list" ? "bg-[#1B3A6B] text-white" : "text-[#5A6A7A] hover:bg-[#E8E5DC]"
              )}
              onClick={() => setViewMode("list")}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
          <Button variant="ghost" size="sm" className="text-[#1B3A6B] hover:bg-[#E8E5DC] gap-1.5">
            <RefreshCw className="h-3.5 w-3.5" />
            Sync
          </Button>
        </div>

        {/* Expanded Filters */}
        {showFilters && (
          <div className="flex items-center gap-4 flex-wrap p-4 rounded-xl bg-white border border-[#D4D0C5]">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-[#5A6A7A]">Offender Type:</span>
              {[{ v: "all", l: "All" }, { v: "yes", l: "First-time" }, { v: "no", l: "Repeat" }].map(opt => (
                <button
                  key={opt.v}
                  onClick={() => setFilterFirstTime(opt.v)}
                  className={cn(
                    "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                    filterFirstTime === opt.v
                      ? "bg-[#1B3A6B] text-white"
                      : "bg-[#E8E5DC] text-[#1B3A6B] hover:bg-[#D4D0C5]"
                  )}
                >
                  {opt.l}
                </button>
              ))}
            </div>
            <div className="h-5 w-px bg-[#D4D0C5]" />
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-[#5A6A7A]">Documents:</span>
              {[{ v: "all", l: "All" }, { v: "ready", l: "Available" }, { v: "missing", l: "Missing" }].map(opt => (
                <button
                  key={opt.v}
                  onClick={() => setFilterDocuments(opt.v)}
                  className={cn(
                    "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                    filterDocuments === opt.v
                      ? "bg-[#1B3A6B] text-white"
                      : "bg-[#E8E5DC] text-[#1B3A6B] hover:bg-[#D4D0C5]"
                  )}
                >
                  {opt.l}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Status Filter Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
          {filterTabs.map(tab => {
            const Icon = tab.icon
            const isActive = activeFilter === tab.key
            return (
              <button
                key={tab.key}
                onClick={() => setActiveFilter(tab.key)}
                className={cn(
                  "flex items-center gap-2 shrink-0 rounded-xl border px-4 py-2.5 text-sm font-medium transition-all",
                  isActive
                    ? "bg-[#1B3A6B] text-white border-[#1B3A6B] shadow-sm"
                    : "bg-white text-[#5A6A7A] border-[#D4D0C5] hover:border-[#1B3A6B] hover:text-[#1B3A6B]"
                )}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
                <span className={cn(
                  "rounded-full px-1.5 py-0.5 text-xs",
                  isActive ? "bg-white/20" : (tab.bg || "bg-[#E8E5DC]"),
                  isActive ? "text-white" : (tab.color || "text-[#1B3A6B]")
                )}>
                  {tab.count}
                </span>
              </button>
            )
          })}
        </div>

        {/* Results */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Scale className="h-12 w-12 text-[#D4D0C5] mb-4" />
            <p className="text-[#1B3A6B] font-medium">No cases match your filters</p>
            <p className="text-sm text-[#5A6A7A] mt-1">Try adjusting the search or filter criteria</p>
            <Button
              variant="ghost"
              size="sm"
              className="mt-4 text-[#1B3A6B] hover:bg-[#E8E5DC]"
              onClick={() => { setSearch(""); setActiveFilter("all"); setFilterFirstTime("all"); setFilterDocuments("all") }}
            >
              Clear all filters
            </Button>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map(c => (
              <CaseCard
                key={c.id}
                caseData={c}
                onClick={() => router.push(`/case/${c.id}`)}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map(c => (
              <div
                key={c.id}
                onClick={() => router.push(`/case/${c.id}`)}
                className="group flex items-center gap-4 rounded-xl bg-white border border-[#D4D0C5] hover:border-[#C9A84C] hover:shadow-sm p-4 cursor-pointer transition-all"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#C9A84C]/20 text-xs font-semibold font-mono text-[#1B3A6B]">
                  #{c.priorityRank}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-[#1B3A6B] truncate">{c.prisonerName}</p>
                    <span className="text-xs text-[#5A6A7A] font-mono shrink-0">{c.caseNumber}</span>
                  </div>
                  <p className="text-xs text-[#5A6A7A] truncate">{c.prison} • {c.district}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <StatusBadge status={c.eligibility.status as CaseStatus} />
                  <span className="text-xs text-[#5A6A7A]">{c.eligibility.detentionServed}d detained</span>
                </div>
              </div>
            ))}
          </div>
        )}

        <p className="text-center text-xs text-[#5A6A7A]">
          Showing {filtered.length} of {mockCases.length} cases
        </p>
      </div>
    </div>
  )
}
