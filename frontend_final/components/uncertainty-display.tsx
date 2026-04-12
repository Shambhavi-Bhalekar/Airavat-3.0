"use client"

import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { AlertTriangle, Info } from "lucide-react"

export type ConfidenceLevel = "high" | "medium" | "low"

interface UncertaintyDisplayProps {
  confidence: number // 0.0 - 1.0
  reasoning?: string
  compact?: boolean
  showWarning?: boolean
}

export function UncertaintyDisplay({
  confidence,
  reasoning,
  compact = false,
  showWarning = true,
}: UncertaintyDisplayProps) {
  const percentage = Math.round(confidence * 100)
  const level: ConfidenceLevel =
    confidence >= 0.8 ? "high" : confidence >= 0.6 ? "medium" : "low"

  const badgeVariant =
    level === "high"
      ? "bg-green-100 text-green-800"
      : level === "medium"
        ? "bg-yellow-100 text-yellow-800"
        : "bg-red-100 text-red-800"

  const levelLabel =
    level === "high"
      ? "High Confidence"
      : level === "medium"
        ? "Medium Confidence"
        : "Low Confidence"

  const unreliabilityWarning =
    level === "low"
      ? "Predictions are highly uncertain. Verify independently before action."
      : level === "medium"
        ? "Predictions may have variance. Cross-reference with other sources."
        : "Predictions are relatively reliable but not deterministic."

  if (compact) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge className={badgeVariant}>
              {level === "low" && <AlertTriangle className="h-3 w-3 mr-1" />}
              {percentage}%
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-sm">
              <strong>{levelLabel}</strong>
            </p>
            <p className="text-xs mt-1">{unreliabilityWarning}</p>
            {reasoning && <p className="text-xs mt-1 italic">"{reasoning}"</p>}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  return (
    <div className="space-y-2 p-3 bg-gray-50 rounded border border-gray-200">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold">Model Confidence</span>
        <Badge className={badgeVariant}>
          {level === "low" && <AlertTriangle className="h-3 w-3 mr-1" />}
          {percentage}%
        </Badge>
      </div>

      <div className="text-xs text-gray-600 space-y-1">
        <p>
          {level === "low" && (
            <span className="text-red-700 font-semibold">⚠️ Unreliable:</span>
          )}
          {level === "medium" && <span className="text-yellow-700">⚡ Note:</span>}
          {level === "high" && <span className="text-green-700">✓ Reliable:</span>}
        </p>
        <p>{unreliabilityWarning}</p>
      </div>

      {showWarning && (
        <div className="p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-700">
          <strong>ℹ️ Important:</strong> This is a prediction input to judgment,
          not an instruction or guarantee. Always verify with primary sources.
        </div>
      )}

      {reasoning && (
        <div className="text-xs italic text-gray-700 mt-2 p-2 bg-white rounded border border-gray-300">
          <strong>Reasoning:</strong> "{reasoning}"
        </div>
      )}
    </div>
  )
}
