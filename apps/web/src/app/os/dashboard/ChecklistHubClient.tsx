'use client';

import React, { useState } from 'react';
import { Search, Shield, Plus, AlertCircle } from 'lucide-react';
import { MatterCard } from '@/components/os/MatterCard';
import { DeepMatterSlideOver } from '@/components/os/DeepMatterSlideOver';
import { NewMatterSlideOver } from '@/components/os/NewMatterSlideOver';
import { useSearchParams, useRouter } from 'next/navigation';

export function ChecklistHubClient({ initialCases, firmUsers, firmClients, currentUser }: { initialCases: any[], firmUsers: any[], firmClients: any[], currentUser: any }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMatter, setSelectedMatter] = useState<any | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();

  React.useEffect(() => {
    const targetId = searchParams.get('caseId') || selectedMatter?.id;
    if (targetId) {
      const found = initialCases.find(c => c.id === targetId);
      if (found && found !== selectedMatter) {
        setSelectedMatter(found);
      }
    }
  }, [searchParams, initialCases, selectedMatter?.id]);

  const handleCloseSlideOver = () => {
    setSelectedMatter(null);
    if (searchParams.has('caseId')) {
      router.replace('/os/dashboard');
    }
  };

  // 1. Algorithmic Prioritization (Urgency Engine)
  const prioritizedCases = React.useMemo(() => {
    return [...initialCases].map(matter => {
      let score = 0;
      const now = new Date();
      const threeDaysFromNow = new Date();
      threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
      
      // +30 for Red Risk, +10 for Amber Risk
      if (matter.risk_level === 'red') score += 30;
      if (matter.risk_level === 'amber') score += 10;

      // +50 if there are tasks due within 72 hours (urgent or overdue)
      const hasUrgentTasks = matter.tasks?.some((t: any) => t.status !== 'completed' && t.due_at && new Date(t.due_at) <= threeDaysFromNow);
      if (hasUrgentTasks) score += 50;

      // +50 if there is a court event in the next 3 days
      const hasImminentCourtEvent = matter.court_events?.some((ce: any) => ce.event_at && new Date(ce.event_at) > now && new Date(ce.event_at) <= threeDaysFromNow);
      if (hasImminentCourtEvent) score += 50;

      return { ...matter, urgencyScore: score, isUrgent: score >= 50 };
    }).sort((a, b) => b.urgencyScore - a.urgencyScore);
  }, [initialCases]);

  const filteredCases = prioritizedCases.filter(c => 
    c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.client?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // 2. Universal Critical Actions Aggregation
  const criticalItems = React.useMemo(() => {
    const urgentTasks: any[] = [];
    const imminentEvents: any[] = [];
    const now = new Date();
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

    initialCases.forEach(matter => {
      // Urgent Tasks (Overdue or due within next 72 hours)
      matter.tasks?.forEach((t: any) => {
        if (t.status !== 'completed' && t.due_at && new Date(t.due_at) <= threeDaysFromNow) {
          urgentTasks.push({ ...t, matterId: matter.id, matterTitle: matter.title, matterCode: matter.case_code });
        }
      });
      // Imminent Court Events
      matter.court_events?.forEach((ce: any) => {
        if (ce.event_at && new Date(ce.event_at) > now && new Date(ce.event_at) <= threeDaysFromNow) {
          imminentEvents.push({ ...ce, matterId: matter.id, matterTitle: matter.title, matterCode: matter.case_code });
        }
      });
    });

    // Sort chronologically
    urgentTasks.sort((a, b) => new Date(a.due_at).getTime() - new Date(b.due_at).getTime());
    imminentEvents.sort((a, b) => new Date(a.event_at).getTime() - new Date(b.event_at).getTime());

    return { urgentTasks, imminentEvents };
  }, [initialCases]);

  return (
    <>
      <div className={`flex-1 overflow-y-auto custom-scrollbar transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${(selectedMatter || isCreating) ? 'scale-[0.98] opacity-60 pointer-events-none blur-[1px]' : ''}`}>
        
        {/* OS Header */}
        <div className="px-8 sm:px-12 lg:px-16 pt-16 pb-12 max-w-[1800px] mx-auto">
          <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
            <div>
              <h1 className="text-4xl md:text-5xl text-[#1D1D1F] font-semibold tracking-tight">Manager Command Center</h1>
              <p className="text-[#86868B] mt-3 font-medium text-[15px] leading-snug">
                Omnipotent overview of {initialCases.length} active matters. Strict logging enforced.
              </p>
            </div>
            
            <div className="flex items-center gap-4 w-full lg:w-auto">
              <div className="relative w-full lg:w-[320px] group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#86868B] group-focus-within:text-[#0066CC] transition-colors" />
                <input
                  type="text"
                  placeholder="Search matters, clients..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 text-[15px] font-medium text-[#1D1D1F] bg-white border border-black/[0.04] rounded-[18px] focus:outline-none focus:ring-4 focus:ring-[#0066CC]/10 focus:border-[#0066CC] transition-all placeholder:text-[#86868B] shadow-sm"
                />
              </div>
              
              <button 
                onClick={() => setIsCreating(true)}
                className="shrink-0 flex items-center gap-2 bg-[#1D1D1F] hover:bg-black text-white px-6 py-3.5 rounded-[18px] text-[15px] font-semibold transition-all shadow-[0_4px_14px_rgba(0,0,0,0.1)] active:scale-95"
              >
                <Plus className="w-5 h-5" />
                New Matter
              </button>
            </div>
          </header>
        </div>

        {/* Grid Canvas */}
        <div className="px-8 sm:px-12 lg:px-16 pb-24 max-w-[1800px] mx-auto flex flex-col xl:flex-row items-start gap-8">
          
          {/* Main Grid */}
          <div className="flex-1 w-full min-w-0">
            {filteredCases.length === 0 ? (
              <div className="py-32 text-center flex flex-col items-center border border-dashed border-black/10 rounded-[32px] bg-black/[0.01]">
                <div className="w-20 h-20 bg-white shadow-[0_8px_32px_rgba(0,0,0,0.04)] rounded-full flex items-center justify-center mb-6">
                  <Shield className="w-8 h-8 text-[#86868B]" />
                </div>
                <h3 className="text-[#1D1D1F] font-semibold text-xl tracking-tight">No Active Matters Found</h3>
                <p className="text-[#86868B] font-medium mt-2">Create a new matter to initialize the Execution Hub.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-6 items-start">
                {filteredCases.map(matter => (
                  <MatterCard key={matter.id} matter={matter} onClick={() => setSelectedMatter(matter)} />
                ))}
              </div>
            )}
          </div>

          {/* Right Sidebar: Critical Actions Board */}
          <div className="w-full xl:w-[400px] shrink-0 flex flex-col gap-6 sticky top-8">
            {/* Imminent Timelines Panel */}
            <div className="bg-gradient-to-b from-red-50 to-white border border-red-500/20 rounded-3xl p-6 shadow-[0_8px_32px_rgba(255,59,48,0.06)]">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center text-red-600">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-red-900 leading-tight">Critical Actions</h3>
                  <p className="text-[12px] font-bold text-red-700/80 uppercase tracking-wider">Requires Immediate Attention</p>
                </div>
              </div>

              <div className="space-y-6">
                {/* Court Events Section */}
                <div>
                  <h4 className="text-[11px] font-bold text-red-800 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                    Court Events (Next 72h)
                  </h4>
                  {criticalItems.imminentEvents.length > 0 ? (
                    <div className="space-y-3">
                      {criticalItems.imminentEvents.map(ce => (
                        <div 
                          key={`imminent-${ce.id}`} 
                          onClick={() => {
                            const found = initialCases.find(c => c.id === ce.matterId);
                            if (found) setSelectedMatter(found);
                          }}
                          className="bg-white p-4 rounded-2xl border border-red-100 shadow-sm cursor-pointer hover:border-red-300 hover:shadow-md transition-all group"
                        >
                          <div className="flex justify-between items-start mb-1.5">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#0066CC] bg-[#0066CC]/10 px-2 py-0.5 rounded-md">{ce.matterCode}</span>
                            <span className="text-[11px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-md">
                              {new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(new Date(ce.event_at))}
                            </span>
                          </div>
                          <p className="text-[13px] font-bold text-[#1D1D1F] line-clamp-1 group-hover:text-[#0066CC] transition-colors">{ce.matterTitle}</p>
                          <p className="text-[12px] text-red-700/90 font-medium mt-1 leading-snug">{ce.event_type} at {ce.court_name}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-white/50 border border-black/5 rounded-2xl p-4 text-center">
                      <p className="text-[12px] font-bold text-neutral-400">No imminent hearings.</p>
                    </div>
                  )}
                </div>

                {/* Urgent Tasks Section */}
                <div>
                  <h4 className="text-[11px] font-bold text-red-800 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse"></span>
                    Urgent Tasks (Next 72h)
                  </h4>
                  {criticalItems.urgentTasks.length > 0 ? (
                    <div className="space-y-3">
                      {criticalItems.urgentTasks.map(t => {
                        const isOverdue = new Date(t.due_at) < new Date();
                        return (
                        <div 
                          key={`urgent-${t.id}`}
                          onClick={() => {
                            const found = initialCases.find(c => c.id === t.matterId);
                            if (found) setSelectedMatter(found);
                          }}
                          className={`bg-white p-4 rounded-2xl border shadow-sm cursor-pointer transition-all group ${isOverdue ? 'border-red-200/50 hover:border-red-300 hover:shadow-md' : 'border-orange-200/50 hover:border-orange-300 hover:shadow-md'}`}
                        >
                          <div className="flex justify-between items-start mb-1.5">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#0066CC] bg-[#0066CC]/10 px-2 py-0.5 rounded-md">{t.matterCode}</span>
                            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${isOverdue ? 'text-red-600 bg-red-50' : 'text-orange-600 bg-orange-50'}`}>
                              {isOverdue ? 'OVERDUE' : new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(new Date(t.due_at))}
                            </span>
                          </div>
                          <p className="text-[13px] font-bold text-[#1D1D1F] line-clamp-1 group-hover:text-[#0066CC] transition-colors">{t.matterTitle}</p>
                          <p className={`text-[12px] font-medium mt-1 leading-snug line-clamp-2 ${isOverdue ? 'text-red-700/80' : 'text-[#86868B]'}`}>{t.title}</p>
                        </div>
                      )})}
                    </div>
                  ) : (
                    <div className="bg-white/50 border border-black/5 rounded-2xl p-4 text-center">
                      <p className="text-[12px] font-bold text-neutral-400">All timelines are intact.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Slide-Over Overlays - Extracted out of the blurred container */}
      {selectedMatter && (
        <DeepMatterSlideOver matter={selectedMatter} onClose={handleCloseSlideOver} firmUsers={firmUsers} />
      )}
      {isCreating && (
        <NewMatterSlideOver onClose={() => setIsCreating(false)} firmUsers={firmUsers} firmClients={firmClients} />
      )}
    </>
  );
}
