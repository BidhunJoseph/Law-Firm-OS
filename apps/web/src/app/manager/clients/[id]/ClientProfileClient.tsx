"use client";

import React, { useState } from "react";
import { User, Mail, Phone, Calendar, ArrowLeft, Briefcase, FileText, Activity, ShieldCheck, FileCheck, CircleDashed } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import PhaseMover from "@/components/features/cases/PhaseMover";

interface Props {
  client: any;
  documents: any[];
}

export function ClientProfileClient({ client, documents }: Props) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"overview" | "matters" | "documents">("overview");

  return (
    <div className="min-h-full bg-[#fbfcfd] p-4 md:p-8 lg:p-10 font-sans">
      <div className="max-w-[1400px] mx-auto space-y-8">
        
        {/* Navigation & Header */}
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.push("/manager/clients")}
            className="p-2.5 bg-white border border-gray-200/60 rounded-xl shadow-sm hover:bg-gray-50 hover:shadow transition-all group"
          >
            <ArrowLeft className="w-5 h-5 text-gray-500 group-hover:text-gray-900 transition-colors" />
          </button>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Client Profile</h1>
            <p className="text-sm text-gray-500 mt-0.5">Manage details and engagements for {client.name}</p>
          </div>
        </div>

        {/* Breathtaking Client Identity Card */}
        <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/60 overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-10" />
          
          <div className="p-8 md:p-10 relative z-10 flex flex-col md:flex-row gap-8 items-start md:items-center">
            {/* Avatar */}
            <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-white shadow-xl shadow-blue-900/5 flex items-center justify-center shrink-0 relative overflow-hidden">
              <div className="absolute inset-0 bg-blue-600/5 backdrop-blur-3xl" />
              <User className="w-12 h-12 text-blue-600 relative z-10" />
            </div>

            {/* Details */}
            <div className="flex-1 space-y-4">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 tracking-tight">{client.name}</h2>
                <div className="flex items-center gap-2 mt-2">
                  <span className="px-3 py-1 bg-green-50 text-green-700 text-xs font-semibold rounded-full border border-green-200/60 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5" /> Verified Client
                  </span>
                  <span className="text-sm text-gray-500 font-medium">
                    Since {new Date(client.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap gap-x-8 gap-y-3 pt-2">
                <div className="flex items-center gap-2.5 text-sm font-medium text-gray-600 bg-gray-50/50 px-4 py-2 rounded-xl border border-gray-100">
                  <Mail className="w-4 h-4 text-gray-400" />
                  {client.email}
                </div>
                <div className="flex items-center gap-2.5 text-sm font-medium text-gray-600 bg-gray-50/50 px-4 py-2 rounded-xl border border-gray-100">
                  <Phone className="w-4 h-4 text-gray-400" />
                  {client.phone || "No phone provided"}
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="flex gap-4 self-stretch md:self-auto shrink-0 mt-4 md:mt-0">
              <div className="bg-white px-6 py-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-center min-w-[140px]">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Active Matters</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{client.cases.length}</p>
              </div>
              <div className="bg-white px-6 py-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-center min-w-[140px]">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Documents</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{documents.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-gray-200">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-6 py-3.5 text-sm font-semibold transition-all relative ${
              activeTab === "overview" ? "text-blue-600" : "text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-t-xl"
            }`}
          >
            <div className="flex items-center gap-2"><Activity className="w-4 h-4" /> CRM Overview</div>
            {activeTab === "overview" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-t-full" />}
          </button>
          <button
            onClick={() => setActiveTab("matters")}
            className={`px-6 py-3.5 text-sm font-semibold transition-all relative ${
              activeTab === "matters" ? "text-blue-600" : "text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-t-xl"
            }`}
          >
            <div className="flex items-center gap-2"><Briefcase className="w-4 h-4" /> Legal Matters</div>
            {activeTab === "matters" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-t-full" />}
          </button>
          <button
            onClick={() => setActiveTab("documents")}
            className={`px-6 py-3.5 text-sm font-semibold transition-all relative ${
              activeTab === "documents" ? "text-blue-600" : "text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-t-xl"
            }`}
          >
            <div className="flex items-center gap-2"><FileText className="w-4 h-4" /> Client Vault</div>
            {activeTab === "documents" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-t-full" />}
          </button>
        </div>

        {/* Tab Content */}
        <div className="animate-in fade-in duration-500">
          
          {activeTab === "overview" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Recent Activity Mockup */}
              <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/40 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-gray-400" /> Recent CRM Activity
                </h3>
                <div className="space-y-6 relative before:absolute before:inset-0 before:ml-2.5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
                  <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                    <div className="flex items-center justify-center w-5 h-5 rounded-full border-2 border-white bg-blue-500 text-slate-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2" />
                    <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                      <p className="text-sm font-medium text-gray-900">Client Profile Created</p>
                      <p className="text-xs text-gray-500 mt-1">{new Date(client.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</p>
                    </div>
                  </div>
                  {client.cases.map((c: any, idx: number) => (
                    <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                      <div className="flex items-center justify-center w-5 h-5 rounded-full border-2 border-white bg-indigo-500 text-slate-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2" />
                      <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                        <p className="text-sm font-medium text-gray-900">New Matter Started</p>
                        <p className="text-xs text-gray-500 mt-1">{c.title}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* CRM Data Mockup */}
              <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/40 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                  <FileCheck className="w-5 h-5 text-gray-400" /> Compliance & KYC
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50/50 rounded-xl border border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                        <ShieldCheck className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">Identity Verified</p>
                        <p className="text-xs text-gray-500">Passport / Emirates ID on file</p>
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-green-700 bg-green-50 px-3 py-1 rounded-full border border-green-200">Complete</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50/50 rounded-xl border border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <CircleDashed className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">Conflict Check</p>
                        <p className="text-xs text-gray-500">Cleared for all active matters</p>
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">Cleared</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "matters" && (
            <div className="space-y-6">
              {client.cases.length === 0 ? (
                <div className="text-center py-20 bg-white/50 rounded-2xl border border-gray-100">
                  <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">This client has no active matters.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6">
                  {client.cases.map((c: any) => (
                    <div key={c.id} className="bg-white/80 backdrop-blur-md rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/40 overflow-hidden group">
                      <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-gray-50/50 to-white">
                        <div>
                          <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                            <Link href={`/workspace/cases/${c.id}`}>{c.title}</Link>
                          </h3>
                          <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                            <span className="flex items-center gap-1.5"><Briefcase className="w-3.5 h-3.5" /> {c.case_type}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> Created {new Date(c.created_at).toLocaleDateString("en-US")}</span>
                          </div>
                        </div>
                        <Link 
                          href={`/workspace/cases/${c.id}`}
                          className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 hover:shadow transition-all"
                        >
                          View Matter
                        </Link>
                      </div>
                      <div className="p-0 pointer-events-none opacity-90 scale-[0.98] origin-top">
                        <PhaseMover caseId={c.id} currentPhase={c.current_phase} userRole="admin" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "documents" && (
            <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/40 overflow-hidden p-6">
               {documents.length === 0 ? (
                <div className="text-center py-20">
                  <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No documents found in the Client Vault.</p>
                </div>
              ) : (
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="pb-4 text-xs font-semibold text-gray-500 uppercase">Document Name</th>
                      <th className="pb-4 text-xs font-semibold text-gray-500 uppercase">Associated Matter</th>
                      <th className="pb-4 text-xs font-semibold text-gray-500 uppercase">Upload Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {documents.map((doc: any) => (
                      <tr key={doc.id} className="group">
                        <td className="py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                              <FileText className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">{doc.file_name}</p>
                              <p className="text-xs text-gray-500">{doc.mime_type}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 text-sm text-gray-600">
                          {doc.case?.title || "N/A"}
                        </td>
                        <td className="py-4 text-sm text-gray-500">
                          {new Date(doc.created_at).toLocaleDateString("en-US")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
