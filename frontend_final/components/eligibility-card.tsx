"use client"

import { cn } from "@/lib/utils"
import type { EligibilityAssessment } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ConfidenceBadge } from "@/components/confidence-badge"
import { StatusBadge } from "@/components/status-badge"
import { Scale, Calendar, Clock, AlertTriangle } from "lucide-react"

interface EligibilityCardProps {
  eligibility: EligibilityAssessment
  isFirstTimeOffender: boolean
  className?: string
}

export function EligibilityCard({ eligibility, isFirstTimeOffender, className }: EligibilityCardProps) {
  const progressPercent = Math.min(eligibility.percentageServed, 100)
  
  return (
    <Card className={cn("border-2 bg-white", eligibility.isEligible && "border-[#166534]/50", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2 text-[#1B3A6B]">
            <Scale className="h-5 w-5 text-[#C9A84C]" />
            Section 479 BNSS Eligibility
          </CardTitle>
          <StatusBadge status={eligibility.status} />
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Confidence Score */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-[#F5F3EE]">
          <span className="text-sm text-[#5A6A7A]">Assessment Confidence</span>
          <ConfidenceBadge confidence={eligibility.confidence} showInterval />
        </div>

        {/* Detention Progress */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-[#1B3A6B]">Detention Progress</span>
            <span className={cn(
              "text-sm font-semibold",
              eligibility.isEligible ? "text-[#166534]" : "text-[#5A6A7A]"
            )}>
              {eligibility.percentageServed}%
            </span>
          </div>
          
          <div className="relative">
            <Progress 
              value={progressPercent} 
              className={cn(
                "h-3",
                eligibility.isEligible && "[&>div]:bg-[#166534]"
              )}
            />
            {/* Threshold marker */}
            <div 
              className="absolute top-0 w-0.5 h-3 bg-[#1B3A6B]/50"
              style={{ left: '100%', transform: 'translateX(-50%)' }}
            />
          </div>
          
          <div className="flex items-center justify-between text-xs text-[#5A6A7A]">
            <span>{eligibility.detentionServed} days served</span>
            <span>{eligibility.requiredDetention > 0 ? `${eligibility.requiredDetention} days required` : 'N/A'}</span>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-lg bg-white border border-[#D4D0C5]">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="h-4 w-4 text-[#5A6A7A]" />
              <span className="text-xs text-[#5A6A7A]">Detention Served</span>
            </div>
            <p className="text-lg font-semibold text-[#1B3A6B]">
              {eligibility.detentionServed} days
            </p>
            <p className="text-xs text-[#5A6A7A]">
              ~{Math.round(eligibility.detentionServed / 30)} months
            </p>
          </div>
          
          <div className="p-3 rounded-lg bg-white border border-[#D4D0C5]">
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="h-4 w-4 text-[#5A6A7A]" />
              <span className="text-xs text-[#5A6A7A]">
                {eligibility.isEligible ? 'Eligible Since' : 'Eligible On'}
              </span>
            </div>
            {eligibility.eligibilityDate ? (
              <>
                <p className="text-lg font-semibold text-[#1B3A6B]">
                  {new Date(eligibility.eligibilityDate).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </p>
                {!eligibility.isEligible && eligibility.daysUntilEligible && (
                  <p className="text-xs text-[#B45309]">
                    {eligibility.daysUntilEligible} days remaining
                  </p>
                )}
              </>
            ) : (
              <p className="text-lg font-semibold text-[#5A6A7A]">N/A</p>
            )}
          </div>
        </div>

        {/* Offender Category */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-[#F5F3EE]">
          <span className="text-sm text-[#5A6A7A]">Offender Category</span>
          <span className={cn(
            "text-sm font-medium px-2 py-0.5 rounded",
            isFirstTimeOffender 
              ? "bg-[#166534]/10 text-[#166534]" 
              : "bg-[#B45309]/10 text-[#B45309]"
          )}>
            {isFirstTimeOffender ? 'First-time (1/3 rule)' : 'Regular (1/2 rule)'}
          </span>
        </div>

        {/* Flags */}
        {(eligibility.requiresLawyerReview || eligibility.requiresHumanResolution) && (
          <div className="p-3 rounded-lg bg-[#B91C1C]/5 border border-[#B91C1C]/30">
            <div className="flex items-center gap-2 text-[#B91C1C]">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm font-medium">Action Required</span>
            </div>
            <ul className="mt-2 space-y-1 text-sm text-[#B91C1C]/90">
              {eligibility.requiresLawyerReview && (
                <li>* Mandatory lawyer review required</li>
              )}
              {eligibility.requiresHumanResolution && (
                <li>* Human resolution required for identity/data issues</li>
              )}
            </ul>
          </div>
        )}

        {/* Timestamp */}
        <p className="text-xs text-[#5A6A7A] text-center">
          Assessment timestamp: {new Date(eligibility.timestamp).toLocaleString('en-IN')}
        </p>
      </CardContent>
    </Card>
  )
}
