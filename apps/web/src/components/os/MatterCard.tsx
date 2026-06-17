'use client';

import React from 'react';

// Shared Phase Mapping
export const LEGAL_PHASES = [
  { id: 1, title: "Intake & Triage" },
  { id: 2, title: "Onboarding, KYC & Retainer" },
  { id: 3, title: "Investigation & Document Gathering" },
  { id: 4, title: "Strategy & Drafting" },
  { id: 5, title: "Internal Review & Client Approval" },
  { id: 6, title: "Filing & Service of Process" },
  { id: 7, title: "Discovery & Pre-Trial" },
  { id: 8, title: "Hearing & Trial Execution" },
  { id: 9, title: "Judgment & Post-Trial" },
  { id: 10, title: "Execution, Settlement & Closure" }
];

export function MatterCard({ matter, onClick }: { matter: any, onClick: () => void }) {
  const phaseMatch = matter.current_phase?.match(/^(\d+)/);
  const phaseIndex = phaseMatch ? parseInt(phaseMatch[1], 10) - 1 : 0;
  const currentPhase = LEGAL_PHASES[Math.max(0, Math.min(phaseIndex, 9))];

  return (
    <div 
      onClick={onClick}
      className={`group relative w-full cursor-pointer rounded-[24px] bg-white/60 p-6 backdrop-blur-2xl transition-all duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)] hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(0,0,0,0.04),0_20px_60px_rgba(0,0,0,0.06)] ${matter.isUrgent ? 'border border-red-500/30 shadow-[0_4px_24px_rgba(239,68,68,0.15)]' : 'border border-white/50 shadow-[0_2px_10px_rgba(0,0,0,0.02),0_8px_32px_rgba(0,0,0,0.04)]'}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-1 pr-4">
          <div className="flex items-center gap-2">
            <p className="text-[11px] font-bold text-[#86868B] uppercase tracking-widest">{matter.client?.name || 'Unknown Client'}</p>
            {matter.isUrgent && <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-[10px] font-bold uppercase tracking-wider animate-pulse">Urgent</span>}
          </div>
          <h3 className="text-[22px] font-semibold tracking-tight text-[#1D1D1F] leading-tight line-clamp-2">{matter.title}</h3>
        </div>
        <div className={`relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full shadow-inner border ${matter.isUrgent ? 'bg-red-50/50 border-red-500/10' : 'bg-[#FBFBFD] border-black/[0.03]'}`}>
          <span className={`text-sm font-bold ${matter.isUrgent ? 'text-red-600' : 'text-[#0066CC]'}`}>P{currentPhase.id}</span>
        </div>
      </div>
      
      <div className="mt-8 flex items-center justify-between">
        <div className="flex -space-x-3">
          {matter.assignments?.slice(0, 3).map((a: any) => (
             <div key={a.id} className="h-8 w-8 rounded-full border-2 border-white bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-700 shadow-sm" title={a.user?.full_name}>
                {a.user?.full_name?.charAt(0) || a.user?.email?.charAt(0)}
             </div>
          ))}
          {matter.assignments?.length > 3 && (
             <div className="h-8 w-8 rounded-full border-2 border-white bg-neutral-100 flex items-center justify-center text-[10px] font-bold text-neutral-600 shadow-sm">
                +{matter.assignments.length - 3}
             </div>
          )}
          {(!matter.assignments || matter.assignments.length === 0) && (
             <span className="text-xs text-neutral-400 italic">Unassigned</span>
          )}
        </div>
        <span className="text-xs font-medium text-[#86868B]">
           {matter.tasks?.filter((t:any) => t.status !== 'completed').length || 0} tasks pending
        </span>
      </div>
    </div>
  );
}
