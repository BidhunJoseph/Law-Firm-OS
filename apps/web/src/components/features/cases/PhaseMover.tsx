"use client";

import React, { useState } from "react";
import { Check, ChevronRight, AlertCircle, Loader2 } from "lucide-react";
import { updateMatterPhase } from "@/server/actions/case-actions";
import { useRouter } from "next/navigation";

export const PHASES = [
  "1. Intake & Conflict Check",
  "2. Onboarding & Doc Collection",
  "3. Strategy & Drafting",
  "4. Client Review",
  "5. Registration & Filing",
  "6. Hearings & Proceedings",
  "7. Judgment & Execution",
  "8. Closed / Archived"
];

export default function PhaseMover({ caseId, currentPhase, userRole }: { caseId: string, currentPhase: string, userRole: string }) {
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentIndex = PHASES.indexOf(currentPhase);
  const safeIndex = currentIndex >= 0 ? currentIndex : 0;
  
  // Only Admin or Lawyers can move phases
  const canMovePhase = userRole === "admin" || userRole === "lawyer";
  const isComplete = safeIndex === PHASES.length - 1;

  const handleAdvancePhase = async () => {
    if (isComplete || !canMovePhase) return;
    setIsUpdating(true);
    setError(null);
    try {
      const nextPhase = PHASES[safeIndex + 1];
      await updateMatterPhase(caseId, nextPhase);
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/40 overflow-hidden mb-8">
      <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 tracking-tight">Lifecycle Tracker</h2>
          <p className="text-sm text-gray-500 mt-1">Matters automatically route to the responsible team member based on the active phase.</p>
        </div>
        {canMovePhase && !isComplete && (
          <button 
            onClick={handleAdvancePhase}
            disabled={isUpdating}
            className="px-5 py-2.5 bg-black hover:bg-gray-900 text-white text-sm font-medium rounded-xl shadow-sm hover:shadow transition-all active:scale-95 flex items-center gap-2 disabled:opacity-50"
          >
            {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : (
              <>Advance to Next Phase <ChevronRight className="w-4 h-4" /></>
            )}
          </button>
        )}
      </div>

      {error && (
        <div className="px-6 py-3 bg-red-50 border-b border-red-100 flex items-center gap-2 text-red-700 text-sm">
          <AlertCircle className="w-4 h-4" /> {error}
        </div>
      )}

      <div className="p-8 overflow-x-auto">
        <div className="flex items-center justify-between min-w-[800px] relative">
          {/* Progress Line */}
          <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-100 -z-10" />
          <div 
            className="absolute top-5 left-0 h-0.5 bg-blue-600 -z-10 transition-all duration-500 ease-in-out" 
            style={{ width: `${(safeIndex / (PHASES.length - 1)) * 100}%` }} 
          />

          {PHASES.map((phase, idx) => {
            const isActive = idx === safeIndex;
            const isPast = idx < safeIndex;
            const isFuture = idx > safeIndex;
            const isClient = userRole === "client";
            
            return (
              <div key={phase} className={`flex flex-col items-center relative group w-32 ${isFuture && isClient ? "opacity-20 grayscale" : "opacity-100"} transition-all duration-300`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold border-2 transition-all duration-300 ${
                  isActive 
                    ? "bg-white border-blue-600 text-blue-600 shadow-[0_0_0_4px_rgba(37,99,235,0.1)] ring-4 ring-white" 
                    : isPast 
                      ? "bg-blue-600 border-blue-600 text-white ring-4 ring-white" 
                      : "bg-white border-gray-200 text-gray-400 ring-4 ring-white"
                }`}>
                  {isPast ? <Check className="w-5 h-5" /> : idx + 1}
                </div>
                <div className="mt-4 text-center">
                  <p className={`text-xs font-semibold whitespace-normal leading-tight ${isActive ? "text-blue-700" : isPast ? "text-gray-900" : "text-gray-400"}`}>
                    {phase.split('. ')[1]}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
