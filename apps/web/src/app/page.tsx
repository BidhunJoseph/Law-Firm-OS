import { Shield } from "lucide-react";
import RoleLoginForm from "@/components/auth/RoleLoginForm";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#f8f9fa] p-4 sm:p-8">
      <div className="w-full max-w-md">
        
        {/* Brand Header */}
        <div className="flex flex-col items-center justify-center mb-8 text-center">
          <div className="h-14 w-14 bg-blue-600 rounded-2xl flex items-center justify-center shadow-md mb-4">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Law Firm OS</h1>
          <p className="text-slate-500 mt-2 text-sm">Secure Network Portal</p>
        </div>

        {/* Login Form Container */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          <RoleLoginForm role="System User" />
        </div>
        
        <p className="text-center text-xs text-slate-400 mt-8">
          Protected by Enterprise Grade Security &bull; V1.0.0
        </p>

      </div>
    </div>
  );
}
