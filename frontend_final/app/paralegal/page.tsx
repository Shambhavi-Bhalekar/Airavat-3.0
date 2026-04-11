"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { AppHeader } from "@/components/app-header"
import { StatsCard } from "@/components/stats-card"
import { CaseCard } from "@/components/case-card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { fetchCases } from "@/lib/api"
import type { Case } from "@/lib/types"
import {
  Scale,
  Clock,
  AlertTriangle,
  CheckCircle2,
  FileText,
  TrendingUp,
  Filter,
  ArrowUpDown,
  Loader2,
  WifiOff,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function ParalegalDashboard() {
  const router = useRouter()
  const [sortBy, setSortBy] = useState<'priority' | 'date' | 'detention'>('priority')
  const [cases, setCases] = useState<Case[]>([])
  const [loading, setLoading] = useState(true)
  const [apiError, setApiError] = useState<string | null>(null)

  useEffect(() => {
    fetchCases()
      .then(data => {
        setCases(data)
        setApiError(null)
      })
      .catch(err => {
        console.error("Failed to load cases from API:", err)
        setApiError("Backend unavailable — showing mock data")
        // fall back to mock data imported lazily
        import("@/lib/mock-data").then(m => setCases(m.mockCases))
      })
      .finally(() => setLoading(false))
  }, [])

  const eligibleCases = cases.filter(c => c.eligibility.status === 'eligible_now')
  const windowClosingCases = cases.filter(c => c.eligibility.status === 'window_closing')
  const reviewCases = cases.filter(
    c => c.eligibility.requiresLawyerReview || c.eligibility.requiresHumanResolution
  )

  const sortedCases = [...cases].sort((a, b) => {
    if (sortBy === 'priority') return a.priorityRank - b.priorityRank
    if (sortBy === 'detention') return b.eligibility.detentionServed - a.eligibility.detentionServed
    return new Date(b.lastActionDate).getTime() - new Date(a.lastActionDate).getTime()
  })

  // Derive live stats from real connected DB data
  const liveStats = {
    eligibleNow: cases.length > 0 ? eligibleCases.length : 0,
    windowClosing: cases.length > 0 ? windowClosingCases.length : 0,
    lawyerReviewRequired: cases.length > 0 ? reviewCases.length : 0,
    totalCases: cases.length > 0 ? cases.length : 0,
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#F5F3EE]">
      <AppHeader
        title="Case Queue"
        subtitle="Prioritized undertrial cases for review and action"
        syncStatus={apiError ? "offline" : "online"}
        lastSync={loading ? "Loading…" : apiError ? "Offline" : "Live"}
      />

      <div className="flex-1 p-4 sm:p-6 space-y-5 sm:space-y-6">
        {/* API Connection Banner */}
        {apiError && (
          <div className="flex items-center gap-3 rounded-lg border border-[#B45309]/30 bg-[#B45309]/5 px-4 py-3 text-sm text-[#B45309]">
            <WifiOff className="h-4 w-4 shrink-0" />
            {apiError}
          </div>
        )}

        {/* Stats Overview */}
        <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Eligible Now"
            value={liveStats.eligibleNow}
            subtitle="Section 479 BNSS eligible"
            icon={Scale}
            variant="success"
            trend={{ value: 12, direction: 'up', label: 'vs last week' }}
          />
          <StatsCard
            title="Window Closing"
            value={liveStats.windowClosing}
            subtitle="Within next 30 days"
            icon={Clock}
            variant="warning"
          />
          <StatsCard
            title="Lawyer Review"
            value={liveStats.lawyerReviewRequired}
            subtitle="Life imprisonment or complex"
            icon={AlertTriangle}
            variant="info"
          />
          <StatsCard
            title="Total Tracked Cases"
            value={liveStats.totalCases}
            subtitle="Undertrials currently loaded"
            icon={Scale}
          />
        </div>

        {/* Case Queue */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between">
            <div className="overflow-x-auto tabs-scroll">
              <Tabs defaultValue="all" className="w-auto">
                <TabsList className="bg-white border border-[#D4D0C5] whitespace-nowrap">
                  <TabsTrigger value="all" className="text-xs data-[state=active]:bg-[#1B3A6B] data-[state=active]:text-white">
                    All Cases ({cases.length})
                  </TabsTrigger>
                  <TabsTrigger value="eligible" className="text-xs data-[state=active]:bg-[#1B3A6B] data-[state=active]:text-white">
                    Eligible ({eligibleCases.length})
                  </TabsTrigger>
                  <TabsTrigger value="window" className="text-xs data-[state=active]:bg-[#1B3A6B] data-[state=active]:text-white">
                    Window Closing ({windowClosingCases.length})
                  </TabsTrigger>
                  <TabsTrigger value="review" className="text-xs data-[state=active]:bg-[#1B3A6B] data-[state=active]:text-white">
                    Needs Review ({reviewCases.length})
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2 border-[#D4D0C5] text-[#1B3A6B] hover:bg-[#E8E5DC]">
                    <ArrowUpDown className="h-3 w-3" />
                    Sort
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-white border-[#D4D0C5]">
                  <DropdownMenuItem onClick={() => setSortBy('priority')} className="text-[#1B3A6B]">
                    Priority Score
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy('detention')} className="text-[#1B3A6B]">
                    Detention Duration
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy('date')} className="text-[#1B3A6B]">
                    Last Action Date
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-[#5A6A7A]">
              <Loader2 className="h-8 w-8 animate-spin text-[#1B3A6B]" />
              <p className="text-sm">Loading cases from backend…</p>
            </div>
          ) : (
            <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {sortedCases.map((caseData) => (
                <CaseCard
                  key={caseData.id}
                  caseData={caseData}
                  onClick={() => router.push(`/case/${caseData.id}`)}
                />
              ))}
              {sortedCases.length === 0 && (
                <div className="col-span-3 flex flex-col items-center justify-center py-20 text-center">
                  <Scale className="h-12 w-12 text-[#D4D0C5] mb-4" />
                  <p className="text-[#1B3A6B] font-medium">No cases found</p>
                  <p className="text-sm text-[#5A6A7A] mt-1">The backend returned no cases yet.</p>
                </div>
              )}
            </div>
          )}
        </div>


      </div>
    </div>
  )
}
