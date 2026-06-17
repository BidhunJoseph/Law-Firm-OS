'use client';

import React, { useState, useTransition } from 'react';
import { UserPlus, ShieldAlert, CheckCircle2, UserMinus, Plus, Edit2 } from 'lucide-react';
import { updateUser, provisionUser, deactivateUser, reactivateUser } from '@/server/actions/user-actions';
import { useRouter } from 'next/navigation';
import { TeamMemberSlideOver } from '@/components/os/TeamMemberSlideOver';

export function TeamRosterClient({ firmUsers }: { firmUsers: any[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [activeTab, setActiveTab] = useState('active');
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'lawyer',
  });

  const handleChange = (e: any) => setFormData(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleEditClick = (user: any) => {
    setFormData({ name: user.full_name, email: user.email, role: user.role });
    setIsEditing(user.id);
  };

  const handleSaveMember = async () => {
    startTransition(async () => {
      try {
        if (isEditing) {
          await updateUser(isEditing, { name: formData.name, role: formData.role });
          setIsEditing(null);
        } else {
          await provisionUser(formData as any);
          setIsAdding(false);
        }
        setFormData({ name: '', email: '', role: 'lawyer' });
        router.refresh();
      } catch (err: any) {
        alert(err.message);
      }
    });
  };

  const handleToggleStatus = async (userId: string, currentlyActive: boolean) => {
    if (!confirm(`Are you sure you want to ${currentlyActive ? 'deactivate' : 'reactivate'} this user?`)) return;
    startTransition(async () => {
      try {
        if (currentlyActive) await deactivateUser(userId);
        else await reactivateUser(userId);
        router.refresh();
      } catch (err: any) {
        alert(err.message);
      }
    });
  };

  const activeUsers = firmUsers.filter(u => u.is_active);
  const inactiveUsers = firmUsers.filter(u => !u.is_active);

  return (
    <>
      <div className={`flex-1 overflow-y-auto custom-scrollbar transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${isAdding ? 'scale-[0.98] opacity-60 pointer-events-none blur-[1px]' : ''}`}>
      <div className="px-8 sm:px-12 lg:px-16 pt-16 pb-12 max-w-[1800px] mx-auto">
        <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <div>
            <h1 className="text-4xl md:text-5xl text-[#1D1D1F] font-semibold tracking-tight">Team Roster</h1>
            <p className="text-[#86868B] mt-3 font-medium text-[15px] leading-snug">
              Manage your firm's internal agents.
            </p>
            <div className="flex items-center gap-6 mt-8">
               <button onClick={() => setActiveTab('active')} className={`text-sm font-semibold transition-colors pb-2 border-b-2 ${activeTab === 'active' ? 'text-[#1D1D1F] border-[#1D1D1F]' : 'text-[#86868B] border-transparent hover:text-[#1D1D1F]'}`}>
                 Active ({activeUsers.length})
               </button>
               <button onClick={() => setActiveTab('inactive')} className={`text-sm font-semibold transition-colors pb-2 border-b-2 ${activeTab === 'inactive' ? 'text-[#1D1D1F] border-[#1D1D1F]' : 'text-[#86868B] border-transparent hover:text-[#1D1D1F]'}`}>
                 Deactivated ({inactiveUsers.length})
               </button>
            </div>
          </div>
          <button 
            onClick={() => setIsAdding(true)}
            className="shrink-0 flex items-center gap-2 bg-[#1D1D1F] hover:bg-black text-white px-6 py-3.5 rounded-[18px] text-[15px] font-semibold transition-all shadow-[0_4px_14px_rgba(0,0,0,0.1)] active:scale-95"
          >
            <UserPlus className="w-5 h-5" />
            Provision Member
          </button>
        </header>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
           {(activeTab === 'active' ? activeUsers : inactiveUsers).map(u => (
              <div key={u.id} onClick={() => setSelectedUser(u)} className={`group relative cursor-pointer bg-white/60 p-6 rounded-[24px] border backdrop-blur-md transition-all duration-300 hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)] ${u.is_active ? 'border-black/[0.04] shadow-[0_2px_10px_rgba(0,0,0,0.02)]' : 'border-red-500/10 bg-red-50/30 grayscale'}`}>
                 <div className="flex items-start justify-between">
                   <div className="flex items-center gap-4">
                      <div className={`w-14 h-14 rounded-full flex items-center justify-center font-bold text-xl shadow-inner border ${u.is_active ? 'bg-[#FBFBFD] border-black/[0.05] text-[#1D1D1F]' : 'bg-neutral-200 border-neutral-300 text-neutral-500'}`}>
                         {u.full_name?.charAt(0) || u.email.charAt(0)}
                      </div>
                      <div>
                         <h3 className="text-lg font-bold text-[#1D1D1F]">{u.full_name || 'Unnamed User'}</h3>
                         <p className="text-[11px] font-bold text-[#86868B] uppercase tracking-wider mt-0.5">{u.role.replace('_', ' ')}</p>
                         <p className="text-[13px] text-[#86868B] mt-1">{u.email}</p>
                      </div>
                   </div>
                 </div>

                 {/* Workload Metrics */}
                 {u.is_active && (
                   <div className="mt-5 flex items-center gap-3 border-t border-black/[0.04] pt-5">
                      <div className="flex-1 flex flex-col items-center p-2 rounded-xl bg-[#FBFBFD] border border-black/[0.03]">
                         <span className="text-xl font-bold text-[#1D1D1F]">{u.tasks_assigned_to?.length || 0}</span>
                         <span className="text-[10px] font-bold uppercase tracking-wider text-[#86868B]">Active Tasks</span>
                      </div>
                      <div className="flex-1 flex flex-col items-center p-2 rounded-xl bg-red-50/50 border border-red-500/10">
                         <span className="text-xl font-bold text-red-600">
                           {u.tasks_assigned_to?.filter((t: any) => t.due_at && new Date(t.due_at) < new Date()).length || 0}
                         </span>
                         <span className="text-[10px] font-bold uppercase tracking-wider text-red-700">Overdue</span>
                      </div>
                   </div>
                 )}
                 
                 <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1" onClick={e => e.stopPropagation()}>
                    {u.is_active && (
                      <button 
                        onClick={() => handleEditClick(u)}
                        disabled={isPending}
                        className="p-2 rounded-xl transition-colors text-[#0066CC] hover:bg-[#0066CC]/10"
                        title="Edit User Details"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    )}
                    <button 
                      onClick={() => handleToggleStatus(u.id, u.is_active)}
                      disabled={isPending}
                      className={`p-2 rounded-xl transition-colors ${u.is_active ? 'text-red-500 hover:bg-red-50' : 'text-green-600 hover:bg-green-50'}`}
                      title={u.is_active ? "Deactivate User" : "Reactivate User"}
                    >
                      {u.is_active ? <UserMinus className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
                    </button>
                 </div>
              </div>
           ))}
           {(activeTab === 'active' ? activeUsers : inactiveUsers).length === 0 && (
             <div className="col-span-full py-20 text-center text-[#86868B] font-medium text-[15px]">
               No {activeTab} members found.
             </div>
           )}
      </div>
      </div>
      </div>

      {/* Add/Edit Member Slide-Over rendered as a sibling to the main canvas */}
      {(isAdding || isEditing) && (
        <div className="fixed inset-0 z-50 flex justify-end bg-[#1D1D1F]/20 backdrop-blur-[4px] transition-opacity duration-500">
          <div className="relative h-full w-[400px] bg-[#FBFBFD] shadow-[-20px_0_80px_rgba(0,0,0,0.07)] flex flex-col animate-in slide-in-from-right-full">
            <header className="px-8 py-6 border-b border-black/[0.04] flex items-center justify-between">
              <h2 className="text-xl font-bold tracking-tight text-[#1D1D1F]">{isEditing ? 'Edit Member' : 'Provision Member'}</h2>
              <button onClick={() => { setIsAdding(false); setIsEditing(null); }} className="text-[#1D1D1F]">X</button>
            </header>
            <div className="flex-1 p-8 overflow-y-auto">
               <div className="space-y-5">
                 <div>
                   <label className="block text-[13px] font-semibold text-[#86868B] mb-1.5 uppercase tracking-wider">Full Name</label>
                   <input required type="text" name="name" value={formData.name} onChange={handleChange} className="w-full px-4 py-3 bg-white border border-black/[0.04] rounded-xl focus:ring-2 focus:ring-[#0066CC]/20 outline-none text-[15px]" />
                 </div>
                 <div>
                   <label className="block text-[13px] font-semibold text-[#86868B] mb-1.5 uppercase tracking-wider">Email Address</label>
                   <input required type="email" name="email" value={formData.email} onChange={handleChange} disabled={!!isEditing} className="w-full px-4 py-3 bg-white border border-black/[0.04] rounded-xl focus:ring-2 focus:ring-[#0066CC]/20 outline-none text-[15px] disabled:opacity-50 disabled:bg-neutral-100" />
                 </div>
                 <div>
                   <label className="block text-[13px] font-semibold text-[#86868B] mb-1.5 uppercase tracking-wider">Role</label>
                   <select name="role" value={formData.role} onChange={handleChange} className="w-full px-4 py-3 bg-white border border-black/[0.04] rounded-xl focus:ring-2 focus:ring-[#0066CC]/20 outline-none text-[15px]">
                     <option value="manager">Manager</option>
                     <option value="lawyer">Lawyer</option>
                     <option value="paralegal">Paralegal</option>
                     <option value="partner">Partner</option>
                   </select>
                 </div>
                 {!isEditing && (
                   <div className="mt-4 p-4 bg-amber-50 border border-amber-100 rounded-xl">
                     <p className="text-[13px] font-medium text-amber-800">
                       User will be provisioned instantly. Temporary password defaults to <b>123456</b>.
                     </p>
                   </div>
                 )}
               </div>
            </div>
            <div className="p-6 bg-white border-t border-black/[0.04]">
               <button 
                 onClick={handleSaveMember}
                 disabled={isPending || !formData.name || !formData.email}
                 className="w-full bg-[#1D1D1F] text-white px-6 py-3.5 rounded-xl text-[15px] font-bold hover:bg-black transition-all disabled:opacity-50"
               >
                 {isPending ? 'Saving...' : (isEditing ? 'Save Changes' : 'Provision Member')}
               </button>
            </div>
          </div>
        </div>
      )}

      {selectedUser && (
        <TeamMemberSlideOver user={selectedUser} onClose={() => setSelectedUser(null)} />
      )}
    </>
  );
}
