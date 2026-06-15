"use client";

import React, { useState } from "react";
import { 
  Briefcase, 
  FileText, 
  CheckCircle2,
  Circle,
  Calendar, 
  ArrowLeft,
  Scale,
  Clock,
  UserCheck,
  Zap,
  MoreHorizontal
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import MatterTeamRoster from "@/components/features/cases/MatterTeamRoster";
import PhaseMover from "@/components/features/cases/PhaseMover";
import { updateTaskStatus } from "@/server/actions/workspace-actions";

export function MatterDashboardClient({ caseData, userRole }: { caseData: any, userRole: string }) {
  const isClient = userRole === "client";
  const [optimisticTasks, setOptimisticTasks] = useState(caseData.tasks || []);

  const pendingTasks = optimisticTasks.filter((t:any) => t.status !== 'completed');
  const completedTasks = optimisticTasks.filter((t:any) => t.status === 'completed');

  async function handleToggleTask(taskId: string, currentStatus: string) {
    const newStatus = currentStatus === 'completed' ? 'pending' : 'completed';
    setOptimisticTasks((prev:any[]) => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
    await updateTaskStatus(taskId, newStatus);
  }

  return (
    <div className="min-h-full bg-[#f4f7f6] font-sans animate-in fade-in duration-700">
      
      {/* Dynamic Breathtaking Header */}
      <header className="relative bg-gradient-to-br from-[#001d35] to-[#012a4a] text-white pt-6 pb-24 px-6 md:px-12 overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="relative z-10 max-w-[1600px] mx-auto flex flex-col gap-6">
          <Link href="/workspace" className="inline-flex items-center gap-2 text-blue-200 hover:text-white transition-colors w-fit font-medium text-sm">
            <ArrowLeft className="w-4 h-4" /> Back to Workspace
          </Link>
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-md bg-blue-500/20 text-blue-100 border border-blue-400/30">
                  {caseData.status}
                </span>
                {!isClient && caseData.risk_level && (
                  <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-md border ${
                    caseData.risk_level === 'high' ? 'bg-rose-500/20 text-rose-200 border-rose-400/30' :
                    caseData.risk_level === 'medium' ? 'bg-amber-500/20 text-amber-200 border-amber-400/30' :
                    'bg-emerald-500/20 text-emerald-200 border-emerald-400/30'
                  }`}>
                    {caseData.risk_level} Risk
                  </span>
                )}
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white">{caseData.title}</h1>
              <p className="text-blue-100/80 mt-3 text-lg flex items-center gap-2">
                <Briefcase className="w-5 h-5" /> {caseData.client?.name || "Unassigned Client"} &bull; ID: {caseData.id.slice(0,8)}
              </p>
            </div>
            
            {!isClient && (
              <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl flex flex-col items-center justify-center min-w-[200px]">
                <p className="text-xs font-bold text-blue-200 uppercase tracking-widest mb-1">Current Phase</p>
                <PhaseMover caseId={caseData.id} currentPhase={caseData.current_phase || "1. Lead & Intake"} userRole={userRole} />
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Command Hub Layout */}
      <main className="max-w-[1600px] mx-auto px-4 md:px-12 -mt-16 pb-12 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Stage (Execution & Tasks) */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Active Execution Board */}
            <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-white/60 overflow-hidden">
              <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-3">
                  <Zap className="w-5 h-5 text-amber-500" /> Action Required (Tasks)
                </h2>
                <span className="bg-amber-100 text-amber-700 font-bold px-3 py-1 rounded-full text-xs">
                  {pendingTasks.length} Pending
                </span>
              </div>
              
              <div className="divide-y divide-slate-100">
                {pendingTasks.map((t:any) => {
                  const isOverdue = new Date(t.due_date) < new Date();
                  return (
                    <div key={t.id} className={`group flex items-start gap-5 px-8 py-5 hover:bg-slate-50 transition-colors ${isOverdue ? 'bg-rose-50/20' : ''}`}>
                      <button onClick={() => handleToggleTask(t.id, t.status)} className="mt-0.5 shrink-0 group-hover:scale-110 transition-transform">
                        <Circle className={`w-6 h-6 ${isOverdue ? 'text-rose-400' : 'text-slate-200 group-hover:text-blue-500'}`} />
                      </button>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <span className={`text-base font-bold ${isOverdue ? 'text-rose-900' : 'text-slate-900'}`}>{t.title}</span>
                          {isOverdue && <span className="bg-rose-100 text-rose-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">Overdue</span>}
                        </div>
                        {t.description && <p className="text-sm text-slate-500 mt-1 line-clamp-2">{t.description}</p>}
                        <div className="flex items-center gap-4 mt-3 text-xs font-semibold">
                          <span className={`${isOverdue ? 'text-rose-600' : 'text-slate-400'}`}>
                            Due: {format(new Date(t.due_date), "MMM do")}
                          </span>
                          {t.assignee && (
                            <span className="flex items-center gap-1.5 text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                              <UserCheck className="w-3.5 h-3.5" /> {t.assignee.name}
                            </span>
                          )}
                        </div>
                      </div>
                      <button className="p-2 text-slate-300 hover:text-slate-600 rounded-md hover:bg-slate-100">
                        <MoreHorizontal className="w-5 h-5" />
                      </button>
                    </div>
                  );
                })}
                {pendingTasks.length === 0 && (
                  <div className="py-16 text-center flex flex-col items-center">
                    <CheckCircle2 className="w-16 h-16 text-emerald-400 mb-4" />
                    <h3 className="text-xl font-bold text-slate-900">All tasks completed</h3>
                    <p className="text-slate-500 mt-1">This matter is up to date.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Completed Tasks Accordion */}
            {completedTasks.length > 0 && (
              <div className="bg-white/60 backdrop-blur-xl rounded-3xl border border-slate-200/60 p-6 shadow-sm">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest flex items-center gap-2 mb-4">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Completed History ({completedTasks.length})
                </h3>
                <div className="space-y-3 opacity-60 hover:opacity-100 transition-opacity">
                  {completedTasks.slice(0, 3).map((t:any) => (
                    <div key={t.id} className="flex items-center gap-4 px-4 py-3 bg-slate-50 rounded-xl">
                      <button onClick={() => handleToggleTask(t.id, t.status)} className="shrink-0 hover:scale-110 transition-transform">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      </button>
                      <span className="text-sm font-medium text-slate-700 line-through decoration-slate-300">{t.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Intelligence Sidebar (Right) */}
          <div className="space-y-8">
            
            {/* Court & Hearing Widget */}
            <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-white/60 p-8">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest flex items-center gap-2 mb-6">
                <Calendar className="w-4 h-4 text-purple-500" /> Upcoming Court Dates
              </h3>
              <div className="space-y-4">
                {caseData.court_events?.map((event:any) => (
                  <div key={event.id} className="flex gap-4 group">
                    <div className="w-12 pt-1 text-center">
                      <p className="text-[10px] font-bold text-purple-600 uppercase">{format(new Date(event.event_date), 'MMM')}</p>
                      <p className="text-lg font-black text-slate-900 leading-none">{format(new Date(event.event_date), 'dd')}</p>
                    </div>
                    <div className="flex-1 bg-slate-50 rounded-2xl p-4 border border-slate-100 group-hover:border-purple-200 group-hover:bg-purple-50/30 transition-all">
                      <p className="font-bold text-slate-900 text-sm leading-tight">{event.title}</p>
                      <p className="text-xs font-semibold text-slate-500 mt-1">{event.event_type}</p>
                    </div>
                  </div>
                ))}
                {(!caseData.court_events || caseData.court_events.length === 0) && (
                  <p className="text-sm text-slate-500 font-medium">No upcoming hearings scheduled.</p>
                )}
              </div>
            </div>

            {/* Matter Timeline */}
            <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-white/60 p-8">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest flex items-center gap-2 mb-6">
                <Clock className="w-4 h-4 text-blue-500" /> Timeline
              </h3>
              <div className="space-y-6">
                {caseData.timeline_events?.map((event:any, idx:number) => (
                  <div key={event.id} className="relative pl-6">
                    {idx !== caseData.timeline_events.length - 1 && (
                      <div className="absolute left-[7px] top-4 bottom-[-24px] w-0.5 bg-slate-100" />
                    )}
                    <div className="absolute left-0 top-1.5 h-4 w-4 rounded-full bg-blue-100 border-2 border-white flex items-center justify-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                    </div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      {format(new Date(event.event_date), "MMM dd, yyyy")}
                    </p>
                    <p className="text-sm font-bold text-slate-900 mt-0.5">{event.title}</p>
                    {event.description && <p className="text-xs text-slate-600 mt-1">{event.description}</p>}
                  </div>
                ))}
                {(!caseData.timeline_events || caseData.timeline_events.length === 0) && (
                  <p className="text-sm text-slate-500 font-medium">No timeline events recorded.</p>
                )}
              </div>
            </div>

            {/* AI Precedents (Internal Only) */}
            {!isClient && (
              <div className="bg-gradient-to-br from-slate-900 to-[#001d35] rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] p-8 text-white">
                <h3 className="text-sm font-bold uppercase tracking-widest flex items-center gap-2 mb-4 text-blue-300">
                  <Scale className="w-4 h-4" /> AI Insights
                </h3>
                <p className="text-sm text-slate-300 font-medium leading-relaxed">
                  Our system has analyzed similar matters and surfaced strategic precedents for this case phase.
                </p>
                <button className="mt-6 w-full py-3 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold transition-colors">
                  View Strategic Analysis
                </button>
              </div>
            )}

            {/* Team Roster */}
            {!isClient && (
               <MatterTeamRoster caseData={caseData} userRole={userRole} />
            )}

          </div>
        </div>
      </main>
    </div>
  );
}
