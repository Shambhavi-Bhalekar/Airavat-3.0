// JusticeGrid Type Definitions

export type UserRole = 'paralegal' | 'utrc_coordinator' | 'supervisor'

export type CaseStatus = 
  | 'eligible_now' 
  | 'window_closing' 
  | 'not_yet_eligible' 
  | 'lawyer_review_required'
  | 'identity_mismatch'
  | 'data_stale'

export type ConfidenceLevel = 'high' | 'medium' | 'low'

export interface ConfidenceScore {
  percentage: number
  level: ConfidenceLevel
  interval: [number, number] // e.g., [75, 85] for 80% +/- 5%
}

export interface ChargeSection {
  section: string
  act: string // 'IPC' | 'BNSS' | 'NDPS' | etc.
  description: string
  maxSentence: string
  maxSentenceMonths: number
  isLifeImprisonment: boolean
  confidence: ConfidenceScore
  bnssMapping?: string // For IPC to BNSS transition
}

export interface MultiAgentDebate {
  verdict: string           // 'RELEASE' | 'HOLD_FOR_REVIEW' | 'ERROR'
  reasoning: string         // Moderator's final reasoning
  confidence: number        // 0-100
  agentMessages: Array<{
    agent: string           // 'Defense Counsel' | 'Public Prosecutor' | 'Social Worker'
    content: string
  }>
}

export interface EligibilityAssessment {
  isEligible: boolean
  status: CaseStatus
  confidence: ConfidenceScore
  eligibilityDate: string | null
  daysUntilEligible: number | null
  detentionServed: number // days
  requiredDetention: number // days
  percentageServed: number
  reasoningChain: string[]
  uncertaintyFlags: string[]
  dataSourcesUsed: string[]
  timestamp: string
  requiresLawyerReview: boolean
  requiresHumanResolution: boolean
  multiAgentDebate?: MultiAgentDebate  // Present if AI debate has been run
}

export interface Hearing {
  date: string
  court: string
  judge: string
  purpose: string
  adjournmentProbability: ConfidenceScore
  consecutiveAdjournments: number
}

export interface SuretyInfo {
  amount: number
  currency: string
  grantedDate: string
  executed: boolean
  daysSinceGranted: number
  localMedianDailyWage: number
  daysOfWageEquivalent: number
  recommendSuretyReduction: boolean
}

export interface Case {
  id: string
  caseNumber: string
  prisonerName: string
  prisonerId: string
  fatherName: string
  age: number
  gender: 'male' | 'female' | 'other'
  prison: string
  district: string
  state: string
  
  // Case details
  firNumber: string
  firDate: string
  policeStation: string
  charges: ChargeSection[]
  isFirstTimeOffender: boolean
  arrestDate: string
  
  // Eligibility
  eligibility: EligibilityAssessment
  
  // Priority
  priorityScore: number
  priorityRank: number
  priorityReason: string
  
  // Hearings
  nextHearing: Hearing | null
  hearingHistory: Hearing[]
  
  // Surety
  surety: SuretyInfo | null
  
  // Legal representation
  lawyerAssigned: boolean
  lawyerName: string | null
  documentsPresent: boolean
  applicationReady: boolean
  
  // Tracking
  lastActionDate: string
  daysSinceLastAction: number
  paralegalNotes: string[]
  
  // Data quality
  dataFreshness: 'fresh' | 'stale'
  lastSyncTimestamp: string
  sourcesAvailable: string[]
  
  // Family notification
  familyNotificationOptIn: boolean
  familyPhone: string | null
  familyLanguage: string
  lastFamilyNotification: string | null
}

export interface PrisonSummary {
  prisonName: string
  district: string
  state: string
  totalUndertrials: number
  eligibleUndertrials: number
  windowClosingCount: number
  pendingActions: number
  avgDetentionDays: number
}

export interface CourtBehavior {
  courtName: string
  judge: string
  caseType: string
  adjournmentRate: number
  avgBailDecisionDays: number
  totalCasesAnalyzed: number
  quarterlyAdjournments: number
}

export interface SystemAlert {
  id: string
  type: 'eligibility_window' | 'stale_data' | 'family_notification' | 'surety_blocked' | 'court_pattern'
  severity: 'critical' | 'warning' | 'info'
  message: string
  caseId?: string
  timestamp: string
  acknowledged: boolean
}

export interface DashboardStats {
  totalCases: number
  eligibleNow: number
  windowClosing: number
  lawyerReviewRequired: number
  pendingActions: number
  bailsFiledThisMonth: number
  bailsGrantedThisMonth: number
  avgProcessingDays: number
}

export interface DistrictComparison {
  district: string
  state: string
  eligibleCount: number
  actionsCompleted: number
  avgProcessingTime: number
  dataQualityScore: number
}
