'use client';

import React, { useState, useTransition } from 'react';
import { UserPlus, CheckCircle2, UserMinus, Edit2, Building2, Phone, Mail, FileText } from 'lucide-react';
import { provisionUser } from '@/server/actions/user-actions';
import { updateClient, deactivateClient, reactivateClient } from '@/server/actions/client-actions';
import { useRouter } from 'next/navigation';
import { ClientSlideOver } from '@/components/os/ClientSlideOver';

export function ClientRosterClient({ initialClients }: { initialClients: any[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [activeTab, setActiveTab] = useState('active');
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [selectedClient, setSelectedClient] = useState<any | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    passport_number: '',
    emirates_id: ''
  });

  const handleChange = (e: any) => setFormData(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleEditClick = (client: any) => {
    setFormData({ 
      name: client.name, 
      email: client.email, 
      phone: client.phone || '',
      passport_number: client.passport_number || '',
      emirates_id: client.emirates_id || ''
    });
    setIsEditing(client.id);
  };

  const handleSaveClient = async () => {
    startTransition(async () => {
      try {
        if (isEditing) {
          await updateClient(isEditing, formData);
          setIsEditing(null);
        } else {
          // Provision as a client role, generating portal access automatically
          await provisionUser({ ...formData, role: 'client' } as any);
          setIsAdding(false);
        }
        setFormData({ name: '', email: '', phone: '', passport_number: '', emirates_id: '' });
        router.refresh();
      } catch (err: any) {
        alert(err.message);
      }
    });
  };

  const handleToggleStatus = async (clientId: string, profileId: string | null, currentlyActive: boolean) => {
    if (!profileId) {
      alert("This client does not have a linked portal profile to deactivate.");
      return;
    }
    if (!confirm(`Are you sure you want to ${currentlyActive ? 'revoke portal access for' : 'restore portal access to'} this client?`)) return;
    
    startTransition(async () => {
      try {
        if (currentlyActive) await deactivateClient(profileId);
        else await reactivateClient(profileId);
        router.refresh();
      } catch (err: any) {
        alert(err.message);
      }
    });
  };

  const activeClients = initialClients.filter(c => c.is_active);
  const inactiveClients = initialClients.filter(c => !c.is_active);

  return (
    <>
      <div className={`flex-1 overflow-y-auto custom-scrollbar transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${isAdding ? 'scale-[0.98] opacity-60 pointer-events-none blur-[1px]' : ''}`}>
      <div className="px-8 sm:px-12 lg:px-16 pt-16 pb-12 max-w-[1800px] mx-auto">
        <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <div>
            <h1 className="text-4xl md:text-5xl text-[#1D1D1F] font-semibold tracking-tight">Client Hub</h1>
            <p className="text-[#86868B] mt-3 font-medium text-[15px] leading-snug">
              Manage your firm's clients and their portal access.
            </p>
            <div className="flex items-center gap-6 mt-8">
               <button onClick={() => setActiveTab('active')} className={`text-sm font-semibold transition-colors pb-2 border-b-2 ${activeTab === 'active' ? 'text-[#1D1D1F] border-[#1D1D1F]' : 'text-[#86868B] border-transparent hover:text-[#1D1D1F]'}`}>
                 Active ({activeClients.length})
               </button>
               <button onClick={() => setActiveTab('inactive')} className={`text-sm font-semibold transition-colors pb-2 border-b-2 ${activeTab === 'inactive' ? 'text-[#1D1D1F] border-[#1D1D1F]' : 'text-[#86868B] border-transparent hover:text-[#1D1D1F]'}`}>
                 Deactivated/Offline ({inactiveClients.length})
               </button>
            </div>
          </div>
          <button 
            onClick={() => setIsAdding(true)}
            className="shrink-0 flex items-center gap-2 bg-[#0066CC] hover:bg-blue-700 text-white px-6 py-3.5 rounded-[18px] text-[15px] font-semibold transition-all shadow-[0_4px_14px_rgba(0,102,204,0.3)] active:scale-95"
          >
            <UserPlus className="w-5 h-5" />
            Provision Client
          </button>
        </header>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
           {(activeTab === 'active' ? activeClients : inactiveClients).map(c => (
              <div key={c.id} onClick={() => setSelectedClient(c)} className={`group relative cursor-pointer bg-white/60 p-6 rounded-[24px] border backdrop-blur-md transition-all duration-300 hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)] ${c.is_active ? 'border-black/[0.04] shadow-[0_2px_10px_rgba(0,0,0,0.02)]' : 'border-neutral-200 bg-neutral-50/50 grayscale'}`}>
                 <div className="flex items-start justify-between">
                   <div className="flex items-center gap-4">
                      <div className={`w-14 h-14 rounded-full flex items-center justify-center font-bold text-xl shadow-inner border ${c.is_active ? 'bg-[#0066CC]/10 border-[#0066CC]/20 text-[#0066CC]' : 'bg-neutral-200 border-neutral-300 text-neutral-500'}`}>
                         {c.name?.charAt(0)}
                      </div>
                      <div>
                         <h3 className="text-lg font-bold text-[#1D1D1F]">{c.name}</h3>
                         <div className="flex items-center gap-1.5 mt-1 text-[#86868B]">
                           <Mail className="w-3.5 h-3.5" />
                           <p className="text-[13px]">{c.email}</p>
                         </div>
                         {c.phone && (
                           <div className="flex items-center gap-1.5 mt-0.5 text-[#86868B]">
                             <Phone className="w-3.5 h-3.5" />
                             <p className="text-[13px]">{c.phone}</p>
                           </div>
                         )}
                      </div>
                   </div>
                 </div>

                 {/* Workload Metrics */}
                 <div className="mt-5 flex items-center gap-3 border-t border-black/[0.04] pt-5">
                    <div className="flex-1 flex flex-col items-center p-2 rounded-xl bg-[#FBFBFD] border border-black/[0.03]">
                       <span className="text-xl font-bold text-[#1D1D1F]">{c.active_cases || 0}</span>
                       <span className="text-[10px] font-bold uppercase tracking-wider text-[#86868B]">Active Matters</span>
                    </div>
                    <div className="flex-1 flex flex-col items-center p-2 rounded-xl bg-[#FBFBFD] border border-black/[0.03]">
                       <span className="text-xl font-bold text-[#1D1D1F]">{c.cases?.length || 0}</span>
                       <span className="text-[10px] font-bold uppercase tracking-wider text-[#86868B]">Total Lifetime</span>
                    </div>
                 </div>
                 
                 <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1" onClick={e => e.stopPropagation()}>
                    <button 
                      onClick={() => handleEditClick(c)}
                      disabled={isPending}
                      className="p-2 rounded-xl transition-colors text-[#0066CC] hover:bg-[#0066CC]/10"
                      title="Edit Client Details"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    {c.profile_id && (
                      <button 
                        onClick={() => handleToggleStatus(c.id, c.profile_id, c.is_active)}
                        disabled={isPending}
                        className={`p-2 rounded-xl transition-colors ${c.is_active ? 'text-red-500 hover:bg-red-50' : 'text-green-600 hover:bg-green-50'}`}
                        title={c.is_active ? "Revoke Portal Access" : "Restore Portal Access"}
                      >
                        {c.is_active ? <UserMinus className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
                      </button>
                    )}
                 </div>
              </div>
           ))}
           {(activeTab === 'active' ? activeClients : inactiveClients).length === 0 && (
             <div className="col-span-full py-20 text-center text-[#86868B] font-medium text-[15px]">
               No {activeTab} clients found.
             </div>
           )}
        </div>
      </div>
      </div>

      {/* Add/Edit Client Slide-Over */}
      {(isAdding || isEditing) && (
        <div className="fixed inset-0 z-50 flex justify-end bg-[#1D1D1F]/20 backdrop-blur-[4px] transition-opacity duration-500">
          <div className="relative h-full w-[450px] max-w-[90vw] bg-[#FBFBFD] shadow-[-20px_0_80px_rgba(0,0,0,0.07)] flex flex-col animate-in slide-in-from-right-full">
            <header className="px-8 py-6 border-b border-black/[0.04] flex items-center justify-between">
              <h2 className="text-xl font-bold tracking-tight text-[#1D1D1F]">{isEditing ? 'Edit Client' : 'Provision Client'}</h2>
              <button onClick={() => { setIsAdding(false); setIsEditing(null); }} className="text-[#1D1D1F]">X</button>
            </header>
            <div className="flex-1 p-8 overflow-y-auto custom-scrollbar">
               <div className="space-y-5">
                 <div>
                   <label className="block text-[13px] font-semibold text-[#86868B] mb-1.5 uppercase tracking-wider">Full Name / Entity Name</label>
                   <input required type="text" name="name" value={formData.name} onChange={handleChange} className="w-full px-4 py-3 bg-white border border-black/[0.04] rounded-xl focus:ring-2 focus:ring-[#0066CC]/20 outline-none text-[15px]" />
                 </div>
                 <div>
                   <label className="block text-[13px] font-semibold text-[#86868B] mb-1.5 uppercase tracking-wider">Email Address</label>
                   <input required type="email" name="email" value={formData.email} onChange={handleChange} disabled={!!isEditing} className="w-full px-4 py-3 bg-white border border-black/[0.04] rounded-xl focus:ring-2 focus:ring-[#0066CC]/20 outline-none text-[15px] disabled:opacity-50 disabled:bg-neutral-100" />
                 </div>
                 <div>
                   <label className="block text-[13px] font-semibold text-[#86868B] mb-1.5 uppercase tracking-wider">Phone Number (Optional)</label>
                   <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full px-4 py-3 bg-white border border-black/[0.04] rounded-xl focus:ring-2 focus:ring-[#0066CC]/20 outline-none text-[15px]" />
                 </div>
                 
                 <div className="pt-4 mt-2 border-t border-black/[0.04]">
                   <h3 className="text-sm font-bold text-[#1D1D1F] mb-4">KYC Information (Optional)</h3>
                   <div className="space-y-4">
                     <div>
                       <label className="block text-[13px] font-semibold text-[#86868B] mb-1.5 uppercase tracking-wider">Passport Number</label>
                       <input type="text" name="passport_number" value={formData.passport_number} onChange={handleChange} className="w-full px-4 py-3 bg-white border border-black/[0.04] rounded-xl focus:ring-2 focus:ring-[#0066CC]/20 outline-none text-[15px]" />
                     </div>
                     <div>
                       <label className="block text-[13px] font-semibold text-[#86868B] mb-1.5 uppercase tracking-wider">Emirates ID</label>
                       <input type="text" name="emirates_id" value={formData.emirates_id} onChange={handleChange} className="w-full px-4 py-3 bg-white border border-black/[0.04] rounded-xl focus:ring-2 focus:ring-[#0066CC]/20 outline-none text-[15px]" />
                     </div>
                   </div>
                 </div>

                 {!isEditing && (
                   <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-xl flex gap-3">
                     <Building2 className="w-5 h-5 text-blue-600 shrink-0" />
                     <p className="text-[13px] font-medium text-blue-800">
                       A Secure Client Portal profile will be generated automatically. Default password: <b>123456</b>
                     </p>
                   </div>
                 )}
               </div>
            </div>
            <div className="p-6 bg-white border-t border-black/[0.04]">
               <button 
                 onClick={handleSaveClient}
                 disabled={isPending || !formData.name || !formData.email}
                 className="w-full bg-[#0066CC] hover:bg-blue-700 text-white px-6 py-3.5 rounded-xl text-[15px] font-bold transition-all disabled:opacity-50 shadow-sm"
               >
                 {isPending ? 'Processing...' : (isEditing ? 'Save Client Details' : 'Provision Client')}
               </button>
            </div>
          </div>
        </div>
      )}

      {selectedClient && (
        <ClientSlideOver client={selectedClient} onClose={() => setSelectedClient(null)} />
      )}
    </>
  );
}
