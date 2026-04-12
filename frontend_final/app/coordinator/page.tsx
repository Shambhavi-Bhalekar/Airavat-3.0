"use client"

import { useState, useEffect } from "react"
import { AppHeader } from "@/components/app-header"
import { StatsCard } from "@/components/stats-card"
import { PrisonCard } from "@/components/prison-card"
import { CourtCard } from "@/components/court-card"
import { AlertCard } from "@/components/alert-card"
import { SystemicInsightsCard } from "@/components/systemic-insights-card"
import { PatternAlertCard } from "@/components/pattern-alert-card"
import { UncertaintyDisplay } from "@/components/uncertainty-display"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import {
  mockPrisonSummaries,
  mockCourtBehaviors,
  mockAlerts,
  mockDistrictComparisons,
} from "@/lib/mock-data"
import {
  fetchCases,
  predictAll,
  fetchChargeSectionInsights,
  fetchCourtInsights,
  fetchPrisonInsights,
  fetchSuretyAnalysis,
  fetchPatternAdjournmentAlerts,
} from "@/lib/api"
import BarChart from "@/components/analytics/bar-chart"
import PieChart from "@/components/analytics/pie-chart"
import LineChart from "@/components/analytics/line-chart"
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

  // Systemic insights state
  const [insightsLoading, setInsightsLoading] = useState(false)
  const [chargeInsights, setChargeInsights] = useState<any>(null)
  const [courtInsights, setCourtInsights] = useState<any>(null)
  const [prisonInsights, setPrisonInsights] = useState<any>(null)
  const [suretyInsights, setSuretyInsights] = useState<any>(null)
  const [patternAlerts, setPatternAlerts] = useState<any>(null)

  useEffect(() => {
    fetchCases()
      .then(data => { setCases(data); setApiError(null) })
      .catch(() => {
        setApiError("Backend unavailable — stats estimated from mock data")
        import("@/lib/mock-data").then(m => setCases(m.mockCases))
      })
      .finally(() => setLoading(false))
    
    // Load systemic insights
    loadSystemicInsights()
  }, [])

  const loadSystemicInsights = async () => {
    setInsightsLoading(true)
    try {
      const [charges, courts, prisons, surety, alerts] = await Promise.all([
        fetchChargeSectionInsights().catch(() => null),
        fetchCourtInsights().catch(() => null),
        fetchPrisonInsights().catch(() => null),
        fetchSuretyAnalysis().catch(() => null),
        fetchPatternAdjournmentAlerts().catch(() => null),
      ])
      
      setChargeInsights(charges)
      setCourtInsights(courts)
      setPrisonInsights(prisons)
      setSuretyInsights(surety)
      setPatternAlerts(alerts)
    } catch (e) {
      console.error("Failed to load systemic insights:", e)
    } finally {
      setInsightsLoading(false)
    }
  }

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

  // Prepare adjournment trend labels and values (robust fallbacks)
  const deriveAdjournmentSeries = () => {
    const defaultLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"]
    // derive labels from quarter_range like '2026-01-12 to 2026-04-12'
    if (patternAlerts && patternAlerts.quarter_range) {
      const qr: string = patternAlerts.quarter_range
      if (qr.includes('to')) {
        try {
          const parts = qr.split('to').map(s => s.trim())
          const start = new Date(parts[0])
          const end = new Date(parts[1])
          if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
            const months: string[] = []
            const cur = new Date(start.getFullYear(), start.getMonth(), 1)
            while (cur <= end && months.length < 6) {
              months.push(cur.toLocaleString(undefined, { month: 'short' }))
              cur.setMonth(cur.getMonth() + 1)
            }
            if (months.length > 0) return { labels: months, values: generatePlaceholders(months.length) }
          }
        } catch (e) {
          // fall through to other strategies
        }
      }
      if (qr.includes(',')) {
        const parts = qr.split(',').map((s: string) => s.trim()).slice(0, 6)
        if (parts.length > 0) return { labels: parts, values: generatePlaceholders(parts.length) }
      }
    }

    // If alerts have a few entries, map them to simple labels
    if (patternAlerts && patternAlerts.alerts && patternAlerts.alerts.length > 0) {
      const labels = (patternAlerts.alerts || []).slice(0, 6).map((a: any, idx: number) => `P${idx + 1}`)
      const values = (patternAlerts.alerts || []).slice(0, 6).map((a: any) => Number(a.high_adjournment_count || a.case_count || 0))
      // pad if needed
      while (values.length < labels.length) values.push(values[values.length - 1] || 0)
      return { labels, values }
    }

    return { labels: defaultLabels, values: [12, 18, 15, 22, 19, 25] }
  }

  const generatePlaceholders = (n: number) => {
    const base = [12, 18, 15, 22, 19, 25]
    if (n <= base.length) return base.slice(0, n)
    const out = [...base]
    while (out.length < n) out.push(Math.round(20 + Math.random() * 8))
    return out
  }

  const adjSeries = deriveAdjournmentSeries()

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

        {/* Pillar 04 & 08: Systemic Intelligence Section */}
        <div className="space-y-4 border-t-2 border-[#D4D0C5] pt-6">
          <div>
            <h2 className="text-lg font-semibold text-[#1B3A6B] flex items-center gap-2">
              🔍 Systemic Pattern Intelligence
              <span className="text-xs font-normal text-[#5A6A7A]">(Pillar 04 & 08)</span>
            </h2>
            <p className="text-sm text-[#5A6A7A]">
              System-wide insights across case corpus - surfaces detention trends, court patterns, prison density, and surety blocking factors.
            </p>
          </div>

          {/* Pattern Alerts - Pillar 08 */}
          {patternAlerts && (
            <div className="mb-6">
              <PatternAlertCard
                alerts={patternAlerts.alerts || []}
                quarterRange={patternAlerts.quarter_range || "Last 90 days"}
                confidence={patternAlerts.confidence || 0.75}
                isEmpty={!patternAlerts.alerts || patternAlerts.alerts.length === 0}
              />
              {patternAlerts.alerts && patternAlerts.alerts.length > 0 && (
                <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded text-xs text-blue-700">
                  <strong>⚠️ UTRC Action Required:</strong> {patternAlerts.alerts.filter((a: any) => a.alert_level === 'CRITICAL').length} courts need immediate intervention for eligible case adjournment patterns.
                </div>
              )}
            </div>
          )}

          {/* Systemic Insights Grid */}
          <div className="grid gap-4 lg:grid-cols-2">
            {/* Charge Section Insights */}
            {chargeInsights && (
              <SystemicInsightsCard
                title="Charge Sections with Longest Detention"
                description="Which IPC/BNS sections correlate with extended undertrial periods"
                insights={chargeInsights.insights || {}}
                confidence={chargeInsights.confidence}
                uncertaintyNote={chargeInsights.uncertaintyNote}
              />
            )}

            {/* Court Bail Intervals */}
            {courtInsights && (
              <SystemicInsightsCard
                title="Courts with Worst Bail Decision Intervals"
                description="Which courts have the longest delays between bail eligibility and decision"
                insights={courtInsights.insights || {}}
                confidence={courtInsights.confidence}
                uncertaintyNote={courtInsights.uncertaintyNote}
              />
            )}

            {/* Prison Eligible Density */}
            {prisonInsights && (
              <SystemicInsightsCard
                title="Prison Eligible-But-Unserved Density"
                description="Which prisons have highest concentration of eligible undertrials not yet released"
                insights={prisonInsights.insights || {}}
                confidence={prisonInsights.confidence}
                uncertaintyNote={prisonInsights.uncertaintyNote}
              />
            )}

            {/* Surety Blocking Analysis */}
            {suretyInsights && (
              <SystemicInsightsCard
                title="Surety Blocking Analysis"
                description="Which cities have surety amounts blocking bail, correlated with poverty indicators"
                insights={suretyInsights.insights || {}}
                confidence={suretyInsights.confidence}
                uncertaintyNote={suretyInsights.uncertaintyNote}
              />
            )}
          </div>

          {/* Quick Visualizations */}
          <div className="mt-6">
            <h3 className="text-base font-semibold text-[#1B3A6B] mb-4 flex items-center gap-2">
              📊 Quick Analytics
            </h3>
            <div className="grid gap-5 lg:grid-cols-3">
              <BarChart
                labels={
                  chargeInsights?.insights
                    ? Object.entries(chargeInsights.insights)
                        .slice(0, 6)
                        .map(([k]) => (k === null || k === 'null' ? 'Unknown' : String(k)))
                    : ["Section 1", "Section 2", "Section 3", "Section 4", "Section 5", "Section 6"]
                }
                values={
                  chargeInsights?.insights
                    ? Object.entries(chargeInsights.insights)
                        .slice(0, 6)
                        .map(([, v]: any) => {
                          if (!v) return 0
                          // prefer avg_detention_days if insight is an object
                          if (typeof v === 'object') {
                            return Number(v.avg_detention_days ?? v.avg_detention_days === 0 ? v.avg_detention_days : 0)
                          }
                          return Number(v) || 0
                        })
                    : [120, 95, 80, 60, 40, 25]
                }
                title="Top Sections — Detention Days"
              />

              <LineChart
                labels={adjSeries.labels}
                values={adjSeries.values}
                title="Adjournment Trend"
              />

              <PieChart
                labels={
                  prisonInsights?.insights
                    ? Object.entries(prisonInsights.insights)
                        .slice(0, 6)
                        .map(([k]) => (k === null || k === 'null' ? 'Unknown' : String(k)))
                    : ["Prison A", "Prison B", "Prison C"]
                }
                values={
                  prisonInsights?.insights
                    ? Object.entries(prisonInsights.insights)
                        .slice(0, 6)
                        .map(([, v]: any) => {
                          if (!v) return 0
                          if (typeof v === 'object') return Number(v.eligible_density_percent ?? v.eligible_unserved ?? v.total_undertrials ?? 0)
                          return Number(v) || 0
                        })
                    : [45, 30, 25]
                }
                title="Prison Eligible Density"
              />
            </div>
          </div>

          {/* Uncertainty Disclaimer Card */}
          <Card className="border-2 border-blue-300 bg-blue-50">
            <CardHeader>
              <CardTitle className="text-base text-blue-900">📊 Model Uncertainty & Confidence</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm text-blue-800">
                <p>
                  All systemic insights above are <strong>predictions and statistical patterns</strong>, not deterministic facts. They serve as decision support inputs to UTRC judgment, not instructions.
                </p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Confidence scores vary by sample size and data quality</li>
                  <li>Cross-reference findings with primary legal documents</li>
                  <li>Use for identifying systemic issues, not individual case decisions</li>
                  <li>Always verify alerts independently before taking action</li>
                </ul>
              </div>
            </CardContent>
          </Card>
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
