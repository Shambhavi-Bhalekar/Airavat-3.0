"use client"

import { use, useEffect, useState } from "react"
import { notFound } from "next/navigation"
import Link from "next/link"
import { AppHeader } from "@/components/app-header"
import { AppSidebar } from "@/components/app-sidebar"
import { StatusBadge } from "@/components/status-badge"
import { ConfidenceBadge } from "@/components/confidence-badge"
import { EligibilityCard } from "@/components/eligibility-card"
import { HearingCard } from "@/components/hearing-card"
import { SuretyCard } from "@/components/surety-card"
import { ReasoningChain } from "@/components/reasoning-chain"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { fetchCases, updateCase } from "@/lib/api"
import type { Case } from "@/lib/types"
import {
  ArrowLeft,
  User,
  MapPin,
  Calendar,
  FileText,
  Phone,
  Scale,
  AlertTriangle,
  CheckCircle2,
  Clock,
  MessageSquare,
  Download,
  Printer,
  Share2,
  Loader2,
} from "lucide-react"

interface CaseDetailPageProps {
  params: Promise<{ id: string }>
}

export default function CaseDetailPage({ params }: CaseDetailPageProps) {
  const { id } = use(params)
  const [caseData, setCaseData] = useState<Case | null>(null)
  const [loading, setLoading] = useState(true)
  const [noteText, setNoteText] = useState("")
  const [savingNote, setSavingNote] = useState(false)

  useEffect(() => {
    fetchCases()
      .then(cases => {
        const found = cases.find(c => c.id === id)
        if (found) {
          setCaseData(found)
        } else {
          // Fallback: try mock data
          import("@/lib/mock-data").then(m => {
            const mock = m.mockCases.find(c => c.id === id)
            setCaseData(mock ?? null)
          })
        }
      })
      .catch(() => {
        // On network error, fall back to mock data
        import("@/lib/mock-data").then(m => {
          const mock = m.mockCases.find(c => c.id === id)
          setCaseData(mock ?? null)
        })
      })
      .finally(() => setLoading(false))
  }, [id])

  const handleAddNote = async () => {
    if (!noteText.trim() || !caseData) return
    setSavingNote(true)
    try {
      const timestamp = new Date().toLocaleDateString('en-IN')
      const newNote = `${timestamp}: ${noteText.trim()}`
      // Try to persist to backend (best-effort)
      await updateCase(caseData.id, { reason: newNote }).catch(() => {})
      setCaseData(prev =>
        prev
          ? { ...prev, paralegalNotes: [newNote, ...prev.paralegalNotes] }
          : prev
      )
      setNoteText("")
    } finally {
      setSavingNote(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#F5F3EE]">
        <div className="flex flex-col items-center gap-3 text-[#5A6A7A]">
          <Loader2 className="h-8 w-8 animate-spin text-[#1B3A6B]" />
          <p className="text-sm">Loading case…</p>
        </div>
      </div>
    )
  }

  if (!caseData) {
    notFound()
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#F5F3EE]">
      <AppSidebar role="paralegal" alerts={4} />
      
      <main className="flex-1 overflow-auto min-w-0">
        <AppHeader
          title="Case Details"
          subtitle={caseData.caseNumber}
          syncStatus={caseData.dataFreshness === 'fresh' ? 'online' : 'offline'}
          lastSync={new Date(caseData.lastSyncTimestamp).toLocaleTimeString('en-IN', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        />

        <div className="p-6 space-y-6">
          {/* Back & Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <Link href="/paralegal">
              <Button variant="ghost" size="sm" className="gap-2 text-[#1B3A6B] hover:bg-[#E8E5DC]">
                <ArrowLeft className="h-4 w-4" />
                Back to Queue
              </Button>
            </Link>
            <div className="flex items-center gap-2 flex-wrap">
              <Button variant="outline" size="sm" className="gap-2 border-[#D4D0C5] text-[#1B3A6B] hover:bg-[#E8E5DC]">
                <Printer className="h-4 w-4" />
                <span className="hidden sm:inline">Print Brief</span>
              </Button>
              <Button variant="outline" size="sm" className="gap-2 border-[#D4D0C5] text-[#1B3A6B] hover:bg-[#E8E5DC]">
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">Export</span>
              </Button>
              <Button variant="outline" size="sm" className="gap-2 border-[#D4D0C5] text-[#1B3A6B] hover:bg-[#E8E5DC]">
                <Share2 className="h-4 w-4" />
                <span className="hidden sm:inline">Share</span>
              </Button>
            </div>
          </div>

          {/* Prisoner Header */}
          <Card className="bg-white border-[#D4D0C5]">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#1B3A6B] text-white text-xl font-bold">
                    {caseData.prisonerName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <h1 className="text-2xl font-bold text-[#1B3A6B]">
                        {caseData.prisonerName}
                      </h1>
                      <StatusBadge status={caseData.eligibility.status} />
                    </div>
                    <p className="text-[#5A6A7A]">
                      {caseData.fatherName !== '—' ? `S/o ${caseData.fatherName} | ` : ''}
                      {caseData.age > 0 ? `${caseData.age} years | ` : ''}
                      {caseData.gender}
                    </p>
                    <div className="flex flex-wrap gap-4 mt-2 text-sm text-[#5A6A7A]">
                      <span className="flex items-center gap-1">
                        <FileText className="h-4 w-4" />
                        {caseData.caseNumber}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {caseData.prison}
                      </span>
                      {caseData.arrestDate && (
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          Arrested {new Date(caseData.arrestDate).toLocaleDateString('en-IN')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col items-end gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-[#5A6A7A]">Priority Rank</span>
                    <span className="text-2xl font-bold text-[#C9A84C]">#{caseData.priorityRank}</span>
                  </div>
                  <ConfidenceBadge confidence={caseData.eligibility.confidence} showInterval />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Main Content Grid */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Eligibility Assessment */}
              <EligibilityCard 
                eligibility={caseData.eligibility}
                isFirstTimeOffender={caseData.isFirstTimeOffender}
              />

              {/* Charges */}
              <Card className="bg-white border-[#D4D0C5]">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2 text-[#1B3A6B]">
                    <Scale className="h-5 w-5 text-[#C9A84C]" />
                    Charges ({caseData.charges.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {caseData.charges.map((charge, index) => (
                      <div
                        key={index}
                        className="flex items-start justify-between p-3 rounded-lg bg-[#F5F3EE]"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-sm font-medium text-[#1B3A6B]">
                              {charge.act} {charge.section}
                            </span>
                            {charge.isLifeImprisonment && (
                              <span className="rounded bg-[#B91C1C]/10 px-1.5 py-0.5 text-xs text-[#B91C1C]">
                                Life
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-[#5A6A7A] mt-1">
                            {charge.description}
                          </p>
                          <p className="text-xs text-[#5A6A7A] mt-1">
                            Max sentence: {charge.maxSentence}
                          </p>
                          {charge.bnssMapping && (
                            <p className="text-xs text-[#1B3A6B] mt-1">
                              BNSS mapping: {charge.bnssMapping}
                            </p>
                          )}
                        </div>
                        <ConfidenceBadge confidence={charge.confidence} size="sm" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Reasoning Chain */}
              <Card className="bg-white border-[#D4D0C5]">
                <CardHeader>
                  <CardTitle className="text-base text-[#1B3A6B]">Assessment Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="reasoning">
                    <TabsList className="mb-4 bg-[#E8E5DC]">
                      <TabsTrigger value="reasoning" className="data-[state=active]:bg-[#1B3A6B] data-[state=active]:text-white">Reasoning Chain</TabsTrigger>
                      <TabsTrigger value="notes" className="data-[state=active]:bg-[#1B3A6B] data-[state=active]:text-white">Paralegal Notes</TabsTrigger>
                      <TabsTrigger value="history" className="data-[state=active]:bg-[#1B3A6B] data-[state=active]:text-white">Action History</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="reasoning">
                      <ReasoningChain
                        steps={caseData.eligibility.reasoningChain}
                        uncertaintyFlags={caseData.eligibility.uncertaintyFlags}
                        dataSources={caseData.eligibility.dataSourcesUsed}
                      />
                    </TabsContent>
                    
                    <TabsContent value="notes">
                      <div className="space-y-4">
                        {caseData.paralegalNotes.length > 0 ? (
                          caseData.paralegalNotes.map((note, index) => (
                            <div key={index} className="flex gap-3 text-sm">
                              <span className="text-[#5A6A7A] shrink-0">
                                {note.split(':')[0]}:
                              </span>
                              <span className="text-[#1B3A6B]">
                                {note.split(':').slice(1).join(':')}
                              </span>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-[#5A6A7A]">No notes yet.</p>
                        )}
                        
                        <div className="pt-4 border-t border-[#D4D0C5]">
                          <Textarea 
                            placeholder="Add a note…"
                            value={noteText}
                            onChange={e => setNoteText(e.target.value)}
                            className="mb-2 border-[#D4D0C5] focus:border-[#1B3A6B]"
                          />
                          <Button
                            size="sm"
                            className="gap-2 bg-[#1B3A6B] hover:bg-[#2A4A7B]"
                            onClick={handleAddNote}
                            disabled={savingNote || !noteText.trim()}
                          >
                            {savingNote ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <MessageSquare className="h-4 w-4" />
                            )}
                            Add Note
                          </Button>
                        </div>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="history">
                      <div className="text-sm text-[#5A6A7A]">
                        Action history will be displayed here.
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Actions & Quick Info */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <Card className="bg-white border-[#D4D0C5]">
                <CardHeader>
                  <CardTitle className="text-base text-[#1B3A6B]">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {caseData.eligibility.isEligible && !caseData.applicationReady && (
                    <Button className="w-full justify-start gap-2 bg-[#1B3A6B] hover:bg-[#2A4A7B]">
                      <FileText className="h-4 w-4" />
                      Prepare Bail Application
                    </Button>
                  )}
                  {caseData.eligibility.requiresLawyerReview && (
                    <Button variant="outline" className="w-full justify-start gap-2 text-[#B45309] border-[#B45309]/30 hover:bg-[#B45309]/5">
                      <AlertTriangle className="h-4 w-4" />
                      Send for Lawyer Review
                    </Button>
                  )}
                  {caseData.eligibility.requiresHumanResolution && (
                    <Button variant="outline" className="w-full justify-start gap-2 text-[#B91C1C] border-[#B91C1C]/30 hover:bg-[#B91C1C]/5">
                      <User className="h-4 w-4" />
                      Resolve Identity Mismatch
                    </Button>
                  )}
                  <Button variant="outline" className="w-full justify-start gap-2 border-[#D4D0C5] text-[#1B3A6B] hover:bg-[#E8E5DC]">
                    <Calendar className="h-4 w-4" />
                    Schedule Visit
                  </Button>
                  {caseData.familyNotificationOptIn && (
                    <Button variant="outline" className="w-full justify-start gap-2 border-[#D4D0C5] text-[#1B3A6B] hover:bg-[#E8E5DC]">
                      <Phone className="h-4 w-4" />
                      Send Family Update
                    </Button>
                  )}
                </CardContent>
              </Card>

              {/* Next Hearing */}
              {caseData.nextHearing && (
                <HearingCard hearing={caseData.nextHearing} isNext />
              )}

              {/* Surety */}
              {caseData.surety && (
                <SuretyCard surety={caseData.surety} />
              )}

              {/* Legal Representation */}
              <Card className="bg-white border-[#D4D0C5]">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2 text-[#1B3A6B]">
                    <User className="h-5 w-5 text-[#C9A84C]" />
                    Legal Representation
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[#5A6A7A]">Lawyer Assigned</span>
                    {caseData.lawyerAssigned ? (
                      <CheckCircle2 className="h-5 w-5 text-[#166534]" />
                    ) : (
                      <Clock className="h-5 w-5 text-[#B45309]" />
                    )}
                  </div>
                  {caseData.lawyerName && (
                    <p className="text-sm font-medium text-[#1B3A6B]">
                      {caseData.lawyerName}
                    </p>
                  )}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#5A6A7A]">Documents</span>
                    <span className={caseData.documentsPresent ? "text-[#166534]" : "text-[#B45309]"}>
                      {caseData.documentsPresent ? 'Present' : 'Pending'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#5A6A7A]">Application</span>
                    <span className={caseData.applicationReady ? "text-[#166534]" : "text-[#B45309]"}>
                      {caseData.applicationReady ? 'Ready' : 'Not Ready'}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Family Contact */}
              {caseData.familyNotificationOptIn && (
                <Card className="bg-white border-[#D4D0C5]">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2 text-[#1B3A6B]">
                      <Phone className="h-5 w-5 text-[#C9A84C]" />
                      Family Contact
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-[#5A6A7A]">Phone</span>
                      <span className="font-mono text-[#1B3A6B]">{caseData.familyPhone}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#5A6A7A]">Language</span>
                      <span className="text-[#1B3A6B]">{caseData.familyLanguage}</span>
                    </div>
                    {caseData.lastFamilyNotification && (
                      <div className="flex items-center justify-between">
                        <span className="text-[#5A6A7A]">Last Update</span>
                        <span className="text-[#1B3A6B]">
                          {new Date(caseData.lastFamilyNotification).toLocaleDateString('en-IN')}
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
