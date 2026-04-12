/**
 * JusticeGrid API Client
 * Connects to the FastAPI backend at http://localhost:8000
 * and adapts backend data to the frontend Case type.
 */

import type {
  Case,
  EligibilityAssessment,
  ChargeSection,
  ConfidenceScore,
  CaseStatus,
  MultiAgentDebate,
} from './types'

export const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'

// ─── Raw Backend Types ─────────────────────────────────────────────────────────

export interface BackendCase {
  id: string
  client_id: string
  city?: string
  crime_description?: string
  assigned_ipc?: string
  assigned_bns?: string
  date_reported?: string
  date_of_occurrence?: string
  victim_age?: number
  victim_gender?: string
  bailable?: string          // "Bailable" | "Non-Bailable"
  cognizable?: string
  max_sentence?: number      // years
  family_contact_number?: string
  mother_tongue?: string
  case_closed?: boolean
  detention_days?: number
  eligible?: boolean
  priority_score?: number    // 0-200
  priority_level?: string    // "HIGH" | "MEDIUM" | "LOW"
  adjournment_prob?: number  // 0-100
  conflict_flag?: string | null
  reason?: string
  confidence?: number        // 0.0-1.0
  hearing_outcome?: string
  report_number?: number
  // Hearing fields (optional)
  next_hearing_date?: string
  last_hearing_date?: string
  court_name?: string
  // Bail fields (optional)
  bail_status?: string
  bail_delay_days?: number
  surety_amount?: number
  surety_blocked?: boolean
  // Prison field (optional)
  prison_name?: string
}

// ─── Multi-Agent Reason Parser ────────────────────────────────────────────────

/**
 * Parses the special MULTIAGENT:: format stored in the `reason` column.
 * Format: MULTIAGENT::<verdict>|<reasoning>|<confidence>|<transcript>
 * Transcript format: "*** AGENT 1 (Name) ***\ntext\n\n*** AGENT 2 (Name) ***\ntext..."
 */
function parseMultiAgentReason(reason: string): MultiAgentDebate | null {
  if (!reason.startsWith('MULTIAGENT::')) return null
  try {
    const payload = reason.slice('MULTIAGENT::'.length)
    // Split into max 4 parts on the first 3 pipe separators
    const pipeIdx1 = payload.indexOf('|')
    const pipeIdx2 = payload.indexOf('|', pipeIdx1 + 1)
    const pipeIdx3 = payload.indexOf('|', pipeIdx2 + 1)
    const verdict    = payload.slice(0, pipeIdx1)
    const reasoning  = payload.slice(pipeIdx1 + 1, pipeIdx2)
    const confidence = Number(payload.slice(pipeIdx2 + 1, pipeIdx3))
    const transcript = payload.slice(pipeIdx3 + 1).replace(/\\n/g, '\n')

    // Parse individual agent blocks from transcript
    const agentMessages: MultiAgentDebate['agentMessages'] = []
    const agentRegex = /\*\*\* AGENT \d+ \(([^)]+)\) \*\*\*\n([\s\S]+?)(?=\n\n\*\*\* AGENT|$)/g
    let match: RegExpExecArray | null
    while ((match = agentRegex.exec(transcript)) !== null) {
      agentMessages.push({ agent: match[1].trim(), content: match[2].trim() })
    }

    return { verdict, reasoning, confidence, agentMessages }
  } catch {
    return null
  }
}

// ─── Adapter Helpers ───────────────────────────────────────────────────────────

function toConfidenceScore(raw: number /* 0-1 */): ConfidenceScore {
  const percentage = Math.min(100, Math.round(raw * 100))
  return {
    percentage,
    level: percentage >= 80 ? 'high' : percentage >= 60 ? 'medium' : 'low',
    interval: [Math.max(0, percentage - 5), Math.min(100, percentage + 5)],
  }
}

function deriveCaseStatus(raw: BackendCase): CaseStatus {
  // Life-sentence or serious offence flag → lawyer review
  if (raw.conflict_flag === 'SERIOUS_OFFENCE' && !raw.eligible) {
    return 'lawyer_review_required'
  }
  if (raw.eligible) {
    return 'eligible_now'
  }
  const level = (raw.priority_level ?? '').toUpperCase()
  if (level === 'HIGH' || level === 'MEDIUM') return 'window_closing'
  return 'not_yet_eligible'
}

function buildCharge(raw: BackendCase): ChargeSection {
  const maxSentenceYears = raw.max_sentence ?? 0
  const isLife = maxSentenceYears === 0 && raw.conflict_flag === 'SERIOUS_OFFENCE'
  const maxSentenceStr = isLife
    ? 'Life imprisonment'
    : maxSentenceYears > 0
    ? `${maxSentenceYears} year${maxSentenceYears !== 1 ? 's' : ''}`
    : 'Unknown'
  return {
    section: raw.assigned_ipc ?? 'N/A',
    act: 'IPC',
    description: raw.crime_description ?? 'Unknown offence',
    maxSentence: maxSentenceStr,
    maxSentenceMonths: maxSentenceYears * 12,
    isLifeImprisonment: isLife,
    confidence: toConfidenceScore(raw.confidence ?? 0.75),
    bnssMapping: raw.assigned_bns ?? undefined,
  }
}

