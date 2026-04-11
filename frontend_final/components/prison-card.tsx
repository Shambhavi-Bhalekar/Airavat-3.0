"use client"

import { cn } from "@/lib/utils"
import type { PrisonSummary } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Building2, Users, Clock, ChevronRight } from "lucide-react"

interface PrisonCardProps {
  prison: PrisonSummary
  onClick?: () => void
  className?: string
}

export function PrisonCard({ prison, onClick, className }: PrisonCardProps) {
  const eligiblePercent = Math.round((prison.eligibleUndertrials / prison.totalUndertrials) * 100)
  
  return (
    <Card 
      className={cn(
        "group cursor-pointer transition-all bg-white border-[#D4D0C5] hover:border-[#C9A84C] hover:shadow-md",
        className
      )}
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#1B3A6B]">
              <Building2 className="h-5 w-5 text-[#C9A84C]" />
            </div>
            <div>
              <CardTitle className="text-base text-[#1B3A6B]">{prison.prisonName}</CardTitle>
              <p className="text-sm text-[#5A6A7A]">{prison.district}, {prison.state}</p>
            </div>
          </div>
          {prison.pendingActions > 0 && (
            <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-[#B45309]/10 px-2 text-xs font-medium text-[#B45309]">
              {prison.pendingActions}
            </span>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <p className="text-xs text-[#5A6A7A]">Total Undertrials</p>
            <p className="text-lg font-semibold text-[#1B3A6B]">{prison.totalUndertrials.toLocaleString()}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-[#5A6A7A]">Eligible (S.479)</p>
            <p className="text-lg font-semibold text-[#166534]">{prison.eligibleUndertrials}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-[#5A6A7A]">Window Closing</p>
            <p className="text-lg font-semibold text-[#B45309]">{prison.windowClosingCount}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-[#5A6A7A]">Avg Detention</p>
            <p className="text-lg font-semibold text-[#1B3A6B]">{prison.avgDetentionDays}d</p>
          </div>
        </div>

        {/* Eligible Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#5A6A7A]">Eligibility Coverage</span>
            <span className="font-medium text-[#1B3A6B]">{eligiblePercent}%</span>
          </div>
          <Progress value={eligiblePercent} className="h-1.5" />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-[#D4D0C5]">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-xs text-[#5A6A7A]">
              <Users className="h-3 w-3" />
              {prison.pendingActions} pending
            </span>
            <span className="flex items-center gap-1 text-xs text-[#B45309]">
              <Clock className="h-3 w-3" />
              {prison.windowClosingCount} urgent
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 gap-1 text-xs text-[#1B3A6B] hover:bg-[#E8E5DC] group-hover:bg-[#1B3A6B] group-hover:text-white"
          >
            View
            <ChevronRight className="h-3 w-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
