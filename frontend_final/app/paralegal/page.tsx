"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { AppHeader } from "@/components/app-header"
import { StatsCard } from "@/components/stats-card"
import { CaseCard } from "@/components/case-card"
import { AlertCard } from "@/components/alert-card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { mockCases, mockAlerts, mockDashboardStats } from "@/lib/mock-data"
import {
  Scale,
  Clock,
  AlertTriangle,
  CheckCircle2,
  FileText,
  TrendingUp,
  Filter,
  ArrowUpDown,
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

  const eligibleCases = mockCases.filter(c => c.eligibility.status === 'eligible_now')
  const windowClosingCases = mockCases.filter(c => c.eligibility.status === 'window_closing')
  const reviewCases = mockCases.filter(
    c => c.eligibility.requiresLawyerReview || c.eligibility.requiresHumanResolution
  )

  const sortedCases = [...mockCases].sort((a, b) => {
    if (sortBy === 'priority') return a.priorityRank - b.priorityRank
    if (sortBy === 'detention') return b.eligibility.detentionServed - a.eligibility.detentionServed
    return new Date(b.lastActionDate).getTime() - new Date(a.lastActionDate).getTime()
  })

  const handleAcknowledgeAlert = (alertId: string) => {
    setAlerts(prev => prev.filter(a => a.id !== alertId))
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#F5F3EE]">
      <AppHeader
        title="Case Queue"
        subtitle="Prioritized undertrial cases for review and action"
        syncStatus="online"
        lastSync="2 min ago"
      />

      <div className="flex-1 p-6 space-y-6">
        {/* Stats Overview */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Eligible Now"
            value={mockDashboardStats.eligibleNow}
            subtitle="Section 479 BNSS eligible"
            icon={Scale}
            variant="success"
            trend={{ value: 12, direction: 'up', label: 'vs last week' }}
          />
          <StatsCard
            title="Window Closing"
            value={mockDashboardStats.windowClosing}
            subtitle="Within next 30 days"
            icon={Clock}
            variant="warning"
          />
          <StatsCard
            title="Lawyer Review"
            value={mockDashboardStats.lawyerReviewRequired}
            subtitle="Life imprisonment or complex"
            icon={AlertTriangle}
            variant="info"
          />
          <StatsCard
            title="Bails Filed"
            value={mockDashboardStats.bailsFiledThisMonth}
            subtitle={`${mockDashboardStats.bailsGrantedThisMonth} granted this month`}
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
          <div className="flex items-center justify-between">
            <Tabs defaultValue="all" className="w-auto">
              <TabsList className="bg-white border border-[#D4D0C5]">
                <TabsTrigger value="all" className="text-xs data-[state=active]:bg-[#1B3A6B] data-[state=active]:text-white">
                  All Cases ({mockCases.length})
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

            <div className="flex items-center gap-2">
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

          {/* Case Grid */}
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {sortedCases.map((caseData) => (
              <CaseCard
                key={caseData.id}
                caseData={caseData}
                onClick={() => router.push(`/case/${caseData.id}`)}
              />
            ))}
          </div>
        </div>

        {/* Quick Stats Footer */}
        <div className="grid gap-4 md:grid-cols-3 pt-4 border-t border-[#D4D0C5]">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-white border border-[#D4D0C5]">
            <div className="p-2 rounded-lg bg-[#166534]/10">
              <TrendingUp className="h-5 w-5 text-[#166534]" />
            </div>
            <div>
              <p className="text-sm font-medium text-[#1B3A6B]">
                Avg Processing Time
              </p>
              <p className="text-xs text-[#5A6A7A]">
                {mockDashboardStats.avgProcessingDays} days from eligibility to filing
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
                {mockDashboardStats.pendingActions} cases need attention today
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
                {mockDashboardStats.totalCases} undertrials tracked
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