function buildEligibility(raw: BackendCase): EligibilityAssessment {
  const detentionServed = raw.detention_days ?? 0
  const maxSentenceMonths = (raw.max_sentence ?? 0) * 12
  // Required detention ≈ 1/3 of max sentence in days (first-time offender rule)
  const requiredDetention = Math.round((maxSentenceMonths / 3) * 30)
  const daysUntilEligible =
    !raw.eligible && requiredDetention > detentionServed
      ? requiredDetention - detentionServed
      : null

  const multiAgentDebate = raw.reason ? parseMultiAgentReason(raw.reason) : null

  // For the reasoning chain bullets: use a plain summary when multi-agent
  const reasoningChain = multiAgentDebate
    ? [`⚖️ Multi-Agent Verdict: ${multiAgentDebate.verdict} (${multiAgentDebate.confidence}% confidence)`, multiAgentDebate.reasoning]
    : raw.reason
      ? raw.reason.split('. ').filter(Boolean)
      : ['AI assessment pending']

  return {
    isEligible: raw.eligible ?? false,
    status: deriveCaseStatus(raw),
    confidence: toConfidenceScore(raw.confidence ?? 0.75),
    eligibilityDate: raw.eligible ? (raw.date_of_occurrence ?? null) : null,
    daysUntilEligible,
    detentionServed,
    requiredDetention,
    percentageServed:
      requiredDetention > 0
        ? Math.min(100, Math.round((detentionServed / requiredDetention) * 100))
        : 0,
    reasoningChain,
    uncertaintyFlags: raw.conflict_flag
      ? [`Conflict flag detected: ${raw.conflict_flag}`]
      : [],
    dataSourcesUsed: multiAgentDebate
      ? ['Multi-Agent AI Debate', 'Judge Moderator Consensus', 'JusticeGrid Backend']
      : ['JusticeGrid Backend'],
    timestamp: new Date().toISOString(),
    requiresLawyerReview:
      raw.conflict_flag === 'SERIOUS_OFFENCE' || raw.bailable === 'Non-Bailable',
    requiresHumanResolution: false,
    multiAgentDebate: multiAgentDebate ?? undefined,
  }
}

/** Converts a raw backend case object into the frontend Case type */
export function adaptBackendCase(raw: BackendCase, index: number): Case {
  const city = raw.city ?? 'Unknown'
  const prisonDisplay = raw.prison_name ?? city

  return {
    id: raw.id,
    caseNumber: raw.report_number
      ? `#${raw.report_number}`
      : raw.id.slice(0, 8).toUpperCase(),

    // Client info — backend stores client_id, not the name.
    // Display the client_id until a separate /client lookup is wired.
    prisonerName: raw.client_id,
    prisonerId: raw.client_id,
    fatherName: '—',
    age: raw.victim_age ?? 0,
    gender: (raw.victim_gender as 'male' | 'female' | 'other') ?? 'male',

    prison: prisonDisplay,
    district: city,
    state: 'India',

    firNumber: raw.report_number?.toString() ?? raw.id.slice(0, 6),
    firDate: raw.date_reported ?? raw.date_of_occurrence ?? '',
    policeStation: '—',

    charges: [buildCharge(raw)],
    isFirstTimeOffender: true, // backend doesn't track this separately yet

    arrestDate: raw.date_of_occurrence ?? '',

    eligibility: buildEligibility(raw),

    priorityScore: raw.priority_score ?? 0,
    priorityRank: index + 1,
    priorityReason: raw.reason ?? 'AI scoring pending',

    nextHearing: {
      date: raw.next_hearing_date ?? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      court: raw.court_name ?? 'Assignment Pending',
      judge: '—',
      purpose: raw.hearing_outcome ?? 'Initial Hearing',
      adjournmentProbability: toConfidenceScore(
        (raw.adjournment_prob ?? 50) / 100
      ),
      consecutiveAdjournments: 0,
    },
    hearingHistory: [],

    surety:
      raw.surety_amount != null
        ? {
            amount: raw.surety_amount,
            currency: 'INR',
            grantedDate: raw.date_of_occurrence ?? new Date().toISOString(),
            executed: false,
            daysSinceGranted: raw.bail_delay_days ?? 0,
            localMedianDailyWage: 450,
            daysOfWageEquivalent: Math.round(raw.surety_amount / 450),
            recommendSuretyReduction: raw.surety_blocked ?? false,
          }
        : null,

    lawyerAssigned: false,
    lawyerName: null,
    documentsPresent: false,
    applicationReady: raw.eligible === true && raw.bail_status === 'APPROVED',

    lastActionDate: new Date().toISOString().split('T')[0],
    daysSinceLastAction: 0,
    paralegalNotes: raw.reason ? [`AI: ${raw.reason}`] : [],

    dataFreshness: 'fresh',
    lastSyncTimestamp: new Date().toISOString(),
    sourcesAvailable: ['JusticeGrid Backend'],

    familyNotificationOptIn: !!raw.family_contact_number,
    familyPhone: raw.family_contact_number ?? null,
    familyLanguage: raw.mother_tongue ?? 'Hindi',
    lastFamilyNotification: null,
  }
}

