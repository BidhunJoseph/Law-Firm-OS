'use client';

import React, { useState, useTransition } from 'react';
import { Archive, Search, FileText, CalendarClock, Shield, ArrowUpRight, Sparkles, FolderOpen, Loader2, X } from 'lucide-react';
import { format } from 'date-fns';
import { reopenCase } from '@/server/actions/case-actions';
import { useRouter } from 'next/navigation';

export function HistoryHubClient({ closedCases, currentUser }: { closedCases: any[], currentUser: any }) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMatter, setSelectedMatter] = useState<any | null>(null);
  const [isPending, startTransition] = useTransition();

  const filteredCases = closedCases.filter(c => 
    c.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.case_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.client?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleReopen = (caseId: string) => {
    startTransition(async () => {
      await reopenCase(caseId);
      setSelectedMatter(null);
      router.refresh();
    });
  };

  // AI Extraction Logic (Heuristic for UI representation)
  const generateAIVector = (matter: any) => {
    const phases = new Set(matter.tasks.map((t: any) => t.task_type));
    const courtEventsCount = matter.court_events?.length || 0;
    const completedTasks = matter.tasks.filter((t: any) => t.status === 'completed').length;
    
    return {
      complexity: courtEventsCount > 5 ? 'High' : courtEventsCount > 2 ? 'Medium' : 'Low',
      primaryPhase: Array.from(phases)[0] || 'General',
      totalPhases: phases.size,
      executionScore: completedTasks === matter.tasks.length ? '100% (Flawless)' : `${Math.round((completedTasks/matter.tasks.length)*100)}%`,
      precedenceSummary: `This ${matter.case_type} concluded after navigating ${phases.size} distinct phases and ${courtEventsCount} court events. This structural timeline serves as an AI reference vector for future ${matter.case_type} assignments.`
    };
  };

  return (
    <div className="flex h-full w-full flex-col relative bg-[#FBFBFD]">
      
      {/* Header */}
      <header className="sticky top-0 z-20 bg-[#FBFBFD]/80 backdrop-blur-xl border-b border-black/[0.04] px-8 sm:px-12 py-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-[#1D1D1F] flex items-center gap-3">
              <Archive className="w-8 h-8 text-[#1D1D1F]" /> Case History & Vectors
            </h1>
            <p className="mt-1 text-sm font-medium text-[#86868B]">Browse archived matters and utilize AI-extracted precedence logic.</p>
          </div>
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <input 
              type="text" 
              placeholder="Search historical records..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-black/5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#0066CC]/20 focus:border-[#0066CC] transition-all shadow-sm font-medium"
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto px-8 sm:px-12 py-8 custom-scrollbar relative">
        <div className="max-w-6xl mx-auto">
           {filteredCases.length === 0 ? (
             <div className="text-center py-20">
               <Archive className="w-12 h-12 text-[#86868B]/30 mx-auto mb-4" />
               <h3 className="text-lg font-bold text-[#1D1D1F]">No archived matters</h3>
               <p className="text-[#86868B] text-sm mt-1">Closed cases will appear here as AI precedence vectors.</p>
             </div>
           ) : (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {filteredCases.map(matter => (
                 <div 
                   key={matter.id}
                   onClick={() => setSelectedMatter(matter)}
                   className="bg-white rounded-3xl p-6 border border-black/[0.04] shadow-[0_4px_24px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.06)] transition-all cursor-pointer group hover:-translate-y-1"
                 >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1D1D1F]/5 text-[#1D1D1F]">
                         <FolderOpen className="w-5 h-5" />
                      </div>
                      <span className="text-[11px] font-bold text-[#86868B] bg-neutral-100 px-2.5 py-1 rounded-md uppercase tracking-wider">
                        {format(new Date(matter.updated_at), 'MMM yyyy')}
                      </span>
                    </div>
                    
                    <h3 className="text-[17px] font-bold text-[#1D1D1F] leading-tight mb-2 group-hover:text-[#0066CC] transition-colors line-clamp-2">
                      {matter.title}
                    </h3>
                    
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-[12px] font-bold text-[#0066CC] bg-[#0066CC]/10 px-2 py-0.5 rounded-md truncate">
                        {matter.case_code}
                      </span>
                      <span className="text-[13px] text-[#86868B] font-medium truncate">{matter.client?.name}</span>
                    </div>
                    
                    <div className="pt-4 border-t border-black/[0.04] flex items-center justify-between">
                       <div className="flex items-center gap-1.5 text-[12px] font-bold text-[#86868B]">
                          <Sparkles className="w-3.5 h-3.5 text-purple-500" /> Vector Synthesized
                       </div>
                       <ArrowUpRight className="w-4 h-4 text-neutral-400 group-hover:text-[#0066CC] transition-colors" />
                    </div>
                 </div>
               ))}
             </div>
           )}
        </div>
      </div>

      {/* Detail Slideover */}
      {selectedMatter && (
        <div className="fixed inset-0 z-50 flex justify-end bg-[#1D1D1F]/20 backdrop-blur-[4px] transition-opacity" onClick={() => setSelectedMatter(null)}>
           <div onClick={e => e.stopPropagation()} className="relative h-full w-[85vw] max-w-4xl bg-[#FBFBFD] shadow-2xl flex flex-col animate-in slide-in-from-right-full rounded-l-[40px] border-l border-white/50">
             
             <header className="sticky top-0 z-10 bg-white/70 backdrop-blur-xl px-10 py-8 border-b border-black/[0.04]">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-[#1D1D1F] leading-tight">{selectedMatter.title}</h2>
                    <p className="text-sm font-medium text-[#86868B] mt-1">{selectedMatter.case_code} • {selectedMatter.client?.name}</p>
                  </div>
                  <button onClick={() => setSelectedMatter(null)} className="p-2 hover:bg-black/5 rounded-full transition-colors">
                    <X className="w-5 h-5 text-[#1D1D1F]" />
                  </button>
                </div>
                
                <div className="mt-6 flex gap-3">
                  <button onClick={() => handleReopen(selectedMatter.id)} disabled={isPending} className="flex items-center justify-center gap-2 bg-[#1D1D1F] text-white px-5 py-2.5 rounded-xl text-[13px] font-bold shadow-sm hover:bg-black transition-all">
                    {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <FolderOpen className="w-4 h-4" />}
                    Re-open Case
                  </button>
                </div>
             </header>

             <div className="flex-1 overflow-y-auto p-10 custom-scrollbar space-y-10">
                
                {/* AI Vector Assistance Panel */}
                <div className="bg-gradient-to-br from-[#1D1D1F] to-[#2C2C2E] rounded-3xl p-8 shadow-xl text-white relative overflow-hidden">
                   <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
                   
                   <div className="flex items-center gap-2 text-purple-400 mb-4">
                     <Sparkles className="w-5 h-5" />
                     <h3 className="text-[13px] font-bold uppercase tracking-widest">AI Precedence Vector</h3>
                   </div>
                   
                   <p className="text-[15px] leading-relaxed text-neutral-300 font-medium max-w-2xl">
                     {generateAIVector(selectedMatter).precedenceSummary}
                   </p>
                   
                   <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8">
                     <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                       <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest mb-1">Complexity</p>
                       <p className="text-lg font-bold">{generateAIVector(selectedMatter).complexity}</p>
                     </div>
                     <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                       <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest mb-1">Phases Executed</p>
                       <p className="text-lg font-bold">{generateAIVector(selectedMatter).totalPhases}</p>
                     </div>
                     <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                       <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest mb-1">Court Events</p>
                       <p className="text-lg font-bold">{selectedMatter.court_events?.length || 0}</p>
                     </div>
                     <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                       <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest mb-1">Task Completion</p>
                       <p className="text-lg font-bold">{generateAIVector(selectedMatter).executionScore}</p>
                     </div>
                   </div>
                </div>

                {/* Audit Ledger */}
                <div>
                   <h3 className="text-xl font-bold tracking-tight text-[#1D1D1F] mb-6">Complete Audit Ledger</h3>
                   <div className="space-y-6">
                     {selectedMatter.timeline_events?.map((event: any) => (
                       <div key={event.id} className="flex gap-4">
                          <div className="w-24 pt-1 text-right shrink-0">
                             <p className="text-[12px] font-bold text-[#86868B]">{format(new Date(event.created_at), 'MMM d, yyyy')}</p>
                             <p className="text-[10px] font-bold text-neutral-400">{format(new Date(event.created_at), 'h:mm a')}</p>
                          </div>
                          <div className="relative pb-6">
                             <div className="absolute left-[-1rem] top-2 bottom-0 w-px bg-black/[0.05]" />
                             <div className="absolute left-[-1.25rem] top-2 w-2 h-2 rounded-full bg-neutral-300 border-2 border-[#FBFBFD]" />
                             <div className="bg-white rounded-2xl p-5 shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-black/[0.03]">
                                <p className="text-[15px] font-bold text-[#1D1D1F] leading-tight">{event.title}</p>
                                {event.description && <p className="text-[13px] text-[#86868B] font-medium mt-1.5">{event.description}</p>}
                             </div>
                          </div>
                       </div>
                     ))}
                   </div>
                </div>

             </div>
           </div>
        </div>
      )}

    </div>
  );
}
