"use client";

import React, { useState } from "react";
import { AlertTriangle, Clock, Briefcase, CheckCircle2, ShieldAlert, ArrowRight, UserCheck, Circle, Zap } from "lucide-react";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { updateTaskStatus } from "@/server/actions/workspace-actions";

export default function ManagerWorkspace({ tasks, cases, userId }: { tasks: any[], cases: any[], userId: string }) {
  const router = useRouter();

  const [optimisticTasks, setOptimisticTasks] = useState(tasks || []);

  const urgentCases = cases.filter(c => c.risk_level === 'high' || c.risk_level === 'medium');
  const pendingTasks = optimisticTasks.filter((t:any) => t.status !== 'completed');
  const overdueTasks = pendingTasks.filter((t:any) => new Date(t.due_date) < new Date());

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
              <span className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                Oversight Mode
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900">Manager Command</h1>
            <p className="text-slate-500 mt-3 text-lg font-medium">Firm-wide overview of active matters, urgency, and tasks.</p>
          </div>
        </div>
      </header>

      {/* Main Command Hub Layout */}
      <main className="max-w-[1600px] mx-auto px-4 md:px-12 py-8 relative z-10 space-y-8">
        
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          <KPICard icon={<Briefcase />} label="Total Active Matters" value={cases.length} color="blue" />
          <KPICard icon={<AlertTriangle />} label="High Risk Cases" value={cases.filter(c=>c.risk_level==='high').length} color="rose" />
          <KPICard icon={<CheckCircle2 />} label="Pending Tasks" value={pendingTasks.length} color="amber" />
          <KPICard icon={<Clock />} label="Overdue Tasks" value={overdueTasks.length} color="red" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column - High Risk Matters */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden flex flex-col h-full min-h-[500px]">
              <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-white">
                <div className="flex items-center gap-3">
                  <ShieldAlert className="w-5 h-5 text-rose-500" />
                  <h2 className="text-lg font-bold text-slate-900">Matters Requiring Attention</h2>
                </div>
              </div>
              <div className="divide-y divide-slate-50 flex-1 p-6 space-y-4 bg-slate-50/30">
                {urgentCases.length > 0 ? urgentCases.map(c => (
                  <div key={c.id} onClick={() => router.push(`/workspace/cases/${c.id}`)} className="group bg-white border border-slate-200 hover:border-rose-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] cursor-pointer transition-all duration-300 rounded-3xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${c.risk_level === 'high' ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                          {c.risk_level} Risk
                        </span>
                      </div>
                      <span className="font-bold text-lg text-slate-900 truncate block mb-2">{c.title}</span>
                      <div className="text-sm font-semibold text-slate-500 flex items-center gap-4">
                        <span className="flex items-center gap-1.5 bg-slate-100 px-2 py-1 rounded-md"><UserCheck className="w-3.5 h-3.5"/> Lead: {c.lawyer?.name || 'Unassigned'}</span>
                        <span className="flex items-center gap-1.5 bg-slate-100 px-2 py-1 rounded-md"><Clock className="w-3.5 h-3.5"/> Phase: {c.current_phase?.split('. ')[1] || c.current_phase}</span>
                      </div>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center border border-slate-200 group-hover:bg-rose-600 group-hover:border-rose-600 group-hover:text-white transition-colors shrink-0">
                      <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-white transition-all" />
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 border-dashed">
                    <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
                    <p className="text-slate-900 font-bold text-xl mb-1">Perfectly Healthy</p>
                    <p className="text-slate-500 font-medium">All firm matters are operating within normal risk parameters.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Task Overview (Execution Board) */}
          <div className="space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
              <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-white">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-amber-500" /> Pending Tasks
                </h2>
              </div>
              <div className="divide-y divide-slate-50">
                {pendingTasks.slice(0, 10).map((t:any) => {
                  const isOverdue = new Date(t.due_date) < new Date();
                  return (
                    <div 
                      key={t.id} 
                      className={`group flex items-start gap-4 px-6 py-5 transition-all duration-300 hover:bg-slate-50/80 cursor-pointer ${isOverdue ? 'bg-rose-50/10' : ''}`}
                      onClick={() => router.push(`/workspace/cases/${t.case_id}`)}
                    >
                      <button onClick={(e) => handleToggleTask(e, t.id, t.status)} className="mt-0.5 shrink-0 group-hover:scale-110 transition-transform z-10">
                        <Circle className={`w-5 h-5 ${isOverdue ? 'text-rose-400' : 'text-slate-300 group-hover:text-emerald-500'}`} />
                      </button>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className={`font-bold text-sm truncate ${isOverdue ? 'text-rose-900' : 'text-slate-900'}`}>{t.title}</p>
                          {isOverdue && <span className="bg-rose-100 text-rose-700 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider shrink-0">Overdue</span>}
                        </div>
                        <p className="text-xs font-semibold text-slate-500 truncate flex items-center gap-1.5 mt-1.5">
                          <Briefcase className="w-3.5 h-3.5" /> {t.case?.title || 'No Case'}
                        </p>
                        <p className={`text-xs font-bold mt-2 px-2 py-0.5 rounded-md inline-block border ${isOverdue ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-slate-50 text-slate-500 border-slate-100'}`}>
                          Due: {format(new Date(t.due_date), 'MMM dd')}
                        </p>
                      </div>
                    </div>
                  );
                })}
                {pendingTasks.length === 0 && (
                  <div className="py-12 text-center text-slate-500">
                    <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
                    <p className="font-bold text-slate-900">No pending tasks.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
          
        </div>
      </main>
    </div>
  );
}

function KPICard({ icon, label, value, color }: { icon: any, label: string, value: number, color: 'blue' | 'rose' | 'amber' | 'red' }) {
  const colors = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    rose: 'bg-rose-50 text-rose-600 border-rose-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    red: 'bg-red-50 text-red-600 border-red-100',
  };

  return (
    <div className="bg-white border border-slate-200 shadow-[0_4px_20px_rgb(0,0,0,0.03)] rounded-3xl p-6 flex items-center gap-5 transition-transform hover:-translate-y-1 hover:shadow-lg cursor-default">
      <div className={`p-4 rounded-2xl border ${colors[color]}`}>
        {React.cloneElement(icon, { className: 'w-7 h-7' })}
      </div>
      <div>
        <p className="text-3xl font-black text-slate-900">{value}</p>
        <p className="text-sm font-bold text-slate-500 mt-0.5">{label}</p>
      </div>
    </div>
  );
}
