'use client';

import React from 'react';
import { X, FolderOpen, AlertCircle, ArrowUpRight, User } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function TeamMemberSlideOver({ user, onClose }: { user: any, onClose: () => void }) {
  const router = useRouter();

  // Deduplicate cases from assignments
  const assignedCasesMap = new Map();
  user.case_assignments?.forEach((a: any) => {
    if (a.case && a.case.current_status !== 'closed') {
      assignedCasesMap.set(a.case.id, a.case);
    }
  });
  const assignedCases = Array.from(assignedCasesMap.values());

  const handleOpenCase = (caseId: string) => {
    onClose();
    router.push(`/os/dashboard?caseId=${caseId}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-[#1D1D1F]/20 backdrop-blur-[4px] transition-opacity" onClick={onClose}>
      <div onClick={e => e.stopPropagation()} className="relative h-full w-[85vw] max-w-2xl bg-[#FBFBFD] shadow-2xl flex flex-col animate-in slide-in-from-right-full rounded-l-[40px] border-l border-white/50">
        
        <header className="sticky top-0 z-10 bg-white/70 backdrop-blur-xl px-10 py-8 border-b border-black/[0.04]">
           <div className="flex items-start justify-between">
             <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full flex items-center justify-center font-bold text-2xl shadow-inner border bg-[#FBFBFD] border-black/[0.05] text-[#1D1D1F]">
                   {user.full_name?.charAt(0) || user.email.charAt(0)}
                </div>
                <div>
                   <h2 className="text-2xl font-bold text-[#1D1D1F] leading-tight">{user.full_name || 'Unnamed User'}</h2>
                   <p className="text-[12px] font-bold text-[#0066CC] uppercase tracking-widest mt-1">{user.role.replace('_', ' ')}</p>
                </div>
             </div>
             <button onClick={onClose} className="p-2 hover:bg-black/5 rounded-full transition-colors">
               <X className="w-5 h-5 text-[#1D1D1F]" />
             </button>
           </div>
        </header>

        <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
           
           <div className="grid grid-cols-2 gap-4 mb-10">
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-black/[0.04]">
                 <p className="text-[11px] font-bold text-[#86868B] uppercase tracking-widest mb-2">Active Workload</p>
                 <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-[#1D1D1F]">{assignedCases.length}</span>
                    <span className="text-sm font-medium text-[#86868B]">Cases</span>
                 </div>
              </div>
              <div className="bg-red-50/50 rounded-3xl p-6 shadow-sm border border-red-500/10">
                 <p className="text-[11px] font-bold text-red-700 uppercase tracking-widest mb-2">Pending Tasks</p>
                 <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-red-600">{user.tasks_assigned_to?.length || 0}</span>
                    <span className="text-sm font-medium text-red-700/80">Tasks</span>
                 </div>
              </div>
           </div>

           <h3 className="text-lg font-bold text-[#1D1D1F] mb-4">Assigned Matters</h3>
           {assignedCases.length === 0 ? (
             <div className="bg-white border border-black/[0.04] rounded-2xl p-8 text-center">
                <FolderOpen className="w-8 h-8 text-[#86868B]/50 mx-auto mb-3" />
                <p className="text-[#86868B] font-medium text-sm">No active cases assigned.</p>
             </div>
           ) : (
             <div className="space-y-4">
               {assignedCases.map(c => (
                 <div 
                   key={c.id} 
                   onClick={() => handleOpenCase(c.id)}
                   className="group bg-white border border-black/[0.04] p-5 rounded-2xl flex items-center justify-between cursor-pointer hover:shadow-md transition-all hover:border-[#0066CC]/20"
                 >
                    <div>
                       <h4 className="font-bold text-[#1D1D1F] group-hover:text-[#0066CC] transition-colors">{c.title}</h4>
                       <div className="flex items-center gap-2 mt-1.5">
                          <span className={`w-2 h-2 rounded-full ${c.risk_level === 'red' ? 'bg-red-500' : c.risk_level === 'amber' ? 'bg-amber-500' : 'bg-green-500'}`} />
                          <span className="text-xs font-medium text-[#86868B]">{c.current_phase || 'Active'}</span>
                       </div>
                    </div>
                    <ArrowUpRight className="w-5 h-5 text-neutral-300 group-hover:text-[#0066CC]" />
                 </div>
               ))}
             </div>
           )}

        </div>
      </div>
    </div>
  );
}
