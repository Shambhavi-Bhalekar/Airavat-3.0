"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { submitLogToBlockchain, fetchAllLogs, BlockchainLog } from "@/lib/blockchain";
import { ShieldCheck, Link as LinkIcon, Loader2, CheckCircle2, AlertTriangle, Scale } from "lucide-react";

interface BlockchainLogCardProps {
  caseId: string;
  reasoningChain: string;
  confidence: number;
}

export function BlockchainLogCard({ caseId, reasoningChain, confidence }: BlockchainLogCardProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [logs, setLogs] = useState<BlockchainLog[]>([]);
  const [errorMsg, setErrorMsg] = useState("");
  const [txHash, setTxHash] = useState("");

  // Check if logs already exists for this case securely on-chain
  useEffect(() => {
    async function loadLogs() {
      try {
        const historyLogs = await fetchAllLogs(caseId);
        setLogs(historyLogs);
      } catch (err) {
        console.log("Could not fetch logs immediately or MetaMask locked.");
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
      
      // Re-fetch ALL logs visually to prove immutability and append to audit trail
      const verifiedLogs = await fetchAllLogs(caseId);
      setLogs(verifiedLogs);
      
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Execution reverted or user denied transaction.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Permanent Assessment Card */}
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

          {txHash && (
            <div className="bg-green-50 text-green-700 p-3 rounded-lg flex items-center justify-between text-sm border border-green-200">
              <span className="flex items-center gap-2 font-medium">
                <CheckCircle2 className="h-4 w-4" /> Assessment Logged to Blockchain!
              </span>
              <span className="font-mono text-xs text-green-600 truncate max-w-[120px]">{txHash}</span>
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
            Clicking any button will launch MetaMask to log a cryptic proof on Ganache.
          </p>
        </CardContent>
      </Card>

      {/* Immutable Audit Trail List */}
      {logs.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-[#5A6A7A] uppercase tracking-wider pl-1">
            Immutable Audit Trail ({logs.length})
          </h3>
          <div className="flex flex-col gap-3">
            {logs.map((historicalLog, i) => (
              <Card key={i} className="bg-[#F5F3EE] border-[#C9A84C]/50 relative overflow-hidden transition-all hover:border-[#C9A84C]">
                {/* Subtle decorative background icon */}
                <ShieldCheck className="absolute -right-6 -bottom-6 h-32 w-32 text-[#C9A84C]/5" />
                
                <CardHeader className="p-4 pb-2 border-b border-[#D4D0C5]/40">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="bg-[#166534] p-1 rounded-full">
                        <CheckCircle2 className="h-3 w-3 text-white" />
                      </div>
                      <CardTitle className="text-sm font-semibold text-[#1B3A6B]">
                        Block Mined
                      </CardTitle>
                    </div>
                    <span className="text-xs font-medium text-[#5A6A7A]">{historicalLog.timestamp}</span>
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-3 space-y-2 relative z-10">
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <p className="text-[#5A6A7A] mb-0.5">Decision</p>
                      <p className="font-semibold text-[#1B3A6B]">{historicalLog.paralegalResponse}</p>
                    </div>
                    <div>
                      <p className="text-[#5A6A7A] mb-0.5">Signed Address</p>
                      <p className="font-mono text-[#1B3A6B] truncate" title={historicalLog.loggedBy}>
                        {historicalLog.loggedBy.slice(0, 6)}...{historicalLog.loggedBy.slice(-4)}
                      </p>
                    </div>
                    <div className="col-span-2">
                       <p className="text-[#5A6A7A] mb-0.5 mt-1">Data Sources Cryptographically Tied</p>
                       <p className="font-mono text-[#1B3A6B]/80 p-1.5 bg-white border border-[#D4D0C5] rounded break-words">
                         {historicalLog.dataSources}
                       </p>
                    </div>
                    <div className="col-span-2">
                       <p className="text-[#5A6A7A] mb-0.5 mt-1">AI Reasoning Cryptographically Anchored</p>
                       <p className="font-mono text-[#1B3A6B]/80 p-1.5 bg-white border border-[#D4D0C5] rounded break-words whitespace-pre-wrap max-h-32 overflow-y-auto">
                         {historicalLog.reasoningChain}
                       </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
