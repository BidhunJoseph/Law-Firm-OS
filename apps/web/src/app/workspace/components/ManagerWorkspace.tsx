"use client";

import React, { useState } from "react";
import { AlertTriangle, Clock, Briefcase, CheckCircle2, ShieldAlert, ArrowRight, UserCheck } from "lucide-react";
import { format } from "date-fns";
import { useRouter } from "next/navigation";

export default function ManagerWorkspace({ tasks, cases, userId }: { tasks: any[], cases: any[], userId: string }) {
  const router = useRouter();

  // Urgent cases calculation
  const urgentCases = cases.filter(c => c.risk_level === 'high' || c.risk_level === 'medium');
  
  // Pending tasks calculation
  const pendingTasks = tasks.filter(t => t.status !== 'completed');
  const overdueTasks = pendingTasks.filter(t => new Date(t.due_date) < new Date());

  return (
    <div className="min-h-full bg-gradient-to-br from-[#f8f9fa] to-blue-50/20 p-6 md:p-10 font-sans space-y-8 animate-in fade-in duration-700">
      
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Manager Command Center</h1>
          <p className="text-slate-500 mt-1.5 font-medium">Firm-wide overview of active matters, urgency, and tasks.</p>
        </div>
      </header>

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
          <div className="bg-white/80 backdrop-blur-xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl overflow-hidden p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-rose-500" /> Matters Requiring Attention
            </h2>
            <div className="space-y-4">
              {urgentCases.length > 0 ? urgentCases.map(c => (
                <div key={c.id} onClick={() => router.push(`/workspace/cases/${c.id}`)} className="group bg-slate-50 border border-slate-100 hover:border-blue-200 hover:bg-blue-50/50 hover:shadow-md cursor-pointer transition-all duration-300 rounded-2xl p-5 flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-semibold text-slate-900 truncate">{c.title}</span>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide ${c.risk_level === 'high' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'}`}>
                        {c.risk_level} Risk
                      </span>
                    </div>
                    <div className="text-sm font-medium text-slate-500 flex items-center gap-4">
                      <span>Lead: {c.lawyer?.name || 'Unassigned'}</span>
                      <span className="w-1 h-1 rounded-full bg-slate-300" />
                      <span>Phase: {c.current_phase?.split('. ')[1] || c.current_phase}</span>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                </div>
              )) : (
                <div className="text-center py-10 bg-slate-50 rounded-2xl border border-slate-100 border-dashed">
                  <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
                  <p className="text-slate-600 font-medium">All cases are perfectly healthy.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Task Overview */}
        <div className="space-y-6">
          <div className="bg-white/80 backdrop-blur-xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-blue-500" /> Recent Pending Tasks
            </h2>
            <div className="space-y-4">
              {pendingTasks.slice(0, 5).map(t => (
                <div key={t.id} className="relative pl-4 border-l-2 border-amber-200">
                  <div className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full bg-amber-400 ring-4 ring-white" />
                  <p className="font-medium text-slate-900 text-sm line-clamp-1">{t.title}</p>
                  <p className="text-xs text-slate-500 mt-1">{t.case?.title || 'No Case'}</p>
                  <p className={`text-xs font-semibold mt-1 ${new Date(t.due_date) < new Date() ? 'text-rose-600' : 'text-slate-500'}`}>
                    Due: {format(new Date(t.due_date), 'MMM dd')}
                  </p>
                </div>
              ))}
              {pendingTasks.length === 0 && (
                <p className="text-sm text-slate-500 text-center py-4">No pending tasks.</p>
              )}
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
}

function KPICard({ icon, label, value, color }: { icon: any, label: string, value: number, color: 'blue'|'rose'|'amber'|'red' }) {
  const colorMap = {
    blue: 'bg-blue-50 text-blue-600 ring-blue-100',
    rose: 'bg-rose-50 text-rose-600 ring-rose-100',
    amber: 'bg-amber-50 text-amber-600 ring-amber-100',
    red: 'bg-red-50 text-red-600 ring-red-100',
  };
  
  return (
    <div className="bg-white/80 backdrop-blur-xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl p-6 flex flex-col items-start gap-4 transition-transform hover:-translate-y-1 hover:shadow-[0_15px_40px_rgb(0,0,0,0.08)]">
      <div className={`p-3 rounded-2xl ring-1 ${colorMap[color]}`}>
        {React.cloneElement(icon, { className: 'w-6 h-6' })}
      </div>
      <div>
        <p className="text-3xl font-extrabold text-slate-900">{value}</p>
        <p className="text-sm font-semibold text-slate-500 mt-1">{label}</p>
      </div>
    </div>
  );
}