// ─── API Functions ─────────────────────────────────────────────────────────────

/** Fetch all cases sorted by priority_score descending */
export async function fetchCases(): Promise<Case[]> {
  const res = await fetch(`${BASE_URL}/cases`, {
    cache: 'no-store',
  })
  if (!res.ok) throw new Error(`GET /cases failed: ${res.status}`)
  const data: BackendCase[] = await res.json()
  return data.map(adaptBackendCase)
}

/** Create a client record */
export async function createClient(payload: {
  client_id: string
  mother_tongue: string
  family_contact_number: string
}): Promise<void> {
  const res = await fetch(`${BASE_URL}/client`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(
      (err as { detail?: string }).detail ?? `POST /client failed: ${res.status}`
    )
  }
}

/** Create a case (triggers AI scoring) */
export async function createCase(
  payload: Record<string, unknown>
): Promise<{ case: BackendCase[]; computed: Record<string, unknown> }> {
  const res = await fetch(`${BASE_URL}/case`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(
      (err as { detail?: string }).detail ?? `POST /case failed: ${res.status}`
    )
  }
  return res.json()
}

/** Update specific fields of a case */
export async function updateCase(
  id: string,
  updates: Record<string, unknown>
): Promise<void> {
  const res = await fetch(`${BASE_URL}/case/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  })
  if (!res.ok) throw new Error(`PUT /case/${id} failed: ${res.status}`)
}

/** Delete a case */
export async function deleteCase(id: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/case/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error(`DELETE /case/${id} failed: ${res.status}`)
}

/** Re-score all cases with Gemma-4 */
export async function predictAll(): Promise<{
  message: string
  updated_count: number
  updated_ids: string[]
}> {
  const res = await fetch(`${BASE_URL}/predict-all`, { method: 'POST' })
  if (!res.ok) throw new Error(`POST /predict-all failed: ${res.status}`)
  return res.json()
}

// ─── Systemic Insights & Pattern Alerts (Pillar 04 & 08) ─────────────────────

/** Get insights on charge sections and detention times */
export async function fetchChargeSectionInsights(): Promise<{
  status: string
  insights: Record<string, any>
  confidence: number
  uncertaintyNote: string
}> {
  const res = await fetch(`${BASE_URL}/systemic-insights/charge-sections`, {
    cache: 'no-store',
  })
  if (!res.ok) throw new Error(`GET /systemic-insights/charge-sections failed: ${res.status}`)
  return res.json()
}

/** Get insights on court bail decision intervals */
export async function fetchCourtInsights(): Promise<{
  status: string
  insights: Record<string, any>
  confidence: number
  uncertaintyNote: string
}> {
  const res = await fetch(`${BASE_URL}/systemic-insights/courts`, {
    cache: 'no-store',
  })
  if (!res.ok) throw new Error(`GET /systemic-insights/courts failed: ${res.status}`)
  return res.json()
}

/** Get insights on prison eligible-but-unserved density */
export async function fetchPrisonInsights(): Promise<{
  status: string
  insights: Record<string, any>
  confidence: number
  uncertaintyNote: string
}> {
  const res = await fetch(`${BASE_URL}/systemic-insights/prisons`, {
    cache: 'no-store',
  })
  if (!res.ok) throw new Error(`GET /systemic-insights/prisons failed: ${res.status}`)
  return res.json()
}

/** Get insights on surety blocking analysis */
export async function fetchSuretyAnalysis(): Promise<{
  status: string
  insights: Record<string, any>
  confidence: number
  uncertaintyNote: string
}> {
  const res = await fetch(`${BASE_URL}/systemic-insights/surety-analysis`, {
    cache: 'no-store',
  })
  if (!res.ok) throw new Error(`GET /systemic-insights/surety-analysis failed: ${res.status}`)
  return res.json()
}

/** Get pattern alerts for courts with high eligible case adjournments */
export async function fetchPatternAdjournmentAlerts(): Promise<{
  status: string
  quarter_range: string
  alerts: Array<{
    court: string
    high_adjournment_count: number
    alert_level: 'CRITICAL' | 'WARNING' | 'INFO'
    recommendation: string
    confidence: number
    case_count: number
  }>
  confidence: number
  uncertaintyNote: string
}> {
  const res = await fetch(`${BASE_URL}/alerts/pattern-adjournments`, {
    cache: 'no-store',
  })
  if (!res.ok) throw new Error(`GET /alerts/pattern-adjournments failed: ${res.status}`)
  return res.json()
}
