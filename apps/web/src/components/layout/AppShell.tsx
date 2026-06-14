"use client";

import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { usePathname } from "next/navigation";
import { useState } from "react";

export function AppShell({ children, userRole }: { children: React.ReactNode, userRole?: string | null }) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  if (pathname === '/' || pathname === '/login') {
    return <>{children}</>;
  }

  return (
    <div className="flex flex-col h-screen w-full bg-[#f8f9fa] overflow-hidden text-sm relative">
      <Header userRole={userRole} onMenuClick={() => setIsMobileMenuOpen(true)} />
      <div className="flex flex-1 overflow-hidden relative">
        <Sidebar userRole={userRole} isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
        <main className="flex-1 overflow-auto bg-white sm:rounded-tl-2xl sm:border sm:border-gray-200 shadow-sm sm:mr-3 sm:mb-3 p-4 md:p-6 ring-1 ring-black/5 relative z-0">
          {children}
        </main>
      </div>
    </div>
  );
}
