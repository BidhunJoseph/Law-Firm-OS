import { getLawyerDashboardData } from "@/server/actions/dashboard-actions";
import { DataTable } from "@/components/ui/data-table";
import { Briefcase, Calendar, CheckCircle2, FileText, Search, MoreHorizontal, AlertCircle } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function LawyerDashboard() {
  const cases = await getLawyerDashboardData();

  const caseColumns = [
    {
      accessorKey: "title",
      header: "Case Name",
      cell: ({ row }: any) => <div className="font-medium text-gray-900">{row.original.title}</div>,
    },
    {
      accessorKey: "client",
      header: "Client",
      cell: ({ row }: any) => <div>{row.original.client.name}</div>,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }: any) => {
        const status = row.original.status;
        return (
          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-700/10`}>
            {status}
          </span>
        );
      },
    },
    {
      accessorKey: "nextHearing",
      header: "Next Hearing",
      cell: ({ row }: any) => {
        const events = row.original.court_events;
        return <div className="text-gray-600">{events.length > 0 ? new Date(events[0].event_date).toLocaleDateString() : 'No date set'}</div>;
      },
    },
    {
      id: "actions",
      cell: () => (
        <button className="p-1 rounded-md hover:bg-gray-200/50 text-gray-400 hover:text-gray-600 transition-colors">
          <MoreHorizontal className="h-4 w-4" />
        </button>
      ),
    },
  ];

  let pendingTasksCount = 0;
  let upcomingHearingsCount = 0;
  
  cases.forEach(c => {
    pendingTasksCount += c.tasks.length;
    upcomingHearingsCount += c.court_events.length;
  });

  const actionRequiredPhases = [
    "2. Onboarding & Doc Collection",
    "3. Strategy & Drafting",
    "4. Client Review",
    "6. Hearings & Proceedings",
    "7. Judgment & Execution"
  ];

  const actionRequiredCases = cases.filter(c => actionRequiredPhases.includes(c.current_phase));

  return (
    <div className="flex-1 flex flex-col h-full bg-[#fbfcfd]">
      <header className="bg-white/80 backdrop-blur-xl border-b border-gray-100 px-6 py-5 sticky top-0 z-30 flex items-center justify-between shadow-[0_2px_10px_rgb(0,0,0,0.02)]">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Attorney Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your active matters, court dates, and tasks.</p>
        </div>
      </header>

      {/* Main Content Scrollable */}
      <div className="flex-1 overflow-auto p-6 space-y-6 bg-[#f8f9fa]">
        
        {/* Action Required Swimlane */}
        {actionRequiredCases.length > 0 && (
          <div className="mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-500" /> Action Required (Your Phase)
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
      {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Active Cases", value: cases.length.toString(), icon: Briefcase, color: "text-blue-600", bg: "bg-blue-50" },
            { label: "Pending Tasks", value: pendingTasksCount.toString(), icon: CheckCircle2, color: "text-amber-600", bg: "bg-amber-50" },
            { label: "Upcoming Hearings", value: upcomingHearingsCount.toString(), icon: Calendar, color: "text-purple-600", bg: "bg-purple-50" },
            { label: "Unread Documents", value: "0", icon: FileText, color: "text-emerald-600", bg: "bg-emerald-50" },
          ].map((stat, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm flex items-center gap-4">
              <div className={`p-3 rounded-lg ${stat.bg}`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                <p className="text-2xl font-semibold text-gray-900 mt-0.5">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Table Area */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-base font-semibold text-gray-900">Your Assigned Cases</h2>
              </div>
              <div className="p-0">
                <DataTable columns={caseColumns} data={cases as any} />
              </div>
            </div>
          </div>

          {/* Sidebar Area within content */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
              <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-400" /> Upcoming Hearings
              </h2>
              <div className="space-y-4">
                {cases.flatMap(c => c.court_events).map((event, i) => (
                  <div key={i} className="flex gap-3 items-start group">
                    <div className="w-16 text-xs font-medium text-gray-500 pt-0.5">{new Date(event.event_date).toLocaleDateString()}</div>
                    <div className="flex-1 bg-gray-50 group-hover:bg-blue-50/50 rounded-lg p-3 border border-gray-100 transition-colors">
                      <p className="text-sm font-medium text-gray-900">{event.title}</p>
                      <p className="text-xs text-gray-500 mt-1">{event.event_type}</p>
                    </div>
                  </div>
                ))}
                {cases.flatMap(c => c.court_events).length === 0 && (
                   <p className="text-sm text-gray-500">No upcoming hearings scheduled.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
