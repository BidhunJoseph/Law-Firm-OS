"use client";

import React, { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X, CheckCircle2, UserCheck, Shield, Loader2 } from "lucide-react";
import { submitKYCForm } from "@/server/actions/case-actions";
import { useRouter } from "next/navigation";

export default function KYCModal({
  isOpen,
  setIsOpen,
  task
}: {
  isOpen: boolean;
  setIsOpen: (o: boolean) => void;
  task: any;
}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passport, setPassport] = useState("");
  const [emiratesId, setEmiratesId] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (!task || !task.case) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passport || !emiratesId) {
      setError("Please fill in all KYC details.");
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    try {
      await submitKYCForm(task.case.client_id, task.id, task.case_id, {
        passport_number: passport,
        emirates_id: emiratesId
      });
      setIsOpen(false);
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Failed to submit KYC");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 transition-all" />
        <Dialog.Content className="fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] w-full max-w-md bg-white rounded-3xl p-8 shadow-2xl z-50 focus:outline-none">
          
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <Dialog.Title className="text-xl font-bold text-gray-900">
                  Collect KYC
                </Dialog.Title>
                <Dialog.Description className="text-sm text-gray-500">
                  Matter: {task.case?.title}
                </Dialog.Description>
              </div>
            </div>
            <Dialog.Close asChild>
              <button className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </Dialog.Close>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3 bg-red-50 text-red-700 text-sm rounded-xl border border-red-100">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Passport Number</label>
              <input
                type="text"
                placeholder="e.g. A1234567"
                value={passport}
                onChange={(e) => setPassport(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Emirates ID</label>
              <input
                type="text"
                placeholder="e.g. 784-1234-1234567-1"
                value={emiratesId}
                onChange={(e) => setEmiratesId(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                required
              />
            </div>

            <div className="pt-4 flex gap-3">
              <Dialog.Close asChild>
                <button type="button" className="flex-1 px-4 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
              </Dialog.Close>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-[2] px-4 py-3 text-sm font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 focus:ring-4 focus:ring-blue-500/20 transition-all flex items-center justify-center gap-2"
              >
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <UserCheck className="w-5 h-5" />}
                {isSubmitting ? "Processing..." : "Submit & Advance Phase"}
              </button>
            </div>
          </form>

        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
