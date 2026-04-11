"use client"

import { cn } from "@/lib/utils"
import type { CourtBehavior } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Scale, AlertTriangle, Clock, FileText } from "lucide-react"

interface CourtCardProps {
  court: CourtBehavior
  className?: string
}

export function CourtCard({ court, className }: CourtCardProps) {
  const isHighAdjournment = court.adjournmentRate >= 70
  const isPatternAlert = court.quarterlyAdjournments >= 20
  
  return (
    <Card 
      className={cn(
        "transition-all bg-white border-[#D4D0C5]",
        isPatternAlert && "border-[#B45309]/50",
        className
      )}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              "flex h-10 w-10 items-center justify-center rounded-lg",
              isHighAdjournment ? "bg-[#B45309]/10" : "bg-[#1B3A6B]"
            )}>
              <Scale className={cn(
                "h-5 w-5",
                isHighAdjournment ? "text-[#B45309]" : "text-[#C9A84C]"
              )} />
            </div>
            <div>
              <CardTitle className="text-base text-[#1B3A6B]">{court.courtName}</CardTitle>
              <p className="text-sm text-[#5A6A7A]">{court.judge}</p>
            </div>
          </div>
          {isPatternAlert && (
            <span className="flex items-center gap-1 rounded bg-[#B45309]/10 px-2 py-1 text-xs font-medium text-[#B45309]">
              <AlertTriangle className="h-3 w-3" />
              Pattern Alert
            </span>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Case Type */}
        <div className="flex items-center gap-2">
          <span className="rounded bg-[#E8E5DC] px-2 py-0.5 text-xs text-[#1B3A6B]">
            {court.caseType}
          </span>
          <span className="text-xs text-[#5A6A7A]">
            {court.totalCasesAnalyzed} cases analyzed
          </span>
        </div>

        {/* Adjournment Rate */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-[#5A6A7A]">Adjournment Rate</span>
            <span className={cn(
              "text-sm font-semibold",
              isHighAdjournment ? "text-[#B45309]" : "text-[#1B3A6B]"
            )}>
              {court.adjournmentRate}%
            </span>
          </div>
          <Progress 
            value={court.adjournmentRate} 
            className={cn(
              "h-2",
              isHighAdjournment && "[&>div]:bg-[#B45309]"
            )}
          />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 pt-2 border-t border-[#D4D0C5]">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-[#5A6A7A]" />
            <div>
              <p className="text-sm font-medium text-[#1B3A6B]">{court.avgBailDecisionDays}d</p>
              <p className="text-xs text-[#5A6A7A]">Avg Decision Time</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-[#5A6A7A]" />
            <div>
              <p className="text-sm font-medium text-[#1B3A6B]">{court.quarterlyAdjournments}</p>
              <p className="text-xs text-[#5A6A7A]">This Quarter</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
