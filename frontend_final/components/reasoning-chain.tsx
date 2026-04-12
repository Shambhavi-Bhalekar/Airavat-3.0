"use client"

import { cn } from "@/lib/utils"
import { CheckCircle2, AlertTriangle, Info, Database, Scale, ShieldAlert, Users } from "lucide-react"
import type { MultiAgentDebate } from "@/lib/types"

// ─── Agent Config ────────────────────────────────────────────────────────────

const AGENT_CONFIG: Record<string, { icon: string; color: string; bg: string; border: string }> = {
  "Defense Counsel": {
    icon:   "🛡️",
    color:  "text-blue-700",
    bg:     "bg-blue-50",
    border: "border-blue-200",
  },
  "Public Prosecutor": {
    icon:   "⚖️",
    color:  "text-orange-700",
    bg:     "bg-orange-50",
    border: "border-orange-200",
  },
  "Social Worker": {
    icon:   "🤝",
    color:  "text-purple-700",
    bg:     "bg-purple-50",
    border: "border-purple-200",
  },
}

function getAgentConfig(agent: string) {
  return AGENT_CONFIG[agent] ?? {
    icon: "🤖", color: "text-gray-700", bg: "bg-gray-50", border: "border-gray-200"
  }
}

// ─── Multi-Agent Chat Renderer ────────────────────────────────────────────────

function MultiAgentDebateView({ debate }: { debate: MultiAgentDebate }) {
  const isRelease = debate.verdict === "RELEASE"

  return (
    <div className="space-y-4">
      {/* Agent Chat Bubbles */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-[#5A6A7A] flex items-center gap-1.5">
          <Users className="h-3.5 w-3.5" />
          AI Debate Transcript
        </h4>

        {debate.agentMessages.map((msg, i) => {
          const cfg = getAgentConfig(msg.agent)
          return (
            <div
              key={i}
              className={cn(
                "rounded-lg border p-3 text-sm",
                cfg.bg,
                cfg.border
              )}
            >
              <div className={cn("font-semibold mb-1.5 flex items-center gap-1.5 text-xs", cfg.color)}>
                <span>{cfg.icon}</span>
                <span>{msg.agent}</span>
              </div>
              <p className={cn("leading-relaxed whitespace-pre-wrap", cfg.color)}>
                {msg.content}
              </p>
            </div>
          )
        })}
      </div>

      {/* Moderator Final Verdict */}
      <div className={cn(
        "rounded-lg border-2 p-4",
        isRelease
          ? "bg-green-50 border-green-400"
          : "bg-orange-50 border-orange-400"
      )}>
        <div className="flex items-center justify-between mb-2">
          <span className={cn(
            "font-bold text-sm flex items-center gap-1.5",
            isRelease ? "text-green-700" : "text-orange-700"
          )}>
            <Scale className="h-4 w-4" />
            Judge Moderator — Final Verdict
          </span>
          <span className={cn(
            "text-xs font-bold px-2 py-0.5 rounded-full text-white",
            isRelease ? "bg-green-600" : "bg-orange-600"
          )}>
            {debate.verdict}
          </span>
        </div>
        <p className={cn(
          "text-sm leading-relaxed",
          isRelease ? "text-green-800" : "text-orange-800"
        )}>
          {debate.reasoning}
        </p>
        <div className={cn(
          "mt-2 text-xs flex items-center gap-1",
          isRelease ? "text-green-600" : "text-orange-600"
        )}>
          <CheckCircle2 className="h-3 w-3" />
          Moderator Confidence: {debate.confidence}%
        </div>
      </div>
    </div>
  )
}

// ─── Standard Reasoning Chain ─────────────────────────────────────────────────

interface ReasoningChainProps {
  steps: string[]
  uncertaintyFlags?: string[]
  dataSources?: string[]
  className?: string
  multiAgentDebate?: MultiAgentDebate
}

export function ReasoningChain({
  steps,
  uncertaintyFlags = [],
  dataSources = [],
  className,
  multiAgentDebate,
}: ReasoningChainProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {/* If multi-agent debate data exists, show the full chat UI */}
      {multiAgentDebate ? (
        <MultiAgentDebateView debate={multiAgentDebate} />
      ) : (
        /* Standard bullet-point reasoning chain */
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
      )}

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
