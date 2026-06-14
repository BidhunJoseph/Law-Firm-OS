"use client";

import React, { useMemo, useState } from "react";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  MoreHorizontal,
  Search,
  SlidersHorizontal,
} from "lucide-react";

/** Utility for Tailwind class merging */
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Types & Mock Data ---

type RiskLevel = "Green" | "Amber" | "Red" | "Critical";

interface CaseSituation {
  id: string;
  matterName: string;
  client: string;
  leadAttorney: string;
  riskLevel: RiskLevel;
  upcomingDeadline: string;
  budgetStatus: number; // Percentage
  lastUpdated: string;
}

const MOCK_DATA: CaseSituation[] = [
  {
    id: "MAT-2024-001",
    matterName: "Acquisition of TechCorp",
    client: "Global Enterprises Inc.",
    leadAttorney: "Sarah Jenkins",
    riskLevel: "Green",
    upcomingDeadline: "2024-06-20",
    budgetStatus: 45,
    lastUpdated: "2 hours ago",
  },
  {
    id: "MAT-2024-002",
    matterName: "Smith v. Johnson Industries",
    client: "Johnson Industries",
    leadAttorney: "David Chen",
    riskLevel: "Amber",
    upcomingDeadline: "2024-06-15",
    budgetStatus: 85,
    lastUpdated: "5 hours ago",
  },
  {
    id: "MAT-2024-003",
    matterName: "Project Phoenix Restructuring",
    client: "Phoenix Retail Group",
    leadAttorney: "Elena Rodriguez",
    riskLevel: "Red",
    upcomingDeadline: "2024-06-14",
    budgetStatus: 110,
    lastUpdated: "1 hour ago",
  },
  {
    id: "MAT-2024-004",
    matterName: "Estate Planning - Williams",
    client: "Arthur Williams",
    leadAttorney: "Michael Chang",
    riskLevel: "Green",
    upcomingDeadline: "2024-07-01",
    budgetStatus: 20,
    lastUpdated: "1 day ago",
  },
  {
    id: "MAT-2024-005",
    matterName: "Intellectual Property Dispute",
    client: "Innovate LLC",
    leadAttorney: "Sarah Jenkins",
    riskLevel: "Critical",
    upcomingDeadline: "2024-06-13",
    budgetStatus: 95,
    lastUpdated: "15 mins ago",
  },
  {
    id: "MAT-2024-006",
    matterName: "Series C Funding Round",
    client: "NextGen Startups",
    leadAttorney: "David Chen",
    riskLevel: "Amber",
    upcomingDeadline: "2024-06-25",
    budgetStatus: 70,
    lastUpdated: "3 hours ago",
  },
];

// --- Components ---

function RiskBadge({ level }: { level: RiskLevel }) {
  const styles = {
    Green: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
    Amber: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
    Red: "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20",
    Critical: "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20 animate-pulse",
  };

  const icons = {
    Green: <CheckCircle2 className="w-3 h-3 mr-1.5" />,
    Amber: <AlertTriangle className="w-3 h-3 mr-1.5" />,
    Red: <AlertCircle className="w-3 h-3 mr-1.5" />,
    Critical: <Clock className="w-3 h-3 mr-1.5" />,
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border",
        "shadow-sm backdrop-blur-sm",
        styles[level]
      )}
    >
      {icons[level]}
      {level}
    </span>
  );
}

function BudgetBar({ value }: { value: number }) {
  const isOverBudget = value > 100;
  const isWarning = value > 80 && !isOverBudget;

  const barColor = isOverBudget
    ? "bg-rose-500"
    : isWarning
    ? "bg-amber-500"
    : "bg-emerald-500";

  return (
    <div className="flex items-center gap-2">
      <div className="w-24 h-1.5 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all duration-500", barColor)}
          style={{ width: `${Math.min(value, 100)}%` }}
        />
      </div>
      <span
        className={cn(
          "text-xs font-medium w-9 text-right",
          isOverBudget ? "text-rose-600 dark:text-rose-400" : "text-gray-600 dark:text-gray-400"
        )}
      >
        {value}%
      </span>
    </div>
  );
}

const columnHelper = createColumnHelper<CaseSituation>();

