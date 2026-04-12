"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, TrendingUp, TrendingDown } from "lucide-react"

interface InsightItem {
  label: string
  value: number
  unit: string
  details?: Record<string, number | string>
}

interface SystemicInsightsCardProps {
  title: string
  description: string
  insights: Record<string, InsightItem | Record<string, any>>
  confidence?: number
  uncertaintyNote?: string
  isEmpty?: boolean
}

export function SystemicInsightsCard({
  title,
  description,
  insights,
  confidence = 0.75,
  uncertaintyNote,
  isEmpty = false,
}: SystemicInsightsCardProps) {
  const confidenceLevel =
    confidence >= 0.8 ? "high" : confidence >= 0.6 ? "medium" : "low"
  const confidenceColor =
    confidenceLevel === "high"
      ? "bg-green-100 text-green-800"
      : confidenceLevel === "medium"
        ? "bg-yellow-100 text-yellow-800"
        : "bg-red-100 text-red-800"

  const insightEntries = Object.entries(insights).slice(0, 5) // Top 5

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          <Badge className={confidenceColor}>
            {Math.round(confidence * 100)}% Confidence
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isEmpty ? (
          <>
            <div className="space-y-3">
              {insightEntries.map(([key, value], idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 bg-gray-50 rounded"
                >
                  <span className="font-medium text-sm">{key}</span>
                  {typeof value === "object" && value !== null ? (
                    <div className="text-right text-sm space-y-1">
                      {Object.entries(value as Record<string, any>)
                        .slice(0, 3)
                        .map(([k, v], i) => (
                          <div key={i} className="text-gray-600">
                            {k}: <span className="font-semibold">{String(v).substring(0, 30)}</span>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <span className="font-semibold text-right">
                      {typeof value === "number" ? (value as any).toFixed(1) : String(value)}
                    </span>
                  )}
                </div>
              ))}
            </div>

            {uncertaintyNote && (
              <Alert className="mt-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="text-xs mt-1">
                  <strong>Note:</strong> {uncertaintyNote}
                </AlertDescription>
              </Alert>
            )}
          </>
        ) : (
          <p className="text-gray-500 text-sm">No insights available yet.</p>
        )}
      </CardContent>
    </Card>
  )
}
