'use client';

import React, { useState, useTransition } from 'react';
import { X, Briefcase, UserPlus, FileText, CheckCircle2, Sparkles } from 'lucide-react';
import { createMatter } from '@/server/actions/case-actions';
import { useRouter } from 'next/navigation';

export function NewMatterSlideOver({ onClose, firmUsers, firmClients }: { onClose: () => void, firmUsers: any[], firmClients: any[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [step, setStep] = useState(1);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    case_type: 'Civil Cases',
    risk_level: 'green',
    client_id: '',
    client_name: '',
    client_email: '',
    client_phone: '',
    client_passport: '',
    client_emirates_id: '',
    lawyer_id: '',
    paralegal_id: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const autoClassifyWithAI = () => {
    const textToAnalyze = `${formData.title} ${formData.description}`.toLowerCase();
    if (!textToAnalyze.trim()) return;
    
    // Heuristic AI Rules Engine
    let suggestedType = formData.case_type;
    let suggestedRisk = formData.risk_level;
    
    if (textToAnalyze.includes('murder') || textToAnalyze.includes('assault') || textToAnalyze.includes('drug')) suggestedType = 'Felonies';
    else if (textToAnalyze.includes('theft') || textToAnalyze.includes('dui') || textToAnalyze.includes('drink')) suggestedType = 'Misdemeanors';
    else if (textToAnalyze.includes('police') || textToAnalyze.includes('fine') || textToAnalyze.includes('traffic')) suggestedType = 'Infractions / Contraventions';
    else if (textToAnalyze.includes('cyber') || textToAnalyze.includes('hack') || textToAnalyze.includes('scam')) suggestedType = 'Cybercrime Cases';
    else if (textToAnalyze.includes('money launder') || textToAnalyze.includes('aml')) suggestedType = 'Anti-Money Laundering (AML) Cases';
    else if (textToAnalyze.includes('divorce') || textToAnalyze.includes('custody') || textToAnalyze.includes('alimony') || textToAnalyze.includes('marriage')) suggestedType = 'Muslim Personal Status Cases';
    else if (textToAnalyze.includes('non-muslim') || textToAnalyze.includes('expat divorce')) suggestedType = 'Non-Muslim Personal Status Cases';
    else if (textToAnalyze.includes('rent') || textToAnalyze.includes('evict') || textToAnalyze.includes('tenant') || textToAnalyze.includes('landlord')) suggestedType = 'Rental Dispute Cases';
    else if (textToAnalyze.includes('real estate') || textToAnalyze.includes('property') || textToAnalyze.includes('developer') || textToAnalyze.includes('oqood')) suggestedType = 'Real Estate Cases';
    else if (textToAnalyze.includes('labor') || textToAnalyze.includes('employment') || textToAnalyze.includes('salary') || textToAnalyze.includes('dismissal') || textToAnalyze.includes('mohre')) suggestedType = 'Private Labor Cases';
    else if (textToAnalyze.includes('maid') || textToAnalyze.includes('domestic') || textToAnalyze.includes('nanny')) suggestedType = 'Domestic Workers Cases';
    else if (textToAnalyze.includes('tax') || textToAnalyze.includes('vat') || textToAnalyze.includes('fta')) suggestedType = 'Tax Dispute Cases';
    else if (textToAnalyze.includes('insurance') || textToAnalyze.includes('claim')) suggestedType = 'Insurance Dispute Cases';
    else if (textToAnalyze.includes('medical') || textToAnalyze.includes('malpractice') || textToAnalyze.includes('doctor')) suggestedType = 'Medical Malpractice Liability Cases';
    else if (textToAnalyze.includes('ship') || textToAnalyze.includes('vessel') || textToAnalyze.includes('maritime') || textToAnalyze.includes('cargo')) suggestedType = 'Maritime and Shipping Cases';
    else if (textToAnalyze.includes('difc') || textToAnalyze.includes('adgm')) suggestedType = 'Court of First Instance Commercial Cases';
    else if (textToAnalyze.includes('arbitration')) suggestedType = 'Local Arbitration Ratification/Nullification Cases';
    else if (textToAnalyze.includes('bankrupt') || textToAnalyze.includes('insolven')) suggestedType = 'Corporate Bankruptcy and Insolvency Cases';
    else if (textToAnalyze.includes('commercial') || textToAnalyze.includes('business') || textToAnalyze.includes('company') || textToAnalyze.includes('shareholder')) suggestedType = 'Commercial Cases';
    else if (textToAnalyze.includes('execution') || textToAnalyze.includes('enforce')) suggestedType = 'Standard Execution Cases';
    
    if (textToAnalyze.includes('urgent') || textToAnalyze.includes('immediate') || textToAnalyze.includes('critical') || textToAnalyze.includes('emergency')) {
      suggestedRisk = 'red';
    } else if (textToAnalyze.includes('soon') || textToAnalyze.includes('complex') || textToAnalyze.includes('high value')) {
      suggestedRisk = 'amber';
    }

    setFormData(prev => ({ 
      ...prev, 
      // Only fill if current is empty or at default
      case_type: prev.case_type === 'Civil Cases' ? suggestedType : prev.case_type,
      risk_level: prev.risk_level === 'green' ? suggestedRisk : prev.risk_level,
    }));
  };

  const handleSubmit = async () => {
    setError(null);
    startTransition(async () => {
      const result = await createMatter({
        title: formData.title,
        description: formData.description,
        case_type: formData.case_type,
        risk_level: formData.risk_level as any,
        client_id: formData.client_id === '__NEW__' ? undefined : (formData.client_id || undefined),
        client_name: formData.client_id === '__NEW__' ? formData.client_name : undefined,
        client_email: formData.client_id === '__NEW__' ? formData.client_email : undefined,
        client_phone: formData.client_id === '__NEW__' ? formData.client_phone : undefined,
        client_passport: formData.client_id === '__NEW__' ? formData.client_passport : undefined,
        client_emirates_id: formData.client_id === '__NEW__' ? formData.client_emirates_id : undefined,
        lawyer_id: formData.lawyer_id || undefined,
        paralegal_id: formData.paralegal_id || undefined,
      });

      if (result.success) {
        onClose();
        router.refresh();
      } else {
        setError(result.error || "Failed to create matter");
      }
    });
  };

  const lawyers = firmUsers.filter(u => u.role === 'lawyer' || u.role === 'partner');
  const paralegals = firmUsers.filter(u => u.role === 'paralegal');

  return (
    <div className="fixed inset-0 z-[60] flex justify-end bg-[#1D1D1F]/20 backdrop-blur-[4px] transition-opacity duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]">
      <div className="relative h-full w-[500px] translate-x-0 transform bg-[#FBFBFD] shadow-[-20px_0_80px_rgba(0,0,0,0.07)] transition-transform duration-700 ease-[cubic-bezier(0.2,0.8,0.2,1)] flex flex-col animate-in slide-in-from-right-full">
        
        {/* Header */}
        <header className="shrink-0 bg-white/70 px-8 py-6 backdrop-blur-2xl border-b border-black/[0.04] flex items-center justify-between">
          <h2 className="text-xl font-bold tracking-tight text-[#1D1D1F]">Initialize Matter</h2>
          <button onClick={onClose} className="h-8 w-8 rounded-full bg-[#1D1D1F]/5 flex items-center justify-center hover:bg-[#1D1D1F]/10 transition-colors">
            <X className="w-4 h-4 text-[#1D1D1F]" />
          </button>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-8 py-6 custom-scrollbar">
           {error && (
             <div className="p-4 mb-6 text-sm text-red-600 bg-red-50 rounded-xl border border-red-100">
               {error}
             </div>
           )}

           <div className="space-y-6 pb-24">
             {step === 1 && (
               <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
                 <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mb-2">
                    <Briefcase className="w-6 h-6 text-blue-600" />
                 </div>
                 <h3 className="text-lg font-bold text-[#1D1D1F]">Matter Details</h3>
                 
                 <div className="space-y-4">
                   <div>
                     <label className="flex items-center justify-between text-[13px] font-semibold text-[#86868B] mb-1.5 uppercase tracking-wider">
                       <span>Matter Title</span>
                       <button onClick={autoClassifyWithAI} className="flex items-center gap-1.5 text-purple-600 hover:text-purple-800 transition-colors normal-case tracking-normal">
                         <Sparkles className="w-3.5 h-3.5" /> AI Auto-Classify
                       </button>
                     </label>
                     <input required type="text" name="title" value={formData.title} onChange={handleChange} placeholder="e.g. Breach of Contract Dispute" className="w-full px-4 py-3 bg-white border border-black/[0.04] rounded-xl focus:ring-2 focus:ring-[#0066CC]/20 focus:border-[#0066CC] outline-none text-[15px] font-medium" />
                   </div>
                   <div>
                     <label className="block text-[13px] font-semibold text-[#86868B] mb-1.5 uppercase tracking-wider">
                       Case Description / Synopsis
                     </label>
                     <textarea name="description" value={formData.description} onChange={handleChange} rows={3} placeholder="Briefly describe the matter (e.g. Tenant is refusing to pay rent...)" className="w-full px-4 py-3 bg-white border border-black/[0.04] rounded-xl focus:ring-2 focus:ring-[#0066CC]/20 focus:border-[#0066CC] outline-none text-[15px] font-medium resize-none" />
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                     <div>
                       <label className="block text-[13px] font-semibold text-[#86868B] mb-1.5 uppercase tracking-wider">Type</label>
                       <select name="case_type" value={formData.case_type} onChange={handleChange} className="w-full px-4 py-3 bg-white border border-black/[0.04] rounded-xl focus:ring-2 focus:ring-[#0066CC]/20 outline-none text-[15px] font-medium appearance-none">
                          <optgroup label="Mainstream Onshore Cases">
                            <option>Civil Cases</option>
                            <option>Commercial Cases</option>
                            <option>Real Estate Cases</option>
                            <option>Private Labor Cases</option>
                            <option>Domestic Workers Cases</option>
                            <option>Muslim Personal Status Cases</option>
                            <option>Non-Muslim Personal Status Cases</option>
                            <option>Urgent Matters / Summary Cases</option>
                          </optgroup>
                          <optgroup label="Criminal Cases">
                            <option>Infractions / Contraventions</option>
                            <option>Misdemeanors</option>
                            <option>Felonies</option>
                            <option>Juvenile Delinquency Cases</option>
                            <option>Cybercrime Cases</option>
                            <option>Anti-Money Laundering (AML) Cases</option>
                          </optgroup>
                          <optgroup label="Execution and Enforcement Cases">
                            <option>Standard Execution Cases</option>
                            <option>Deputation Execution Cases</option>
                            <option>Foreign Judgment Enforcement Cases</option>
                          </optgroup>
                          <optgroup label="Specialized Committee & Tribunal Cases">
                            <option>Rental Dispute Cases</option>
                            <option>Tax Dispute Cases</option>
                            <option>Insurance Dispute Cases</option>
                            <option>Banking and Financial Consumer Cases</option>
                            <option>Medical Malpractice Liability Cases</option>
                            <option>Customs Violation Cases</option>
                            <option>Intellectual Property Enforcement Cases</option>
                            <option>Corporate Bankruptcy and Insolvency Cases</option>
                            <option>Maritime and Shipping Cases</option>
                            <option>Local Arbitration Ratification/Nullification Cases</option>
                            <option>Sports Arbitration Cases</option>
                          </optgroup>
                          <optgroup label="Constitutional & Sovereign Cases">
                            <option>Constitutional Validity Appeals</option>
                            <option>Jurisdictional Conflict Cases</option>
                            <option>Administrative Lawsuits</option>
                          </optgroup>
                          <optgroup label="Free Zone Common Law Cases">
                            <option>Court of First Instance Commercial Cases</option>
                            <option>Court of Appeal Cases</option>
                            <option>Small Claims Tribunal (SCT) Cases</option>
                            <option>Technology & Construction Division (TCD) Cases</option>
                            <option>Digital Economy Court Cases</option>
                            <option>Arbitration Enforcement Cases</option>
                          </optgroup>
                       </select>
                     </div>
                     <div>
                       <label className="block text-[13px] font-semibold text-[#86868B] mb-1.5 uppercase tracking-wider">Risk Level</label>
                       <select name="risk_level" value={formData.risk_level} onChange={handleChange} className="w-full px-4 py-3 bg-white border border-black/[0.04] rounded-xl focus:ring-2 focus:ring-[#0066CC]/20 outline-none text-[15px] font-medium">
                         <option value="green">Standard (Green)</option>
                         <option value="amber">Elevated (Amber)</option>
                         <option value="red">High Risk (Red)</option>
                       </select>
                     </div>
                   </div>
                 </div>

                 <div className="pt-4 border-t border-black/[0.04] space-y-4">
                   <h3 className="text-lg font-bold text-[#1D1D1F]">Client Intake</h3>
                   <div>
                     <label className="block text-[13px] font-semibold text-[#86868B] mb-1.5 uppercase tracking-wider">Select Client</label>
                     <select name="client_id" value={formData.client_id} onChange={handleChange} className="w-full px-4 py-3 bg-white border border-black/[0.04] rounded-xl focus:ring-2 focus:ring-[#0066CC]/20 outline-none text-[15px] font-medium">
                       <option value="" disabled>Select a client...</option>
                       {firmClients.map(c => <option key={c.id} value={c.id}>{c.name} ({c.email})</option>)}
                       <option value="__NEW__" className="font-bold text-[#0066CC]">+ Add New Client...</option>
                     </select>
                   </div>
                   
                   {formData.client_id === '__NEW__' && (
                     <div className="p-5 bg-[#0066CC]/5 border border-[#0066CC]/10 rounded-2xl space-y-4 animate-in fade-in slide-in-from-top-2">
                       <p className="text-[12px] font-bold text-[#0066CC] uppercase tracking-wider">New Client Details</p>
                       <div>
                         <label className="block text-[13px] font-semibold text-[#86868B] mb-1.5">Client Name</label>
                         <input required type="text" name="client_name" value={formData.client_name} onChange={handleChange} placeholder="John Doe" className="w-full px-4 py-3 bg-white border border-black/[0.04] rounded-xl focus:ring-2 focus:ring-[#0066CC]/20 outline-none text-[15px] font-medium" />
                       </div>
                       <div>
                         <label className="block text-[13px] font-semibold text-[#86868B] mb-1.5">Client Email</label>
                         <input required type="email" name="client_email" value={formData.client_email} onChange={handleChange} placeholder="john@example.com" className="w-full px-4 py-3 bg-white border border-black/[0.04] rounded-xl focus:ring-2 focus:ring-[#0066CC]/20 outline-none text-[15px] font-medium" />
                       </div>
                       <div>
                         <label className="block text-[13px] font-semibold text-[#86868B] mb-1.5">Phone Number (Optional)</label>
                         <input type="tel" name="client_phone" value={formData.client_phone} onChange={handleChange} className="w-full px-4 py-3 bg-white border border-black/[0.04] rounded-xl focus:ring-2 focus:ring-[#0066CC]/20 outline-none text-[15px] font-medium" />
                       </div>
                       <div className="grid grid-cols-2 gap-4">
                         <div>
                           <label className="block text-[13px] font-semibold text-[#86868B] mb-1.5">Passport Number</label>
                           <input type="text" name="client_passport" value={formData.client_passport} onChange={handleChange} className="w-full px-4 py-3 bg-white border border-black/[0.04] rounded-xl focus:ring-2 focus:ring-[#0066CC]/20 outline-none text-[15px] font-medium" />
                         </div>
                         <div>
                           <label className="block text-[13px] font-semibold text-[#86868B] mb-1.5">Emirates ID</label>
                           <input type="text" name="client_emirates_id" value={formData.client_emirates_id} onChange={handleChange} className="w-full px-4 py-3 bg-white border border-black/[0.04] rounded-xl focus:ring-2 focus:ring-[#0066CC]/20 outline-none text-[15px] font-medium" />
                         </div>
                       </div>
                       <p className="text-xs text-[#0066CC]/80 font-medium">
                         * Submitting this will automatically provision the client with Secure Portal credentials.
                       </p>
                     </div>
                   )}
                 </div>
               </div>
             )}

             {step === 2 && (
               <div className="space-y-5 animate-in fade-in slide-in-from-right-8 duration-500">
                 <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center mb-2">
                    <UserPlus className="w-6 h-6 text-purple-600" />
                 </div>
                 <h3 className="text-lg font-bold text-[#1D1D1F]">Assign Team</h3>
                 
                 <div className="space-y-4">
                   <div>
                     <label className="block text-[13px] font-semibold text-[#86868B] mb-1.5 uppercase tracking-wider">Lead Lawyer</label>
                     <select name="lawyer_id" value={formData.lawyer_id} onChange={handleChange} className="w-full px-4 py-3 bg-white border border-black/[0.04] rounded-xl focus:ring-2 focus:ring-[#0066CC]/20 outline-none text-[15px] font-medium">
                       <option value="">Unassigned</option>
                       {lawyers.map(l => <option key={l.id} value={l.id}>{l.full_name} ({l.email})</option>)}
                     </select>
                   </div>
                   <div>
                     <label className="block text-[13px] font-semibold text-[#86868B] mb-1.5 uppercase tracking-wider">Assigned Paralegal</label>
                     <select name="paralegal_id" value={formData.paralegal_id} onChange={handleChange} className="w-full px-4 py-3 bg-white border border-black/[0.04] rounded-xl focus:ring-2 focus:ring-[#0066CC]/20 outline-none text-[15px] font-medium">
                       <option value="">Unassigned</option>
                       {paralegals.map(p => <option key={p.id} value={p.id}>{p.full_name} ({p.email})</option>)}
                     </select>
                   </div>
                 </div>

                 <div className="p-5 bg-[#0066CC]/5 border border-[#0066CC]/10 rounded-2xl mt-6">
                    <p className="text-sm text-[#0066CC] font-medium">
                      Initializing this matter will immediately dispatch Phase 1 (Intake) tasks to the assigned team members and log the creation in the timeline.
                    </p>
                 </div>
               </div>
             )}
           </div>
        </div>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-white/80 backdrop-blur-md border-t border-black/[0.04] flex items-center justify-between">
          {step === 1 ? (
             <>
               <button onClick={onClose} className="text-[13px] font-bold text-[#86868B] hover:text-[#1D1D1F] transition-colors">Cancel</button>
               <button 
                 onClick={() => { if(formData.title && formData.client_id) setStep(2) }}
                 className="bg-[#1D1D1F] text-white px-6 py-2.5 rounded-xl text-[13px] font-bold shadow-md hover:bg-black active:scale-95 transition-all disabled:opacity-50"
                 disabled={!formData.title || !formData.client_id || (formData.client_id === '__NEW__' && (!formData.client_name || !formData.client_email))}
               >
                 Next: Assign Team
               </button>
             </>
          ) : (
             <>
               <button onClick={() => setStep(1)} className="text-[13px] font-bold text-[#86868B] hover:text-[#1D1D1F] transition-colors">Back</button>
               <button 
                 onClick={handleSubmit}
                 disabled={isPending}
                 className="flex items-center gap-2 bg-[#0066CC] text-white px-6 py-2.5 rounded-xl text-[13px] font-bold shadow-md hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-50"
               >
                 {isPending ? 'Initializing...' : <><CheckCircle2 className="w-4 h-4" /> Initialize Matter</>}
               </button>
             </>
          )}
        </div>

      </div>
    </div>
  );
}
