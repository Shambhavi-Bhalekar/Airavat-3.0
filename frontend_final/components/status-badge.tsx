"use client"

import { cn } from "@/lib/utils"
import type { CaseStatus } from "@/lib/types"
import { 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Scale, 
  UserX, 
  CloudOff 
} from "lucide-react"

interface StatusBadgeProps {
  status: CaseStatus
  className?: string
}

const statusConfig: Record<CaseStatus, {
  label: string
  icon: React.ComponentType<{ className?: string }>
  className: string
}> = {
  eligible_now: {
    label: 'Eligible Now',
    icon: CheckCircle2,
    className: 'bg-[#166534]/10 text-[#166534] border-[#166534]/30',
  },
  window_closing: {
    label: 'Window Closing',
    icon: Clock,
    className: 'bg-[#B45309]/10 text-[#B45309] border-[#B45309]/30',
  },
  not_yet_eligible: {
    label: 'Not Yet Eligible',
    icon: Clock,
    className: 'bg-[#E8E5DC] text-[#5A6A7A] border-[#D4D0C5]',
  },
  lawyer_review_required: {
    label: 'Lawyer Review',
    icon: Scale,
    className: 'bg-[#1B3A6B]/10 text-[#1B3A6B] border-[#1B3A6B]/30',
  },
  identity_mismatch: {
    label: 'Identity Mismatch',
    icon: UserX,
    className: 'bg-[#B91C1C]/10 text-[#B91C1C] border-[#B91C1C]/30',
  },
  data_stale: {
    label: 'Data Stale',
    icon: CloudOff,
    className: 'bg-[#E8E5DC] text-[#5A6A7A] border-[#D4D0C5]',
  },
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status]
  const Icon = config.icon

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs font-medium",
        config.className,
        className
      )}
    >
      <Icon className="h-3 w-3" />
      <span>{config.label}</span>
    </span>
  )
}
