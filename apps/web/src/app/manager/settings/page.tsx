"use client";

import { useState } from "react";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Settings, Users, Shield, Mail, CheckCircle2, UserPlus, MoreHorizontal, Building2 } from "lucide-react";

// Mock Members Data
type FirmMember = {
  id: string;
  name: string;
  email: string;
  role: "Manager" | "Lawyer" | "Paralegal";
  status: "Active" | "Invited" | "Suspended";
  joinedDate: string;
};

const memberColumns: ColumnDef<FirmMember>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-medium text-xs">
          {row.original.name.split(" ").map(n => n[0]).join("")}
        </div>
        <div className="font-medium text-gray-900">{row.getValue("name")}</div>
      </div>
    ),
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => <div className="text-gray-600">{row.getValue("email")}</div>,
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => {
      const role = row.getValue("role") as string;
      return (
        <span className="inline-flex items-center gap-1.5 text-sm text-gray-700">
          {role === 'Manager' && <Shield className="h-3.5 w-3.5 text-purple-600" />}
          {role === 'Lawyer' && <Building2 className="h-3.5 w-3.5 text-blue-600" />}
          {role === 'Paralegal' && <Users className="h-3.5 w-3.5 text-amber-600" />}
          {role}
        </span>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      return (
        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium
          ${status === 'Active' ? 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20' : ''}
          ${status === 'Invited' ? 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-700/10' : ''}
          ${status === 'Suspended' ? 'bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/10' : ''}
        `}>
          {status}
        </span>
      );
    },
  },
  {
    accessorKey: "joinedDate",
    header: "Joined Date",
    cell: ({ row }) => <div className="text-gray-500">{row.getValue("joinedDate")}</div>,
  },
  {
    id: "actions",
    cell: () => (
      <button className="p-1 rounded-md hover:bg-gray-200/50 text-gray-400 hover:text-gray-600 transition-colors">
        <MoreHorizontal className="h-4 w-4" />
      </button>
    ),
  },
];

const mockMembers: FirmMember[] = [
  { id: "1", name: "Alice Johnson", email: "alice@lawfirm.com", role: "Manager", status: "Active", joinedDate: "Jan 12, 2024" },
  { id: "2", name: "Robert Smith", email: "robert@lawfirm.com", role: "Lawyer", status: "Active", joinedDate: "Feb 05, 2024" },
  { id: "3", name: "Maria Garcia", email: "maria@lawfirm.com", role: "Paralegal", status: "Active", joinedDate: "Mar 20, 2024" },
  { id: "4", name: "James Wilson", email: "james.w@lawfirm.com", role: "Lawyer", status: "Invited", joinedDate: "Pending" },
  { id: "5", name: "Elena Davis", email: "elena.d@lawfirm.com", role: "Paralegal", status: "Active", joinedDate: "Apr 15, 2024" },
];

export default function ManagerSettings() {
  const [activeTab, setActiveTab] = useState("members");
  
  // Form state
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteName, setInviteName] = useState("");
  const [inviteRole, setInviteRole] = useState("Lawyer");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Mock server action
    setTimeout(() => {
      setIsSubmitting(false);
      setInviteEmail("");
      setInviteName("");
      setInviteRole("Lawyer");
      alert("Invitation sent successfully!");
    }, 800);
  };

  return (
    <div className="flex flex-col h-full bg-[#f8f9fa] overflow-hidden">
      {/* Header */}
      <div className="px-8 py-6 bg-white border-b border-gray-200 shrink-0">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 tracking-tight flex items-center gap-2">
              <Settings className="h-6 w-6 text-gray-400" /> Organization Settings
            </h1>
            <p className="text-sm text-gray-500 mt-1">Manage your firm's members, billing, and global preferences.</p>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="max-w-6xl mx-auto mt-6 flex gap-6 border-b border-gray-200">
          {[
            { id: "members", label: "Team Members", icon: Users },
            { id: "firm", label: "Firm Profile", icon: Building2 },
            { id: "security", label: "Security & Roles", icon: Shield },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3 flex items-center gap-2 text-sm font-medium transition-colors relative
                ${activeTab === tab.id ? "text-blue-600" : "text-gray-500 hover:text-gray-700"}
              `}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-t-full" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-auto p-8">
        <div className="max-w-6xl mx-auto">
          
          {activeTab === "members" && (
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              
              {/* Members List */}
              <div className="xl:col-span-2 space-y-4">
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
                    <div>
                      <h2 className="text-base font-semibold text-gray-900">Directory</h2>
                      <p className="text-sm text-gray-500 mt-0.5">Active and pending members in your organization.</p>
                    </div>
                  </div>
                  <div className="p-0">
                    <DataTable columns={memberColumns} data={mockMembers} />
                  </div>
                </div>
              </div>

              {/* Invite Form */}
              <div className="space-y-6">
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 sticky top-0">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center">
                      <UserPlus className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h2 className="text-base font-semibold text-gray-900">Invite Member</h2>
                      <p className="text-sm text-gray-500">Add a new colleague to the firm.</p>
                    </div>
                  </div>

                  <form onSubmit={handleInvite} className="space-y-4">
                    <div className="space-y-1.5">
                      <label htmlFor="name" className="text-sm font-medium text-gray-700">Full Name</label>
                      <input
                        id="name"
                        type="text"
                        required
                        value={inviteName}
                        onChange={(e) => setInviteName(e.target.value)}
                        className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-gray-400 shadow-sm"
                        placeholder="Jane Doe"
                      />
                    </div>
                    
                    <div className="space-y-1.5">
                      <label htmlFor="email" className="text-sm font-medium text-gray-700">Email Address</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          id="email"
                          type="email"
                          required
                          value={inviteEmail}
                          onChange={(e) => setInviteEmail(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-gray-400 shadow-sm"
                          placeholder="jane@lawfirm.com"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label htmlFor="role" className="text-sm font-medium text-gray-700">Role</label>
                      <select
                        id="role"
                        value={inviteRole}
                        onChange={(e) => setInviteRole(e.target.value)}
                        className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm appearance-none"
                        style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: `right 0.5rem center`, backgroundRepeat: `no-repeat`, backgroundSize: `1.5em 1.5em`, paddingRight: `2.5rem` }}
                      >
                        <option value="Lawyer">Lawyer</option>
                        <option value="Paralegal">Paralegal</option>
                        <option value="Manager">Manager</option>
                      </select>
                    </div>

                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg text-sm transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                      >
                        {isSubmitting ? (
                          <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <Mail className="h-4 w-4" />
                        )}
                        {isSubmitting ? "Sending Invite..." : "Send Invitation"}
                      </button>
                    </div>
                  </form>
                  
                  <div className="mt-6 pt-5 border-t border-gray-100">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 h-1.5 w-1.5 rounded-full bg-blue-500 flex-shrink-0" />
                      <p className="text-xs text-gray-500 leading-relaxed">
                        Invited members will receive an email with a secure link to set up their account and verify their identity.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab !== "members" && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Settings className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">Section Under Construction</h3>
              <p className="text-gray-500 mt-2 max-w-sm">This section is part of a future update. Check back later for firm profile and security settings.</p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
