"use client";

import { useState } from "react";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Search, CheckSquare, Clock, FileText, AlertTriangle, MoreVertical, MessageSquare } from "lucide-react";

// Mock data
type Task = {
  id: string;
  title: string;
  caseName: string;
  priority: "High" | "Medium" | "Low";
  dueDate: string;
  status: "To Do" | "In Progress" | "In Review";
};

const taskColumns: ColumnDef<Task>[] = [
  {
    accessorKey: "title",
    header: "Task",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-600" />
        <span className="font-medium text-gray-900">{row.getValue("title")}</span>
      </div>
    ),
  },
  {
    accessorKey: "caseName",
    header: "Case",
    cell: ({ row }) => <span className="text-gray-600">{row.getValue("caseName")}</span>,
  },
  {
    accessorKey: "priority",
    header: "Priority",
    cell: ({ row }) => {
      const p = row.getValue("priority") as string;
      return (
        <span className={`inline-flex items-center gap-1.5 text-xs font-medium
          ${p === 'High' ? 'text-red-700' : ''}
          ${p === 'Medium' ? 'text-amber-700' : ''}
          ${p === 'Low' ? 'text-emerald-700' : ''}
        `}>
          {p === 'High' && <AlertTriangle className="h-3 w-3" />}
          {p}
        </span>
      );
    },
  },
  {
    accessorKey: "dueDate",
    header: "Due Date",
    cell: ({ row }) => <div className="text-gray-600 flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 text-gray-400" /> {row.getValue("dueDate")}</div>,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      return (
        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium
          ${status === 'To Do' ? 'bg-gray-100 text-gray-700' : ''}
          ${status === 'In Progress' ? 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-700/10' : ''}
          ${status === 'In Review' ? 'bg-purple-50 text-purple-700 ring-1 ring-inset ring-purple-600/20' : ''}
        `}>
          {status}
        </span>
      );
    },
  },
  {
    id: "actions",
    cell: () => (
      <button className="p-1 rounded-md hover:bg-gray-200/50 text-gray-400 hover:text-gray-600 transition-colors">
        <MoreVertical className="h-4 w-4" />
      </button>
    ),
  },
];

const mockTasks: Task[] = [
  { id: "1", title: "Draft initial discovery requests", caseName: "Smith v. State", priority: "High", dueDate: "Today", status: "In Progress" },
  { id: "2", title: "Review medical records", caseName: "Estate of R. Davis", priority: "Medium", dueDate: "Tomorrow", status: "To Do" },
  { id: "3", title: "File motion for extension", caseName: "TechCorp Merger", priority: "High", dueDate: "Oct 24", status: "In Review" },
  { id: "4", title: "Compile exhibit list", caseName: "Smith v. State", priority: "Low", dueDate: "Oct 28", status: "To Do" },
];

export default function ParalegalDashboard() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="flex-1 flex flex-col h-full bg-white">
      {/* Header Area */}
      <div className="px-6 py-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/50 backdrop-blur-sm sticky top-0 z-20">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 tracking-tight">Task Center</h1>
          <p className="text-sm text-gray-500 mt-0.5">You have 12 tasks pending. 2 due today.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Filter tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-1.5 w-full sm:w-64 text-sm bg-gray-50 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-gray-400"
            />
          </div>
          <button className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-1.5 rounded-md text-sm font-medium transition-colors shadow-sm">
            Quick Add
          </button>
        </div>
      </div>

      {/* Main Content Scrollable */}
      <div className="flex-1 overflow-auto p-6 space-y-6 bg-[#f8f9fa]">
        
        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "My Tasks", value: "12", icon: CheckSquare, color: "text-blue-600", bg: "bg-blue-50" },
            { label: "Due Today", value: "2", icon: Clock, color: "text-red-600", bg: "bg-red-50" },
            { label: "Docs to Review", value: "45", icon: FileText, color: "text-amber-600", bg: "bg-amber-50" },
            { label: "Messages", value: "5", icon: MessageSquare, color: "text-purple-600", bg: "bg-purple-50" },
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
          {/* Tasks Table Area */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-base font-semibold text-gray-900">Priority Tasks</h2>
                <div className="flex gap-2">
                  <button className="text-sm text-gray-500 font-medium hover:text-gray-900 px-2 py-1 rounded hover:bg-gray-100 transition-colors">Active</button>
                  <button className="text-sm text-gray-500 font-medium hover:text-gray-900 px-2 py-1 rounded hover:bg-gray-100 transition-colors">Completed</button>
                </div>
              </div>
              <div className="p-0">
                <DataTable columns={taskColumns} data={mockTasks} />
              </div>
            </div>
          </div>

          {/* Sidebar Area within content */}
          <div className="space-y-6">
            {/* Recent Documents */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
              <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FileText className="h-4 w-4 text-gray-400" /> Recent Documents
              </h2>
              <div className="space-y-3">
                {[
                  { name: "Discovery_Request_v2.docx", case: "Smith v. State", date: "10 mins ago" },
                  { name: "Medical_Records_Batch_1.pdf", case: "Estate of R. Davis", date: "2 hours ago" },
                  { name: "Motion_Extension_Draft.pdf", case: "TechCorp Merger", date: "Yesterday" },
                ].map((doc, i) => (
                  <div key={i} className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50 group cursor-pointer transition-colors border border-transparent hover:border-gray-100">
                    <div className="p-2 bg-gray-100 rounded text-gray-500 group-hover:text-blue-600 transition-colors">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 truncate w-48">{doc.name}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{doc.case} • {doc.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Links / Notes */}
            <div className="bg-blue-50/50 rounded-xl border border-blue-100 p-5">
              <h2 className="text-base font-semibold text-blue-900 mb-3">Workspace Notes</h2>
              <textarea 
                className="w-full h-32 bg-white border border-blue-200/60 rounded-lg p-3 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none"
                placeholder="Jot down quick thoughts or reminders here..."
                defaultValue="Need to call court clerk regarding Davis case scheduling by 3PM."
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
