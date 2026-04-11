import type { 
  Case, 
  PrisonSummary, 
  CourtBehavior, 
  SystemAlert, 
  DashboardStats,
  DistrictComparison 
} from './types'

export const mockCases: Case[] = [
  {
    id: 'CASE-001',
    caseNumber: 'SC/2024/1234',
    prisonerName: 'Ramesh Kumar Singh',
    prisonerId: 'PRN-2024-5678',
    fatherName: 'Shyam Singh',
    age: 32,
    gender: 'male',
    prison: 'Central Jail, Lucknow',
    district: 'Lucknow',
    state: 'Uttar Pradesh',
    firNumber: 'FIR/2023/456',
    firDate: '2023-06-15',
    policeStation: 'Hazratganj PS',
    charges: [
      {
        section: '379',
        act: 'IPC',
        description: 'Theft',
        maxSentence: '3 years',
        maxSentenceMonths: 36,
        isLifeImprisonment: false,
        confidence: { percentage: 92, level: 'high', interval: [88, 96] },
        bnssMapping: 'Section 303 BNSS'
      },
      {
        section: '411',
        act: 'IPC',
        description: 'Dishonestly receiving stolen property',
        maxSentence: '3 years',
        maxSentenceMonths: 36,
        isLifeImprisonment: false,
        confidence: { percentage: 88, level: 'high', interval: [84, 92] },
        bnssMapping: 'Section 317 BNSS'
      }
    ],
    isFirstTimeOffender: true,
    arrestDate: '2023-06-20',
    eligibility: {
      isEligible: true,
      status: 'eligible_now',
      confidence: { percentage: 94, level: 'high', interval: [90, 98] },
      eligibilityDate: '2024-06-20',
      daysUntilEligible: null,
      detentionServed: 420,
      requiredDetention: 365,
      percentageServed: 115,
      reasoningChain: [
        'Extracted charges: IPC 379, IPC 411 from FIR text (Hindi)',
        'Maximum sentence across charges: 3 years (36 months)',
        'Offender category: First-time offender (no prior convictions found)',
        'Required detention for eligibility: 1/3 of 36 months = 12 months',
        'Current detention: 14 months (420 days)',
        'Detention exceeds eligibility threshold by 55 days',
        'Section 479 BNSS eligibility: CONFIRMED'
      ],
      uncertaintyFlags: [
        'FIR OCR confidence 88% - minor text ambiguity in charge description'
      ],
      dataSourcesUsed: ['UP eCourts Portal', 'NJDG', 'Central Jail Lucknow Records'],
      timestamp: '2024-08-10T09:30:00Z',
      requiresLawyerReview: false,
      requiresHumanResolution: false
    },
    priorityScore: 92,
    priorityRank: 1,
    priorityReason: 'Eligible now, hearing in 3 days, all documents ready',
    nextHearing: {
      date: '2024-08-13',
      court: 'Sessions Court, Lucknow',
      judge: 'Hon. Justice A.K. Sharma',
      purpose: 'Bail hearing',
      adjournmentProbability: { percentage: 23, level: 'low', interval: [18, 28] },
      consecutiveAdjournments: 1
    },
    hearingHistory: [
      {
        date: '2024-07-15',
        court: 'Sessions Court, Lucknow',
        judge: 'Hon. Justice A.K. Sharma',
        purpose: 'Bail hearing',
        adjournmentProbability: { percentage: 45, level: 'medium', interval: [40, 50] },
        consecutiveAdjournments: 0
      }
    ],
    surety: null,
    lawyerAssigned: true,
    lawyerName: 'Adv. Priya Verma (DLSA Panel)',
    documentsPresent: true,
    applicationReady: true,
    lastActionDate: '2024-08-08',
    daysSinceLastAction: 2,
    paralegalNotes: [
      '2024-08-08: Documents verified, bail application prepared',
      '2024-08-05: Lawyer assigned from DLSA panel',
      '2024-07-20: Case flagged as eligible under Section 479'
    ],
    dataFreshness: 'fresh',
    lastSyncTimestamp: '2024-08-10T08:00:00Z',
    sourcesAvailable: ['eCourts', 'NJDG', 'Prison Records'],
    familyNotificationOptIn: true,
    familyPhone: '+91-9876543210',
    familyLanguage: 'Hindi',
    lastFamilyNotification: '2024-08-08T14:00:00Z'
  },
  {
    id: 'CASE-002',
    caseNumber: 'SC/2024/2345',
    prisonerName: 'Mohammad Irfan',
    prisonerId: 'PRN-2024-6789',
    fatherName: 'Abdul Karim',
    age: 28,
    gender: 'male',
    prison: 'District Jail, Varanasi',
    district: 'Varanasi',
    state: 'Uttar Pradesh',
    firNumber: 'FIR/2023/789',
    firDate: '2023-08-22',
    policeStation: 'Lanka PS',
    charges: [
      {
        section: '420',
        act: 'IPC',
        description: 'Cheating and dishonestly inducing delivery of property',
        maxSentence: '7 years',
        maxSentenceMonths: 84,
        isLifeImprisonment: false,
        confidence: { percentage: 85, level: 'high', interval: [80, 90] },
        bnssMapping: 'Section 318 BNSS'
      }
    ],
    isFirstTimeOffender: true,
    arrestDate: '2023-08-25',
    eligibility: {
      isEligible: false,
      status: 'window_closing',
      confidence: { percentage: 91, level: 'high', interval: [87, 95] },
      eligibilityDate: '2024-08-25',
      daysUntilEligible: 15,
      detentionServed: 350,
      requiredDetention: 365,
      percentageServed: 96,
      reasoningChain: [
        'Extracted charges: IPC 420 from FIR text (Hindi/Urdu mixed)',
        'Maximum sentence: 7 years (84 months)',
        'Offender category: First-time offender',
        'Required detention: 1/3 of 84 months = 28 months',
        'Current detention: 11.5 months (350 days)',
        'Eligibility window opens in 15 days',
        'Recommend: Prepare bail application NOW for filing on eligibility date'
      ],
      uncertaintyFlags: [],
      dataSourcesUsed: ['UP eCourts Portal', 'NJDG', 'District Jail Varanasi Records'],
      timestamp: '2024-08-10T09:35:00Z',
      requiresLawyerReview: false,
      requiresHumanResolution: false
    },
    priorityScore: 88,
    priorityRank: 2,
    priorityReason: 'Window closing in 15 days, prepare application now',
    nextHearing: {
      date: '2024-08-28',
      court: 'Sessions Court, Varanasi',
      judge: 'Hon. Justice R. Mishra',
      purpose: 'Case status',
      adjournmentProbability: { percentage: 67, level: 'medium', interval: [60, 74] },
      consecutiveAdjournments: 3
    },
    hearingHistory: [],
    surety: null,
    lawyerAssigned: true,
    lawyerName: 'Adv. Sanjay Dubey (DLSA Panel)',
    documentsPresent: true,
    applicationReady: false,
    lastActionDate: '2024-08-05',
    daysSinceLastAction: 5,
    paralegalNotes: [
      '2024-08-05: Documents collected, application drafting in progress'
    ],
    dataFreshness: 'fresh',
    lastSyncTimestamp: '2024-08-10T08:15:00Z',
    sourcesAvailable: ['eCourts', 'NJDG', 'Prison Records'],
    familyNotificationOptIn: true,
    familyPhone: '+91-9123456780',
    familyLanguage: 'Hindi',
    lastFamilyNotification: '2024-08-05T10:00:00Z'
  },
  {
    id: 'CASE-003',
    caseNumber: 'SC/2024/3456',
    prisonerName: 'Suresh Yadav',
    prisonerId: 'PRN-2024-7890',
    fatherName: 'Mohan Yadav',
    age: 45,
    gender: 'male',
    prison: 'Central Jail, Agra',
    district: 'Agra',
    state: 'Uttar Pradesh',
    firNumber: 'FIR/2022/234',
    firDate: '2022-03-10',
    policeStation: 'Sadar PS',
    charges: [
      {
        section: '302',
        act: 'IPC',
        description: 'Murder',
        maxSentence: 'Life imprisonment or death',
        maxSentenceMonths: -1,
        isLifeImprisonment: true,
        confidence: { percentage: 95, level: 'high', interval: [92, 98] },
        bnssMapping: 'Section 101 BNSS'
      },
      {
        section: '34',
        act: 'IPC',
        description: 'Common intention',
        maxSentence: 'N/A (enhancing provision)',
        maxSentenceMonths: 0,
        isLifeImprisonment: false,
        confidence: { percentage: 93, level: 'high', interval: [90, 96] }
      }
    ],
    isFirstTimeOffender: true,
    arrestDate: '2022-03-15',
    eligibility: {
      isEligible: false,
      status: 'lawyer_review_required',
      confidence: { percentage: 97, level: 'high', interval: [95, 99] },
      eligibilityDate: null,
      daysUntilEligible: null,
      detentionServed: 880,
      requiredDetention: -1,
      percentageServed: 0,
      reasoningChain: [
        'Extracted charges: IPC 302 r/w 34 from FIR text',
        'CRITICAL: Life imprisonment charge detected (IPC 302)',
        'Section 479 BNSS eligibility: NOT APPLICABLE for life imprisonment offences',
        'Case routed to MANDATORY LAWYER REVIEW',
        'Paralegal action: Do NOT include in eligible queue'
      ],
      uncertaintyFlags: [
        'Life imprisonment charge - automatic lawyer review required'
      ],
      dataSourcesUsed: ['UP eCourts Portal', 'NJDG', 'Central Jail Agra Records'],
      timestamp: '2024-08-10T09:40:00Z',
      requiresLawyerReview: true,
      requiresHumanResolution: false
    },
    priorityScore: 45,
    priorityRank: 8,
    priorityReason: 'Life imprisonment charge - requires lawyer review for alternative remedies',
    nextHearing: {
      date: '2024-09-05',
      court: 'Sessions Court, Agra',
      judge: 'Hon. Justice P.K. Singh',
      purpose: 'Evidence examination',
      adjournmentProbability: { percentage: 54, level: 'medium', interval: [48, 60] },
      consecutiveAdjournments: 2
    },
    hearingHistory: [],
    surety: null,
    lawyerAssigned: true,
    lawyerName: 'Adv. Meera Gupta (DLSA Panel)',
    documentsPresent: true,
    applicationReady: false,
    lastActionDate: '2024-08-01',
    daysSinceLastAction: 9,
    paralegalNotes: [
      '2024-08-01: Case flagged for lawyer review - life imprisonment charge',
      '2024-07-28: Initial assessment completed'
    ],
    dataFreshness: 'fresh',
    lastSyncTimestamp: '2024-08-10T08:30:00Z',
    sourcesAvailable: ['eCourts', 'NJDG', 'Prison Records'],
    familyNotificationOptIn: false,
    familyPhone: null,
    familyLanguage: 'Hindi',
    lastFamilyNotification: null
  },
  {
    id: 'CASE-004',
    caseNumber: 'SC/2024/4567',
    prisonerName: 'Lakshmi Devi',
    prisonerId: 'PRN-2024-8901',
    fatherName: 'Late Rajan Prasad',
    age: 38,
    gender: 'female',
    prison: 'Women Jail, Lucknow',
    district: 'Lucknow',
    state: 'Uttar Pradesh',
    firNumber: 'FIR/2023/567',
    firDate: '2023-09-05',
    policeStation: 'Mahila Thana',
    charges: [
      {
        section: '498A',
        act: 'IPC',
        description: 'Cruelty by husband or relatives',
        maxSentence: '3 years',
        maxSentenceMonths: 36,
        isLifeImprisonment: false,
        confidence: { percentage: 78, level: 'medium', interval: [72, 84] },
        bnssMapping: 'Section 84 BNSS'
      }
    ],
    isFirstTimeOffender: true,
    arrestDate: '2023-09-10',
    eligibility: {
      isEligible: true,
      status: 'eligible_now',
      confidence: { percentage: 82, level: 'high', interval: [76, 88] },
      eligibilityDate: '2024-05-10',
      daysUntilEligible: null,
      detentionServed: 335,
      requiredDetention: 365,
      percentageServed: 92,
      reasoningChain: [
        'Extracted charges: IPC 498A from FIR text (Hindi)',
        'Maximum sentence: 3 years (36 months)',
        'Offender category: First-time offender',
        'Required detention: 1/3 of 36 months = 12 months',
        'Current detention: 11 months (335 days)',
        'Section 479 BNSS eligibility: CONFIRMED'
      ],
      uncertaintyFlags: [
        'FIR text partially illegible - OCR confidence 78%',
        'Recommend manual verification of charge sections'
      ],
      dataSourcesUsed: ['UP eCourts Portal', 'Women Jail Records'],
      timestamp: '2024-08-10T09:45:00Z',
      requiresLawyerReview: false,
      requiresHumanResolution: false
    },
    priorityScore: 78,
    priorityRank: 3,
    priorityReason: 'Eligible now, but lower OCR confidence - verify charges',
    nextHearing: {
      date: '2024-08-20',
      court: 'Family Court, Lucknow',
      judge: 'Hon. Justice S. Patel',
      purpose: 'Bail consideration',
      adjournmentProbability: { percentage: 35, level: 'low', interval: [28, 42] },
      consecutiveAdjournments: 0
    },
    hearingHistory: [],
    surety: null,
    lawyerAssigned: true,
    lawyerName: 'Adv. Anjali Srivastava (Women Cell)',
    documentsPresent: false,
    applicationReady: false,
    lastActionDate: '2024-08-07',
    daysSinceLastAction: 3,
    paralegalNotes: [
      '2024-08-07: FIR copy requested from PS for verification',
      '2024-08-03: Case identified as eligible, pending document collection'
    ],
    dataFreshness: 'fresh',
    lastSyncTimestamp: '2024-08-10T08:45:00Z',
    sourcesAvailable: ['eCourts', 'Prison Records'],
    familyNotificationOptIn: true,
    familyPhone: '+91-9988776655',
    familyLanguage: 'Hindi',
    lastFamilyNotification: '2024-08-07T16:00:00Z'
  },
  {
    id: 'CASE-005',
    caseNumber: 'SC/2024/5678',
    prisonerName: 'Vijay Sharma',
    prisonerId: 'PRN-2024-9012',
    fatherName: 'Dinesh Sharma',
    age: 25,
    gender: 'male',
    prison: 'District Jail, Meerut',
    district: 'Meerut',
    state: 'Uttar Pradesh',
    firNumber: 'FIR/2024/123',
    firDate: '2024-01-15',
    policeStation: 'Civil Lines PS',
    charges: [
      {
        section: '323',
        act: 'IPC',
        description: 'Voluntarily causing hurt',
        maxSentence: '1 year',
        maxSentenceMonths: 12,
        isLifeImprisonment: false,
        confidence: { percentage: 96, level: 'high', interval: [93, 99] },
        bnssMapping: 'Section 115 BNSS'
      },
      {
        section: '504',
        act: 'IPC',
        description: 'Intentional insult with intent to provoke breach of peace',
        maxSentence: '2 years',
        maxSentenceMonths: 24,
        isLifeImprisonment: false,
        confidence: { percentage: 94, level: 'high', interval: [90, 98] },
        bnssMapping: 'Section 351 BNSS'
      }
    ],
    isFirstTimeOffender: true,
    arrestDate: '2024-01-20',
    eligibility: {
      isEligible: false,
      status: 'not_yet_eligible',
      confidence: { percentage: 95, level: 'high', interval: [92, 98] },
      eligibilityDate: '2024-09-20',
      daysUntilEligible: 41,
      detentionServed: 203,
      requiredDetention: 244,
      percentageServed: 83,
      reasoningChain: [
        'Extracted charges: IPC 323, IPC 504 from FIR text',
        'Maximum sentence across charges: 2 years (24 months)',
        'Offender category: First-time offender',
        'Required detention: 1/3 of 24 months = 8 months (244 days)',
        'Current detention: 6.7 months (203 days)',
        'Eligibility date: September 20, 2024 (41 days away)'
      ],
      uncertaintyFlags: [],
      dataSourcesUsed: ['UP eCourts Portal', 'NJDG', 'District Jail Meerut Records'],
      timestamp: '2024-08-10T09:50:00Z',
      requiresLawyerReview: false,
      requiresHumanResolution: false
    },
    priorityScore: 55,
    priorityRank: 6,
    priorityReason: 'Not yet eligible, track for September 20 window',
    nextHearing: {
      date: '2024-08-25',
      court: 'Magistrate Court, Meerut',
      judge: 'Hon. Magistrate V. Kumar',
      purpose: 'Charge framing',
      adjournmentProbability: { percentage: 42, level: 'medium', interval: [35, 49] },
      consecutiveAdjournments: 1
    },
    hearingHistory: [],
    surety: null,
    lawyerAssigned: false,
    lawyerName: null,
    documentsPresent: true,
    applicationReady: false,
    lastActionDate: '2024-08-02',
    daysSinceLastAction: 8,
    paralegalNotes: [
      '2024-08-02: Case tracked, eligibility window in September'
    ],
    dataFreshness: 'fresh',
    lastSyncTimestamp: '2024-08-10T09:00:00Z',
    sourcesAvailable: ['eCourts', 'NJDG', 'Prison Records'],
    familyNotificationOptIn: false,
    familyPhone: null,
    familyLanguage: 'Hindi',
    lastFamilyNotification: null
  },
  {
    id: 'CASE-006',
    caseNumber: 'SC/2024/6789',
    prisonerName: 'Arun Patel',
    prisonerId: 'PRN-2024-0123',
    fatherName: 'Bhagwan Patel',
    age: 40,
    gender: 'male',
    prison: 'Central Jail, Lucknow',
    district: 'Lucknow',
    state: 'Uttar Pradesh',
    firNumber: 'FIR/2023/890',
    firDate: '2023-04-20',
    policeStation: 'Alambagh PS',
    charges: [
      {
        section: '376',
        act: 'IPC',
        description: 'Rape',
        maxSentence: '10 years to life imprisonment',
        maxSentenceMonths: 120,
        isLifeImprisonment: false,
        confidence: { percentage: 62, level: 'medium', interval: [55, 69] }
      }
    ],
    isFirstTimeOffender: true,
    arrestDate: '2023-04-25',
    eligibility: {
      isEligible: false,
      status: 'identity_mismatch',
      confidence: { percentage: 45, level: 'low', interval: [35, 55] },
      eligibilityDate: null,
      daysUntilEligible: null,
      detentionServed: 472,
      requiredDetention: 1460,
      percentageServed: 32,
      reasoningChain: [
        'ALERT: Name mismatch detected across data sources',
        'eCourts: "Arun Patel s/o Bhagwan Patel"',
        'Prison Records: "Arun Kumar Patel s/o Bhagwan Das Patel"',
        'NJDG: "A. Patel"',
        'Identity resolution: REQUIRES HUMAN VERIFICATION',
        'Eligibility assessment: SUSPENDED pending identity confirmation'
      ],
      uncertaintyFlags: [
        'Critical: Name mismatch across 3 data sources',
        'Cannot proceed with eligibility assessment until identity confirmed'
      ],
      dataSourcesUsed: ['UP eCourts Portal', 'NJDG', 'Central Jail Lucknow Records'],
      timestamp: '2024-08-10T09:55:00Z',
      requiresLawyerReview: false,
      requiresHumanResolution: true
    },
    priorityScore: 72,
    priorityRank: 4,
    priorityReason: 'Identity mismatch - requires immediate human resolution',
    nextHearing: {
      date: '2024-08-18',
      court: 'Sessions Court, Lucknow',
      judge: 'Hon. Justice M. Khan',
      purpose: 'Evidence hearing',
      adjournmentProbability: { percentage: 58, level: 'medium', interval: [50, 66] },
      consecutiveAdjournments: 2
    },
    hearingHistory: [],
    surety: null,
    lawyerAssigned: true,
    lawyerName: 'Adv. Rahul Saxena (DLSA Panel)',
    documentsPresent: false,
    applicationReady: false,
    lastActionDate: '2024-08-09',
    daysSinceLastAction: 1,
    paralegalNotes: [
      '2024-08-09: Identity mismatch flagged - visiting prison tomorrow to verify',
      '2024-08-06: Case synced, discrepancies noted'
    ],
    dataFreshness: 'fresh',
    lastSyncTimestamp: '2024-08-10T09:30:00Z',
    sourcesAvailable: ['eCourts', 'NJDG', 'Prison Records'],
    familyNotificationOptIn: false,
    familyPhone: null,
    familyLanguage: 'Hindi',
    lastFamilyNotification: null
  },
  {
    id: 'CASE-007',
    caseNumber: 'SC/2023/7890',
    prisonerName: 'Deepak Verma',
    prisonerId: 'PRN-2023-1234',
    fatherName: 'Rajendra Verma',
    age: 35,
    gender: 'male',
    prison: 'District Jail, Kanpur',
    district: 'Kanpur',
    state: 'Uttar Pradesh',
    firNumber: 'FIR/2023/012',
    firDate: '2023-01-10',
    policeStation: 'Govind Nagar PS',
    charges: [
      {
        section: '420',
        act: 'IPC',
        description: 'Cheating',
        maxSentence: '7 years',
        maxSentenceMonths: 84,
        isLifeImprisonment: false,
        confidence: { percentage: 91, level: 'high', interval: [87, 95] }
      },
      {
        section: '467',
        act: 'IPC',
        description: 'Forgery of valuable security',
        maxSentence: '10 years',
        maxSentenceMonths: 120,
        isLifeImprisonment: false,
        confidence: { percentage: 89, level: 'high', interval: [85, 93] }
      }
    ],
    isFirstTimeOffender: false,
    arrestDate: '2023-01-15',
    eligibility: {
      isEligible: true,
      status: 'eligible_now',
      confidence: { percentage: 88, level: 'high', interval: [84, 92] },
      eligibilityDate: '2024-01-15',
      daysUntilEligible: null,
      detentionServed: 573,
      requiredDetention: 547,
      percentageServed: 105,
      reasoningChain: [
        'Extracted charges: IPC 420, IPC 467 from FIR text',
        'Maximum sentence across charges: 10 years (120 months)',
        'Offender category: Regular accused (prior conviction 2018)',
        'Required detention: 1/2 of 120 months = 60 months for regular accused',
        'NOTE: Applying 1/2 rule for non-first-time offender',
        'Wait - recalculating: For 10 year max, 1/2 = 5 years = 60 months',
        'Current detention: 19 months - NOT YET ELIGIBLE under 1/2 rule',
        'CORRECTION: Re-evaluating with correct calculation...',
        'Section 479 requires 1/2 of max sentence for repeat offenders',
        'Status: Currently at 32% of required detention'
      ],
      uncertaintyFlags: [
        'Prior conviction record from 2018 - verify details'
      ],
      dataSourcesUsed: ['UP eCourts Portal', 'NJDG', 'District Jail Kanpur Records', 'Criminal History Database'],
      timestamp: '2024-08-10T10:00:00Z',
      requiresLawyerReview: false,
      requiresHumanResolution: false
    },
    priorityScore: 68,
    priorityRank: 5,
    priorityReason: 'Eligible but surety blocked - needs surety reduction application',
    nextHearing: {
      date: '2024-08-22',
      court: 'Sessions Court, Kanpur',
      judge: 'Hon. Justice L. Agarwal',
      purpose: 'Bail hearing',
      adjournmentProbability: { percentage: 78, level: 'high', interval: [72, 84] },
      consecutiveAdjournments: 4
    },
    hearingHistory: [],
    surety: {
      amount: 200000,
      currency: 'INR',
      grantedDate: '2024-06-15',
      executed: false,
      daysSinceGranted: 56,
      localMedianDailyWage: 450,
      daysOfWageEquivalent: 444,
      recommendSuretyReduction: true
    },
    lawyerAssigned: true,
    lawyerName: 'Adv. Amit Tiwari (DLSA Panel)',
    documentsPresent: true,
    applicationReady: false,
    lastActionDate: '2024-08-06',
    daysSinceLastAction: 4,
    paralegalNotes: [
      '2024-08-06: Surety reduction application being drafted',
      '2024-06-20: Bail granted but surety amount unaffordable',
      '2024-06-15: Bail hearing - bail granted with Rs. 2 lakh surety'
    ],
    dataFreshness: 'fresh',
    lastSyncTimestamp: '2024-08-10T09:15:00Z',
    sourcesAvailable: ['eCourts', 'NJDG', 'Prison Records'],
    familyNotificationOptIn: true,
    familyPhone: '+91-9012345678',
    familyLanguage: 'Hindi',
    lastFamilyNotification: '2024-08-06T11:00:00Z'
  },
  {
    id: 'CASE-008',
    caseNumber: 'SC/2024/8901',
    prisonerName: 'Santosh Mishra',
    prisonerId: 'PRN-2024-2345',
    fatherName: 'Gyanendra Mishra',
    age: 29,
    gender: 'male',
    prison: 'District Jail, Gorakhpur',
    district: 'Gorakhpur',
    state: 'Uttar Pradesh',
    firNumber: 'FIR/2024/234',
    firDate: '2024-02-01',
    policeStation: 'Golghar PS',
    charges: [
      {
        section: '307',
        act: 'IPC',
        description: 'Attempt to murder',
        maxSentence: '10 years',
        maxSentenceMonths: 120,
        isLifeImprisonment: false,
        confidence: { percentage: 72, level: 'medium', interval: [65, 79] }
      }
    ],
    isFirstTimeOffender: true,
    arrestDate: '2024-02-05',
    eligibility: {
      isEligible: false,
      status: 'data_stale',
      confidence: { percentage: 60, level: 'medium', interval: [50, 70] },
      eligibilityDate: null,
      daysUntilEligible: null,
      detentionServed: 187,
      requiredDetention: 1217,
      percentageServed: 15,
      reasoningChain: [
        'WARNING: Data staleness detected',
        'eCourts Gorakhpur: Last sync 72+ hours ago',
        'Assessment based on stale data - DO NOT escalate',
        'Awaiting fresh data sync before eligibility computation'
      ],
      uncertaintyFlags: [
        'CRITICAL: eCourts API downtime - Gorakhpur district',
        'Data is 72+ hours stale',
        'Do not use for eligibility determination'
      ],
      dataSourcesUsed: ['UP eCourts Portal (STALE)', 'District Jail Gorakhpur Records'],
      timestamp: '2024-08-10T10:05:00Z',
      requiresLawyerReview: false,
      requiresHumanResolution: false
    },
    priorityScore: 35,
    priorityRank: 10,
    priorityReason: 'Data stale - awaiting eCourts sync',
    nextHearing: null,
    hearingHistory: [],
    surety: null,
    lawyerAssigned: false,
    lawyerName: null,
    documentsPresent: false,
    applicationReady: false,
    lastActionDate: '2024-08-07',
    daysSinceLastAction: 3,
    paralegalNotes: [
      '2024-08-07: Waiting for eCourts Gorakhpur to come online'
    ],
    dataFreshness: 'stale',
    lastSyncTimestamp: '2024-08-07T14:00:00Z',
    sourcesAvailable: ['Prison Records'],
    familyNotificationOptIn: false,
    familyPhone: null,
    familyLanguage: 'Bhojpuri',
    lastFamilyNotification: null
  }
]

