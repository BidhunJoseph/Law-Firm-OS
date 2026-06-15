import { getClientDashboardData } from "@/server/actions/dashboard-actions";
import { FileText, Calendar, Clock, BellRing, ChevronRight, UploadCloud, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export const dynamic = 'force-dynamic';

export default async function ClientPortal() {
  const cases = await getClientDashboardData();

  return (
    <div className="flex-1 flex flex-col h-full bg-[#fcfdfd] font-sans">
      <div className="px-8 py-10 bg-gradient-to-br from-[#001d35] to-[#012a4a] text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="relative z-10">
          <h1 className="text-3xl font-extrabold tracking-tight">Your Legal Hub</h1>
          <p className="text-blue-100 mt-2 font-medium max-w-xl">Welcome back. Stay up to date with your active matters, recent case developments, and required actions securely.</p>
        </div>
      </div>

      <div className="flex-1 p-6 md:p-10 overflow-auto space-y-10">
        {cases.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm">
            <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">No Active Matters</h2>
            <p className="text-slate-500 mt-2">You currently have no active legal matters with our firm.</p>
          </div>
        ) : cases.map((c) => {
          const requiresAction = c.current_phase === "2. Onboarding & Doc Collection" || c.next_action?.toLowerCase().includes("upload");
          
          return (
            <div key={c.id} className="bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-slate-100/60 overflow-hidden transition-all duration-500 hover:shadow-[0_15px_40px_rgb(0,0,0,0.08)]">
              
              {/* Card Header */}
              <div className="px-8 py-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-50/50">
                <div>
                  <div className="text-xs font-bold tracking-wider text-blue-600 uppercase mb-1.5 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                    Matter #{c.id.substring(0, 8)}
                  </div>
                  <h2 className="text-2xl font-extrabold text-slate-900">{c.title}</h2>
                </div>
                <div className="px-4 py-1.5 bg-emerald-50 text-emerald-700 text-sm font-bold uppercase tracking-wide rounded-full ring-1 ring-inset ring-emerald-600/20">
                  {c.current_phase?.split('. ')[1] || c.status}
                </div>
              </div>
              
              <div className="p-8 grid grid-cols-1 lg:grid-cols-2 gap-10">
                
                {/* Timeline Section */}
                <div>
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest flex items-center gap-2 mb-6">
                    <Clock className="h-4 w-4 text-slate-400" /> Case Progress
                  </h3>
                  <div className="space-y-6">
                    {c.timeline_events.length === 0 ? (
                      <p className="text-sm text-slate-500 bg-slate-50 p-4 rounded-2xl border border-slate-100">No timeline events yet.</p>
                    ) : c.timeline_events.map((event, idx) => (
                      <div key={event.id} className="relative pl-6">
                        {idx !== c.timeline_events.length - 1 && (
                          <div className="absolute left-[7px] top-4 bottom-[-24px] w-0.5 bg-slate-100" />
                        )}
                        <div className="absolute left-0 top-1.5 h-4 w-4 rounded-full bg-blue-100 border-2 border-white flex items-center justify-center">
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                        </div>
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{new Date(event.event_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric'})}</p>
                        <p className="text-sm font-bold text-slate-900 mt-1">{event.title}</p>
                        {event.description && <p className="text-sm text-slate-600 mt-1 leading-relaxed">{event.description}</p>}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Status & Action Section */}
                <div className="space-y-6">
                  
                  {requiresAction && (
                    <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/60 rounded-3xl p-6 shadow-sm relative overflow-hidden animate-in zoom-in-95 duration-500">
                      <div className="absolute top-0 right-0 p-4 opacity-10">
                        <BellRing className="w-24 h-24 text-amber-500" />
                      </div>
                      <div className="relative z-10">
                        <div className="flex items-center gap-2 text-amber-600 mb-2">
                          <BellRing className="w-5 h-5 animate-bounce" />
                          <span className="font-bold uppercase tracking-wider text-xs">Action Required</span>
                        </div>
                        <h4 className="text-lg font-extrabold text-slate-900 mb-2">Missing Documentation</h4>
                        <p className="text-sm text-amber-900/80 mb-6 font-medium">Please securely upload the required documents to advance your case.</p>
                        <Link href="/client/documents" className="inline-flex items-center justify-center w-full sm:w-auto bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-md hover:shadow-lg focus:ring-4 focus:ring-amber-500/20 gap-2">
                          <UploadCloud className="w-5 h-5" /> Go to Vault
                        </Link>
                      </div>
                    </div>
                  )}

                  {!requiresAction && (
                    <div className="bg-slate-50 border border-slate-100 rounded-3xl p-6 flex flex-col items-center justify-center text-center">
                      <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-3">
                        <CheckCircle2 className="w-6 h-6" />
                      </div>
                      <h4 className="font-bold text-slate-900">All set for now</h4>
                      <p className="text-sm text-slate-500 mt-1 font-medium">Your legal team is actively working on this matter. We will notify you if anything is needed.</p>
                    </div>
                  )}

                  {/* Upcoming Court Dates Widget */}
                  {c.court_events && c.court_events.length > 0 && (
                    <div className="border border-slate-100 rounded-3xl p-6">
                      <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest flex items-center gap-2 mb-4">
                        <Calendar className="h-4 w-4 text-slate-400" /> Upcoming Court Dates
                      </h3>
                      <div className="space-y-3">
                        {c.court_events.map(event => (
                          <div key={event.id} className="flex items-center justify-between bg-slate-50 p-4 rounded-2xl">
                            <div>
                              <p className="font-bold text-slate-900">{event.title}</p>
                              <p className="text-xs text-slate-500 font-medium mt-0.5">{event.event_type}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-bold text-blue-600">{new Date(event.event_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
