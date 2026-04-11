"use client"

import { useState } from "react"
import { AppHeader } from "@/components/app-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { mockPrisonSummaries, mockDistrictComparisons, mockCourtBehaviors } from "@/lib/mock-data"
import {
  FileText,
  Download,
  Calendar,
  BarChart3,
  Building2,
  Scale,
  Users,
  Clock,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  AlertTriangle,
  Filter,
  Printer,
  Mail,
  ChevronRight,
  Loader2,
  MapPin,
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const reportTemplates = [
  {
    id: "nalsa-quarterly",
    name: "NALSA Quarterly Report",
    description: "Mandatory quarterly submission to NALSA. Covers eligibility rates, bail outcomes, and systemic patterns.",
    icon: FileText,
    badge: "Due in 18 days",
    badgeColor: "bg-[#B45309] text-white",
    category: "Mandatory",
  },
  {
    id: "district-status",
    name: "District Status Report",
    description: "Overview of all districts' undertrial status, pending actions, and performance metrics.",
    icon: MapPin,
    badge: "Monthly",
    badgeColor: "bg-[#1B3A6B] text-white",
    category: "Periodic",
  },
  {
    id: "section-479-analysis",
    name: "Section 479 BNSS Analysis",
    description: "Detailed analysis of Section 479 eligibility computations, edge cases, and lawyer review flags.",
    icon: Scale,
    badge: "On Demand",
    badgeColor: "bg-[#166534] text-white",
    category: "Analysis",
  },
  {
    id: "prison-overcrowding",
    name: "Prison Overcrowding Report",
    description: "Facility-wise undertrial population vs capacity ratios and recommendations.",
    icon: Building2,
    badge: "On Demand",
    badgeColor: "bg-[#166534] text-white",
    category: "Analysis",
  },
  {
    id: "court-behavior",
    name: "Court Behavior Analysis",
    description: "Adjournment patterns, bail decision timelines, and judge-specific trends.",
    icon: BarChart3,
    badge: "On Demand",
    badgeColor: "bg-[#166534] text-white",
    category: "Analysis",
  },
  {
    id: "bail-outcomes",
    name: "Bail Outcomes Report",
    description: "Track bail granted vs denied rates, surety blocks, and family notification uptake.",
    icon: CheckCircle2,
    badge: "On Demand",
    badgeColor: "bg-[#166534] text-white",
    category: "Analysis",
  },
]

function ReportPreviewCard({ reportId, onClose }: { reportId: string; onClose: () => void }) {
  const [generating, setGenerating] = useState(false)
  const [generated, setGenerated] = useState(false)

  const template = reportTemplates.find(r => r.id === reportId)!

  const handleGenerate = async () => {
    setGenerating(true)
    await new Promise(r => setTimeout(r, 2000))
    setGenerating(false)
    setGenerated(true)
  }

  const totalUndertrials = mockPrisonSummaries.reduce((s, p) => s + p.totalUndertrials, 0)
  const totalEligible = mockPrisonSummaries.reduce((s, p) => s + p.eligibleUndertrials, 0)
  const totalWindow = mockPrisonSummaries.reduce((s, p) => s + p.windowClosingCount, 0)
  const totalPending = mockPrisonSummaries.reduce((s, p) => s + p.pendingActions, 0)

  return (
    <Card className="bg-white border-[#C9A84C] border-2">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-[#1B3A6B] text-base flex items-center gap-2">
            <template.icon className="h-5 w-5 text-[#C9A84C]" />
            {template.name} — Preview
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            className="text-[#5A6A7A] hover:bg-[#E8E5DC]"
            onClick={onClose}
          >
            ✕
          </Button>
        </div>
        <p className="text-xs text-[#5A6A7A]">Generated: {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Summary Stats */}
        <div className="grid gap-3 md:grid-cols-4">
          {[
            { label: "Total Undertrials", value: totalUndertrials.toLocaleString(), icon: Users, color: "text-[#1B3A6B]", bg: "bg-[#1B3A6B]/10" },
            { label: "Sec. 479 Eligible", value: totalEligible, icon: Scale, color: "text-[#166534]", bg: "bg-[#166534]/10" },
            { label: "Window Closing", value: totalWindow, icon: Clock, color: "text-[#B45309]", bg: "bg-[#B45309]/10" },
            { label: "Actions Pending", value: totalPending, icon: AlertTriangle, color: "text-[#B91C1C]", bg: "bg-[#B91C1C]/10" },
          ].map(stat => {
            const Icon = stat.icon
            return (
              <div key={stat.label} className={cn("rounded-lg p-3", stat.bg)}>
                <Icon className={cn("h-5 w-5 mb-1", stat.color)} />
                <p className={cn("text-xl font-bold", stat.color)}>{stat.value}</p>
                <p className="text-xs text-[#5A6A7A]">{stat.label}</p>
              </div>
            )
          })}
        </div>

        {/* District Table Preview */}
        <div>
          <p className="text-sm font-semibold text-[#1B3A6B] mb-2">District Performance Summary</p>
          <div className="rounded-lg border border-[#D4D0C5] overflow-hidden">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-[#1B3A6B] text-white">
                  <th className="text-left px-3 py-2">District</th>
                  <th className="text-right px-3 py-2">Eligible</th>
                  <th className="text-right px-3 py-2">Completed</th>
                  <th className="text-right px-3 py-2">%</th>
                  <th className="text-right px-3 py-2">Avg Days</th>
                  <th className="text-right px-3 py-2">Quality</th>
                </tr>
              </thead>
              <tbody>
                {mockDistrictComparisons.map((d, i) => {
                  const pct = Math.round((d.actionsCompleted / d.eligibleCount) * 100)
                  return (
                    <tr key={d.district} className={i % 2 === 0 ? "bg-white" : "bg-[#F5F3EE]"}>
                      <td className="px-3 py-2 font-medium text-[#1B3A6B]">{d.district}</td>
                      <td className="px-3 py-2 text-right text-[#5A6A7A]">{d.eligibleCount}</td>
                      <td className="px-3 py-2 text-right text-[#5A6A7A]">{d.actionsCompleted}</td>
                      <td className={cn("px-3 py-2 text-right font-medium", pct >= 70 ? "text-[#166534]" : pct >= 40 ? "text-[#B45309]" : "text-[#B91C1C]")}>
                        {pct}%
                      </td>
                      <td className="px-3 py-2 text-right text-[#5A6A7A]">{d.avgProcessingTime}d</td>
                      <td className="px-3 py-2 text-right text-[#5A6A7A]">{d.dataQualityScore}%</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Key Findings */}
        <div>
          <p className="text-sm font-semibold text-[#1B3A6B] mb-2">Key Findings</p>
          <div className="space-y-2">
            {[
              { icon: TrendingUp, color: "text-[#166534] bg-[#166534]/10", text: `${Math.round((totalEligible / totalUndertrials) * 100)}% of undertrials are eligible under Section 479 BNSS — action is pending for ${totalPending} cases` },
              { icon: AlertTriangle, color: "text-[#B45309] bg-[#B45309]/10", text: `${totalWindow} eligibility windows set to close within 30 days — requires immediate paralegal intervention` },
              { icon: Scale, color: "text-[#1B3A6B] bg-[#1B3A6B]/10", text: `${mockCourtBehaviors.filter(c => c.adjournmentRate >= 70).length} courts have adjournment rates above 70%, contributing to extended detention` },
            ].map(({ icon: Icon, color, text }, i) => (
              <div key={i} className="flex items-start gap-3 rounded-lg bg-[#F5F3EE] p-3">
                <div className={cn("flex h-6 w-6 shrink-0 items-center justify-center rounded-full", color.split(" ")[1])}>
                  <Icon className={cn("h-3.5 w-3.5", color.split(" ")[0])} />
                </div>
                <p className="text-xs text-[#5A6A7A]">{text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-[#D4D0C5]">
          <Button
            className="gap-2 bg-[#1B3A6B] hover:bg-[#2A4A7B]"
            onClick={handleGenerate}
            disabled={generating}
          >
            {generating ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Generating...</>
            ) : generated ? (
              <><CheckCircle2 className="h-4 w-4" /> Download PDF</>
            ) : (
              <><Download className="h-4 w-4" /> Generate & Download</>
            )}
          </Button>
          <Button variant="outline" className="gap-2 border-[#D4D0C5] text-[#1B3A6B] hover:bg-[#E8E5DC]">
            <Printer className="h-4 w-4" />
            Print
          </Button>
          <Button variant="outline" className="gap-2 border-[#D4D0C5] text-[#1B3A6B] hover:bg-[#E8E5DC]">
            <Mail className="h-4 w-4" />
            Email to NALSA
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default function ReportsPage() {
  const [selectedReport, setSelectedReport] = useState<string | null>(null)
  const [period, setPeriod] = useState("q3-2024")
  const [district, setDistrict] = useState("all")

  return (
    <div className="flex flex-col min-h-screen bg-[#F5F3EE]">
      <AppHeader
        title="Reports"
        subtitle="Generate and manage district-wide reports for NALSA and administration"
        syncStatus="online"
        lastSync="3 min ago"
      />

      <div className="flex-1 p-6 space-y-6">
        {/* Filters Row */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-[#5A6A7A]" />
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-40 border-[#D4D0C5] bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="q3-2024">Q3 2024</SelectItem>
                <SelectItem value="q2-2024">Q2 2024</SelectItem>
                <SelectItem value="q1-2024">Q1 2024</SelectItem>
                <SelectItem value="q4-2023">Q4 2023</SelectItem>
                <SelectItem value="annual-2023">Annual 2023</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-[#5A6A7A]" />
            <Select value={district} onValueChange={setDistrict}>
              <SelectTrigger className="w-48 border-[#D4D0C5] bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="all">All Districts</SelectItem>
                <SelectItem value="lucknow">Lucknow</SelectItem>
                <SelectItem value="varanasi">Varanasi</SelectItem>
                <SelectItem value="agra">Agra</SelectItem>
                <SelectItem value="kanpur">Kanpur</SelectItem>
                <SelectItem value="meerut">Meerut</SelectItem>
                <SelectItem value="gorakhpur">Gorakhpur</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="ml-auto">
            <Button className="gap-2 bg-[#C9A84C] hover:bg-[#A8893D] text-[#1B3A6B] font-semibold">
              <BarChart3 className="h-4 w-4" />
              Generate All
            </Button>
          </div>
        </div>

        {/* Report Preview (if selected) */}
        {selectedReport && (
          <ReportPreviewCard
            reportId={selectedReport}
            onClose={() => setSelectedReport(null)}
          />
        )}

        {/* Report Templates */}
        <div className="space-y-4">
          <h2 className="text-base font-semibold text-[#1B3A6B]">Report Templates</h2>

          {["Mandatory", "Periodic", "Analysis"].map(cat => (
            <div key={cat} className="space-y-3">
              <div className="flex items-center gap-2">
                <div className={cn(
                  "h-2 w-2 rounded-full",
                  cat === "Mandatory" ? "bg-[#B91C1C]" :
                  cat === "Periodic" ? "bg-[#B45309]" : "bg-[#1B3A6B]"
                )} />
                <p className="text-xs font-semibold uppercase tracking-wider text-[#5A6A7A]">{cat}</p>
              </div>
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {reportTemplates
                  .filter(r => r.category === cat)
                  .map(report => {
                    const Icon = report.icon
                    const isSelected = selectedReport === report.id
                    return (
                      <div
                        key={report.id}
                        onClick={() => setSelectedReport(isSelected ? null : report.id)}
                        className={cn(
                          "group cursor-pointer rounded-xl border bg-white p-4 transition-all hover:shadow-md",
                          isSelected
                            ? "border-[#C9A84C] ring-2 ring-[#C9A84C]/30"
                            : "border-[#D4D0C5] hover:border-[#C9A84C]"
                        )}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                              isSelected ? "bg-[#C9A84C]/20" : "bg-[#1B3A6B]/10"
                            )}>
                              <Icon className={cn("h-5 w-5", isSelected ? "text-[#C9A84C]" : "text-[#1B3A6B]")} />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-[#1B3A6B]">{report.name}</p>
                              <span className={cn("mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium", report.badgeColor)}>
                                {report.badge}
                              </span>
                            </div>
                          </div>
                          <ChevronRight className={cn(
                            "h-4 w-4 shrink-0 transition-transform",
                            isSelected ? "rotate-90 text-[#C9A84C]" : "text-[#D4D0C5] group-hover:text-[#C9A84C]"
                          )} />
                        </div>
                        <p className="mt-3 text-xs text-[#5A6A7A] leading-relaxed">{report.description}</p>
                        <div className="mt-3 flex gap-2">
                          <button
                            onClick={e => { e.stopPropagation(); setSelectedReport(report.id) }}
                            className="rounded text-xs font-medium text-[#1B3A6B] hover:underline"
                          >
                            Preview
                          </button>
                          <span className="text-[#D4D0C5]">•</span>
                          <button
                            onClick={e => e.stopPropagation()}
                            className="flex items-center gap-1 rounded text-xs font-medium text-[#1B3A6B] hover:underline"
                          >
                            <Download className="h-3 w-3" />
                            Quick Download
                          </button>
                        </div>
                      </div>
                    )
                  })}
              </div>
            </div>
          ))}
        </div>

        {/* Historical Reports */}
        <Card className="bg-white border-[#D4D0C5]">
          <CardHeader>
            <CardTitle className="text-[#1B3A6B] flex items-center gap-2 text-base">
              <FileText className="h-5 w-5 text-[#C9A84C]" />
              Previously Generated Reports
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {[
                { name: "NALSA Q2 2024 Report", date: "2024-07-15", size: "2.4 MB", type: "PDF" },
                { name: "District Status – June 2024", date: "2024-07-01", size: "1.1 MB", type: "PDF" },
                { name: "Section 479 Analysis – Q2", date: "2024-06-30", size: "856 KB", type: "XLSX" },
                { name: "NALSA Q1 2024 Report", date: "2024-04-12", size: "2.2 MB", type: "PDF" },
                { name: "Annual Report 2023", date: "2024-01-20", size: "5.8 MB", type: "PDF" },
              ].map((report, i) => (
                <div key={i} className="flex items-center justify-between py-2.5 border-b border-[#E8E5DC] last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1B3A6B]/10">
                      <FileText className="h-4 w-4 text-[#1B3A6B]" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#1B3A6B]">{report.name}</p>
                      <p className="text-xs text-[#5A6A7A]">{new Date(report.date).toLocaleDateString('en-IN')} • {report.size} • {report.type}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="gap-1.5 text-[#1B3A6B] hover:bg-[#E8E5DC]">
                    <Download className="h-3.5 w-3.5" />
                    Download
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Deadlines */}
        <Card className="bg-white border-[#D4D0C5]">
          <CardHeader>
            <CardTitle className="text-[#1B3A6B] flex items-center gap-2 text-base">
              <Calendar className="h-5 w-5 text-[#C9A84C]" />
              Upcoming Report Deadlines
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { name: "NALSA Q3 2024 Report", due: "2024-08-31", daysLeft: 18, urgency: "warning" },
                { name: "High Court Status Report", due: "2024-09-15", daysLeft: 33, urgency: "info" },
                { name: "Annual Review Submission", due: "2025-01-15", daysLeft: 158, urgency: "info" },
              ].map((item, i) => (
                <div key={i} className={cn(
                  "flex items-center justify-between rounded-lg p-3",
                  item.urgency === "warning" ? "bg-[#B45309]/10 border border-[#B45309]/30" : "bg-[#F5F3EE]"
                )}>
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold",
                      item.urgency === "warning" ? "bg-[#B45309] text-white" : "bg-[#1B3A6B]/20 text-[#1B3A6B]"
                    )}>
                      {item.daysLeft}d
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#1B3A6B]">{item.name}</p>
                      <p className="text-xs text-[#5A6A7A]">Due: {new Date(item.due).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                    </div>
                  </div>
                  <Button size="sm" className="bg-[#1B3A6B] hover:bg-[#2A4A7B] gap-1.5">
                    <FileText className="h-3.5 w-3.5" />
                    Prepare
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
