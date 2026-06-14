import Link from 'next/link';
import { Shield, Briefcase, FileSearch, UserCircle } from "lucide-react";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#f8f9fa] p-4 sm:p-8">
      
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-semibold tracking-tight text-slate-900 mb-3">Law Firm OS</h1>
          <p className="text-slate-500 text-lg">Select your portal to securely access the firm network.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Manager / Admin Portal */}
          <Link href="/manager/login" className="group block h-full">
            <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-200 h-full flex flex-col items-start text-left">
              <div className="h-12 w-12 rounded-lg bg-blue-50 flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
                <Shield className="h-6 w-6 text-blue-600" />
              </div>
              <h2 className="text-xl font-semibold text-slate-900 mb-2">Command Center</h2>
              <p className="text-slate-500 flex-1">For Managing Partners and Administrators. View firm-wide analytics, monitor risks, and manage users.</p>
              <span className="mt-6 text-sm font-medium text-blue-600 group-hover:text-blue-700 flex items-center gap-1">
                Access Portal &rarr;
              </span>
            </div>
          </Link>

          {/* Lawyer Portal */}
          <Link href="/lawyer/login" className="group block h-full">
            <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-200 h-full flex flex-col items-start text-left">
              <div className="h-12 w-12 rounded-lg bg-slate-50 flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
                <Briefcase className="h-6 w-6 text-slate-700" />
              </div>
              <h2 className="text-xl font-semibold text-slate-900 mb-2">Lawyer Dashboard</h2>
              <p className="text-slate-500 flex-1">For legal counsel. Manage assigned cases, monitor upcoming hearings, and review paralegal drafts.</p>
              <span className="mt-6 text-sm font-medium text-slate-700 group-hover:text-slate-900 flex items-center gap-1">
                Access Portal &rarr;
              </span>
            </div>
          </Link>

          {/* Paralegal Portal */}
          <Link href="/paralegal/login" className="group block h-full">
            <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-200 h-full flex flex-col items-start text-left">
              <div className="h-12 w-12 rounded-lg bg-emerald-50 flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
                <FileSearch className="h-6 w-6 text-emerald-600" />
              </div>
              <h2 className="text-xl font-semibold text-slate-900 mb-2">Execution Desk</h2>
              <p className="text-slate-500 flex-1">For paralegals and support staff. Complete assigned operational tasks, file documents, and manage queues.</p>
              <span className="mt-6 text-sm font-medium text-emerald-600 group-hover:text-emerald-700 flex items-center gap-1">
                Access Portal &rarr;
              </span>
            </div>
          </Link>

          {/* Client Portal */}
          <Link href="/client/login" className="group block h-full">
            <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-200 h-full flex flex-col items-start text-left">
              <div className="h-12 w-12 rounded-lg bg-purple-50 flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
                <UserCircle className="h-6 w-6 text-purple-600" />
              </div>
              <h2 className="text-xl font-semibold text-slate-900 mb-2">Client Portal</h2>
              <p className="text-slate-500 flex-1">For external clients. Track case status, securely upload requested documents, and view billing.</p>
              <span className="mt-6 text-sm font-medium text-purple-600 group-hover:text-purple-700 flex items-center gap-1">
                Access Portal &rarr;
              </span>
            </div>
          </Link>

        </div>
      </div>
    </div>
  );
}
