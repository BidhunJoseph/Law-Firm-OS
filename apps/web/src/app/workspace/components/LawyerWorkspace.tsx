"use client";

import React, { useState } from "react";
import { CheckCircle2, Clock, Calendar, Briefcase, FileText, MoreHorizontal, ShieldAlert, Circle, UserCheck, ArrowRight, Zap } from "lucide-react";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import KYCModal from "../KYCModal";
import { updateTaskStatus } from "@/server/actions/workspace-actions";

export default function LawyerWorkspace({ tasks, cases, userId }: { tasks: any[], cases: any[], userId: string }) {
  const router = useRouter();
  
  const [isKYCModalOpen, setIsKYCModalOpen] = useState(false);
  const [selectedTaskObj, setSelectedTaskObj] = useState<any>(null);
  const [optimisticTasks, setOptimisticTasks] = useState(tasks || []);

  const pendingTasks = optimisticTasks.filter((t:any) => t.status !== 'completed');
  const myCases = cases.filter(c => c.lawyer_id === userId);
  const upcomingHearings = myCases.flatMap(c => c.court_events || []).sort((a: any, b: any) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime());

  async function handleToggleTask(e: React.MouseEvent, taskId: string, currentStatus: string) {
    e.stopPropagation();
    const newStatus = currentStatus === 'completed' ? 'pending' : 'completed';
    setOptimisticTasks((prev:any[]) => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
    await updateTaskStatus(taskId, newStatus);
  }

  return (
    <div className="min-h-screen bg-[#fafafa] font-sans animate-in fade-in duration-700 pb-12">
      
      {/* Pristine White Header */}
      <header className="bg-white border-b border-slate-200 pt-8 pb-10 px-6 md:px-12 shadow-sm relative z-20">
        <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                Focus Mode
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900">Lawyer Command</h1>
            <p className="text-slate-500 mt-3 text-lg font-medium">Your assigned matters and urgent execution board.</p>
          </div>
        </div>
      </header>

      {/* Main Command Hub Layout */}
      <main className="max-w-[1600px] mx-auto px-4 md:px-12 py-8 relative z-10 space-y-8">
        
        {/* Active Matters Quick Access */}
        <div className="space-y-4">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-4">
            <Briefcase className="w-4 h-4 text-blue-500" /> Active Matters Directory
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {myCases.map(c => (
              <div 
                key={c.id} 
                onClick={() => router.push(`/workspace/cases/${c.id}`)}
                className="group bg-white border border-slate-200 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:border-blue-300 transition-all cursor-pointer rounded-3xl p-6 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${c.risk_level === 'high' ? 'bg-rose-50 text-rose-700 border-rose-200' : c.risk_level === 'medium' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-slate-50 text-slate-600 border-slate-200'}`}>
                      {c.risk_level || 'Normal'} Risk
                    </span>
                    <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100 group-hover:bg-blue-600 group-hover:border-blue-600 transition-colors">
                      <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
                    </div>
                  </div>
                  <h3 className="font-bold text-slate-900 text-lg line-clamp-2 leading-tight">{c.title}</h3>
                  <p className="text-sm font-medium text-slate-500 mt-2 flex items-center gap-1.5"><UserCheck className="w-4 h-4" /> {c.client?.name}</p>
                </div>
                <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-500 bg-slate-50 px-2.5 py-1 rounded-md">{c.current_phase?.split('. ')[1] || c.status}</span>
                  <span className="text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md">{c.tasks?.filter((t:any) => t.status !== 'completed').length || 0} tasks</span>
                </div>
              </div>
            ))}
            {myCases.length === 0 && (
              <div className="col-span-full py-12 text-center border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/50">
                <Briefcase className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 font-bold">No active matters assigned.</p>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column - My Tasks (Execution Board) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden flex flex-col h-full min-h-[500px]">
              <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-white">
                <div className="flex items-center gap-3">
                  <Zap className="w-5 h-5 text-amber-500" />
                  <h2 className="text-lg font-bold text-slate-900">Action Required (Tasks)</h2>
                  <span className="bg-amber-50 text-amber-700 font-bold px-3 py-1 rounded-full text-xs border border-amber-200/50">
                    {pendingTasks.length} Pending
                  </span>
                </div>
              </div>
              
              <div className="divide-y divide-slate-50 flex-1">
                {pendingTasks.length > 0 ? pendingTasks.map(task => {
                  const isOverdue = new Date(task.due_date) < new Date();
                  return (
                    <div 
                      key={task.id}
                      onClick={() => {
                        if (task.title === "Collect KYC" && task.status !== "completed") {
                          setSelectedTaskObj(task);
                          setIsKYCModalOpen(true);
                        } else {
                          router.push(`/workspace/cases/${task.case_id}`);
                        }
                      }}
                      className={`group flex items-start gap-5 px-8 py-6 transition-all duration-300 hover:bg-slate-50/80 cursor-pointer ${isOverdue ? 'bg-rose-50/10' : ''}`}
                    >
                      <button onClick={(e) => handleToggleTask(e, task.id, task.status)} className="mt-0.5 shrink-0 group-hover:scale-110 transition-transform">
                        <Circle className={`w-6 h-6 ${isOverdue ? 'text-rose-400' : 'text-slate-300 group-hover:text-blue-500'}`} />
                      </button>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <span className={`text-base font-bold truncate ${isOverdue ? 'text-rose-900' : 'text-slate-900'}`}>{task.title}</span>
                          {isOverdue && <span className="bg-rose-100 text-rose-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">Overdue</span>}
                        </div>
                        {task.description && <p className="text-sm text-slate-500 mt-1.5 leading-relaxed line-clamp-2">{task.description}</p>}
                        
                        <div className="flex items-center gap-4 mt-4 text-xs font-semibold">
                          <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg ${isOverdue ? 'bg-rose-50 text-rose-600 border border-rose-100' : 'bg-slate-50 text-slate-500 border border-slate-100'}`}>
                            <Clock className="w-3.5 h-3.5" /> Due {format(new Date(task.due_date), "MMM do")}
                          </span>
                          <span className="flex items-center gap-1.5 text-blue-700 bg-blue-50/50 border border-blue-100 px-2.5 py-1 rounded-lg truncate max-w-[200px]">
                            <Briefcase className="w-3.5 h-3.5 shrink-0" /> {task.case?.title || "No Case"}
                          </span>
                          {task.title === "Collect KYC" && (
                            <span className="flex items-center gap-1.5 text-indigo-700 bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded-lg">
                              <UserCheck className="w-3.5 h-3.5" /> Interactive Modal
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="p-2 text-slate-300 hover:text-slate-600 rounded-xl hover:bg-slate-200 transition-colors">
                        <ArrowRight className="w-5 h-5" />
                      </div>
                    </div>
                  );
                }) : (
                  <div className="flex flex-col items-center justify-center h-full text-slate-500 py-24">
                    <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-5">
                      <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                    </div>
                    <p className="font-bold text-xl text-slate-900 mb-2">Inbox Zero!</p>
                    <p className="text-slate-500 font-medium">You have no pending tasks across any matters.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Upcoming Hearings */}
          <div className="space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8">
              <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-6">
                <Calendar className="w-4 h-4 text-purple-500" /> Upcoming Hearings
              </h3>
              <div className="space-y-4">
                {upcomingHearings.slice(0, 6).map(event => (
                  <div key={event.id} className="flex gap-5 group cursor-pointer" onClick={() => router.push(`/workspace/cases/${event.case_id}`)}>
                    <div className="w-12 pt-1 text-center shrink-0">
                      <p className="text-[10px] font-bold text-purple-600 uppercase tracking-wider">{format(new Date(event.event_date), 'MMM')}</p>
                      <p className="text-xl font-black text-slate-900 mt-1 leading-none">{format(new Date(event.event_date), 'dd')}</p>
                    </div>
                    <div className="flex-1 bg-slate-50 group-hover:bg-purple-50/50 rounded-2xl p-4 border border-slate-100 group-hover:border-purple-200 transition-all">
                      <p className="font-bold text-slate-900 text-sm leading-tight">{event.title}</p>
                      <p className="text-xs font-semibold text-slate-500 mt-1.5 flex items-center gap-1.5">
                        <Clock className="w-3 h-3"/> {event.event_type}
                      </p>
                    </div>
                  </div>
                ))}
                {upcomingHearings.length === 0 && (
                  <div className="py-6 text-center border-2 border-dashed border-slate-100 rounded-2xl">
                    <p className="text-sm text-slate-400 font-semibold">No upcoming hearings scheduled.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
          
        </div>

        <KYCModal isOpen={isKYCModalOpen} setIsOpen={setIsKYCModalOpen} task={selectedTaskObj} />
      </main>
    </div>
  );
}
