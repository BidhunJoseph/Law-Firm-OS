'use client';

import React, { useState, useTransition } from 'react';
import { Calendar as CalendarIcon, MapPin, Plus, CheckCircle2 } from 'lucide-react';
import { addCourtEvent } from '@/server/actions/court-actions';
import { useRouter } from 'next/navigation';

export function CourtCalendarClient({ events, cases }: { events: any[], cases: any[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isAdding, setIsAdding] = useState(false);
  
  const [formData, setFormData] = useState({
    case_id: '',
    event_type: 'Hearing',
    court_name: '',
    event_at: '',
    internal_notes: ''
  });

  const handleChange = (e: any) => setFormData(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async () => {
    startTransition(async () => {
      const result = await addCourtEvent(formData);
      if (result.success) {
        setIsAdding(false);
        setFormData({ case_id: '', event_type: 'Hearing', court_name: '', event_at: '', internal_notes: '' });
        router.refresh();
      } else {
        alert(result.error);
      }
    });
  };

  const upcomingEvents = events.filter(e => new Date(e.event_at) >= new Date());
  const pastEvents = events.filter(e => new Date(e.event_at) < new Date()).reverse();

  return (
    <div className="flex-1 flex flex-col h-full bg-[#FBFBFD]">
      <header className="shrink-0 px-8 sm:px-12 lg:px-16 pt-16 pb-8 border-b border-black/[0.04] flex items-end justify-between bg-white/30 backdrop-blur-md sticky top-0 z-10">
        <div>
          <h1 className="text-4xl md:text-5xl text-[#1D1D1F] font-semibold tracking-tight">Court Calendar</h1>
          <p className="text-[#86868B] mt-3 font-medium text-[15px] leading-snug">
            {upcomingEvents.length} upcoming hearings. Imminent events auto-prioritize matters in the Hub.
          </p>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="shrink-0 flex items-center gap-2 bg-[#1D1D1F] hover:bg-black text-white px-6 py-3.5 rounded-[18px] text-[15px] font-semibold transition-all shadow-[0_4px_14px_rgba(0,0,0,0.1)] active:scale-95"
        >
          {isAdding ? <CheckCircle2 className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
          {isAdding ? 'Cancel' : 'Log Hearing'}
        </button>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Pane: Event Feed */}
        <div className={`flex-1 overflow-y-auto custom-scrollbar p-8 sm:p-12 lg:p-16 transition-all duration-500 ${isAdding ? 'w-2/3 max-w-4xl opacity-50 blur-[1px] pointer-events-none' : 'w-full max-w-[1400px] mx-auto'}`}>
           <h3 className="text-lg font-bold text-[#1D1D1F] mb-6">Upcoming</h3>
           <div className="space-y-4">
             {upcomingEvents.map(event => {
                const date = new Date(event.event_at);
                const isVerySoon = date <= new Date(new Date().setDate(new Date().getDate() + 3));
                return (
                  <div key={event.id} className={`group flex items-start gap-6 bg-white p-6 rounded-[24px] shadow-[0_2px_10px_rgba(0,0,0,0.02)] border ${isVerySoon ? 'border-red-500/20 shadow-[0_4px_24px_rgba(239,68,68,0.05)]' : 'border-black/[0.04]'} transition-all hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)]`}>
                     <div className={`flex flex-col items-center justify-center w-16 h-16 rounded-[16px] shrink-0 border ${isVerySoon ? 'bg-red-50 border-red-500/10 text-red-600' : 'bg-[#FBFBFD] border-black/[0.04] text-[#1D1D1F]'}`}>
                        <span className="text-[10px] font-bold uppercase tracking-wider">{date.toLocaleString('default', { month: 'short' })}</span>
                        <span className="text-xl font-bold">{date.getDate()}</span>
                     </div>
                     <div className="flex-1">
                        <div className="flex justify-between items-start">
                           <h4 className="text-lg font-bold text-[#1D1D1F]">{event.case?.title}</h4>
                           {isVerySoon && <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-[10px] font-bold uppercase tracking-wider">Imminent</span>}
                        </div>
                        <p className="text-[13px] font-bold text-[#86868B] uppercase tracking-wider mt-1">{event.event_type} • {date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                        <div className="flex items-center gap-2 mt-4 text-[#86868B]">
                           <MapPin className="w-4 h-4" />
                           <span className="text-[14px] font-medium">{event.court_name || 'Unspecified Location'}</span>
                        </div>
                        {event.internal_notes && <p className="text-[14px] text-neutral-500 mt-3 p-3 bg-neutral-50 rounded-xl border border-neutral-100">{event.internal_notes}</p>}
                     </div>
                  </div>
                )
             })}
             {upcomingEvents.length === 0 && <p className="text-[#86868B] text-sm font-medium">No upcoming hearings scheduled.</p>}
           </div>

           <h3 className="text-lg font-bold text-[#86868B] mb-6 mt-16">Past Events</h3>
           <div className="space-y-4 opacity-70">
             {pastEvents.map(event => {
                const date = new Date(event.event_at);
                return (
                  <div key={event.id} className="flex items-start gap-6 bg-white/60 p-5 rounded-[20px] border border-black/[0.03]">
                     <div className="flex flex-col items-center justify-center w-12 h-12 rounded-[12px] shrink-0 bg-neutral-100 text-neutral-500">
                        <span className="text-[9px] font-bold uppercase tracking-wider">{date.toLocaleString('default', { month: 'short' })}</span>
                        <span className="text-lg font-bold">{date.getDate()}</span>
                     </div>
                     <div className="flex-1">
                        <h4 className="text-[15px] font-bold text-[#1D1D1F]">{event.case?.title}</h4>
                        <p className="text-[12px] font-medium text-[#86868B] mt-0.5">{event.event_type} at {event.court_name}</p>
                     </div>
                  </div>
                )
             })}
           </div>
        </div>

        {/* Right Pane: Slide-Over Form */}
        <div className={`w-1/3 bg-white border-l border-black/[0.04] shadow-2xl transition-transform duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)] ${isAdding ? 'translate-x-0' : 'translate-x-[110%] absolute right-0 bottom-0 top-[180px]'}`}>
           <div className="h-full overflow-y-auto p-8 custom-scrollbar">
              <h3 className="text-xl font-bold tracking-tight text-[#1D1D1F] mb-6">Log New Event</h3>
              
              <div className="space-y-5">
                 <div>
                   <label className="block text-[13px] font-semibold text-[#86868B] mb-1.5 uppercase tracking-wider">Matter</label>
                   <select name="case_id" value={formData.case_id} onChange={handleChange} className="w-full px-4 py-3 bg-[#FBFBFD] border border-black/[0.04] rounded-xl focus:ring-2 focus:ring-[#0066CC]/20 outline-none text-[15px] font-medium">
                     <option value="">Select a matter...</option>
                     {cases.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                   </select>
                 </div>
                 
                 <div>
                   <label className="block text-[13px] font-semibold text-[#86868B] mb-1.5 uppercase tracking-wider">Event Type</label>
                   <select name="event_type" value={formData.event_type} onChange={handleChange} className="w-full px-4 py-3 bg-[#FBFBFD] border border-black/[0.04] rounded-xl focus:ring-2 focus:ring-[#0066CC]/20 outline-none text-[15px] font-medium">
                     <option>Hearing</option>
                     <option>Trial</option>
                     <option>Mediation</option>
                     <option>Deposition</option>
                     <option>Filing Deadline</option>
                   </select>
                 </div>

                 <div>
                   <label className="block text-[13px] font-semibold text-[#86868B] mb-1.5 uppercase tracking-wider">Court Name & Location</label>
                   <input type="text" name="court_name" value={formData.court_name} onChange={handleChange} placeholder="e.g. Dubai Courts, First Instance" className="w-full px-4 py-3 bg-[#FBFBFD] border border-black/[0.04] rounded-xl focus:ring-2 focus:ring-[#0066CC]/20 outline-none text-[15px] font-medium" />
                 </div>

                 <div>
                   <label className="block text-[13px] font-semibold text-[#86868B] mb-1.5 uppercase tracking-wider">Date & Time</label>
                   <input type="datetime-local" name="event_at" value={formData.event_at} onChange={handleChange} className="w-full px-4 py-3 bg-[#FBFBFD] border border-black/[0.04] rounded-xl focus:ring-2 focus:ring-[#0066CC]/20 outline-none text-[15px] font-medium" />
                 </div>

                 <div>
                   <label className="block text-[13px] font-semibold text-[#86868B] mb-1.5 uppercase tracking-wider">Internal Notes</label>
                   <textarea name="internal_notes" value={formData.internal_notes} onChange={handleChange} rows={4} placeholder="Required documents, representation details..." className="w-full px-4 py-3 bg-[#FBFBFD] border border-black/[0.04] rounded-xl focus:ring-2 focus:ring-[#0066CC]/20 outline-none text-[15px] font-medium custom-scrollbar" />
                 </div>
              </div>

              <div className="mt-8 pt-6 border-t border-black/[0.04]">
                 <button 
                   onClick={handleSubmit}
                   disabled={isPending || !formData.case_id || !formData.event_at}
                   className="w-full bg-[#0066CC] text-white px-6 py-3.5 rounded-xl text-[15px] font-bold shadow-md hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-50 flex justify-center items-center gap-2"
                 >
                   {isPending ? 'Logging Event...' : <><CalendarIcon className="w-5 h-5" /> Confirm Event</>}
                 </button>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
