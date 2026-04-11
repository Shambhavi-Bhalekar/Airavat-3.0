"use client"

import { cn } from "@/lib/utils"
import type { Case } from "@/lib/types"
import { StatusBadge } from "@/components/status-badge"
import { ConfidenceBadge } from "@/components/confidence-badge"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Calendar,
  MapPin,
  User,
  ChevronRight,
  AlertTriangle,
  FileText,
  Phone,
} from "lucide-react"

interface CaseCardProps {
  caseData: Case
  onClick?: () => void
  compact?: boolean
  className?: string
}

export function CaseCard({ caseData, onClick, compact = false, className }: CaseCardProps) {
  const hasUrgentFlags = 
    caseData.eligibility.requiresLawyerReview ||
    caseData.eligibility.requiresHumanResolution ||
    caseData.dataFreshness === 'stale'

  return (
    <Card
      className={cn(
        "group cursor-pointer transition-all bg-white border-[#D4D0C5] hover:border-[#C9A84C] hover:shadow-md",
        hasUrgentFlags && "border-[#B91C1C]/30",
        className
      )}
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-[#1B3A6B] truncate">
                {caseData.prisonerName}
              </h3>
              <span className="shrink-0 rounded bg-[#C9A84C]/20 px-1.5 py-0.5 text-xs font-mono text-[#1B3A6B]">
                #{caseData.priorityRank}
              </span>
            </div>
            <p className="text-sm text-[#5A6A7A] truncate">
              {caseData.caseNumber}
            </p>
          </div>
          <StatusBadge status={caseData.eligibility.status} />
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Priority Reason */}
        <p className="text-sm text-[#1B3A6B]/80 line-clamp-2">
          {caseData.priorityReason}
        </p>

        {/* Key Info */}
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#5A6A7A]">
          <span className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {caseData.prison}
          </span>
          <span className="flex items-center gap-1">
            <User className="h-3 w-3" />
            {caseData.isFirstTimeOffender ? 'First-time' : 'Regular'}
          </span>
          {caseData.nextHearing && (
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {new Date(caseData.nextHearing.date).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
              })}
            </span>
          )}
        </div>

        {/* Charges */}
        {!compact && (
          <div className="flex flex-wrap gap-1">
            {caseData.charges.slice(0, 3).map((charge, i) => (
              <span
                key={i}
                className="rounded bg-[#E8E5DC] px-1.5 py-0.5 text-xs text-[#1B3A6B]"
              >
                {charge.act} {charge.section}
              </span>
            ))}
            {caseData.charges.length > 3 && (
              <span className="rounded bg-[#E8E5DC] px-1.5 py-0.5 text-xs text-[#5A6A7A]">
                +{caseData.charges.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Confidence & Flags */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ConfidenceBadge confidence={caseData.eligibility.confidence} size="sm" />
            {caseData.eligibility.requiresLawyerReview && (
              <span className="flex items-center gap-1 rounded bg-[#1B3A6B]/10 px-1.5 py-0.5 text-xs text-[#1B3A6B]">
                <AlertTriangle className="h-3 w-3" />
                Lawyer
              </span>
            )}
            {caseData.eligibility.requiresHumanResolution && (
              <span className="flex items-center gap-1 rounded bg-[#B91C1C]/10 px-1.5 py-0.5 text-xs text-[#B91C1C]">
                <AlertTriangle className="h-3 w-3" />
                Review
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-1">
            {caseData.documentsPresent && (
              <FileText className="h-4 w-4 text-[#166534]" />
            )}
            {caseData.familyNotificationOptIn && (
              <Phone className="h-4 w-4 text-[#1B3A6B]" />
            )}
          </div>
        </div>

        {/* Actions */}
        {!compact && (
          <div className="flex items-center justify-between pt-2 border-t border-[#D4D0C5]">
            <span className="text-xs text-[#5A6A7A]">
              Last action: {caseData.daysSinceLastAction}d ago
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 gap-1 text-xs text-[#1B3A6B] hover:bg-[#E8E5DC] group-hover:bg-[#1B3A6B] group-hover:text-white"
            >
              View Details
              <ChevronRight className="h-3 w-3" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
