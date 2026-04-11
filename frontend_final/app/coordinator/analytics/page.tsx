"use client"

import { AppHeader } from "@/components/app-header"
import { StatsCard } from "@/components/stats-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  mockCourtBehaviors,
} from "@/lib/mock-data"
import {
  BarChart3,
  TrendingUp,
  Scale,
  Clock,
  AlertTriangle,
  Download,
  RefreshCw,
  Info,
} from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts"

// Mock analytics data
const chargeDistribution = [
  { name: 'Theft (IPC 379-382)', count: 234, avgDetention: 245 },
  { name: 'Cheating (IPC 420)', count: 189, avgDetention: 312 },
  { name: 'Hurt (IPC 323-326)', count: 167, avgDetention: 198 },
  { name: 'Criminal Breach (IPC 405-409)', count: 145, avgDetention: 287 },
  { name: 'NDPS', count: 123, avgDetention: 456 },
  { name: 'Other', count: 312, avgDetention: 234 },
]

const monthlyTrends = [
  { month: 'Mar', eligible: 145, filed: 98, granted: 82 },
  { month: 'Apr', eligible: 167, filed: 112, granted: 94 },
  { month: 'May', eligible: 178, filed: 125, granted: 108 },
  { month: 'Jun', eligible: 192, filed: 134, granted: 118 },
  { month: 'Jul', eligible: 187, filed: 142, granted: 125 },
  { month: 'Aug', eligible: 203, filed: 156, granted: 138 },
]

const suretyBlockedCases = [
  { range: '< 30 days wage', count: 45, percentage: 12 },
  { range: '30-60 days wage', count: 78, percentage: 21 },
  { range: '60-90 days wage', count: 112, percentage: 30 },
  { range: '> 90 days wage', count: 134, percentage: 37 },
]

const COLORS = ['#1B3A6B', '#C9A84C', '#166534', '#B45309']

