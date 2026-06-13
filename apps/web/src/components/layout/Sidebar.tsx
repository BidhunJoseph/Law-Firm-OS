"use client";

import { 
  FolderKanban, 
  Users, 
  FileText, 
  Calendar, 
  Clock, 
  Star, 
  Trash2, 
  Plus,
  Cloud,
  LayoutDashboard
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { icon: LayoutDashboard, label: "Workspace", href: "/workspace" },
    { icon: FolderKanban, label: "Matters", href: "/manager/court" },
    { icon: Users, label: "Clients", href: "/client/portal" },
    { icon: FileText, label: "Documents", href: "/client/documents" },
    { icon: Calendar, label: "Calendar", href: "#" },
  ];

  const secondaryItems = [
    { icon: Clock, label: "Recent" },
    { icon: Star, label: "Starred" },
    { icon: Trash2, label: "Trash" },
  ];

  return (
    <aside className="w-64 bg-[#f8f9fa] shrink-0 flex-col hidden lg:flex">
      <div className="px-4 py-3">
        <button className="flex items-center gap-3 bg-white hover:bg-blue-50 hover:text-blue-700 hover:shadow-md transition-all text-gray-700 border border-gray-200 shadow-sm rounded-2xl px-5 py-4 font-medium w-fit min-w-[140px]">
          <Plus className="h-6 w-6 text-blue-600" />
          <span className="text-[15px]">New</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
        <nav className="space-y-0.5">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "#" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-2 rounded-full transition-colors ${
                  isActive 
                    ? "bg-[#c2e7ff] text-[#001d35]" 
                    : "text-gray-700 hover:bg-black/5"
                }`}
              >
                <item.icon className={`h-[18px] w-[18px] ${isActive ? "text-[#001d35]" : "text-gray-600"}`} />
                <span className="font-medium text-[14px]">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="my-3 border-t border-gray-200 mx-4"></div>

        <nav className="space-y-0.5">
          {secondaryItems.map((item) => (
            <a
              key={item.label}
              href="#"
              className="flex items-center gap-3 px-4 py-2 rounded-full text-gray-700 hover:bg-black/5 transition-colors"
            >
              <item.icon className="h-[18px] w-[18px] text-gray-600" />
              <span className="font-medium text-[14px]">{item.label}</span>
            </a>
          ))}
        </nav>
      </div>

      <div className="p-4 mt-auto">
        <div className="flex items-center gap-3 px-4 py-2 text-gray-700">
          <Cloud className="h-[18px] w-[18px] text-gray-600 shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium">Storage</div>
            <div className="w-full bg-gray-200 rounded-full h-1 mt-2">
              <div className="bg-blue-600 h-1 rounded-full" style={{ width: '45%' }}></div>
            </div>
            <div className="text-[13px] text-gray-500 mt-1">45 GB of 100 GB used</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