export const mockPrisonSummaries: PrisonSummary[] = [
  {
    prisonName: 'Central Jail, Lucknow',
    district: 'Lucknow',
    state: 'Uttar Pradesh',
    totalUndertrials: 1245,
    eligibleUndertrials: 187,
    windowClosingCount: 34,
    pendingActions: 52,
    avgDetentionDays: 342
  },
  {
    prisonName: 'District Jail, Varanasi',
    district: 'Varanasi',
    state: 'Uttar Pradesh',
    totalUndertrials: 876,
    eligibleUndertrials: 124,
    windowClosingCount: 28,
    pendingActions: 41,
    avgDetentionDays: 298
  },
  {
    prisonName: 'Central Jail, Agra',
    district: 'Agra',
    state: 'Uttar Pradesh',
    totalUndertrials: 1089,
    eligibleUndertrials: 156,
    windowClosingCount: 31,
    pendingActions: 48,
    avgDetentionDays: 367
  },
  {
    prisonName: 'Women Jail, Lucknow',
    district: 'Lucknow',
    state: 'Uttar Pradesh',
    totalUndertrials: 234,
    eligibleUndertrials: 45,
    windowClosingCount: 8,
    pendingActions: 12,
    avgDetentionDays: 256
  },
  {
    prisonName: 'District Jail, Meerut',
    district: 'Meerut',
    state: 'Uttar Pradesh',
    totalUndertrials: 567,
    eligibleUndertrials: 89,
    windowClosingCount: 15,
    pendingActions: 23,
    avgDetentionDays: 278
  },
  {
    prisonName: 'District Jail, Kanpur',
    district: 'Kanpur',
    state: 'Uttar Pradesh',
    totalUndertrials: 923,
    eligibleUndertrials: 134,
    windowClosingCount: 22,
    pendingActions: 38,
    avgDetentionDays: 312
  },
  {
    prisonName: 'District Jail, Gorakhpur',
    district: 'Gorakhpur',
    state: 'Uttar Pradesh',
    totalUndertrials: 645,
    eligibleUndertrials: 98,
    windowClosingCount: 19,
    pendingActions: 29,
    avgDetentionDays: 289
  }
]

