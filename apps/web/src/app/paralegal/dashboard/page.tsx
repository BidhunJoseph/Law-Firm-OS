import { getParalegalDashboardData } from "@/server/actions/dashboard-actions";
import { CheckCircle2, Clock, Calendar, AlertCircle } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function ParalegalDashboard() {
  const tasks = await getParalegalDashboardData();

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-50 text-red-700 ring-red-600/20';
      case 'high': return 'bg-amber-50 text-amber-700 ring-amber-600/20';
      case 'medium': return 'bg-blue-50 text-blue-700 ring-blue-600/20';
      default: return 'bg-slate-50 text-slate-700 ring-slate-600/20';
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50">
      {/* Header */}
      <div className="px-6 py-5 bg-white border-b border-slate-200">
        <h1 className="text-xl font-semibold text-slate-900">Execution Desk</h1>
        <p className="text-sm text-slate-500 mt-1">You have {tasks.length} active tasks in your queue.</p>
      </div>

      {/* Main Board */}
      <div className="flex-1 overflow-auto p-6">
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
                      <span className={`px-2 py-0.5 text-xs font-semibold uppercase tracking-wider rounded ring-1 ring-inset ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                      <span className="text-xs font-medium text-slate-500">
                        {task.case.case_code}
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
