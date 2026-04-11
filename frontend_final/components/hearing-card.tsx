"use client"

import { cn } from "@/lib/utils"
import type { Hearing } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ConfidenceBadge } from "@/components/confidence-badge"
import { Calendar, MapPin, User, AlertTriangle } from "lucide-react"

interface HearingCardProps {
  hearing: Hearing
  isNext?: boolean
  className?: string
}

export function HearingCard({ hearing, isNext = false, className }: HearingCardProps) {
  const isHighAdjournment = hearing.adjournmentProbability.percentage >= 70
  const hearingDate = new Date(hearing.date)
  const daysUntil = Math.ceil((hearingDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  
  return (
    <Card className={cn(
      "bg-white border-[#D4D0C5]",
      isNext && "border-[#C9A84C] border-2",
      isHighAdjournment && "border-[#B45309]/50",
      className
    )}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2 text-[#1B3A6B]">
            <Calendar className="h-4 w-4 text-[#C9A84C]" />
            {isNext ? 'Next Hearing' : 'Hearing'}
          </CardTitle>
          {isNext && daysUntil > 0 && (
            <span className={cn(
              "text-xs font-medium px-2 py-1 rounded",
              daysUntil <= 3 ? "bg-[#B45309]/10 text-[#B45309]" : "bg-[#E8E5DC] text-[#1B3A6B]"
            )}>
              {daysUntil === 1 ? 'Tomorrow' : `In ${daysUntil} days`}
            </span>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {/* Date & Time */}
        <div className="flex items-center gap-3 p-3 rounded-lg bg-[#F5F3EE]">
          <div className="flex h-12 w-12 flex-col items-center justify-center rounded-lg bg-[#1B3A6B] text-white">
            <span className="text-lg font-bold leading-none">
              {hearingDate.getDate()}
            </span>
            <span className="text-xs uppercase">
              {hearingDate.toLocaleDateString('en-IN', { month: 'short' })}
            </span>
          </div>
          <div>
            <p className="font-medium text-[#1B3A6B]">
              {hearingDate.toLocaleDateString('en-IN', { 
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
            <p className="text-sm text-[#5A6A7A]">{hearing.purpose}</p>
          </div>
        </div>

        {/* Court & Judge */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-[#5A6A7A] shrink-0" />
            <span className="text-[#1B3A6B]">{hearing.court}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <User className="h-4 w-4 text-[#5A6A7A] shrink-0" />
            <span className="text-[#1B3A6B]">{hearing.judge}</span>
          </div>
        </div>

        {/* Adjournment Probability */}
        <div className={cn(
          "p-3 rounded-lg border",
          isHighAdjournment 
            ? "bg-[#B45309]/5 border-[#B45309]/30" 
            : "bg-[#F5F3EE] border-transparent"
        )}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              {isHighAdjournment && <AlertTriangle className="h-4 w-4 text-[#B45309]" />}
              <span className="text-sm text-[#5A6A7A]">Adjournment Probability</span>
            </div>
            <ConfidenceBadge 
              confidence={hearing.adjournmentProbability} 
              size="sm"
            />
          </div>
          {isHighAdjournment && (
            <p className="text-xs text-[#B45309]">
              High probability of adjournment based on court history. Consider alternative scheduling.
            </p>
          )}
          {hearing.consecutiveAdjournments > 0 && (
            <p className="text-xs text-[#5A6A7A] mt-1">
              {hearing.consecutiveAdjournments} consecutive prior adjournment{hearing.consecutiveAdjournments > 1 ? 's' : ''}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