export const mockCourtBehaviors: CourtBehavior[] = [
  {
    courtName: 'Sessions Court, Lucknow',
    judge: 'Hon. Justice A.K. Sharma',
    caseType: 'Theft/Property',
    adjournmentRate: 34,
    avgBailDecisionDays: 12,
    totalCasesAnalyzed: 234,
    quarterlyAdjournments: 18
  },
  {
    courtName: 'Sessions Court, Kanpur',
    judge: 'Hon. Justice L. Agarwal',
    caseType: 'Financial Crimes',
    adjournmentRate: 78,
    avgBailDecisionDays: 45,
    totalCasesAnalyzed: 156,
    quarterlyAdjournments: 89
  },
  {
    courtName: 'Sessions Court, Varanasi',
    judge: 'Hon. Justice R. Mishra',
    caseType: 'General',
    adjournmentRate: 67,
    avgBailDecisionDays: 28,
    totalCasesAnalyzed: 189,
    quarterlyAdjournments: 54
  },
  {
    courtName: 'Family Court, Lucknow',
    judge: 'Hon. Justice S. Patel',
    caseType: 'Domestic',
    adjournmentRate: 35,
    avgBailDecisionDays: 8,
    totalCasesAnalyzed: 312,
    quarterlyAdjournments: 12
  },
  {
    courtName: 'Magistrate Court, Meerut',
    judge: 'Hon. Magistrate V. Kumar',
    caseType: 'Minor Offences',
    adjournmentRate: 42,
    avgBailDecisionDays: 15,
    totalCasesAnalyzed: 278,
    quarterlyAdjournments: 23
  }
]

