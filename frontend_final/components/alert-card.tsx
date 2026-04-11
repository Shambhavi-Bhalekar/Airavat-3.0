"use client"

import { cn } from "@/lib/utils"
import type { SystemAlert } from "@/lib/types"
import { Button } from "@/components/ui/button"
import {
  Clock,
  AlertTriangle,
  CloudOff,
  Phone,
  Scale,
  DollarSign,
  Check,
  X,
} from "lucide-react"

interface AlertCardProps {
  alert: SystemAlert
  onAcknowledge?: () => void
  onDismiss?: () => void
  className?: string
}

const alertConfig: Record<SystemAlert['type'], {
  icon: React.ComponentType<{ className?: string }>
  label: string
}> = {
  eligibility_window: {
    icon: Clock,
    label: 'Eligibility Window',
  },
  stale_data: {
    icon: CloudOff,
    label: 'Data Staleness',
  },
  family_notification: {
    icon: Phone,
    label: 'Family Notification',
  },
  surety_blocked: {
    icon: DollarSign,
    label: 'Surety Blocked',
  },
  court_pattern: {
    icon: Scale,
    label: 'Court Pattern',
  },
}

const severityClasses: Record<SystemAlert['severity'], string> = {
  critical: 'border-[#B91C1C]/50 bg-[#B91C1C]/5',
  warning: 'border-[#B45309]/50 bg-[#B45309]/5',
  info: 'border-[#1B3A6B]/50 bg-[#1B3A6B]/5',
}

const severityIconClasses: Record<SystemAlert['severity'], string> = {
  critical: 'text-[#B91C1C]',
  warning: 'text-[#B45309]',
  info: 'text-[#1B3A6B]',
}

export function AlertCard({ alert, onAcknowledge, onDismiss, className }: AlertCardProps) {
  const config = alertConfig[alert.type]
  const Icon = config.icon

  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-lg border p-3 bg-white",
        severityClasses[alert.severity],
        alert.acknowledged && "opacity-60",
        className
      )}
    >
      <div className={cn("shrink-0 mt-0.5", severityIconClasses[alert.severity])}>
        {alert.severity === 'critical' ? (
          <AlertTriangle className="h-5 w-5" />
        ) : (
          <Icon className="h-5 w-5" />
        )}
      </div>
      
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-[#5A6A7A] uppercase tracking-wider">
            {config.label}
          </span>
          <span className="text-xs text-[#5A6A7A]">
            {new Date(alert.timestamp).toLocaleTimeString('en-IN', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        </div>
        <p className="text-sm text-[#1B3A6B]">{alert.message}</p>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        {!alert.acknowledged && onAcknowledge && (
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-[#166534] hover:bg-[#166534]/10 hover:text-[#166534]"
            onClick={onAcknowledge}
          >
            <Check className="h-4 w-4" />
            <span className="sr-only">Acknowledge</span>
          </Button>
        )}
        {onDismiss && (
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-[#5A6A7A] hover:bg-[#B91C1C]/10 hover:text-[#B91C1C]"
            onClick={onDismiss}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Dismiss</span>
          </Button>
        )}
      </div>
    </div>
  )
}
