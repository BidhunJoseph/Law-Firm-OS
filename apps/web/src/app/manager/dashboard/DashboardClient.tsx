"use client";

import React, { useState } from "react";
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
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { NewMatterDialog } from "./NewMatterDialog";

/** Utility for Tailwind class merging */
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type RiskLevel = "Green" | "Amber" | "Red" | "Critical";

export interface CaseSituationData {
  id: string;
  matterName: string;
  client: string;
  leadAttorney: string;
  riskLevel: RiskLevel;
  upcomingDeadline: string;
  budgetStatus: number; // Percentage
  lastUpdated: string;
}

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

const columnHelper = createColumnHelper<CaseSituationData>();

const columns = [
  columnHelper.accessor("id", {
    header: "Matter ID",
    cell: (info) => (
      <span className="font-mono text-xs text-gray-500 dark:text-gray-400">
        {info.getValue().split('-')[0] + "..."} {/* shorten uuid */}
      </span>
    ),
  }),
  columnHelper.accessor("matterName", {
    header: "Matter Name",
    cell: (info) => (
      <span className="font-medium text-gray-900">
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
    cell: (info) => {
      const val = info.getValue();
      if (val === 'Unassigned') {
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
            Unassigned
          </span>
        );
      }
      return <span className="text-gray-600 dark:text-gray-300 font-medium">{val}</span>;
    },
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
    cell: (info) => {
      const val = info.getValue();
      if (val === 'No upcoming deadline') {
        return <span className="text-gray-500 text-xs italic">{val}</span>;
      }
      return (
        <span className="text-gray-600 dark:text-gray-300 text-xs">
          {new Date(val).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </span>
      );
    },
  }),
  columnHelper.accessor("lastUpdated", {
    header: "Last Updated",
    cell: (info) => (
      <span className="text-gray-400 text-xs">
        {new Date(info.getValue()).toLocaleDateString("en-US")}
      </span>
    ),
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

interface DashboardClientProps {
  data: CaseSituationData[];
  clients: { id: string; name: string }[];
  lawyers: { id: string; name: string }[];
  paralegals: { id: string; name: string }[];
}

export function DashboardClient({ data, clients, lawyers, paralegals }: DashboardClientProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [isNewMatterOpen, setIsNewMatterOpen] = useState(searchParams.get("new") === "matter");

  // Keep dialog state in sync with URL
  React.useEffect(() => {
    if (searchParams.get("new") === "matter") {
      setIsNewMatterOpen(true);
    }
  }, [searchParams]);

  const handleOpenChange = (open: boolean) => {
    setIsNewMatterOpen(open);
    if (!open && searchParams.get("new") === "matter") {
      router.replace(pathname); // Clear query params when closing
    }
  };

  const table = useReactTable({
    data,
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
    <div className="min-h-full bg-[#fbfcfd] p-4 md:p-8 lg:p-10 font-sans">
      <div className="max-w-[1600px] mx-auto space-y-6">
        {/* Header Section */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">
              Manager Command Center
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              High-level overview of active matters, risks, and performance.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-full shadow-sm hover:bg-gray-50 hover:shadow-md transition-all active:scale-95 focus:outline-none focus:ring-2 focus:ring-gray-200">
              Export Report
            </button>
            <button 
              onClick={() => setIsNewMatterOpen(true)}
              className="px-5 py-2.5 text-sm font-medium text-white bg-black border border-transparent rounded-full shadow-md hover:bg-gray-900 hover:shadow-lg transition-all active:scale-95 focus:outline-none focus:ring-2 focus:ring-black/50"
            >
              New Matter
            </button>
          </div>
        </header>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-3xl bg-white border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)]">
          <div className="relative w-full sm:max-w-md group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-black transition-colors" />
            <input
              type="text"
              placeholder="Search matters, clients, or attorneys..."
              value={globalFilter ?? ""}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 text-sm text-gray-900 bg-gray-50 border-transparent rounded-full focus:bg-white focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-gray-200 transition-all placeholder:text-gray-400"
            />
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-gray-600 bg-gray-50 border-transparent rounded-full hover:bg-gray-100 transition-all hover:text-black active:scale-95">
              <SlidersHorizontal className="w-4 h-4" />
              Filters
            </button>
          </div>
        </div>

        {/* Case Situation Grid */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden transition-all duration-300">
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-white border-b border-gray-100">
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        className="px-6 py-4 font-semibold text-[13px] tracking-wide text-gray-400 uppercase"
                      >
                        {header.isPlaceholder ? null : (
                          <div
                            className={cn(
                              "flex items-center gap-1.5",
                              header.column.getCanSort()
                                ? "cursor-pointer select-none hover:text-gray-800 transition-colors"
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
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody className="divide-y divide-gray-50 bg-white">
                {table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    onClick={() => router.push(`/workspace/cases/${row.original.id}`)}
                    className="group hover:bg-gray-50/80 transition-all duration-200 cursor-pointer"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-6 py-4">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden divide-y divide-gray-50">
            {table.getRowModel().rows.map((row) => {
              const rData = row.original;
              return (
                <div key={row.id} onClick={() => router.push(`/workspace/cases/${row.original.id}`)} className="p-5 space-y-4 hover:bg-gray-50/80 transition-all duration-200 cursor-pointer active:bg-gray-100/50">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900">{rData.matterName}</h3>
                      <p className="text-xs text-gray-500 mt-1">{rData.client}</p>
                    </div>
                    <RiskBadge level={rData.riskLevel} />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-xs text-gray-400 font-medium mb-1">Lead Attorney</p>
                      <p className="text-gray-700 font-medium">{rData.leadAttorney}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 font-medium mb-1">Next Deadline</p>
                      <p className="text-gray-700">{rData.upcomingDeadline !== 'No upcoming deadline' ? new Date(rData.upcomingDeadline).toLocaleDateString() : 'None'}</p>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-medium mb-1.5">
                      <span className="text-gray-400">Budget</span>
                    </div>
                    <BudgetBar value={rData.budgetStatus} />
                  </div>
                </div>
              );
            })}
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
      
      <NewMatterDialog 
        isOpen={isNewMatterOpen} 
        setIsOpen={handleOpenChange} 
        clients={clients}
        lawyers={lawyers}
        paralegals={paralegals}
      />
    </div>
  );
}