export const mockAlerts: SystemAlert[] = [
  {
    id: 'ALERT-001',
    type: 'eligibility_window',
    severity: 'critical',
    message: 'Mohammad Irfan (SC/2024/2345) becomes eligible in 15 days. Bail application not yet prepared.',
    caseId: 'CASE-002',
    timestamp: '2024-08-10T09:00:00Z',
    acknowledged: false
  },
  {
    id: 'ALERT-002',
    type: 'stale_data',
    severity: 'warning',
    message: 'eCourts Gorakhpur offline for 72+ hours. 23 cases affected.',
    timestamp: '2024-08-10T08:30:00Z',
    acknowledged: false
  },
  {
    id: 'ALERT-003',
    type: 'surety_blocked',
    severity: 'critical',
    message: 'Deepak Verma (SC/2023/7890): Bail granted 56 days ago, surety not executed. Amount equals 444 days of local wages.',
    caseId: 'CASE-007',
    timestamp: '2024-08-10T08:00:00Z',
    acknowledged: false
  },
  {
    id: 'ALERT-004',
    type: 'court_pattern',
    severity: 'warning',
    message: 'Sessions Court Kanpur: 89 adjournments this quarter for eligible cases. Pattern alert triggered.',
    timestamp: '2024-08-09T16:00:00Z',
    acknowledged: true
  },
  {
    id: 'ALERT-005',
    type: 'family_notification',
    severity: 'info',
    message: 'Lakshmi Devi (SC/2024/4567): Family opted in but no notification sent in 45+ days despite bail eligibility.',
    caseId: 'CASE-004',
    timestamp: '2024-08-10T07:00:00Z',
    acknowledged: false
  }
]

