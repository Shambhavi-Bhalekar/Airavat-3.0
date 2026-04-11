"use client"

import { cn } from "@/lib/utils"
import type { ConfidenceScore } from "@/lib/types"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface ConfidenceBadgeProps {
  confidence: ConfidenceScore
  showInterval?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function ConfidenceBadge({ 
  confidence, 
  showInterval = false,
  size = 'md',
  className 
}: ConfidenceBadgeProps) {
  const { percentage, level, interval } = confidence

  const colorClasses = {
    high: 'bg-[#166534]/10 text-[#166534] border-[#166534]/30',
    medium: 'bg-[#B45309]/10 text-[#B45309] border-[#B45309]/30',
    low: 'bg-[#B91C1C]/10 text-[#B91C1C] border-[#B91C1C]/30',
  }

  const sizeClasses = {
    sm: 'text-xs px-1.5 py-0.5',
    md: 'text-sm px-2 py-1',
    lg: 'text-base px-3 py-1.5',
  }

  const badge = (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md border font-medium",
        colorClasses[level],
        sizeClasses[size],
        level === 'low' && 'animate-pulse-confidence',
        className
      )}
    >
      <span>{percentage}%</span>
      {showInterval && (
        <span className="text-[0.7em] opacity-70">
          [{interval[0]}-{interval[1]}]
        </span>
      )}
    </span>
  )

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{badge}</TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs bg-white border-[#D4D0C5] text-[#1B3A6B]">
          <div className="space-y-1">
            <p className="font-medium">
              Confidence: {percentage}% ({level})
            </p>
            <p className="text-xs text-[#5A6A7A]">
              Interval: {interval[0]}% - {interval[1]}%
            </p>
            {level === 'low' && (
              <p className="text-xs text-[#B91C1C]">
                Low confidence - requires human review
              </p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

interface ConfidenceBarProps {
  confidence: ConfidenceScore
  className?: string
}

export function ConfidenceBar({ confidence, className }: ConfidenceBarProps) {
  const { percentage, level } = confidence

  const colorClasses = {
    high: 'bg-[#166534]',
    medium: 'bg-[#B45309]',
    low: 'bg-[#B91C1C]',
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="h-1.5 flex-1 rounded-full bg-[#E8E5DC]">
        <div
          className={cn("h-full rounded-full transition-all", colorClasses[level])}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="text-xs font-medium text-[#5A6A7A] w-10 text-right">
        {percentage}%
      </span>
    </div>
  )
}
