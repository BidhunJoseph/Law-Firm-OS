'use client';

import React from 'react';
import { X, FolderOpen, ArrowUpRight, ShieldCheck, Mail, Phone, Briefcase } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function ClientSlideOver({ client, onClose }: { client: any, onClose: () => void }) {
  const router = useRouter();

  const activeCases = client.cases?.filter((c: any) => c.current_status !== 'closed') || [];
  const closedCases = client.cases?.filter((c: any) => c.current_status === 'closed') || [];

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
                   {client.name?.charAt(0) || client.email.charAt(0)}
                </div>
                <div>
                   <h2 className="text-2xl font-bold text-[#1D1D1F] leading-tight">{client.name}</h2>
                   <div className="flex items-center gap-3 mt-1.5 text-[12px] font-bold text-[#86868B]">
                      <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> {client.email}</span>
                      {client.phone && <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> {client.phone}</span>}
                   </div>
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
                 <p className="text-[11px] font-bold text-[#86868B] uppercase tracking-widest mb-2 flex items-center gap-1.5"><Briefcase className="w-3.5 h-3.5" /> Active Matters</p>
                 <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-[#1D1D1F]">{activeCases.length}</span>
                    <span className="text-sm font-medium text-[#86868B]">Cases</span>
                 </div>
              </div>
              <div className="bg-[#0066CC]/5 rounded-3xl p-6 shadow-sm border border-[#0066CC]/10">
                 <p className="text-[11px] font-bold text-[#0066CC] uppercase tracking-widest mb-2 flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5" /> Portal Status</p>
                 <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-[#0066CC]">{client.is_active ? 'Active' : 'Pending'}</span>
                 </div>
                 <p className="text-[11px] font-medium text-[#0066CC]/70 mt-1">{client.is_active ? 'Client has logged in' : 'Waiting for client to login'}</p>
              </div>
           </div>

           <h3 className="text-lg font-bold text-[#1D1D1F] mb-4">Active Matters</h3>
           {activeCases.length === 0 ? (
             <div className="bg-white border border-black/[0.04] rounded-2xl p-8 text-center mb-8">
                <FolderOpen className="w-8 h-8 text-[#86868B]/50 mx-auto mb-3" />
                <p className="text-[#86868B] font-medium text-sm">No active matters for this client.</p>
             </div>
           ) : (
             <div className="space-y-4 mb-8">
               {activeCases.map((c: any) => (
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

           {closedCases.length > 0 && (
             <>
               <h3 className="text-lg font-bold text-[#1D1D1F] mb-4">Archived History</h3>
               <div className="space-y-4 opacity-70">
                 {closedCases.map((c: any) => (
                   <div 
                     key={c.id} 
                     className="bg-white/50 border border-black/[0.04] p-5 rounded-2xl flex items-center justify-between"
                   >
                      <div>
                         <h4 className="font-bold text-[#1D1D1F]">{c.title}</h4>
                         <p className="text-xs font-medium text-[#86868B] mt-1.5">Closed & Archived</p>
                      </div>
                   </div>
                 ))}
               </div>
             </>
           )}

        </div>
      </div>
    </div>
  );
}
