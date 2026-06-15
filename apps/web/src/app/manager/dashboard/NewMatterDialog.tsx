"use client";

import React, { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X, Building2, User, Users, AlignLeft, Briefcase, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { createMatter } from "@/server/actions/case-actions";

const matterSchema = z.object({
  title: z.string().min(1, "Matter name is required"),
  clientId: z.string().min(1, "Client is required"),
  newClientName: z.string().optional(),
  newClientEmail: z.string().email("Invalid email").optional().or(z.literal("")),
  newClientPhone: z.string().optional(),
  newClientPassword: z.string().optional(),
  lawyerId: z.string().optional(),
  paralegalId: z.string().optional(),
  internalNotes: z.string().optional(),
  caseType: z.string().min(1, "Case type is required"),
}).refine(data => {
  if (data.clientId === "NEW" && !data.newClientName) return false;
  return true;
}, {
  message: "Client name is required",
  path: ["newClientName"]
});

type FormData = z.infer<typeof matterSchema>;

interface Props {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  clients: { id: string; name: string }[];
  lawyers: { id: string; name: string }[];
  paralegals: { id: string; name: string }[];
}

export function NewMatterDialog({ isOpen, setIsOpen, clients, lawyers, paralegals }: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, handleSubmit, watch, formState: { errors }, reset } = useForm<FormData>({
    resolver: zodResolver(matterSchema),
    defaultValues: {
      title: "",
      clientId: "",
      newClientName: "",
      newClientEmail: "",
      lawyerId: "",
      paralegalId: "",
      internalNotes: "",
      caseType: "Civil Litigation",
    }
  });

  const watchClientId = watch("clientId");
  const isNewClient = watchClientId === "NEW";

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      await createMatter({
        title: data.title,
        description: data.internalNotes,
        case_type: data.caseType,
        client_id: data.clientId === "NEW" ? undefined : data.clientId,
        new_client: data.clientId === "NEW" ? {
          name: data.newClientName!,
          email: data.newClientEmail!,
          phone: data.newClientPhone,
          password: data.newClientPassword,
        } : undefined,
        lawyer_id: data.lawyerId || undefined,
        paralegal_id: data.paralegalId || undefined,
        status: "open",
        risk_level: "low",
      });

      setIsOpen(false);
      reset();
    } catch (error: any) {
      console.error("CREATE MATTER ERROR:", error);
      alert(`Failed to create matter: ${error?.message || "Unknown error"}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 border-l border-gray-100 flex flex-col data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right duration-300">
          
          <div className="flex items-center justify-between px-8 py-5 border-b border-gray-100/70 bg-gradient-to-r from-gray-50/80 to-white shrink-0">
            <Dialog.Title className="text-xl font-semibold text-gray-900 flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-xl">
                <Briefcase className="w-5 h-5 text-blue-600" />
              </div>
              Create New Matter
            </Dialog.Title>
            <Dialog.Close className="p-2.5 text-gray-400 hover:text-gray-900 hover:bg-gray-50 rounded-xl shadow-sm hover:shadow border border-transparent hover:border-gray-200/50 transition-all active:scale-95">
              <X className="w-5 h-5" />
            </Dialog.Close>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-y-auto">
            <div className="p-8 space-y-8">
              
              {/* Matter Details */}
              <div className="space-y-5">
                <h3 className="text-sm font-semibold text-gray-900 border-b border-gray-100/70 pb-2">Matter Details</h3>
                
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Matter Name</label>
                  <input
                    {...register("title")}
                    placeholder="e.g. Acme Corp Acquisition"
                    className="w-full px-4 py-3 text-sm text-gray-900 bg-gray-50 border border-gray-200/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-gray-300 focus:bg-white transition-all shadow-inner"
                  />
                  {errors.title && <span className="text-xs text-rose-500 font-medium">{errors.title.message}</span>}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Case Type</label>
                  <select
                    {...register("caseType")}
                    className="w-full px-4 py-3 text-sm text-gray-900 bg-gray-50 border border-gray-200/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-gray-300 transition-all shadow-inner appearance-none"
                  >
                    <option value="Civil Litigation">Civil Litigation (Local Courts)</option>
                    <option value="Commercial Litigation">Commercial Litigation</option>
                    <option value="Criminal">Criminal</option>
                    <option value="Real Estate & Property">Real Estate & Property</option>
                    <option value="Employment / Labor">Employment / Labor</option>
                    <option value="Family & Personal Status">Family & Personal Status</option>
                    <option value="Arbitration">Arbitration (DIAC / ICC)</option>
                    <option value="DIFC / ADGM Courts">DIFC / ADGM Courts</option>
                    <option value="Corporate / Advisory">Corporate / Advisory</option>
                    <option value="Cheque Execution">Cheque Execution</option>
                  </select>
                  {errors.caseType && <span className="text-xs text-rose-500 font-medium">{errors.caseType.message}</span>}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Description / Notes</label>
                  <textarea
                    {...register("internalNotes")}
                    rows={3}
                    placeholder="Internal details..."
                    className="w-full px-4 py-3 text-sm text-gray-900 bg-gray-50 border border-gray-200/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-gray-300 focus:bg-white transition-all shadow-inner resize-none"
                  />
                </div>
              </div>

              {/* Client Selection */}
              <div className="space-y-5">
                <h3 className="text-sm font-semibold text-gray-900 border-b border-gray-100/70 pb-2 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-gray-400" /> Client
                </h3>
                
                <div className="space-y-1.5">
                  <select
                    {...register("clientId")}
                    className="w-full px-4 py-3 text-sm text-gray-900 bg-gray-50 border border-gray-200/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-gray-300 transition-all shadow-inner appearance-none"
                  >
                    <option value="">Select a client...</option>
                    {clients.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                    <option value="NEW">+ Add New Client</option>
                  </select>
                  {errors.clientId && <span className="text-xs text-rose-500 font-medium">{errors.clientId.message}</span>}
                </div>

                {isNewClient && (
                  <div className="p-5 bg-gray-50/80 rounded-2xl border border-gray-200/60 space-y-4 shadow-inner mt-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Client Name *</label>
                      <input
                        {...register("newClientName")}
                        placeholder="Full name or company name"
                        className="w-full px-4 py-2.5 text-sm text-gray-900 bg-white border border-gray-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-gray-300 transition-all shadow-sm"
                      />
                      {errors.newClientName && <span className="text-xs text-rose-500 font-medium">{errors.newClientName.message}</span>}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Client Email *</label>
                        <input
                          {...register("newClientEmail")}
                          type="email"
                          placeholder="client@company.com"
                          className="w-full px-4 py-3 text-sm text-gray-900 bg-gray-50 border border-gray-200/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-gray-300 focus:bg-white transition-all shadow-inner"
                        />
                        {errors.newClientEmail && <span className="text-xs text-rose-500 font-medium">{errors.newClientEmail.message}</span>}
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Client Portal Password *</label>
                        <input
                          {...register("newClientPassword")}
                          type="text"
                          placeholder="e.g. SecurePass123!"
                          className="w-full px-4 py-3 text-sm text-gray-900 bg-gray-50 border border-gray-200/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-gray-300 focus:bg-white transition-all shadow-inner"
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Phone Number</label>
                      <input
                        {...register("newClientPhone")}
                        placeholder="+1 555-0000"
                        className="w-full px-4 py-2.5 text-sm text-gray-900 bg-white border border-gray-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-gray-300 transition-all shadow-sm"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-5">
                <h3 className="text-sm font-semibold text-gray-900 border-b border-gray-100/70 pb-2 flex items-center gap-2">
                  <Users className="w-4 h-4 text-gray-400" /> Initial Team
                </h3>
                
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Lead Attorney</label>
                    <select
                      {...register("lawyerId")}
                      className="w-full px-4 py-3 text-sm text-gray-900 bg-gray-50 border border-gray-200/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-gray-300 transition-all shadow-inner appearance-none"
                    >
                      <option value="">Unassigned (Assign Later)</option>
                      {lawyers.map(l => (
                        <option key={l.id} value={l.id}>{l.name}</option>
                      ))}
                    </select>
                    {errors.lawyerId && <span className="text-xs text-rose-500 font-medium">{errors.lawyerId.message}</span>}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Paralegal (Optional)</label>
                    <select
                      {...register("paralegalId")}
                      className="w-full px-4 py-3 text-sm text-gray-900 bg-gray-50 border border-gray-200/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-gray-300 transition-all shadow-inner appearance-none"
                    >
                      <option value="">None</option>
                      {paralegals.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-8 py-5 border-t border-gray-100/70 bg-gray-50/50 flex items-center justify-end gap-3">
              <Dialog.Close asChild>
                <button 
                  type="button" 
                  className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 border border-gray-200/60 rounded-xl shadow-sm hover:shadow transition-all active:scale-95"
                >
                  Cancel
                </button>
              </Dialog.Close>
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="px-6 py-2.5 text-sm font-medium text-white bg-black hover:bg-gray-900 rounded-xl shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 flex items-center gap-2"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create Matter"}
              </button>
            </div>
          </form>
          
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