export const mockDashboardStats: DashboardStats = {
  totalCases: 847,
  eligibleNow: 187,
  windowClosing: 45,
  lawyerReviewRequired: 23,
  pendingActions: 156,
  bailsFiledThisMonth: 34,
  bailsGrantedThisMonth: 28,
  avgProcessingDays: 18
}

export const mockDistrictComparisons: DistrictComparison[] = [
  {
    district: 'Lucknow',
    state: 'Uttar Pradesh',
    eligibleCount: 232,
    actionsCompleted: 189,
    avgProcessingTime: 14,
    dataQualityScore: 94
  },
  {
    district: 'Varanasi',
    state: 'Uttar Pradesh',
    eligibleCount: 124,
    actionsCompleted: 98,
    avgProcessingTime: 18,
    dataQualityScore: 89
  },
  {
    district: 'Kanpur',
    state: 'Uttar Pradesh',
    eligibleCount: 134,
    actionsCompleted: 87,
    avgProcessingTime: 24,
    dataQualityScore: 85
  },
  {
    district: 'Agra',
    state: 'Uttar Pradesh',
    eligibleCount: 156,
    actionsCompleted: 112,
    avgProcessingTime: 21,
    dataQualityScore: 88
  },
  {
    district: 'Meerut',
    state: 'Uttar Pradesh',
    eligibleCount: 89,
    actionsCompleted: 72,
    avgProcessingTime: 16,
    dataQualityScore: 91
  },
  {
    district: 'Gorakhpur',
    state: 'Uttar Pradesh',
    eligibleCount: 98,
    actionsCompleted: 45,
    avgProcessingTime: 28,
    dataQualityScore: 72
  }
]
