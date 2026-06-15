"use client";

import React, { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X, User, Briefcase, FileText, AlertCircle, Loader2 } from "lucide-react";
import { createMatter } from "@/server/actions/case-actions";
import { useRouter } from "next/navigation";

export default function CreateMatterWizard({
  isOpen,
  setIsOpen,
  lawyers,
  paralegals
}: {
  isOpen: boolean;
  setIsOpen: (o: boolean) => void;
  lawyers: any[];
  paralegals: any[];
}) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientPhone, setClientPhone] = useState("");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [lawyerId, setLawyerId] = useState("");
  const [paralegalId, setParalegalId] = useState("");
  const [riskLevel, setRiskLevel] = useState("low");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 3) {
      setStep(step + 1);
      return;
    }

    if (!title || !clientName || !clientEmail || !lawyerId) {
      setError("Please fill out all required fields.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await createMatter({
        title,
        description,
        case_type: "Civil Litigation",
        new_client: {
          name: clientName,
          email: clientEmail,
          phone: clientPhone
        },
        lawyer_id: lawyerId,
        paralegal_id: paralegalId || undefined,
        risk_level: riskLevel as any,
        status: 'open'
      });
      
      setIsOpen(false);
      
      // Reset form
      setStep(1);
      setClientName("");
      setClientEmail("");
      setClientPhone("");
      setTitle("");
      setDescription("");
      setLawyerId("");
      setParalegalId("");
      
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Failed to create matter");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => {
      setIsOpen(open);
      if (!open) setStep(1); // Reset step on close
    }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 transition-opacity" />
        <Dialog.Content className="fixed top-[50%] left-[50%] -translate-x-[50%] -translate-y-[50%] w-[95%] max-w-lg bg-white rounded-xl shadow-2xl p-0 z-50 overflow-hidden border border-gray-200 focus:outline-none">
          
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
            <div>
              <Dialog.Title className="text-lg font-semibold text-gray-900">
                New Matter Intake
              </Dialog.Title>
              <Dialog.Description className="text-sm text-gray-500 mt-0.5">
                Step {step} of 3
              </Dialog.Description>
            </div>
            <Dialog.Close asChild>
              <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
                <X className="h-5 w-5" />
              </button>
            </Dialog.Close>
          </div>

          <div className="h-1 w-full bg-gray-100">
            <div 
              className="h-full bg-blue-600 transition-all duration-300 ease-in-out" 
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {error && (
              <div className="p-3 rounded-md bg-red-50 border border-red-200 text-red-600 text-sm flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}

            {step === 1 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="flex items-center gap-2 text-sm font-medium text-blue-600 mb-2">
                  <User className="h-4 w-4" /> Client Information
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">Client Full Name *</label>
                  <input
                    type="text"
                    required
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="w-full text-gray-900 px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">Client Email *</label>
                  <input
                    type="email"
                    required
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    className="w-full text-gray-900 px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">Phone Number</label>
                  <input
                    type="tel"
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    className="w-full text-gray-900 px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
                  />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="flex items-center gap-2 text-sm font-medium text-blue-600 mb-2">
                  <FileText className="h-4 w-4" /> Matter Details
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">Matter Title *</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full text-gray-900 px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">Matter Description & Context</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    placeholder="This will be used to generate AI vector embeddings for similarity searches..."
                    className="w-full text-gray-900 px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-gray-400 shadow-sm resize-none"
                  />
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="flex items-center gap-2 text-sm font-medium text-blue-600 mb-2">
                  <Briefcase className="h-4 w-4" /> Assignments & Risk
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">Lead Lawyer *</label>
                  <select
                    required
                    value={lawyerId}
                    onChange={(e) => setLawyerId(e.target.value)}
                    className="w-full text-gray-900 px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm appearance-none"
                    style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: `right 0.5rem center`, backgroundRepeat: `no-repeat`, backgroundSize: `1.5em 1.5em`, paddingRight: `2.5rem` }}
                  >
                    <option value="">-- Select Lawyer --</option>
                    {lawyers.map(l => (
                      <option key={l.id} value={l.id}>{l.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">Paralegal (Optional)</label>
                  <select
                    value={paralegalId}
                    onChange={(e) => setParalegalId(e.target.value)}
                    className="w-full text-gray-900 px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm appearance-none"
                    style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: `right 0.5rem center`, backgroundRepeat: `no-repeat`, backgroundSize: `1.5em 1.5em`, paddingRight: `2.5rem` }}
                  >
                    <option value="">-- Unassigned --</option>
                    {paralegals.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">Initial Risk Level</label>
                  <select
                    value={riskLevel}
                    onChange={(e) => setRiskLevel(e.target.value)}
                    className="w-full text-gray-900 px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm appearance-none"
                    style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: `right 0.5rem center`, backgroundRepeat: `no-repeat`, backgroundSize: `1.5em 1.5em`, paddingRight: `2.5rem` }}
                  >
                    <option value="low">Green (Low Risk)</option>
                    <option value="medium">Amber (Medium Risk)</option>
                    <option value="high">Red (High Risk)</option>
                  </select>
                </div>
              </div>
            )}

            <div className="pt-4 flex justify-between items-center border-t border-gray-100 mt-2">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={() => setStep(step - 1)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-sm transition-colors"
                >
                  Back
                </button>
              ) : (
                <div /> // Placeholder
              )}
              
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-sm transition-colors flex items-center gap-2 ml-auto"
              >
                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                {step < 3 ? "Continue" : (isSubmitting ? "Generating AI Embedding..." : "Create Matter")}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
