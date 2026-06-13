"use client";

import { useState } from "react";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Briefcase, Calendar, Clock, FileText, Search, MoreHorizontal, CheckCircle2, AlertCircle } from "lucide-react";

// Mock data
type Case = {
  id: string;
  name: string;
  status: "Active" | "Pending" | "Closed";
  nextHearing: string;
  client: string;
  lastUpdated: string;
};

const caseColumns: ColumnDef<Case>[] = [
  {
    accessorKey: "name",
    header: "Case Name",
    cell: ({ row }) => <div className="font-medium text-gray-900">{row.getValue("name")}</div>,
  },
  {
    accessorKey: "client",
    header: "Client",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      return (
        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium
          ${status === 'Active' ? 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-700/10' : ''}
          ${status === 'Pending' ? 'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20' : ''}
          ${status === 'Closed' ? 'bg-gray-50 text-gray-600 ring-1 ring-inset ring-gray-500/10' : ''}
        `}>
          {status}
        </span>
      );
    },
  },
  {
    accessorKey: "nextHearing",
    header: "Next Hearing",
    cell: ({ row }) => <div className="text-gray-600">{row.getValue("nextHearing")}</div>,
  },
  {
    accessorKey: "lastUpdated",
    header: "Last Updated",
    cell: ({ row }) => <div className="text-gray-500">{row.getValue("lastUpdated")}</div>,
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

const mockCases: Case[] = [
  { id: "1", name: "Smith v. State", status: "Active", nextHearing: "Oct 24, 2026", client: "John Smith", lastUpdated: "2h ago" },
  { id: "2", name: "Estate of R. Davis", status: "Pending", nextHearing: "Nov 12, 2026", client: "Sarah Davis", lastUpdated: "1d ago" },
  { id: "3", name: "TechCorp Merger", status: "Active", nextHearing: "No date set", client: "TechCorp Inc.", lastUpdated: "5h ago" },
  { id: "4", name: "Doe Family Trust", status: "Closed", nextHearing: "-", client: "Jane Doe", lastUpdated: "1w ago" },
];

export default function LawyerDashboard() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="flex-1 flex flex-col h-full bg-white">
      {/* Header Area */}
      <div className="px-6 py-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/50 backdrop-blur-sm sticky top-0 z-20">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 tracking-tight">My Workspace</h1>
          <p className="text-sm text-gray-500 mt-0.5">Welcome back. You have 3 hearings this week.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search cases, documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-1.5 w-full sm:w-64 text-sm bg-gray-50 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-gray-400"
            />
          </div>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-md text-sm font-medium transition-colors shadow-sm">
            New Case
          </button>
        </div>
      </div>

      {/* Main Content Scrollable */}
      <div className="flex-1 overflow-auto p-6 space-y-6 bg-[#f8f9fa]">
        
        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Active Cases", value: "24", icon: Briefcase, color: "text-blue-600", bg: "bg-blue-50" },
            { label: "Pending Tasks", value: "12", icon: CheckCircle2, color: "text-amber-600", bg: "bg-amber-50" },
            { label: "Upcoming Hearings", value: "3", icon: Calendar, color: "text-purple-600", bg: "bg-purple-50" },
            { label: "Unread Documents", value: "8", icon: FileText, color: "text-emerald-600", bg: "bg-emerald-50" },
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
                <h2 className="text-base font-semibold text-gray-900">Recent Cases</h2>
                <button className="text-sm text-blue-600 font-medium hover:text-blue-700">View all</button>
              </div>
              <div className="p-0">
                <DataTable columns={caseColumns} data={mockCases} />
              </div>
            </div>
          </div>

          {/* Sidebar Area within content */}
          <div className="space-y-6">
            {/* Upcoming Schedule */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
              <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-400" /> Schedule
              </h2>
              <div className="space-y-4">
                {[
                  { time: "09:00 AM", title: "Client Call - Smith", type: "Call" },
                  { time: "11:30 AM", title: "Deposition Prep", type: "Meeting" },
                  { time: "02:00 PM", title: "Court Hearing - Davis", type: "Hearing" },
                ].map((item, i) => (
                  <div key={i} className="flex gap-3 items-start group">
                    <div className="w-16 text-xs font-medium text-gray-500 pt-0.5">{item.time}</div>
                    <div className="flex-1 bg-gray-50 group-hover:bg-blue-50/50 rounded-lg p-3 border border-gray-100 transition-colors">
                      <p className="text-sm font-medium text-gray-900">{item.title}</p>
                      <p className="text-xs text-gray-500 mt-1">{item.type}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions / Alerts */}
            <div className="bg-amber-50/50 rounded-xl border border-amber-200/60 p-5">
              <h2 className="text-base font-semibold text-amber-900 mb-3 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-amber-600" /> Needs Attention
              </h2>
              <ul className="space-y-2.5">
                <li className="flex items-start gap-2 text-sm text-amber-800">
                  <div className="mt-1 h-1.5 w-1.5 rounded-full bg-amber-500 flex-shrink-0" />
                  <span>Review settlement document for TechCorp Merger before EOD.</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-amber-800">
                  <div className="mt-1 h-1.5 w-1.5 rounded-full bg-amber-500 flex-shrink-0" />
                  <span>Signature required on Davis Estate filings.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
