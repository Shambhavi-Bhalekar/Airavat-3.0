"use client"

import { useEffect, useMemo, useState } from "react"

import { AppHeader } from "@/components/app-header"
import { StatsCard } from "@/components/stats-card"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { BASE_URL, type BackendCase } from "@/lib/api"
import {
  AlertTriangle,
  BarChart3,
  Download,
  Info,
  RefreshCw,
  Scale,
  ShieldCheck,
  Clock,
  TrendingUp,
} from "lucide-react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

type AnalyticsRow = BackendCase & {
  eligible_but_detained?: boolean
}

type LoadingState = "idle" | "loading" | "ready" | "error"

type Bucket = {
  label: string
  min: number
  max: number | null
}

const palette = ["#1B3A6B", "#C9A84C", "#166534", "#B45309", "#7C3AED"]

const suretyBuckets: Bucket[] = [
  { label: "0-10k", min: 0, max: 10000 },
  { label: "10k-50k", min: 10000, max: 50000 },
  { label: "50k-100k", min: 50000, max: 100000 },
  { label: "100k-250k", min: 100000, max: 250000 },
  { label: "250k+", min: 250000, max: null },
]

function average(values: number[]) {
  if (!values.length) return 0
  return values.reduce((sum, value) => sum + value, 0) / values.length
}

function isTruthy(value: unknown) {
  return value === true || value === 1 || value === "true" || value === "TRUE"
}

function normalizeStatus(value?: string) {
  return (value ?? "").trim().toUpperCase()
}

function formatCount(value: number) {
  return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(value)
}

function formatPercent(value: number) {
  return `${value.toFixed(1)}%`
}

function buildGroupedAverage(rows: AnalyticsRow[], key: keyof AnalyticsRow, field: keyof AnalyticsRow) {
  const grouped = new Map<string, number[]>()

  for (const row of rows) {
    const groupKey = String(row[key] ?? "Unknown")
    const numericValue = Number(row[field] ?? 0)
    if (!grouped.has(groupKey)) grouped.set(groupKey, [])
    grouped.get(groupKey)?.push(numericValue)
  }

  return Array.from(grouped.entries())
    .map(([name, values]) => ({ name, value: average(values) }))
    .sort((left, right) => right.value - left.value)
}

