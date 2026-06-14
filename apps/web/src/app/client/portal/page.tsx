import { getClientDashboardData } from "@/server/actions/dashboard-actions";
import { FileText, Calendar, Clock } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function ClientPortal() {
  const cases = await getClientDashboardData();

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50">
      <div className="px-6 py-8 bg-slate-900 text-white">
        <h1 className="text-2xl font-medium tracking-tight">Client Portal</h1>
        <p className="text-slate-400 mt-2">Welcome. Here is the latest on your active matters.</p>
      </div>

      <div className="flex-1 p-6 overflow-auto space-y-8">
        {cases.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-500">You currently have no active cases.</p>
          </div>
        ) : cases.map((c) => (
          <div key={c.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <div className="text-sm font-medium text-blue-600 mb-1">{c.case_code}</div>
                <h2 className="text-lg font-semibold text-slate-900">{c.title}</h2>
              </div>
              <span className="px-3 py-1 bg-green-50 text-green-700 text-sm font-medium rounded-full ring-1 ring-inset ring-green-600/20">
                {c.status.toUpperCase()}
              </span>
            </div>
            
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Timeline */}
              <div>
                <h3 className="text-sm font-medium text-slate-900 flex items-center gap-2 mb-4">
                  <Clock className="h-4 w-4 text-slate-400" /> Recent Updates
                </h3>
                <div className="space-y-4">
                  {c.timeline_events.length === 0 ? (
                    <p className="text-sm text-slate-500">No recent updates.</p>
                  ) : c.timeline_events.map(event => (
                    <div key={event.id} className="pl-4 border-l-2 border-slate-200 relative">
                      <div className="absolute -left-[5px] top-1.5 h-2 w-2 rounded-full bg-blue-500 ring-4 ring-white" />
                      <p className="text-xs font-medium text-slate-500">{new Date(event.event_date).toLocaleDateString()}</p>
                      <p className="text-sm font-medium text-slate-900 mt-1">{event.title}</p>
                      {event.description && <p className="text-sm text-slate-600 mt-1">{event.description}</p>}
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Required */}
              <div>
                <h3 className="text-sm font-medium text-slate-900 flex items-center gap-2 mb-4">
                  <FileText className="h-4 w-4 text-slate-400" /> Action Required
                </h3>
                {c.document_requests.length === 0 ? (
                  <div className="bg-slate-50 rounded-lg p-4 text-center border border-slate-100">
                    <p className="text-sm text-slate-600">You are all caught up! No documents requested.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {c.document_requests.map(req => (
                      <div key={req.id} className="bg-blue-50/50 rounded-lg p-4 border border-blue-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-medium text-slate-900">{req.title}</p>
                          <p className="text-xs text-slate-600 mt-0.5">{req.description}</p>
                        </div>
                        <button className="whitespace-nowrap px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-md transition-colors shadow-sm">
                          Upload File
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 text-xs text-slate-500">
              Lead Counsel: {c.lawyer.name} ({c.lawyer.email})
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
