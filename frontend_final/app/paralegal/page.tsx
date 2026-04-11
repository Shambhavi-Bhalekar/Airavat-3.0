"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { AppHeader } from "@/components/app-header"
import { StatsCard } from "@/components/stats-card"
import { CaseCard } from "@/components/case-card"
import { AlertCard } from "@/components/alert-card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { mockAlerts, mockDashboardStats } from "@/lib/mock-data"
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
  const [alerts, setAlerts] = useState(mockAlerts.filter(a => !a.acknowledged))
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

  const handleAcknowledgeAlert = (alertId: string) => {
    setAlerts(prev => prev.filter(a => a.id !== alertId))
  }

  // Derive live stats from real data (fall back to mockDashboardStats numbers if empty)
  const liveStats = {
    eligibleNow: cases.length > 0 ? eligibleCases.length : mockDashboardStats.eligibleNow,
    windowClosing: cases.length > 0 ? windowClosingCases.length : mockDashboardStats.windowClosing,
    lawyerReviewRequired: cases.length > 0 ? reviewCases.length : mockDashboardStats.lawyerReviewRequired,
    totalCases: cases.length > 0 ? cases.length : mockDashboardStats.totalCases,
    bailsFiledThisMonth: mockDashboardStats.bailsFiledThisMonth,
    bailsGrantedThisMonth: mockDashboardStats.bailsGrantedThisMonth,
    avgProcessingDays: mockDashboardStats.avgProcessingDays,
    pendingActions: mockDashboardStats.pendingActions,
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
            title="Bails Filed"
            value={liveStats.bailsFiledThisMonth}
            subtitle={`${liveStats.bailsGrantedThisMonth} granted this month`}
            icon={CheckCircle2}
            trend={{ value: 8, direction: 'up', label: 'vs last month' }}
          />
        </div>

        {/* Active Alerts */}
        {alerts.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-[#1B3A6B]">Active Alerts</h2>
              <Button variant="ghost" size="sm" className="text-xs text-[#1B3A6B] hover:bg-[#E8E5DC]">
                View All
              </Button>
            </div>
            <div className="grid gap-2 md:grid-cols-2">
              {alerts.slice(0, 4).map((alert) => (
                <AlertCard
                  key={alert.id}
                  alert={alert}
                  onAcknowledge={() => handleAcknowledgeAlert(alert.id)}
                />
              ))}
            </div>
          </div>
        )}

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
              <Button variant="outline" size="sm" className="gap-2 border-[#D4D0C5] text-[#1B3A6B] hover:bg-[#E8E5DC]">
                <Filter className="h-3 w-3" />
                Filter
              </Button>
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

        {/* Quick Stats Footer */}
        <div className="grid gap-3 sm:gap-4 sm:grid-cols-3 pt-4 border-t border-[#D4D0C5]">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-white border border-[#D4D0C5]">
            <div className="p-2 rounded-lg bg-[#166534]/10">
              <TrendingUp className="h-5 w-5 text-[#166534]" />
            </div>
            <div>
              <p className="text-sm font-medium text-[#1B3A6B]">
                Avg Processing Time
              </p>
              <p className="text-xs text-[#5A6A7A]">
                {liveStats.avgProcessingDays} days from eligibility to filing
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-white border border-[#D4D0C5]">
            <div className="p-2 rounded-lg bg-[#1B3A6B]/10">
              <FileText className="h-5 w-5 text-[#1B3A6B]" />
            </div>
            <div>
              <p className="text-sm font-medium text-[#1B3A6B]">
                Pending Actions
              </p>
              <p className="text-xs text-[#5A6A7A]">
                {liveStats.pendingActions} cases need attention today
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-white border border-[#D4D0C5]">
            <div className="p-2 rounded-lg bg-[#B45309]/10">
              <Clock className="h-5 w-5 text-[#B45309]" />
            </div>
            <div>
              <p className="text-sm font-medium text-[#1B3A6B]">
                Total Active Cases
              </p>
              <p className="text-xs text-[#5A6A7A]">
                {liveStats.totalCases} undertrials tracked
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
