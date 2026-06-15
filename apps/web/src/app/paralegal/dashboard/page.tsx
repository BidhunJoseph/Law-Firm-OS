import { getParalegalDashboardData, getParalegalCases } from "@/server/actions/dashboard-actions";
import { CheckCircle2, Clock, Calendar, AlertCircle } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function ParalegalDashboard() {
  const tasks = await getParalegalDashboardData();
  const cases = await getParalegalCases();

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-50 text-red-700 ring-red-600/20';
      case 'high': return 'bg-amber-50 text-amber-700 ring-amber-600/20';
      case 'medium': return 'bg-blue-50 text-blue-700 ring-blue-600/20';
      default: return 'bg-slate-50 text-slate-700 ring-slate-600/20';
    }
  };

  const actionRequiredPhases = [
    "5. Registration & Filing",
    "7. Judgment & Execution"
  ];

  const actionRequiredCases = cases.filter(c => actionRequiredPhases.includes(c.current_phase));

  return (
    <div className="flex-1 flex flex-col h-full bg-[#fbfcfd]">
      <header className="bg-white/80 backdrop-blur-xl border-b border-gray-100 px-6 py-5 sticky top-0 z-30 flex items-center justify-between shadow-[0_2px_10px_rgb(0,0,0,0.02)]">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Paralegal Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Manage document requests, tasks, and court filings.</p>
        </div>
      </header>

      <div className="flex-1 overflow-auto p-6 space-y-6 bg-[#f8f9fa]">
        
        {/* Action Required Swimlane */}
        {actionRequiredCases.length > 0 && (
          <div className="mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-500" /> Action Required (Filing & Execution)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {actionRequiredCases.map(c => (
                <div key={c.id} className="bg-white border border-rose-100 rounded-2xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden group hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all">
                  <div className="absolute top-0 left-0 w-1 h-full bg-rose-500" />
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">{c.title}</h3>
                      <p className="text-xs text-gray-500 mt-0.5">{c.client?.name}</p>
                    </div>
                    <span className="px-2 py-1 bg-rose-50 text-rose-700 text-[10px] font-bold uppercase rounded-md border border-rose-100 whitespace-nowrap">
                      {c.current_phase.split('. ')[1]}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-50">
                    <div className="text-xs text-gray-500">
                      <span className="font-medium text-gray-700">{c.tasks.length}</span> pending tasks
                    </div>
                    <a href={`/workspace/cases/${c.id}`} className="text-xs font-semibold text-blue-600 hover:text-blue-800">Review Matter &rarr;</a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Stats */}
        <div className="max-w-5xl space-y-6">
          {tasks.length === 0 ? (
             <div className="text-center py-12 bg-white rounded-xl border border-slate-200 shadow-sm">
                <CheckCircle2 className="h-12 w-12 text-green-400 mx-auto mb-3" />
                <h3 className="text-lg font-medium text-slate-900">Queue Clear</h3>
                <p className="text-slate-500">You have no pending tasks assigned.</p>
             </div>
          ) : (
            <div className="space-y-4">
              {tasks.map((task) => (
                <div key={task.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex flex-col sm:flex-row gap-5 transition-shadow hover:shadow-md">
                  
                  {/* Left content */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md border 
                        border-slate-200 bg-slate-50 text-slate-500`}>
                        {task.status.replace('_', ' ')}
                      </span>
                      <span className="text-xs font-medium text-slate-500">
                        Case #{task.case.id.substring(0, 8).toUpperCase()}
                      </span>
                    </div>
                    
                    <h3 className="text-base font-semibold text-slate-900">{task.title}</h3>
                    {task.description && (
                      <p className="text-sm text-slate-600 mt-1 line-clamp-2">{task.description}</p>
                    )}
                    
                    <div className="flex items-center gap-4 mt-4 text-xs font-medium text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5" />
                        Due: {new Date(task.due_date).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5" />
                        Client: {task.case.client.name}
                      </div>
                    </div>
                  </div>

                  {/* Right Actions */}
                  <div className="flex flex-col justify-center sm:items-end gap-3 sm:border-l border-slate-100 sm:pl-5 min-w-[140px]">
                    <button className="w-full sm:w-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2">
                      <CheckCircle2 className="h-4 w-4" />
                      Complete
                    </button>
                    <button className="w-full sm:w-auto px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 text-sm font-medium rounded-lg border border-slate-200 transition-colors">
                      View Details
                    </button>
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