function buildGroupedCount(rows: AnalyticsRow[], key: keyof AnalyticsRow, predicate: (row: AnalyticsRow) => boolean) {
  const grouped = new Map<string, number>()

  for (const row of rows) {
    if (!predicate(row)) continue
    const groupKey = String(row[key] ?? "Unknown")
    grouped.set(groupKey, (grouped.get(groupKey) ?? 0) + 1)
  }

  return Array.from(grouped.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((left, right) => right.value - left.value)
}

function buildSuretyBuckets(rows: AnalyticsRow[]) {
  return suretyBuckets.map((bucket) => ({
    name: bucket.label,
    value: rows.filter((row) => {
      if (!isTruthy(row.surety_blocked)) return false
      const amount = Number(row.surety_amount ?? 0)
      if (amount < bucket.min) return false
      if (bucket.max == null) return true
      return amount < bucket.max
    }).length,
  }))
}

export default function AnalyticsPage() {
  const [cases, setCases] = useState<AnalyticsRow[]>([])
  const [loadingState, setLoadingState] = useState<LoadingState>("idle")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const loadCases = async () => {
    setLoadingState("loading")
    setErrorMessage(null)

    try {
      const response = await fetch(`${BASE_URL}/cases`, { cache: "no-store" })
      if (!response.ok) {
        throw new Error(`GET /cases failed: ${response.status}`)
      }

      const data: AnalyticsRow[] = await response.json()
      setCases(data)
      setLoadingState("ready")
    } catch (error) {
      setCases([])
      setLoadingState("error")
      setErrorMessage(error instanceof Error ? error.message : "Unable to load analytics data")
    }
  }

  useEffect(() => {
    void loadCases()
  }, [])

  const metrics = useMemo(() => {
    const totalCases = cases.length
    const avgDetentionDays = average(cases.map((row) => Number(row.detention_days ?? 0)))
    const grantedCases = cases.filter((row) => {
      const status = normalizeStatus(row.bail_status)
      return ["GRANTED", "APPROVED", "ALLOWED", "BAIL GRANTED", "RELEASED"].includes(status)
    }).length
    const bailGrantRate = totalCases ? (grantedCases / totalCases) * 100 : 0
    const avgBailDelay = average(cases.map((row) => Number(row.bail_delay_days ?? 0)))
    const eligibleButDetainedCount = cases.filter((row) => isTruthy(row.eligible_but_detained)).length

    return {
      totalCases,
      avgDetentionDays,
      bailGrantRate,
      avgBailDelay,
      eligibleButDetainedCount,
    }
  }, [cases])

  const chargeDetention = useMemo(
    () => buildGroupedAverage(cases, "assigned_ipc", "detention_days").slice(0, 8),
    [cases]
  )
  const courtDelay = useMemo(
    () => buildGroupedAverage(cases, "court_name", "bail_delay_days").slice(0, 8),
    [cases]
  )
  const prisonBacklog = useMemo(
    () => buildGroupedCount(cases, "prison_name", (row) => isTruthy(row.eligible_but_detained)).slice(0, 8),
    [cases]
  )
  const suretyBarrier = useMemo(() => buildSuretyBuckets(cases), [cases])

  const recentCases = useMemo(() => cases.slice(0, 6), [cases])

  const downloadCsv = () => {
    const header = ["assigned_ipc", "court_name", "detention_days", "bail_status"].join(",")
    const rows = cases.map((row) => [row.assigned_ipc, row.court_name, row.detention_days, row.bail_status]
      .map((value) => `"${String(value ?? "")}"`)
      .join(","))
    const blob = new Blob([`${header}\n${rows.join("\n")}`], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = "justice-system-analytics.csv"
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#F5F3EE]">
      <AppHeader
        title="Justice System Analytics Dashboard"
        subtitle="Live operational metrics from Supabase case records"
        syncStatus={loadingState === "ready" ? "online" : loadingState === "loading" ? "syncing" : "offline"}
        lastSync={loadingState === "ready" ? "just now" : loadingState === "loading" ? "loading..." : "pending"}
      />

      <div className="flex-1 space-y-6 p-6">
        <div className="flex flex-col gap-3 rounded-2xl border border-[#D4D0C5] bg-white/90 p-4 shadow-sm lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-medium text-navy">Live dataset</p>
            <p className="text-sm text-[#5A6A7A]">
              {loadingState === "loading" ? "Loading case analytics from Supabase..." : `Analyzing ${formatCount(metrics.totalCases)} cases from the backend.`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-2 border-[#D4D0C5] text-navy hover:bg-[#E8E5DC]"
              onClick={() => void loadCases()}
              disabled={loadingState === "loading"}
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-2 border-[#D4D0C5] text-navy hover:bg-[#E8E5DC]"
              onClick={downloadCsv}
              disabled={!cases.length}
            >
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </div>

        {errorMessage ? (
          <Card className="border-[#B91C1C]/30 bg-[#FEF2F2]">
            <CardContent className="p-4 text-sm text-[#991B1B]">
              {errorMessage}
            </CardContent>
          </Card>
        ) : null}

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatsCard
            title="Average Detention Days"
            value={metrics.avgDetentionDays ? `${metrics.avgDetentionDays.toFixed(1)} days` : "0 days"}
            subtitle="Across all cases"
            icon={Clock}
            variant="success"
          />
          <StatsCard
            title="Bail Grant Rate (%)"
            value={metrics.totalCases ? formatPercent(metrics.bailGrantRate) : "0.0%"}
            subtitle="Cases with approved bail"
            icon={TrendingUp}
          />
          <StatsCard
            title="Average Bail Delay"
            value={metrics.avgBailDelay ? `${metrics.avgBailDelay.toFixed(1)} days` : "0 days"}
            subtitle="From filing to resolution"
            icon={Scale}
          />
          <StatsCard
            title="Eligible but Detained"
            value={formatCount(metrics.eligibleButDetainedCount)}
            subtitle="Cases flagged for action"
            icon={ShieldCheck}
            variant="warning"
          />
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <Card className="border-[#D4D0C5] bg-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base text-navy">
                <BarChart3 className="h-5 w-5 text-gold" />
                Charges vs Detention
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chargeDetention} layout="vertical" margin={{ left: 12 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E4DED4" />
                  <XAxis type="number" stroke="#5A6A7A" fontSize={12} />
                  <YAxis type="category" dataKey="name" stroke="#5A6A7A" fontSize={11} width={130} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#fff", border: "1px solid #D4D0C5", borderRadius: 8 }}
                    formatter={(value: number) => [`${value.toFixed(1)} days`, "Avg detention"]}
                  />
                  <Bar dataKey="value" fill="#1B3A6B" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border-[#D4D0C5] bg-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base text-navy">
                <Clock className="h-5 w-5 text-gold" />
                Court Delay Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={courtDelay} margin={{ left: 12, right: 12 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E4DED4" />
                  <XAxis dataKey="name" stroke="#5A6A7A" fontSize={12} interval={0} angle={-20} textAnchor="end" height={56} />
                  <YAxis stroke="#5A6A7A" fontSize={12} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#fff", border: "1px solid #D4D0C5", borderRadius: 8 }}
                    formatter={(value: number) => [`${value.toFixed(1)} days`, "Avg delay"]}
                  />
                  <Line type="monotone" dataKey="value" stroke="#C9A84C" strokeWidth={3} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 xl:grid-cols-3">
          <Card className="border-[#D4D0C5] bg-white xl:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base text-navy">
                <AlertTriangle className="h-5 w-5 text-[#B45309]" />
                Prison Backlog
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={prisonBacklog} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={58} outerRadius={94} paddingAngle={3} label>
                    {prisonBacklog.map((entry, index) => (
                      <Cell key={entry.name} fill={palette[index % palette.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: "#fff", border: "1px solid #D4D0C5", borderRadius: 8 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4 space-y-2">
                {prisonBacklog.slice(0, 5).map((item, index) => (
                  <div key={item.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="h-3 w-3 rounded-full" style={{ backgroundColor: palette[index % palette.length] }} />
                      <span className="text-[#5A6A7A]">{item.name}</span>
                    </div>
                    <span className="font-medium text-navy">{formatCount(item.value)}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-[#D4D0C5] bg-white xl:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base text-navy">
                <Scale className="h-5 w-5 text-gold" />
                Surety Barrier
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {suretyBarrier.map((bucket, index) => (
                  <div key={bucket.name} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[#5A6A7A]">{bucket.name}</span>
                      <span className="font-medium text-navy">{formatCount(bucket.value)}</span>
                    </div>
                    <Progress value={Math.min(100, bucket.value * 20)} className="h-2" />
                  </div>
                ))}
              </div>

              <div className="mt-6 rounded-lg border border-navy/15 bg-navy/5 p-4">
                <div className="flex items-start gap-3">
                  <Info className="mt-0.5 h-5 w-5 shrink-0 text-navy" />
                  <div>
                    <p className="text-sm font-medium text-navy">Pattern insight</p>
                    <p className="mt-1 text-sm text-[#5A6A7A]">
                      The dashboard highlights where surety amounts cluster above common affordability thresholds, helping prioritise relief requests.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-[#D4D0C5] bg-white">
          <CardHeader>
            <div className="flex items-center justify-between gap-4">
              <CardTitle className="flex items-center gap-2 text-base text-navy">
                <BarChart3 className="h-5 w-5 text-gold" />
                Recent Cases
              </CardTitle>
              <span className="text-sm text-[#5A6A7A]">Latest records returned by Supabase</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#D4D0C5]">
                    <th className="px-4 py-3 text-left text-sm font-medium text-[#5A6A7A]">IPC</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-[#5A6A7A]">Court</th>
                    <th className="px-4 py-3 text-center text-sm font-medium text-[#5A6A7A]">Detention</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-[#5A6A7A]">Bail Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentCases.length ? (
                    recentCases.map((row, index) => (
                      <tr key={`${row.id}-${index}`} className="border-b border-[#D4D0C5]/60">
                        <td className="px-4 py-3 text-sm font-medium text-navy">{row.assigned_ipc ?? "Unknown"}</td>
                        <td className="px-4 py-3 text-sm text-[#5A6A7A]">{row.court_name ?? "Unknown"}</td>
                        <td className="px-4 py-3 text-center text-sm text-navy">{Number(row.detention_days ?? 0)} days</td>
                        <td className="px-4 py-3 text-right text-sm text-navy">{row.bail_status ?? "Pending"}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-sm text-[#5A6A7A]">
                        {loadingState === "loading" ? "Loading cases..." : "No case records available."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