export default function AnalyticsPage() {
  const totalCases = chargeDistribution.reduce((acc, c) => acc + c.count, 0)
  
  return (
    <div className="flex flex-col min-h-screen bg-[#F5F3EE]">
      <AppHeader
        title="Analytics & Pattern Intelligence"
        subtitle="Systemic insights from undertrial case data"
        syncStatus="online"
        lastSync="10 min ago"
      />

      <div className="flex-1 p-6 space-y-6">
        {/* Controls */}
        <div className="flex items-center justify-between">
          <Tabs defaultValue="overview">
            <TabsList className="bg-white border border-[#D4D0C5]">
              <TabsTrigger value="overview" className="data-[state=active]:bg-[#1B3A6B] data-[state=active]:text-white">Overview</TabsTrigger>
              <TabsTrigger value="charges" className="data-[state=active]:bg-[#1B3A6B] data-[state=active]:text-white">Charge Analysis</TabsTrigger>
              <TabsTrigger value="courts" className="data-[state=active]:bg-[#1B3A6B] data-[state=active]:text-white">Court Patterns</TabsTrigger>
              <TabsTrigger value="surety" className="data-[state=active]:bg-[#1B3A6B] data-[state=active]:text-white">Surety Intelligence</TabsTrigger>
            </TabsList>
          </Tabs>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2 border-[#D4D0C5] text-[#1B3A6B] hover:bg-[#E8E5DC]">
              <RefreshCw className="h-4 w-4" />
              Refresh Data
            </Button>
            <Button variant="outline" size="sm" className="gap-2 border-[#D4D0C5] text-[#1B3A6B] hover:bg-[#E8E5DC]">
              <Download className="h-4 w-4" />
              Export Report
            </Button>
          </div>
        </div>

        {/* Key Insights */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Bail Filing Rate"
            value="76%"
            subtitle="Of eligible cases"
            icon={TrendingUp}
            variant="success"
            trend={{ value: 8, direction: 'up', label: 'vs last quarter' }}
          />
          <StatsCard
            title="Avg Processing Time"
            value="18 days"
            subtitle="Eligibility to filing"
            icon={Clock}
            trend={{ value: 12, direction: 'down', label: 'improvement' }}
          />
          <StatsCard
            title="Surety Blocked"
            value="134"
            subtitle="Cases > 90 days wage"
            icon={AlertTriangle}
            variant="warning"
          />
          <StatsCard
            title="High Adjournment Courts"
            value="3"
            subtitle="> 70% adjournment rate"
            icon={Scale}
            variant="destructive"
          />
        </div>

        {/* Charts Grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Monthly Trends */}
          <Card className="bg-white border-[#D4D0C5]">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2 text-[#1B3A6B]">
                  <TrendingUp className="h-5 w-5 text-[#C9A84C]" />
                  Monthly Bail Trends
                </CardTitle>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-[#5A6A7A] hover:bg-[#E8E5DC]">
                  <Info className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyTrends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#D4D0C5" />
                  <XAxis 
                    dataKey="month" 
                    stroke="#5A6A7A" 
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="#5A6A7A" 
                    fontSize={12}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #D4D0C5',
                      borderRadius: '8px',
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="eligible" 
                    stroke="#1B3A6B" 
                    strokeWidth={2}
                    name="Eligible"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="filed" 
                    stroke="#C9A84C" 
                    strokeWidth={2}
                    name="Filed"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="granted" 
                    stroke="#166534" 
                    strokeWidth={2}
                    name="Granted"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Charge Distribution */}
          <Card className="bg-white border-[#D4D0C5]">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2 text-[#1B3A6B]">
                  <BarChart3 className="h-5 w-5 text-[#C9A84C]" />
                  Cases by Charge Category
                </CardTitle>
                <span className="text-sm text-[#5A6A7A]">
                  {totalCases} total cases
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chargeDistribution} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#D4D0C5" />
                  <XAxis type="number" stroke="#5A6A7A" fontSize={12} />
                  <YAxis 
                    type="category" 
                    dataKey="name" 
                    stroke="#5A6A7A" 
                    fontSize={11}
                    width={120}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #D4D0C5',
                      borderRadius: '8px',
                    }}
                    formatter={(value, name) => [
                      name === 'count' ? `${value} cases` : `${value} days avg`,
                      name === 'count' ? 'Cases' : 'Avg Detention'
                    ]}
                  />
                  <Bar dataKey="count" fill="#1B3A6B" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Surety Analysis */}
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-1 bg-white border-[#D4D0C5]">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2 text-[#1B3A6B]">
                <AlertTriangle className="h-5 w-5 text-[#B45309]" />
                Surety Affordability
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={suretyBlockedCases}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    dataKey="count"
                    nameKey="range"
                    label={({ percentage }) => `${percentage}%`}
                    labelLine={false}
                  >
                    {suretyBlockedCases.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #D4D0C5',
                      borderRadius: '8px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              
              <div className="mt-4 space-y-2">
                {suretyBlockedCases.map((item, index) => (
                  <div key={item.range} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div 
                        className="h-3 w-3 rounded-full" 
                        style={{ backgroundColor: COLORS[index] }}
                      />
                      <span className="text-[#5A6A7A]">{item.range}</span>
                    </div>
                    <span className="font-medium text-[#1B3A6B]">{item.count}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Longest Detention by Charge */}
          <Card className="lg:col-span-2 bg-white border-[#D4D0C5]">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2 text-[#1B3A6B]">
                <Clock className="h-5 w-5 text-[#C9A84C]" />
                Average Detention by Charge Type
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {chargeDistribution
                  .sort((a, b) => b.avgDetention - a.avgDetention)
                  .map((charge) => (
                    <div key={charge.name} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-[#5A6A7A]">{charge.name}</span>
                        <span className="font-medium text-[#1B3A6B]">
                          {charge.avgDetention} days
                        </span>
                      </div>
                      <Progress 
                        value={(charge.avgDetention / 500) * 100} 
                        className="h-2"
                      />
                    </div>
                  ))}
              </div>
              
              <div className="mt-6 p-4 rounded-lg bg-[#1B3A6B]/5 border border-[#1B3A6B]/20">
                <div className="flex items-start gap-3">
                  <Info className="h-5 w-5 text-[#1B3A6B] shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-[#1B3A6B]">
                      Pattern Insight
                    </p>
                    <p className="text-sm text-[#5A6A7A] mt-1">
                      NDPS cases show 40% longer average detention compared to other charge types. 
                      Consider prioritizing Section 479 eligibility checks for NDPS undertrials.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Court Performance Table */}
        <Card className="bg-white border-[#D4D0C5]">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2 text-[#1B3A6B]">
                <Scale className="h-5 w-5 text-[#C9A84C]" />
                Court Performance Analysis
              </CardTitle>
              <Button variant="outline" size="sm" className="border-[#D4D0C5] text-[#1B3A6B] hover:bg-[#E8E5DC]">
                View Full Report
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#D4D0C5]">
                    <th className="text-left py-3 px-4 text-sm font-medium text-[#5A6A7A]">Court</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-[#5A6A7A]">Judge</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-[#5A6A7A]">Case Type</th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-[#5A6A7A]">Adjournment Rate</th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-[#5A6A7A]">Avg Decision Time</th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-[#5A6A7A]">Q3 Adjournments</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-[#5A6A7A]">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {mockCourtBehaviors.map((court) => (
                    <tr key={`${court.courtName}-${court.judge}`} className="border-b border-[#D4D0C5]/50">
                      <td className="py-3 px-4 text-sm font-medium text-[#1B3A6B]">
                        {court.courtName}
                      </td>
                      <td className="py-3 px-4 text-sm text-[#5A6A7A]">
                        {court.judge}
                      </td>
                      <td className="py-3 px-4">
                        <span className="rounded bg-[#E8E5DC] px-2 py-0.5 text-xs text-[#1B3A6B]">
                          {court.caseType}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`text-sm font-medium ${
                          court.adjournmentRate >= 70 
                            ? 'text-[#B91C1C]' 
                            : court.adjournmentRate >= 50 
                              ? 'text-[#B45309]' 
                              : 'text-[#166534]'
                        }`}>
                          {court.adjournmentRate}%
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center text-sm text-[#1B3A6B]">
                        {court.avgBailDecisionDays} days
                      </td>
                      <td className="py-3 px-4 text-center text-sm text-[#1B3A6B]">
                        {court.quarterlyAdjournments}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {court.quarterlyAdjournments >= 20 ? (
                          <span className="inline-flex items-center gap-1 rounded bg-[#B45309]/10 px-2 py-1 text-xs font-medium text-[#B45309]">
                            <AlertTriangle className="h-3 w-3" />
                            Pattern Alert
                          </span>
                        ) : (
                          <span className="text-xs text-[#5A6A7A]">Normal</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Privacy Notice */}
        <Card className="bg-[#E8E5DC]/50 border-[#D4D0C5]">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-[#5A6A7A] shrink-0 mt-0.5" />
              <div className="text-sm text-[#5A6A7A]">
                <p className="font-medium text-[#1B3A6B] mb-1">Privacy & Compliance Notice</p>
                <p>
                  All analytics are computed from anonymized, aggregated data in compliance with DPDPA 2023. 
                  Individual case records are not retained beyond active case management needs. 
                  Pattern learning uses differential privacy guarantees.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
