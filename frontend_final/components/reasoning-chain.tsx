"use client"

import { cn } from "@/lib/utils"
import { CheckCircle2, AlertTriangle, Info, Database } from "lucide-react"

interface ReasoningChainProps {
  steps: string[]
  uncertaintyFlags?: string[]
  dataSources?: string[]
  className?: string
}

export function ReasoningChain({ 
  steps, 
  uncertaintyFlags = [], 
  dataSources = [],
  className 
}: ReasoningChainProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {/* Reasoning Steps */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-[#1B3A6B] flex items-center gap-2">
          <Info className="h-4 w-4 text-[#1B3A6B]" />
          Reasoning Chain
        </h4>
        <div className="space-y-1 pl-6">
          {steps.map((step, index) => {
            const isWarning = step.toLowerCase().includes('warning') || 
                             step.toLowerCase().includes('critical') ||
                             step.toLowerCase().includes('alert')
            const isSuccess = step.toLowerCase().includes('confirmed') ||
                             step.toLowerCase().includes('eligible')
            
            return (
              <div
                key={index}
                className={cn(
                  "flex items-start gap-2 text-sm rounded-md px-2 py-1.5",
                  isWarning && "bg-[#B45309]/10 text-[#B45309]",
                  isSuccess && "bg-[#166534]/10 text-[#166534]",
                  !isWarning && !isSuccess && "text-[#5A6A7A]"
                )}
              >
                <span className="shrink-0 font-mono text-xs opacity-50 w-5">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span className="flex-1">{step}</span>
                {isSuccess && <CheckCircle2 className="h-4 w-4 shrink-0" />}
                {isWarning && <AlertTriangle className="h-4 w-4 shrink-0" />}
              </div>
            )
          })}
        </div>
      </div>

      {/* Uncertainty Flags */}
      {uncertaintyFlags.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-[#1B3A6B] flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-[#B45309]" />
            Uncertainty Flags
          </h4>
          <div className="space-y-1 pl-6">
            {uncertaintyFlags.map((flag, index) => (
              <div
                key={index}
                className="flex items-start gap-2 text-sm text-[#B45309] bg-[#B45309]/10 rounded-md px-2 py-1.5"
              >
                <span className="shrink-0">*</span>
                <span className="flex-1">{flag}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Data Sources */}
      {dataSources.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-[#1B3A6B] flex items-center gap-2">
            <Database className="h-4 w-4 text-[#5A6A7A]" />
            Data Sources Used
          </h4>
          <div className="flex flex-wrap gap-2 pl-6">
            {dataSources.map((source, index) => (
              <span
                key={index}
                className="rounded-full bg-[#E8E5DC] px-2.5 py-0.5 text-xs text-[#1B3A6B]"
              >
                {source}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
