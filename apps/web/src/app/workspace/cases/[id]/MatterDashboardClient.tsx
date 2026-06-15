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
  MoreHorizontal,
  Plus,
  Cloud,
  ChevronRight
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import MatterTeamRoster from "@/components/features/cases/MatterTeamRoster";
import PhaseMover from "@/components/features/cases/PhaseMover";
import { updateTaskStatus } from "@/server/actions/workspace-actions";
import NewTaskDialog from "../../NewTaskDialog";

export function MatterDashboardClient({ caseData, userRole, userId }: { caseData: any, userRole: string, userId: string }) {
  const isClient = userRole === "client";
  const [optimisticTasks, setOptimisticTasks] = useState(caseData.tasks || []);
  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'execution' | 'vault'>('execution');

  const pendingTasks = optimisticTasks.filter((t:any) => t.status !== 'completed');
  const completedTasks = optimisticTasks.filter((t:any) => t.status === 'completed');

  async function handleToggleTask(taskId: string, currentStatus: string) {
    const newStatus = currentStatus === 'completed' ? 'pending' : 'completed';
    setOptimisticTasks((prev:any[]) => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
    await updateTaskStatus(taskId, newStatus);
  }

  return (
    <div className="min-h-screen bg-[#fafafa] font-sans animate-in fade-in duration-700">
      
      {/* Pristine White Header */}
      <header className="bg-white border-b border-slate-200 pt-6 pb-8 px-6 md:px-12 shadow-sm relative z-20">
        <div className="max-w-[1600px] mx-auto flex flex-col gap-6">
          <Link href="/workspace" className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors w-fit font-medium text-sm">
            <ArrowLeft className="w-4 h-4" /> Back to Workspace
          </Link>
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                  {caseData.status}
                </span>
                {!isClient && caseData.risk_level && (
                  <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-md border ${
                    caseData.risk_level === 'high' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                    caseData.risk_level === 'medium' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                    'bg-emerald-50 text-emerald-700 border-emerald-200'
                  }`}>
                    {caseData.risk_level} Risk
                  </span>
                )}
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900">{caseData.title}</h1>
              <p className="text-slate-500 mt-3 text-lg flex items-center gap-2 font-medium">
                <Briefcase className="w-5 h-5 text-slate-400" /> {caseData.client?.name || "Unassigned Client"} <span className="text-slate-300">|</span> ID: {caseData.id.slice(0,8)}
              </p>
            </div>
            
            {!isClient && (
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl flex flex-col items-center justify-center min-w-[200px] shadow-sm">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Current Phase</p>
                <PhaseMover caseId={caseData.id} currentPhase={caseData.current_phase || "1. Lead & Intake"} userRole={userRole} />
              </div>
            )}
          </div>
          
          {/* Internal Hub Navigation */}
          <div className="flex items-center gap-6 mt-4 border-t border-slate-100 pt-4">
            <button 
              onClick={() => setActiveTab('execution')}
              className={`pb-4 -mb-4 font-bold text-sm tracking-wide transition-all border-b-2 ${activeTab === 'execution' ? 'text-blue-600 border-blue-600' : 'text-slate-500 border-transparent hover:text-slate-800'}`}
            >
              Execution Board
            </button>
            <button 
              onClick={() => setActiveTab('vault')}
              className={`pb-4 -mb-4 font-bold text-sm tracking-wide transition-all border-b-2 ${activeTab === 'vault' ? 'text-blue-600 border-blue-600' : 'text-slate-500 border-transparent hover:text-slate-800'}`}
            >
              Document Vault
            </button>
          </div>
        </div>
      </header>

      {/* Main Command Hub Layout */}
      <main className="max-w-[1600px] mx-auto px-4 md:px-12 py-8 relative z-10">
        
        {activeTab === 'execution' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Stage (Execution & Tasks) */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Active Execution Board */}
              <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-200 overflow-hidden">
                <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-white">
                  <div className="flex items-center gap-3">
                    <Zap className="w-5 h-5 text-amber-500" />
                    <h2 className="text-lg font-bold text-slate-900">Action Required</h2>
                    <span className="bg-amber-50 text-amber-700 font-bold px-3 py-1 rounded-full text-xs border border-amber-200/50">
                      {pendingTasks.length} Pending
                    </span>
                  </div>
                  
                  {!isClient && (
                    <button 
                      onClick={() => setIsNewTaskOpen(true)}
                      className="flex items-center gap-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-xl transition-all shadow-sm shadow-blue-200"
                    >
                      <Plus className="w-4 h-4" /> New Task
                    </button>
                  )}
                </div>
                
                <div className="divide-y divide-slate-50">
                  {pendingTasks.map((t:any) => {
                    const isOverdue = new Date(t.due_date) < new Date();
                    return (
                      <div key={t.id} className={`group flex items-start gap-5 px-8 py-6 hover:bg-slate-50/50 transition-colors ${isOverdue ? 'bg-rose-50/10' : ''}`}>
                        <button onClick={() => handleToggleTask(t.id, t.status)} className="mt-0.5 shrink-0 group-hover:scale-110 transition-transform">
                          <Circle className={`w-6 h-6 ${isOverdue ? 'text-rose-400' : 'text-slate-300 group-hover:text-blue-500'}`} />
                        </button>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <span className={`text-base font-bold ${isOverdue ? 'text-rose-900' : 'text-slate-900'}`}>{t.title}</span>
                            {isOverdue && <span className="bg-rose-100 text-rose-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">Overdue</span>}
                          </div>
                          {t.description && <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">{t.description}</p>}
                          <div className="flex items-center gap-4 mt-4 text-xs font-semibold">
                            <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg ${isOverdue ? 'bg-rose-50 text-rose-600 border border-rose-100' : 'bg-slate-50 text-slate-500 border border-slate-100'}`}>
                              <Clock className="w-3.5 h-3.5" /> Due {format(new Date(t.due_date), "MMM do")}
                            </span>
                            {t.assignee && (
                              <span className="flex items-center gap-1.5 text-blue-700 bg-blue-50/50 border border-blue-100 px-2.5 py-1 rounded-lg">
                                <UserCheck className="w-3.5 h-3.5" /> {t.assignee.name}
                              </span>
                            )}
                          </div>
                        </div>
                        <button className="p-2 text-slate-300 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors">
                          <MoreHorizontal className="w-5 h-5" />
                        </button>
                      </div>
                    );
                  })}
                  {pendingTasks.length === 0 && (
                    <div className="py-20 text-center flex flex-col items-center">
                      <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-5">
                        <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                      </div>
                      <h3 className="text-xl font-bold text-slate-900">All tasks completed</h3>
                      <p className="text-slate-500 mt-2 font-medium">This matter is entirely up to date.</p>
                      {!isClient && (
                        <button onClick={() => setIsNewTaskOpen(true)} className="mt-6 text-sm font-bold text-blue-600 hover:text-blue-700 underline underline-offset-4">
                          Assign a new task
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Completed Tasks Accordion */}
              {completedTasks.length > 0 && (
                <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-5">
                    <CheckCircle2 className="w-4 h-4 text-slate-400" /> Completed History ({completedTasks.length})
                  </h3>
                  <div className="space-y-2 opacity-70 hover:opacity-100 transition-opacity">
                    {completedTasks.slice(0, 5).map((t:any) => (
                      <div key={t.id} className="flex items-center gap-4 px-4 py-3 bg-slate-50 rounded-2xl">
                        <button onClick={() => handleToggleTask(t.id, t.status)} className="shrink-0 hover:scale-110 transition-transform">
                          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        </button>
                        <span className="text-sm font-semibold text-slate-600 line-through decoration-slate-300">{t.title}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Intelligence Sidebar (Right) */}
            <div className="space-y-6">
              
              {/* Court & Hearing Widget */}
              <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-200 p-8">
                <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-6">
                  <Calendar className="w-4 h-4 text-purple-500" /> Upcoming Court Dates
                </h3>
                <div className="space-y-4">
                  {caseData.court_events?.map((event:any) => (
                    <div key={event.id} className="flex gap-5 group">
                      <div className="w-12 pt-1 text-center shrink-0">
                        <p className="text-[10px] font-bold text-purple-600 uppercase tracking-wider">{format(new Date(event.event_date), 'MMM')}</p>
                        <p className="text-xl font-black text-slate-900 leading-none mt-1">{format(new Date(event.event_date), 'dd')}</p>
                      </div>
                      <div className="flex-1 bg-slate-50 rounded-2xl p-4 border border-slate-100 group-hover:border-purple-200 group-hover:bg-purple-50/30 transition-all">
                        <p className="font-bold text-slate-900 text-sm leading-tight">{event.title}</p>
                        <p className="text-xs font-semibold text-slate-500 mt-1.5 flex items-center gap-1.5"><Clock className="w-3 h-3"/> {event.event_type}</p>
                      </div>
                    </div>
                  ))}
                  {(!caseData.court_events || caseData.court_events.length === 0) && (
                    <div className="py-6 text-center border-2 border-dashed border-slate-100 rounded-2xl">
                      <p className="text-sm text-slate-400 font-semibold">No upcoming hearings.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Matter Timeline */}
              <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-200 p-8">
                <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-8">
                  <Clock className="w-4 h-4 text-blue-500" /> Matter Timeline
                </h3>
                <div className="space-y-7">
                  {caseData.timeline_events?.map((event:any, idx:number) => (
                    <div key={event.id} className="relative pl-7">
                      {idx !== caseData.timeline_events.length - 1 && (
                        <div className="absolute left-[9px] top-4 bottom-[-28px] w-[2px] bg-slate-100" />
                      )}
                      <div className="absolute left-0 top-1 h-5 w-5 rounded-full bg-blue-50 border-2 border-white flex items-center justify-center shadow-sm">
                        <div className="w-2 h-2 rounded-full bg-blue-500" />
                      </div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                        {format(new Date(event.event_date), "MMM dd, yyyy")}
                      </p>
                      <p className="text-sm font-bold text-slate-900">{event.title}</p>
                      {event.description && <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">{event.description}</p>}
                    </div>
                  ))}
                  {(!caseData.timeline_events || caseData.timeline_events.length === 0) && (
                    <div className="py-6 text-center border-2 border-dashed border-slate-100 rounded-2xl">
                      <p className="text-sm text-slate-400 font-semibold">No timeline events recorded.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Team Roster */}
              {!isClient && (
                 <MatterTeamRoster caseData={caseData} userRole={userRole} />
              )}

            </div>
          </div>
        )}

        {/* Document Vault Tab */}
        {activeTab === 'vault' && (
          <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-200 p-12 text-center flex flex-col items-center">
            <div className="w-24 h-24 bg-blue-50 rounded-3xl flex items-center justify-center mb-6 shadow-sm border border-blue-100">
              <Cloud className="w-12 h-12 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Secure Document Vault</h2>
            <p className="text-slate-500 mt-3 max-w-md font-medium leading-relaxed">
              All files uploaded to this matter are encrypted and securely synchronized with Supabase Storage.
            </p>
            <div className="mt-8 flex gap-4">
              <Link href="/client/documents" className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-sm transition-all flex items-center gap-2">
                Open Cloud Drive <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}

      </main>

      {/* New Task Dialog Injection */}
      <NewTaskDialog 
        isOpen={isNewTaskOpen} 
        setIsOpen={setIsNewTaskOpen} 
        cases={[{ id: caseData.id, title: caseData.title }]}
        userId={userId} 
      />
    </div>
  );
}
