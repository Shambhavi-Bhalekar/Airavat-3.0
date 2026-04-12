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
import { AlertTriangle, AlertCircle } from "lucide-react"

interface PatternAlert {
  court: string
  high_adjournment_count: number
  alert_level: "CRITICAL" | "WARNING" | "INFO"
  recommendation: string
  confidence: number
  case_count: number
}

interface PatternAlertCardProps {
  alerts: PatternAlert[]
  quarterRange: string
  confidence?: number
  isEmpty?: boolean
}

export function PatternAlertCard({
  alerts,
  quarterRange,
  confidence = 0.75,
  isEmpty = false,
}: PatternAlertCardProps) {
  const alertLevelColors: Record<string, string> = {
    CRITICAL: "bg-red-100 text-red-800 border-red-300",
    WARNING: "bg-yellow-100 text-yellow-800 border-yellow-300",
    INFO: "bg-blue-100 text-blue-800 border-blue-300",
  }

  const alertLevelIcons: Record<string, React.ReactNode> = {
    CRITICAL: <AlertTriangle className="h-5 w-5" />,
    WARNING: <AlertCircle className="h-5 w-5" />,
    INFO: <AlertCircle className="h-5 w-5" />,
  }

  const criticalCount = alerts.filter((a) => a.alert_level === "CRITICAL")
    .length
  const warningCount = alerts.filter((a) => a.alert_level === "WARNING").length

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>🚨 UTRC Pattern Alerts</CardTitle>
            <CardDescription>
              Courts with high eligible case adjournments ({quarterRange})
            </CardDescription>
          </div>
          <div className="text-right space-y-1">
            <Badge variant="destructive">{criticalCount} Critical</Badge>
            <Badge variant="outline">{warningCount} Warning</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isEmpty && alerts.length > 0 ? (
          <>
            <div className="space-y-3">
              {alerts.slice(0, 5).map((alert, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded border-l-4 ${alertLevelColors[alert.alert_level]}`}
                >
                  <div className="flex items-start gap-2">
                    {alertLevelIcons[alert.alert_level]}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm">{alert.court}</h4>
                      <p className="text-xs mt-1">
                        <strong>{alert.high_adjournment_count}</strong> eligible
                        cases at high adjournment risk (
                        <strong>{alert.case_count}</strong> total eligible)
                      </p>
                      <p className="text-xs mt-2 italic">{alert.recommendation}</p>
                      <div className="flex gap-2 mt-2">
                        <Badge variant="secondary" className="text-xs">
                          {Math.round(alert.confidence * 100)}% Confidence
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <Alert className="mt-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="text-xs mt-1">
                <strong>Uncertainty Disclaimer:</strong> These predictions are
                based on historical adjournment patterns and are inputs to UTRC
                judgment, NOT instructions. Verify with actual court records
                before taking action.
              </AlertDescription>
            </Alert>
          </>
        ) : (
          <p className="text-gray-500 text-sm">
            No critical pattern alerts detected for this quarter.
          </p>
        )}
      </CardContent>
    </Card>
  )
}
