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
import { ArrowUpDown, Search, User, Briefcase, Mail, Phone, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";

export type ClientData = {
  id: string;
  name: string;
  email: string;
  phone: string;
  activeMatters: number;
  joinedDate: string;
};

const columnHelper = createColumnHelper<ClientData>();

const columns = [
  columnHelper.accessor("name", {
    header: ({ column }) => (
      <div 
        className="flex items-center gap-2 cursor-pointer hover:text-gray-900 group"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Client Name
        <ArrowUpDown className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    ),
    cell: (info) => (
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center border border-blue-200/50">
          <User className="w-4 h-4 text-blue-600" />
        </div>
        <span className="font-semibold text-gray-900">{info.getValue()}</span>
      </div>
    ),
  }),
  columnHelper.accessor("email", {
    header: "Email",
    cell: (info) => (
      <div className="flex items-center gap-2 text-gray-600">
        <Mail className="w-3.5 h-3.5 opacity-70" />
        {info.getValue()}
      </div>
    ),
  }),
  columnHelper.accessor("phone", {
    header: "Phone",
    cell: (info) => (
      <div className="flex items-center gap-2 text-gray-600">
        <Phone className="w-3.5 h-3.5 opacity-70" />
        {info.getValue()}
      </div>
    ),
  }),
  columnHelper.accessor("activeMatters", {
    header: "Active Matters",
    cell: (info) => (
      <div className="flex items-center gap-2">
        <div className={`px-2.5 py-1 rounded-md text-xs font-semibold ${info.getValue() > 0 ? "bg-blue-50 text-blue-700 border border-blue-200/50" : "bg-gray-100 text-gray-600 border border-gray-200/50"}`}>
          {info.getValue()} {info.getValue() === 1 ? 'Matter' : 'Matters'}
        </div>
      </div>
    ),
  }),
  columnHelper.accessor("joinedDate", {
    header: "Client Since",
    cell: (info) => (
      <span className="text-gray-500 text-sm">
        {new Date(info.getValue()).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
      </span>
    ),
  }),
  columnHelper.display({
    id: "actions",
    cell: () => (
      <div className="flex items-center justify-end text-gray-400">
        <ChevronRight className="w-4 h-4 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
      </div>
    ),
  }),
];

interface Props {
  data: ClientData[];
}

export function ClientDirectoryClient({ data }: Props) {
  const router = useRouter();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

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
              Client Directory
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Manage client relationships, contact details, and their associated legal matters.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                value={globalFilter ?? ""}
                onChange={(e) => setGlobalFilter(e.target.value)}
                placeholder="Search clients..."
                className="pl-9 pr-4 py-2.5 text-sm w-64 bg-white border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-gray-300 transition-all shadow-sm"
              />
            </div>
          </div>
        </header>

        {/* Data Grid */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/40 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id} className="border-b border-gray-100 bg-gray-50/50">
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider"
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody className="divide-y divide-gray-100/80">
                {table.getRowModel().rows.map((row) => (
                  <tr 
                    key={row.id} 
                    className="group hover:bg-gray-50/80 transition-colors cursor-pointer"
                    onClick={() => router.push(`/manager/clients/${row.original.id}`)}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-6 py-4 text-sm text-gray-600">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
                {table.getRowModel().rows.length === 0 && (
                  <tr>
                    <td colSpan={columns.length} className="px-6 py-12 text-center text-gray-500">
                      No clients found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
