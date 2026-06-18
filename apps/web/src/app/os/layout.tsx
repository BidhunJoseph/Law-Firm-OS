import { ReactNode } from "react";
import Link from "next/link";
import { Shield, LayoutDashboard, Users, FileText, Calendar, Settings, LogOut, Briefcase, Archive } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { logoutUser } from "@/server/actions/auth-login-actions";

export default async function OSLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="flex h-screen w-full bg-[#FBFBFD] font-sans overflow-hidden">
      
      {/* Sidebar Navigation */}
      <aside className="w-64 border-r border-black/[0.04] bg-[#FBFBFD] flex flex-col shrink-0 z-10 shadow-[4px_0_24px_rgba(0,0,0,0.01)] relative">
        <div className="p-6">
          <Link href="/os/dashboard" className="flex items-center gap-3">
             <div className="h-10 w-10 bg-neutral-900 rounded-xl flex items-center justify-center shadow-md">
                <Shield className="h-5 w-5 text-white" />
             </div>
             <div>
               <h1 className="text-base font-bold tracking-tight text-[#1D1D1F] leading-tight">Firm OS</h1>
               <p className="text-[10px] font-medium text-[#86868B] uppercase tracking-widest">Manager</p>
             </div>
          </Link>
        </div>

        <nav className="flex-1 px-4 space-y-1.5 mt-4">
           {[
             { label: "Execution Hub", icon: LayoutDashboard, href: "/os/dashboard", active: true },
             { label: "Client Hub", icon: Briefcase, href: "/os/clients", active: false },
             { label: "Team Roster", icon: Users, href: "/os/team", active: false },
             { label: "Document Vault", icon: FileText, href: "/os/documents", active: false },
             { label: "Court Calendar", icon: Calendar, href: "/os/calendar", active: false },
             { label: "Case History", icon: Archive, href: "/os/history", active: false }
           ].map(item => (
             <Link 
               key={item.label}
               href={item.href}
               className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)] group ${
                 item.active 
                  ? "bg-neutral-900 text-white shadow-md shadow-neutral-900/10" 
                  : "text-[#86868B] hover:bg-black/[0.03] hover:text-[#1D1D1F]"
               }`}
             >
               <item.icon className={`w-5 h-5 ${item.active ? "text-white/90" : "text-[#86868B] group-hover:text-[#1D1D1F] transition-colors"}`} />
               <span className="text-sm font-medium">{item.label}</span>
             </Link>
           ))}
        </nav>

        <div className="p-4 border-t border-black/[0.04] m-4 rounded-2xl bg-white/50 backdrop-blur-md shadow-sm border border-white/60">
           <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                 <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">
                    {user?.email?.charAt(0).toUpperCase() || 'M'}
                 </div>
                 <div className="truncate">
                    <p className="text-xs font-semibold text-[#1D1D1F] truncate max-w-[100px]">{user?.email}</p>
                 </div>
              </div>
              <form action={logoutUser}>
                 <button className="p-1.5 text-[#86868B] hover:text-[#1D1D1F] hover:bg-black/[0.05] rounded-md transition-all">
                    <LogOut className="w-4 h-4" />
                 </button>
              </form>
           </div>
        </div>
      </aside>

      {/* Main Content Canvas */}
      <main className="flex-1 relative overflow-hidden flex flex-col bg-[#FBFBFD]">
        {children}
      </main>

    </div>
  );
}
