"use client";

import React, { useState } from "react";
import { Check, Briefcase, FileText, Maximize2, MoreHorizontal, X, Loader2, ArrowRight } from "lucide-react";
import { advanceCasePhase } from "@/server/actions/case-actions";
import { useRouter } from "next/navigation";

const LIFECYCLE_PHASES = [
  "intake",
  "conflict check",
  "client onboarding",
  "retainer",
  "document collection",
  "legal review",
  "drafting",
  "filing",
  "court registration",
  "hearing",
  "evidence",
  "interim order",
  "final hearing",
  "judgment",
  "appeal window",
  "execution",
  "closure",
  "archive"
];

export default function MatterCockpit({ caseItem, onClose, hideHeader }: { caseItem: any, onClose: () => void, hideHeader?: boolean }) {
  const router = useRouter();
  const [isAdvancing, setIsAdvancing] = useState(false);
  
  const currentPhaseIndex = LIFECYCLE_PHASES.indexOf(caseItem.current_phase?.toLowerCase() || "intake");
  const nextPhase = currentPhaseIndex < LIFECYCLE_PHASES.length - 1 ? LIFECYCLE_PHASES[currentPhaseIndex + 1] : null;

  const handleAdvance = async () => {
    if (!nextPhase) return;
    setIsAdvancing(true);
    try {
      await advanceCasePhase(caseItem.id, nextPhase);
      router.refresh();
    } catch (err) {
      console.error("Failed to advance phase:", err);
    } finally {
      setIsAdvancing(false);
    }
  };

  return (
    <div className="w-[45%] max-w-2xl min-w-[480px] bg-white/95 backdrop-blur-2xl border-l border-white/40 flex flex-col shadow-[-20px_0_40px_-10px_rgba(0,0,0,0.05)] z-20 h-full animate-in slide-in-from-right-8 duration-300">
      {/* Header */}
      {!hideHeader && (
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100/50 bg-transparent shrink-0">
          <div className="flex items-center gap-2">
            <span className="bg-purple-50 text-purple-700 px-2.5 py-1 rounded-md text-xs font-semibold tracking-wide uppercase">
              Matter Cockpit
            </span>
            <span className="text-sm text-[#5f6368]">{caseItem.id.slice(0,8)}</span>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 text-gray-400 hover:text-[#202124] hover:bg-gray-50 rounded-full transition-colors">
              <Maximize2 className="w-4 h-4" />
            </button>
            <button className="p-2 text-gray-400 hover:text-[#202124] hover:bg-gray-50 rounded-full transition-colors">
              <MoreHorizontal className="w-4 h-4" />
            </button>
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-50 rounded-full transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto bg-gradient-to-br from-[#f8f9fa] to-gray-50 p-6">
        
        {/* Title Card */}
        <div className="bg-white/80 backdrop-blur-md p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/40 mb-6 transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
          <h2 className="text-2xl font-semibold text-[#202124] mb-2 leading-tight">
            {caseItem.title}
          </h2>
          <div className="flex items-center gap-4 text-sm text-[#5f6368] mb-6">
            <div className="flex items-center gap-1.5">
              <Briefcase className="w-4 h-4" />
              <span>{caseItem.client?.name || "No Client"}</span>
            </div>
            <div className="w-1 h-1 rounded-full bg-gray-300" />
            <div className="flex items-center gap-1.5">
              <FileText className="w-4 h-4" />
              <span className="capitalize">{caseItem.status}</span>
            </div>
          </div>

          <div className="bg-blue-50/50 rounded-xl p-4 border border-blue-100">
            <span className="block text-xs font-semibold text-blue-800 uppercase tracking-wider mb-1">Situation Engine: Next Action</span>
            <span className="text-sm text-blue-900 font-medium">
              {caseItem.next_action || "Awaiting Initial Review"}
            </span>
          </div>
        </div>

        {/* Phase Lifecycle Tracker */}
        <div className="bg-white/80 backdrop-blur-md p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/40 mb-6">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-sm font-semibold text-[#202124] uppercase tracking-wider">Lifecycle Pipeline</h3>
            {nextPhase && (
              <button 
                onClick={handleAdvance}
                disabled={isAdvancing}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-2 shadow-md hover:shadow-lg active:scale-95 disabled:opacity-70 disabled:hover:scale-100"
              >
                {isAdvancing ? <Loader2 className="w-4 h-4 animate-spin" /> : "Advance Phase"}
                {!isAdvancing && <ArrowRight className="w-4 h-4" />}
              </button>
            )}
          </div>

          <div className="relative pl-4 space-y-6 before:absolute before:inset-0 before:ml-[23px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">
            {LIFECYCLE_PHASES.map((phase, idx) => {
              const isCompleted = idx < currentPhaseIndex;
              const isCurrent = idx === currentPhaseIndex;

              // Collapse far future phases for UI density
              if (idx > currentPhaseIndex + 3 && idx !== LIFECYCLE_PHASES.length - 1) return null;
              if (idx === currentPhaseIndex + 3 && idx !== LIFECYCLE_PHASES.length - 1) {
                 return <div key={phase} className="pl-12 text-xs text-gray-400 font-medium tracking-widest">• • •</div>;
              }

              return (
                <div key={phase} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group transition-all duration-300">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 bg-white z-10 shrink-0 transition-transform group-hover:scale-110 ${isCompleted ? 'border-emerald-500 text-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.2)]' : isCurrent ? 'border-blue-600 text-blue-600 shadow-[0_0_0_4px_rgba(37,99,235,0.1)]' : 'border-gray-200'}`}>
                    {isCompleted && <Check className="w-4 h-4" />}
                    {isCurrent && <div className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse" />}
                  </div>
                  
                  <div className={`w-[calc(100%-3.5rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-2xl border transition-all duration-300 ml-4 md:ml-0 md:mr-0 ${isCurrent ? 'bg-blue-50/50 border-blue-200 shadow-sm shadow-blue-500/10' : isCompleted ? 'bg-white border-gray-100 hover:border-gray-300 hover:shadow-sm' : 'bg-transparent border-transparent'}`}>
                    <div className={`font-semibold text-sm capitalize ${isCurrent ? 'text-blue-700' : isCompleted ? 'text-gray-900' : 'text-gray-400'}`}>
                      {phase}
                    </div>
                    {isCurrent && (
                      <div className="text-xs text-blue-600 mt-1">Current Active Phase</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
