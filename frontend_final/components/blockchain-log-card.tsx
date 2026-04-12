"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { submitLogToBlockchain, fetchLatestLog, BlockchainLog } from "@/lib/blockchain";
import { ShieldCheck, Link as LinkIcon, Loader2, CheckCircle2, AlertTriangle, Scale } from "lucide-react";

interface BlockchainLogCardProps {
  caseId: string;
  reasoningChain: string;
  confidence: number;
}

export function BlockchainLogCard({ caseId, reasoningChain, confidence }: BlockchainLogCardProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [log, setLog] = useState<BlockchainLog | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [txHash, setTxHash] = useState("");

  // Check if a log already exists for this case securely on-chain
  useEffect(() => {
    async function loadLogs() {
      try {
        const latestLog = await fetchLatestLog(caseId);
        if (latestLog) setLog(latestLog);
      } catch (err) {
        console.log("Could not fetch log immediately or MetaMask locked.");
      }
    }
    loadLogs();
  }, [caseId]);

  const handleLogAction = async (action: string) => {
    setIsSubmitting(true);
    setErrorMsg("");
    setTxHash("");
    
    try {
      // Connect to MetaMask and sign the Assessment Payload
      const { hash } = await submitLogToBlockchain(
        caseId,
        "eCourts, FIR OCR, JusticeGrid Platform", // Mock data sources
        reasoningChain || "No reasoning provided",
        confidence || 0,
        action
      );
      
      setTxHash(hash);
      
      // Re-fetch the latest log visually to prove immutability
      const verifiedLog = await fetchLatestLog(caseId);
      if (verifiedLog) setLog(verifiedLog);
      
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Execution reverted or user denied transaction.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (log) {
    return (
      <Card className="bg-[#F5F3EE] border-[#C9A84C] relative overflow-hidden">
        {/* Subtle decorative background icon */}
        <ShieldCheck className="absolute -right-8 -bottom-8 h-40 w-40 text-[#C9A84C]/10" />
        
        <CardHeader className="pb-3 border-b border-[#D4D0C5]/50">
          <div className="flex items-center gap-2">
            <div className="bg-[#166534] p-1.5 rounded-full">
              <CheckCircle2 className="h-4 w-4 text-white" />
            </div>
            <CardTitle className="text-lg text-[#1B3A6B] flex items-center gap-2">
              Immutably Logged
            </CardTitle>
          </div>
          <CardDescription className="text-[#5A6A7A]">
            Pillar 05 Security — Assessment securely locked on the Ganache ledger.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4 space-y-3 relative z-10">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-[#5A6A7A] mb-1">Paralegal Decision</p>
              <p className="font-semibold text-[#1B3A6B]">{log.paralegalResponse}</p>
            </div>
            <div>
              <p className="text-[#5A6A7A] mb-1">Signed Timestamp</p>
              <p className="font-semibold text-[#1B3A6B]">{log.timestamp}</p>
            </div>
            <div className="col-span-2">
              <p className="text-[#5A6A7A] mb-1">Architectural Footprint</p>
              <div className="bg-white px-3 py-2 rounded border border-[#D4D0C5] text-xs font-mono break-all text-[#1B3A6B]/80 flex items-center gap-2">
                <LinkIcon className="h-3 w-3 shrink-0" />
                {txHash ? txHash : "Confirmed Block Entry"}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-[#D4D0C5] shadow-sm">
      <CardHeader className="pb-3 border-b border-[#D4D0C5]/50">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-[#C9A84C]" />
          <CardTitle className="text-lg text-[#1B3A6B]">Require Paralegal Assessment</CardTitle>
        </div>
        <CardDescription className="text-[#5A6A7A]">
          According to Accountability Standards, your decision on this AI recommendation must be immutably recorded to the ledger.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pt-5 space-y-4">
        {errorMsg && (
          <div className="bg-red-50 text-red-700 p-3 rounded-lg flex items-start gap-2 text-sm border border-red-200">
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
            <p>{errorMsg}</p>
          </div>
        )}

        <div className="flex flex-col gap-3">
          <Button 
            onClick={() => handleLogAction("Acted On - Agree With AI")}
            disabled={isSubmitting}
            className="w-full bg-[#1B3A6B] hover:bg-[#1B3A6B]/90 text-white gap-2"
          >
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Scale className="h-4 w-4" />}
            Agree & Execute Recommendation
          </Button>

          <div className="flex gap-3">
            <Button 
              onClick={() => handleLogAction("Overrode - Disagree With AI")}
              disabled={isSubmitting}
              variant="outline" 
              className="w-full border-[#C9A84C] text-[#B45309] hover:bg-[#C9A84C]/10"
            >
              Override AI
            </Button>
            <Button 
              onClick={() => handleLogAction("Flagged for Supervisor Review")}
              disabled={isSubmitting}
              variant="outline" 
              className="w-full border-red-200 text-red-700 hover:bg-red-50"
            >
              Flag Case
            </Button>
          </div>
        </div>
        <p className="text-center text-xs text-[#5A6A7A] mt-2">
          Clicking any button will launch MetaMask to sign a cryptic proof mapping your identity to the decision.
        </p>
      </CardContent>
    </Card>
  );
}
