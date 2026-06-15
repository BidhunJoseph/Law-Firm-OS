"use client";

import React, { useState } from "react";
import { CheckCircle2, Circle, Briefcase, FileText, ChevronRight, ListTodo, ClipboardList, Zap } from "lucide-react";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import KYCModal from "../KYCModal";

export default function ParalegalWorkspace({ tasks, cases, userId }: { tasks: any[], cases: any[], userId: string }) {
  const router = useRouter();
  
  const [isKYCModalOpen, setIsKYCModalOpen] = useState(false);
  const [selectedTaskObj, setSelectedTaskObj] = useState<any>(null);

  const pendingTasks = tasks.filter(t => t.status !== 'completed');
  const myCases = cases.filter(c => c.paralegal_id === userId);

  return (
    <div className="min-h-full bg-[#f4f7f6] p-6 md:p-10 font-sans space-y-8 animate-in fade-in duration-700">
      
      {/* Execution Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            <Zap className="w-8 h-8 text-amber-500" /> Execution Mode
          </h1>
          <p className="text-slate-500 mt-1.5 font-medium ml-11">Streamlined task checklist and document gathering.</p>
        </div>
      </header>

      {/* Task Board */}
      <div className="bg-white/80 backdrop-blur-xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl overflow-hidden min-h-[60vh]">
        <div className="flex border-b border-slate-100">
          <div className="flex-1 px-8 py-5 flex items-center gap-3 border-r border-slate-100 bg-white">
            <ListTodo className="w-5 h-5 text-emerald-500" />
            <h2 className="text-lg font-bold text-slate-900">Your Checklist</h2>
            <span className="ml-auto bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-bold">{pendingTasks.length} left</span>
          </div>
          <div className="w-1/3 px-8 py-5 hidden lg:flex items-center gap-3 bg-slate-50/50">
            <Briefcase className="w-5 h-5 text-blue-500" />
            <h2 className="text-lg font-bold text-slate-900">Associated Matter</h2>
          </div>
        </div>

        <div className="divide-y divide-slate-100/80">
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
                className={`group flex items-stretch hover:bg-emerald-50/30 transition-colors cursor-pointer ${isOverdue ? 'bg-rose-50/20' : ''}`}
              >
                {/* Task Section */}
                <div className="flex-1 flex items-start gap-5 px-8 py-6 lg:border-r lg:border-slate-100">
                  <button className="mt-0.5 shrink-0 group-hover:scale-110 transition-transform">
                    <Circle className={`w-6 h-6 ${isOverdue ? 'text-rose-400' : 'text-slate-200 group-hover:text-emerald-500'}`} />
                  </button>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <span className={`text-lg font-semibold ${isOverdue ? 'text-rose-900' : 'text-slate-900'}`}>{task.title}</span>
                      {isOverdue && <span className="bg-rose-100 text-rose-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">Overdue</span>}
                    </div>
                    {task.description && <p className="text-sm text-slate-500 mt-1 line-clamp-2">{task.description}</p>}
                    <p className={`text-xs font-semibold mt-3 ${isOverdue ? 'text-rose-600' : 'text-slate-400'}`}>
                      Deadline: {format(new Date(task.due_date), "MMMM do, yyyy")}
                    </p>
                  </div>
                </div>

                {/* Case Section */}
                <div className="w-1/3 px-8 py-6 hidden lg:flex flex-col justify-center">
                  {task.case ? (
                    <div onClick={(e) => { e.stopPropagation(); router.push(`/workspace/cases/${task.case.id}`) }} className="flex items-center justify-between group/case hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-200 rounded-xl p-3 -mx-3 transition-all">
                      <div>
                        <p className="font-semibold text-slate-900 text-sm">{task.case.title}</p>
                        <p className="text-xs text-slate-500 mt-1">{task.case.client?.name}</p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-slate-300 group-hover/case:text-blue-500 group-hover/case:translate-x-1 transition-all" />
                    </div>
                  ) : (
                    <p className="text-sm text-slate-400 italic">Unassigned task</p>
                  )}
                </div>
              </div>
            );
          }) : (
            <div className="py-20 flex flex-col items-center justify-center text-slate-500">
              <ClipboardList className="w-16 h-16 text-slate-200 mb-4" />
              <p className="text-xl font-bold text-slate-900">All caught up!</p>
              <p className="text-sm mt-1">Enjoy your free time.</p>
            </div>
          )}
        </div>
      </div>

      <KYCModal isOpen={isKYCModalOpen} setIsOpen={setIsKYCModalOpen} task={selectedTaskObj} />
    </div>
  );
}
