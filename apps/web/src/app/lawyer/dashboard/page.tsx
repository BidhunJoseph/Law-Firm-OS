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

  return (
    <div className="flex-1 flex flex-col h-full bg-white">
      {/* Header Area */}
      <div className="px-6 py-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/50 backdrop-blur-sm sticky top-0 z-20">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 tracking-tight">My Workspace</h1>
          <p className="text-sm text-gray-500 mt-0.5">Welcome back. You have {upcomingHearingsCount} upcoming hearings.</p>
        </div>
      </div>

      {/* Main Content Scrollable */}
      <div className="flex-1 overflow-auto p-6 space-y-6 bg-[#f8f9fa]">
        
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
