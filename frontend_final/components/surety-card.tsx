"use client"

import { cn } from "@/lib/utils"
import type { SuretyInfo } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DollarSign, AlertTriangle, Clock, FileText } from "lucide-react"

interface SuretyCardProps {
  surety: SuretyInfo
  className?: string
}

export function SuretyCard({ surety, className }: SuretyCardProps) {
  const isBlocked = !surety.executed && surety.daysSinceGranted > 14
  const isUnaffordable = surety.daysOfWageEquivalent > 90
  
  return (
    <Card className={cn(
      "border-2 bg-white border-[#D4D0C5]",
      isBlocked && "border-[#B91C1C]/50",
      className
    )}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2 text-[#1B3A6B]">
            <DollarSign className="h-5 w-5 text-[#C9A84C]" />
            Bail Surety Status
          </CardTitle>
          {isBlocked && (
            <span className="flex items-center gap-1 rounded bg-[#B91C1C]/10 px-2 py-1 text-xs font-medium text-[#B91C1C]">
              <AlertTriangle className="h-3 w-3" />
              Blocked
            </span>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Amount */}
        <div className="p-4 rounded-lg bg-[#F5F3EE] text-center">
          <p className="text-sm text-[#5A6A7A] mb-1">Surety Amount</p>
          <p className="text-3xl font-bold text-[#1B3A6B]">
            {surety.currency} {surety.amount.toLocaleString('en-IN')}
          </p>
        </div>

        {/* Status & Timing */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-lg bg-white border border-[#D4D0C5]">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="h-4 w-4 text-[#5A6A7A]" />
              <span className="text-xs text-[#5A6A7A]">Granted</span>
            </div>
            <p className="text-sm font-medium text-[#1B3A6B]">
              {new Date(surety.grantedDate).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </p>
            <p className="text-xs text-[#5A6A7A]">
              {surety.daysSinceGranted} days ago
            </p>
          </div>
          
          <div className={cn(
            "p-3 rounded-lg border",
            surety.executed 
              ? "bg-[#166534]/5 border-[#166534]/30" 
              : "bg-[#B91C1C]/5 border-[#B91C1C]/30"
          )}>
            <span className="text-xs text-[#5A6A7A]">Status</span>
            <p className={cn(
              "text-sm font-medium mt-1",
              surety.executed ? "text-[#166534]" : "text-[#B91C1C]"
            )}>
              {surety.executed ? 'Executed' : 'Not Executed'}
            </p>
          </div>
        </div>

        {/* Affordability Analysis */}
        <div className={cn(
          "p-3 rounded-lg border",
          isUnaffordable 
            ? "bg-[#B45309]/5 border-[#B45309]/30" 
            : "bg-[#F5F3EE] border-transparent"
        )}>
          <div className="flex items-center gap-2 mb-2">
            {isUnaffordable && <AlertTriangle className="h-4 w-4 text-[#B45309]" />}
            <span className="text-sm font-medium text-[#1B3A6B]">Affordability Analysis</span>
          </div>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-[#5A6A7A]">Local median daily wage</span>
              <span className="text-[#1B3A6B]">INR {surety.localMedianDailyWage}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#5A6A7A]">Days of wage equivalent</span>
              <span className={cn(
                "font-medium",
                isUnaffordable ? "text-[#B45309]" : "text-[#1B3A6B]"
              )}>
                {surety.daysOfWageEquivalent} days
              </span>
            </div>
          </div>
          
          {isUnaffordable && (
            <p className="text-xs text-[#B45309] mt-2">
              Surety exceeds 90 days of local median income. Section 440 surety reduction recommended.
            </p>
          )}
        </div>

        {/* Action */}
        {surety.recommendSuretyReduction && (
          <div className="space-y-2">
            <Button className="w-full gap-2 bg-[#1B3A6B] hover:bg-[#2A4A7B]">
              <FileText className="h-4 w-4" />
              Generate Surety Reduction Application
            </Button>
            <p className="text-xs text-center text-[#5A6A7A]">
              Auto-generate brief for lawyer review under Section 440
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
