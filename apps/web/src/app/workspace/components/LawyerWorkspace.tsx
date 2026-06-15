"use client";

import React, { useState } from "react";
import { CheckCircle2, Clock, Calendar, Briefcase, FileText, MoreHorizontal, ShieldAlert, Circle, UserCheck, ArrowRight } from "lucide-react";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import KYCModal from "../KYCModal";

export default function LawyerWorkspace({ tasks, cases, userId }: { tasks: any[], cases: any[], userId: string }) {
  const router = useRouter();
  
  const [isKYCModalOpen, setIsKYCModalOpen] = useState(false);
  const [selectedTaskObj, setSelectedTaskObj] = useState<any>(null);

  const pendingTasks = tasks.filter(t => t.status !== 'completed');
  const myCases = cases.filter(c => c.lawyer_id === userId);
  const upcomingHearings = myCases.flatMap(c => c.court_events || []).sort((a: any, b: any) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime());

  return (
    <div className="min-h-full bg-gradient-to-br from-[#f8f9fa] to-slate-50 p-6 md:p-10 font-sans space-y-8 animate-in fade-in duration-700">
      
      {/* Focus Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Focus Mode</h1>
          <p className="text-slate-500 mt-1.5 font-medium">Your assigned matters and urgent tasks.</p>
        </div>
      </header>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <OverviewCard icon={<Briefcase />} label="My Active Matters" value={myCases.length} />
        <OverviewCard icon={<CheckCircle2 />} label="Pending Tasks" value={pendingTasks.length} />
        <OverviewCard icon={<Calendar />} label="Upcoming Hearings" value={upcomingHearings.length} />
      </div>

      {/* Active Matters Quick Access */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-widest flex items-center gap-2 px-1">
          <Briefcase className="w-4 h-4 text-blue-500" /> Active Matters
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {myCases.map(c => (
            <div 
              key={c.id} 
              onClick={() => router.push(`/workspace/cases/${c.id}`)}
              className="group bg-white/80 backdrop-blur-xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-lg hover:border-blue-200 transition-all cursor-pointer rounded-3xl p-5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${c.risk_level === 'high' ? 'bg-rose-100 text-rose-700' : c.risk_level === 'medium' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>
                    {c.risk_level || 'Normal'} Risk
                  </span>
                  <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">
                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500" />
                  </div>
                </div>
                <h3 className="font-bold text-slate-900 line-clamp-2 leading-tight">{c.title}</h3>
                <p className="text-xs text-slate-500 mt-1">{c.client?.name}</p>
              </div>
              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-500">{c.current_phase?.split('. ')[1] || c.status}</span>
                <span className="text-blue-600">{c.tasks?.filter((t:any) => t.status !== 'completed').length || 0} tasks</span>
              </div>
            </div>
          ))}
          {myCases.length === 0 && (
            <div className="col-span-full py-8 text-center text-slate-500">
              No active matters assigned.
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column - My Tasks */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white/80 backdrop-blur-xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl overflow-hidden flex flex-col h-full min-h-[400px]">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-blue-500" /> Action Required
              </h2>
            </div>
            <div className="p-4 flex-1 overflow-y-auto space-y-2">
              {pendingTasks.length > 0 ? pendingTasks.map(task => {
                const isOverdue = new Date(task.due_date) < new Date();
                return (
                  <div 
                    key={task.id}
                    onClick={() => {
                      if (task.title === "Collect KYC" && task.status !== "completed") {
                        setSelectedTaskObj(task);
                        setIsKYCModalOpen(true);
                      }
                    }}
                    className={`group flex items-start gap-4 p-4 rounded-2xl border transition-all duration-300 hover:shadow-md cursor-pointer ${isOverdue ? 'bg-rose-50/30 border-rose-100 hover:bg-rose-50/50' : 'bg-slate-50 border-slate-100 hover:bg-blue-50/50 hover:border-blue-200'}`}
                  >
                    <button className="mt-0.5 shrink-0 group-hover:scale-110 transition-transform">
                      <Circle className={`w-5 h-5 ${isOverdue ? 'text-rose-400' : 'text-slate-300 group-hover:text-blue-500'}`} />
                    </button>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className={`font-semibold truncate ${isOverdue ? 'text-rose-900' : 'text-slate-900'}`}>{task.title}</span>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${isOverdue ? 'bg-rose-100 text-rose-700' : 'bg-slate-200 text-slate-700'}`}>
                          {format(new Date(task.due_date), "MMM dd")}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-slate-500">
                        <span className="truncate flex items-center gap-1.5"><Briefcase className="w-3.5 h-3.5" /> {task.case?.title || "No Case"}</span>
                        {task.title === "Collect KYC" && (
                          <span className="flex items-center gap-1.5 text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full text-xs font-medium"><UserCheck className="w-3.5 h-3.5" /> Interactive Modal</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              }) : (
                <div className="flex flex-col items-center justify-center h-full text-slate-500">
                  <CheckCircle2 className="w-12 h-12 text-slate-200 mb-3" />
                  <p className="font-medium text-slate-900">Inbox Zero!</p>
                  <p className="text-sm">You have no pending tasks.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Upcoming Hearings */}
        <div className="space-y-6">
          <div className="bg-white/80 backdrop-blur-xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-purple-500" /> Upcoming Hearings
            </h2>
            <div className="space-y-4">
              {upcomingHearings.slice(0, 5).map(event => (
                <div key={event.id} className="flex gap-4 group">
                  <div className="w-12 pt-1 text-center">
                    <p className="text-xs font-bold text-purple-600 uppercase">{format(new Date(event.event_date), 'MMM')}</p>
                    <p className="text-lg font-black text-slate-900">{format(new Date(event.event_date), 'dd')}</p>
                  </div>
                  <div className="flex-1 bg-slate-50 group-hover:bg-purple-50 rounded-2xl p-4 border border-slate-100 group-hover:border-purple-100 transition-colors">
                    <p className="font-semibold text-slate-900 text-sm leading-snug">{event.title}</p>
                    <p className="text-xs font-medium text-slate-500 mt-1">{event.event_type}</p>
                  </div>
                </div>
              ))}
              {upcomingHearings.length === 0 && (
                <p className="text-sm text-slate-500 text-center py-4">No upcoming hearings scheduled.</p>
              )}
            </div>
          </div>
        </div>
        
      </div>

      <KYCModal isOpen={isKYCModalOpen} setIsOpen={setIsKYCModalOpen} task={selectedTaskObj} />
    </div>
  );
}

function OverviewCard({ icon, label, value }: { icon: any, label: string, value: number }) {
  return (
    <div className="bg-white/80 backdrop-blur-xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl p-6 flex items-center gap-5 transition-transform hover:-translate-y-1 hover:shadow-lg cursor-default">
      <div className="p-3.5 rounded-2xl bg-slate-100 text-slate-600">
        {React.cloneElement(icon, { className: 'w-6 h-6' })}
      </div>
      <div>
        <p className="text-3xl font-extrabold text-slate-900">{value}</p>
        <p className="text-sm font-semibold text-slate-500 mt-0.5">{label}</p>
      </div>
    </div>
  );
}
