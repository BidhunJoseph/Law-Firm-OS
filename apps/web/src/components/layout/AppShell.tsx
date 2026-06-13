import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col h-screen w-full bg-[#f8f9fa] overflow-hidden text-sm">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-auto bg-white sm:rounded-tl-2xl sm:border sm:border-gray-200 shadow-sm sm:mr-3 sm:mb-3 p-4 md:p-6 ring-1 ring-black/5">
          {children}
        </main>
      </div>
    </div>
  );
}
