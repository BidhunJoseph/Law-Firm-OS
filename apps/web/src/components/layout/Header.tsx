import { Search, Settings, HelpCircle, Menu } from "lucide-react";
import { UserNavDropdown } from "./UserNavDropdown";

export function Header({ userRole, onMenuClick }: { userRole?: string | null, onMenuClick?: () => void }) {
  return (
    <header className="flex h-16 items-center justify-between px-4 lg:px-6 bg-[#f8f9fa] shrink-0 border-b border-transparent sm:border-b-0">
      <div className="flex items-center gap-4 w-64 shrink-0">
        <button onClick={onMenuClick} className="p-2 hover:bg-black/5 rounded-full transition-colors lg:hidden">
          <Menu className="h-5 w-5 text-gray-600" />
        </button>
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 text-white p-1.5 rounded-lg flex items-center justify-center shadow-sm">
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"
              />
            </svg>
          </div>
          <span className="text-[19px] font-semibold text-slate-800 tracking-tight">Law Firm OS</span>
        </div>
      </div>

      <div className="flex-1 max-w-[720px] px-4 justify-center hidden md:flex">
        <div className="flex items-center w-full bg-[#edf2fc] hover:bg-[#e1e6f0] transition-colors rounded-full px-4 py-2.5 focus-within:bg-white focus-within:shadow-md focus-within:ring-1 focus-within:ring-blue-100 group">
          <Search className="h-5 w-5 text-gray-500 mr-3 shrink-0 group-focus-within:text-blue-600 transition-colors" />
          <input
            type="text"
            placeholder="Search cases, documents, or clients..."
            className="w-full bg-transparent border-none outline-none text-gray-800 placeholder-gray-500 text-[15px]"
          />
        </div>
      </div>

      <div className="flex items-center justify-end gap-1.5 shrink-0 min-w-[200px]">
        <button className="p-2 hover:bg-black/5 rounded-full transition-colors hidden sm:block text-gray-600 hover:text-gray-900">
          <HelpCircle className="h-5 w-5" />
        </button>
        <button className="p-2 hover:bg-black/5 rounded-full transition-colors hidden sm:block text-gray-600 hover:text-gray-900">
          <Settings className="h-5 w-5" />
        </button>
        <button className="p-2 hover:bg-black/5 rounded-full transition-colors md:hidden text-gray-600 hover:text-gray-900">
          <Search className="h-5 w-5" />
        </button>
        <div className="mx-2 h-8 w-[1px] bg-gray-200 hidden sm:block"></div>
        <UserNavDropdown userRole={userRole} />
      </div>
    </header>
  );
}
