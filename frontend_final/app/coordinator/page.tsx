"use client"

import { useState, useEffect } from "react"
import { AppHeader } from "@/components/app-header"
import { StatsCard } from "@/components/stats-card"
import { PrisonCard } from "@/components/prison-card"
import { CourtCard } from "@/components/court-card"
import { AlertCard } from "@/components/alert-card"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import {
  mockPrisonSummaries,
  mockCourtBehaviors,
  mockAlerts,
  mockDistrictComparisons,
} from "@/lib/mock-data"
import { fetchCases, predictAll } from "@/lib/api"
import type { Case } from "@/lib/types"
import {
  Building2,
  Scale,
  Users,
  FileText,
  Download,
  BarChart3,
  MapPin,
  RefreshCw,
  Loader2,
  WifiOff,
} from "lucide-react"

export default function CoordinatorDashboard() {
  const [cases, setCases] = useState<Case[]>([])
  const [loading, setLoading] = useState(true)
  const [apiError, setApiError] = useState<string | null>(null)
  const [rescoring, setRescoring] = useState(false)
  const [rescoreMsg, setRescoreMsg] = useState<string | null>(null)

  useEffect(() => {
    fetchCases()
      .then(data => { setCases(data); setApiError(null) })
      .catch(() => {
        setApiError("Backend unavailable — stats estimated from mock data")
        import("@/lib/mock-data").then(m => setCases(m.mockCases))
      })
      .finally(() => setLoading(false))
  }, [])

  const handlePredictAll = async () => {
    setRescoring(true)
    setRescoreMsg(null)
    try {
      const res = await predictAll()
      setRescoreMsg(`✓ Re-scored ${res.updated_count} cases with Gemma-4`)
      // Refresh cases after re-scoring
      const fresh = await fetchCases()
      setCases(fresh)
    } catch {
      setRescoreMsg("Re-scoring failed — is the Gemma-4 server running on port 8001?")
    } finally {
      setRescoring(false)
    }
  }

  // Derive live stats; fall back to mock prison summary aggregates when no live data
  const totalEligible = cases.length > 0
    ? cases.filter(c => c.eligibility.status === 'eligible_now').length
    : mockPrisonSummaries.reduce((acc, p) => acc + p.eligibleUndertrials, 0)

  const totalUndertrials = cases.length > 0
    ? cases.length
    : mockPrisonSummaries.reduce((acc, p) => acc + p.totalUndertrials, 0)

  const totalWindowClosing = cases.length > 0
    ? cases.filter(c => c.eligibility.status === 'window_closing').length
    : mockPrisonSummaries.reduce((acc, p) => acc + p.windowClosingCount, 0)

  const highAdjournmentCourts = mockCourtBehaviors.filter(c => c.adjournmentRate >= 70).length

  return (
    <div className="flex flex-col min-h-screen bg-[#F5F3EE]">
      <AppHeader
        title="UTRC Coordinator Dashboard"
        subtitle="District-wide undertrial monitoring and systemic intelligence"
        syncStatus={apiError ? "offline" : "online"}
        lastSync={loading ? "Loading…" : apiError ? "Offline" : "Live"}
      />

      <div className="flex-1 p-4 sm:p-6 space-y-5 sm:space-y-6">
        {/* API error banner */}
        {apiError && (
          <div className="flex items-center gap-3 rounded-lg border border-[#B45309]/30 bg-[#B45309]/5 px-4 py-3 text-sm text-[#B45309]">
            <WifiOff className="h-4 w-4 shrink-0" />
            {apiError}
          </div>
        )}

        {/* Re-score All + status */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            {rescoreMsg && (
              <p className={`text-sm ${rescoreMsg.startsWith('✓') ? 'text-[#166534]' : 'text-[#B91C1C]'}`}>
                {rescoreMsg}
              </p>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            className="gap-2 border-[#D4D0C5] text-[#1B3A6B] hover:bg-[#E8E5DC]"
            onClick={handlePredictAll}
            disabled={rescoring || loading}
          >
            {rescoring ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <RefreshCw className="h-3.5 w-3.5" />
            )}
            {rescoring ? "Re-scoring…" : "Re-score All Cases (Gemma-4)"}
          </Button>
        </div>

        {/* Top Stats */}

        <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Total Undertrials"
            value={totalUndertrials.toLocaleString()}
            subtitle="Across all prisons"
            icon={Users}
          />
          <StatsCard
            title="Section 479 Eligible"
            value={totalEligible}
            subtitle={`${Math.round((totalEligible / totalUndertrials) * 100)}% of total`}
            icon={Scale}
            variant="success"
            trend={{ value: 15, direction: 'up' }}
          />
          <StatsCard
            title="Window Closing"
            value={totalWindowClosing}
            subtitle="Within 30 days"
            icon={Building2}
            variant="warning"
          />
          <StatsCard
            title="High Adjournment Courts"
            value={highAdjournmentCourts}
            subtitle="Above 70% rate"
            icon={Scale}
            variant="destructive"
          />
        </div>

        {/* Main Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column - Prisons */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-[#1B3A6B]">Prison Overview</h2>
              <Button variant="outline" size="sm" className="gap-2 border-[#D4D0C5] text-[#1B3A6B] hover:bg-[#E8E5DC]">
                <Download className="h-3 w-3" />
                Export Report
              </Button>
            </div>
            <div className="grid gap-3 sm:gap-4 sm:grid-cols-2">
              {mockPrisonSummaries.slice(0, 4).map((prison) => (
                <PrisonCard key={prison.prisonName} prison={prison} />
              ))}
            </div>
            <Button variant="ghost" className="w-full text-[#1B3A6B] hover:bg-[#E8E5DC]">
              View All {mockPrisonSummaries.length} Prisons
            </Button>
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-[#1B3A6B]">System Alerts</h2>
            <div className="space-y-2">
              {mockAlerts.slice(0, 3).map((alert) => (
                <AlertCard key={alert.id} alert={alert} />
              ))}
            </div>

            {/* NALSA Report Card */}
            <Card className="border-[#C9A84C] border-2 bg-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2 text-[#1B3A6B]">
                  <FileText className="h-4 w-4 text-[#C9A84C]" />
                  NALSA Quarterly Report
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-[#5A6A7A]">
                  Q3 2024 report due in 18 days. Auto-generate from current data.
                </p>
                <div className="flex gap-2">
                  <Button size="sm" className="flex-1 gap-2 bg-[#1B3A6B] hover:bg-[#2A4A7B]">
                    <Download className="h-3 w-3" />
                    Generate
                  </Button>
                  <Button variant="outline" size="sm" className="border-[#D4D0C5] text-[#1B3A6B] hover:bg-[#E8E5DC]">
                    Preview
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Court Behavior Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-[#1B3A6B]">Court Behavior Patterns</h2>
              <p className="text-sm text-[#5A6A7A]">Adjournment rates and bail decision times</p>
            </div>
            <Button variant="outline" size="sm" className="gap-2 border-[#D4D0C5] text-[#1B3A6B] hover:bg-[#E8E5DC]">
              <BarChart3 className="h-3 w-3" />
              Full Analysis
            </Button>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {mockCourtBehaviors.slice(0, 3).map((court) => (
              <CourtCard key={`${court.courtName}-${court.judge}`} court={court} />
            ))}
          </div>
        </div>

        {/* District Comparison */}
        <Card className="bg-white border-[#D4D0C5]">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-[#1B3A6B]">
                  <MapPin className="h-5 w-5 text-[#C9A84C]" />
                  District Comparison
                </CardTitle>
                <p className="text-sm text-[#5A6A7A] mt-1">
                  Performance metrics across districts
                </p>
              </div>
              <Button variant="outline" size="sm" className="border-[#D4D0C5] text-[#1B3A6B] hover:bg-[#E8E5DC]">
                View Details
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockDistrictComparisons.map((district) => (
                <div key={district.district} className="flex items-center gap-4">
                  <div className="w-24 shrink-0">
                    <p className="text-sm font-medium text-[#1B3A6B]">{district.district}</p>
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#5A6A7A]">
                        {district.actionsCompleted}/{district.eligibleCount} completed
                      </span>
                      <span className="font-medium text-[#1B3A6B]">
                        {Math.round((district.actionsCompleted / district.eligibleCount) * 100)}%
                      </span>
                    </div>
                    <Progress 
                      value={(district.actionsCompleted / district.eligibleCount) * 100} 
                      className="h-2"
                    />
                  </div>
                  <div className="w-20 text-right shrink-0">
                    <p className="text-sm font-medium text-[#1B3A6B]">{district.avgProcessingTime}d</p>
                    <p className="text-xs text-[#5A6A7A]">avg time</p>
                  </div>
                  <div className="w-16 text-right shrink-0">
                    <p className="text-sm font-medium text-[#1B3A6B]">{district.dataQualityScore}%</p>
                    <p className="text-xs text-[#5A6A7A]">quality</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