const columns = [
  columnHelper.accessor("id", {
    header: "Matter ID",
    cell: (info) => (
      <span className="font-mono text-xs text-gray-500 dark:text-gray-400">
        {info.getValue()}
      </span>
    ),
  }),
  columnHelper.accessor("matterName", {
    header: "Matter Name",
    cell: (info) => (
      <span className="font-medium text-gray-900 dark:text-gray-100">
        {info.getValue()}
      </span>
    ),
  }),
  columnHelper.accessor("client", {
    header: "Client",
    cell: (info) => <span className="text-gray-600 dark:text-gray-300">{info.getValue()}</span>,
  }),
  columnHelper.accessor("leadAttorney", {
    header: "Lead Attorney",
    cell: (info) => <span className="text-gray-600 dark:text-gray-300">{info.getValue()}</span>,
  }),
  columnHelper.accessor("riskLevel", {
    header: "Risk Status",
    cell: (info) => <RiskBadge level={info.getValue()} />,
  }),
  columnHelper.accessor("budgetStatus", {
    header: "Budget",
    cell: (info) => <BudgetBar value={info.getValue()} />,
  }),
  columnHelper.accessor("upcomingDeadline", {
    header: "Next Deadline",
    cell: (info) => (
      <span className="text-gray-600 dark:text-gray-300 text-xs">
        {new Date(info.getValue()).toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
          year: "numeric",
        })}
      </span>
    ),
  }),
  columnHelper.accessor("lastUpdated", {
    header: "Last Updated",
    cell: (info) => <span className="text-gray-400 text-xs">{info.getValue()}</span>,
  }),
  columnHelper.display({
    id: "actions",
    cell: () => (
      <button className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
        <MoreHorizontal className="w-4 h-4" />
      </button>
    ),
  }),
];

export default function ManagerDashboard() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  const table = useReactTable({
    data: MOCK_DATA,
    columns,
    state: {
      sorting,
      globalFilter,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="min-h-full bg-[#f8f9fa] dark:bg-neutral-950 p-4 md:p-6 lg:p-8 font-sans">
      <div className="max-w-[1600px] mx-auto space-y-6">
        {/* Header Section */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 tracking-tight">
              Manager Command Center
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              High-level overview of active matters, risks, and performance.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 dark:bg-neutral-900 dark:border-neutral-800 dark:text-gray-300 dark:hover:bg-neutral-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/20">
              Export Report
            </button>
            <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg shadow-sm hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/50">
              New Matter
            </button>
          </div>
        </header>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-3 rounded-xl bg-white/60 dark:bg-neutral-900/60 backdrop-blur-xl border border-gray-200/50 dark:border-neutral-800/50 shadow-sm">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search matters, clients, or attorneys..."
              value={globalFilter ?? ""}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-white dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-gray-400"
            />
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 bg-white dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 rounded-lg hover:bg-gray-50 dark:hover:bg-neutral-900 transition-colors">
              <SlidersHorizontal className="w-4 h-4" />
              Filters
            </button>
          </div>
        </div>

        {/* Case Situation Grid */}
        <div className="bg-white dark:bg-neutral-900 rounded-xl border border-gray-200 dark:border-neutral-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-gray-50/50 dark:bg-neutral-950/50 border-b border-gray-200 dark:border-neutral-800">
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      return (
                        <th
                          key={header.id}
                          className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400"
                        >
                          {header.isPlaceholder ? null : (
                            <div
                              className={cn(
                                "flex items-center gap-1",
                                header.column.getCanSort()
                                  ? "cursor-pointer select-none hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                                  : ""
                              )}
                              onClick={header.column.getToggleSortingHandler()}
                            >
                              {flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                              {{
                                asc: <ChevronUp className="w-3.5 h-3.5" />,
                                desc: <ChevronDown className="w-3.5 h-3.5" />,
                              }[header.column.getIsSorted() as string] ?? null}
                            </div>
                          )}
                        </th>
                      );
                    })}
                  </tr>
                ))}
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-neutral-800">
                {table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="group hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-colors"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-4 py-2.5">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {table.getRowModel().rows.length === 0 && (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              No matters found matching your criteria.
            </div>
          )}
          {/* Table Footer / Pagination */}
          <div className="px-4 py-3 border-t border-gray-200 dark:border-neutral-800 bg-gray-50/30 dark:bg-neutral-950/30 flex items-center justify-between">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Showing {table.getRowModel().rows.length} matters
            </span>
            <div className="flex gap-1">
              {/* Pagination would go here */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
