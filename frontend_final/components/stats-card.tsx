"use client"

import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react"

interface StatsCardProps {
  title: string
  value: string | number
  subtitle?: string
  trend?: {
    value: number
    direction: 'up' | 'down' | 'neutral'
    label?: string
  }
  icon?: React.ComponentType<{ className?: string }>
  variant?: 'default' | 'success' | 'warning' | 'destructive' | 'info'
  className?: string
}

export function StatsCard({
  title,
  value,
  subtitle,
  trend,
  icon: Icon,
  variant = 'default',
  className,
}: StatsCardProps) {
  const variantClasses = {
    default: 'border-[#D4D0C5]',
    success: 'border-[#166534]/30',
    warning: 'border-[#B45309]/30',
    destructive: 'border-[#B91C1C]/30',
    info: 'border-[#1B3A6B]/30',
  }

  const iconVariantClasses = {
    default: 'bg-[#E8E5DC] text-[#1B3A6B]',
    success: 'bg-[#166534]/10 text-[#166534]',
    warning: 'bg-[#B45309]/10 text-[#B45309]',
    destructive: 'bg-[#B91C1C]/10 text-[#B91C1C]',
    info: 'bg-[#1B3A6B]/10 text-[#1B3A6B]',
  }

  const trendColors = {
    up: 'text-[#166534]',
    down: 'text-[#B91C1C]',
    neutral: 'text-[#5A6A7A]',
  }

  const TrendIcon = trend?.direction === 'up' 
    ? ArrowUpRight 
    : trend?.direction === 'down' 
      ? ArrowDownRight 
      : Minus

  return (
    <Card className={cn("bg-white", variantClasses[variant], className)}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm text-[#5A6A7A]">{title}</p>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-bold text-[#1B3A6B]">{value}</p>
              {trend && (
                <span className={cn("flex items-center text-xs font-medium", trendColors[trend.direction])}>
                  <TrendIcon className="h-3 w-3" />
                  {trend.value}%
                </span>
              )}
            </div>
            {subtitle && (
              <p className="text-xs text-[#5A6A7A]">{subtitle}</p>
            )}
            {trend?.label && (
              <p className="text-xs text-[#5A6A7A]">{trend.label}</p>
            )}
          </div>
          {Icon && (
            <div className={cn("rounded-lg p-2", iconVariantClasses[variant])}>
              <Icon className="h-5 w-5" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
