"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, Bot, Scale, BrainCircuit, CheckCircle2 } from "lucide-react";

interface AgenticVerdictCardProps {
  caseId: string;
  onComplete?: () => void;
}

export function AgenticVerdictCard({ caseId, onComplete }: AgenticVerdictCardProps) {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [data, setData] = useState<{
    transcript: string;
    verdict: { verdict: string; reasoning: string; confidence: number };
  } | null>(null);

  const handleRunVerdict = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const response = await fetch(`http://localhost:8000/case/${caseId}/orchestrate`, {
        method: "POST"
      });
      if (!response.ok) {
        throw new Error("Failed to execute multi-agent orchestrator.");
      }
      const jsonData = await response.json();
      setData(jsonData);
      if (onComplete) {
        // slight delay to allow the card animation to trigger first before parent syncs
        setTimeout(() => onComplete(), 1500);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "An error occurred while debating.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-[#D4D0C5] bg-white shadow-sm overflow-hidden">
      <CardHeader className="bg-[#1B3A6B]/5 border-b border-[#D4D0C5] pb-4">
        <div className="flex items-center gap-2">
          <BrainCircuit className="h-5 w-5 text-[#C9A84C]" />
          <CardTitle className="text-lg text-[#1B3A6B]">
            Multi-Agent AI Debate Panel
          </CardTitle>
        </div>
        <CardDescription className="text-[#5A6A7A]">
          Execute concurrent specialized AI agents (Defense, Prosecution, Social Worker) to debate this case and force an impartial verdict.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pt-5 space-y-4">
        {!data && !loading && (
          <Button 
            onClick={handleRunVerdict}
            className="w-full bg-[#1B3A6B] hover:bg-[#1B3A6B]/90 text-white gap-2"
          >
            <Bot className="h-4 w-4" />
            Launch AI Agents Verdict
          </Button>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center p-6 space-y-3">
            <Loader2 className="h-8 w-8 animate-spin text-[#C9A84C]" />
            <p className="text-sm text-[#5A6A7A] animate-pulse">
              AI Panel currently debating the evidence...
            </p>
          </div>
        )}

        {errorMsg && (
          <div className="bg-red-50 text-red-700 p-3 rounded-md text-sm border border-red-200">
            {errorMsg}
          </div>
        )}

        {data && (
          <div className="space-y-4 animate-in fade-in zoom-in duration-500">
            {/* Verdict Box */}
            <div className={`p-4 rounded-md border ${data.verdict.verdict === 'RELEASE' ? 'bg-green-50 border-green-200' : 'bg-orange-50 border-orange-200'}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold flex items-center gap-2">
                  <Scale className="h-4 w-4" />
                  Judge Moderator Verdict
                </span>
                <span className={`px-2 py-0.5 rounded text-xs font-bold ${data.verdict.verdict === 'RELEASE' ? 'bg-green-600 text-white' : 'bg-orange-600 text-white'}`}>
                  {data.verdict.verdict}
                </span>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">
                {data.verdict.reasoning}
              </p>
              <div className="mt-2 text-xs text-gray-500 flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" />
                Moderator Confidence: {data.verdict.confidence}%
              </div>
            </div>

            {/* Transcript */}
            <div className="bg-[#1e1e1e] rounded-md p-4 text-[#d4d4d4] font-mono text-xs max-h-64 overflow-y-auto whitespace-pre-wrap">
              {data.transcript}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
