"use client";

import React from "react";
import { User, Building2, Shield, Mail, Phone, Plus } from "lucide-react";

export default function MatterTeamRoster({ caseData, userRole }: { caseData: any, userRole: string }) {
  
  const teamMembers = [
    {
      roleLabel: "Lead Attorney",
      person: caseData.lawyer,
      icon: <Shield className="w-4 h-4 text-purple-600" />,
      bg: "bg-purple-100",
      border: "border-purple-200"
    },
    {
      roleLabel: "Paralegal",
      person: caseData.paralegal,
      icon: <User className="w-4 h-4 text-emerald-600" />,
      bg: "bg-emerald-100",
      border: "border-emerald-200"
    },
    {
      roleLabel: "Client",
      person: caseData.client,
      icon: <Building2 className="w-4 h-4 text-blue-600" />,
      bg: "bg-blue-100",
      border: "border-blue-200"
    }
  ];

  return (
    <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/40 overflow-hidden transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
      <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-900">Team Roster</h2>
        {(userRole === 'admin' || userRole === 'manager') && (
          <button className="text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 border border-blue-200">
            <Plus className="w-3.5 h-3.5" /> External Agency
          </button>
        )}
      </div>
      
      <div className="p-6 space-y-6">
        {teamMembers.map((member, idx) => {
          if (!member.person && member.roleLabel !== "Lead Attorney" && member.roleLabel !== "Paralegal") return null;

          return (
            <div key={idx} className="flex items-start gap-4 p-3 rounded-2xl transition-all duration-300 hover:bg-gray-50 group">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border transition-transform duration-300 group-hover:scale-110 group-hover:shadow-sm ${member.person ? member.bg : 'bg-gray-100'} ${member.person ? member.border : 'border-gray-200'}`}>
                {member.person ? member.icon : <User className="w-4 h-4 text-gray-400" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-0.5">{member.roleLabel}</p>
                {member.person ? (
                  <>
                    <h3 className="text-sm font-semibold text-gray-900 truncate">{member.person.name}</h3>
                    <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-500">
                      {member.person.email && (
                        <a href={`mailto:${member.person.email}`} className="flex items-center gap-1 hover:text-blue-600 transition-colors">
                          <Mail className="w-3.5 h-3.5" />
                          <span className="truncate">{member.person.email}</span>
                        </a>
                      )}
                      {member.person.phone && (
                        <a href={`tel:${member.person.phone}`} className="flex items-center gap-1 hover:text-blue-600 transition-colors">
                          <Phone className="w-3.5 h-3.5" />
                          <span>{member.person.phone}</span>
                        </a>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">Unassigned</span>
                    {(userRole === 'admin' || userRole === 'manager') && (
                      <button className="text-xs font-semibold text-blue-600 hover:text-blue-700 underline transition-colors">
                        Assign Now
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
