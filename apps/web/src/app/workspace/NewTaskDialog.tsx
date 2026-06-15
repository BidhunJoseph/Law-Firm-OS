"use client";

import React, { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X, Calendar, AlertCircle, Loader2 } from "lucide-react";
import { createTask } from "@/server/actions/workspace-actions";
import { useRouter } from "next/navigation";

export default function NewTaskDialog({
  isOpen,
  setIsOpen,
  cases,
  userId
}: {
  isOpen: boolean;
  setIsOpen: (o: boolean) => void;
  cases: any[];
  userId?: string;
}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [caseId, setCaseId] = useState("");
  const [priority, setPriority] = useState("medium");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !dueDate || !caseId) {
      setError("Title, due date, and matter are required.");
      return;
    }
    if (!userId) {
      setError("Unable to resolve user session.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      await createTask({
        title,
        description,
        due_date: new Date(dueDate),
        case_id: caseId,
        assignee_id: userId,
      });
      setIsOpen(false);
      setTitle("");
      setDescription("");
      setDueDate("");
      setCaseId("");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Failed to create task");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 transition-opacity" />
        <Dialog.Content className="fixed top-[50%] left-[50%] -translate-x-[50%] -translate-y-[50%] w-full max-w-lg bg-white rounded-xl shadow-2xl p-0 z-50 overflow-hidden border border-gray-200">
          
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
            <div>
              <Dialog.Title className="text-lg font-semibold text-gray-900">
                New Task
              </Dialog.Title>
              <Dialog.Description className="text-sm text-gray-500 mt-0.5">
                Create a new task and assign it to a matter.
              </Dialog.Description>
            </div>
            <Dialog.Close asChild>
              <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
                <X className="h-5 w-5" />
              </button>
            </Dialog.Close>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {error && (
              <div className="p-3 rounded-md bg-red-50 border border-red-200 text-red-600 text-sm flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Task Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="E.g. Review Discovery Documents"
                className="w-full text-gray-900 px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-gray-400 shadow-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Due Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="date"
                    required
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full text-gray-900 pl-9 pr-3 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Priority</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full text-gray-900 px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm appearance-none"
                  style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: `right 0.5rem center`, backgroundRepeat: `no-repeat`, backgroundSize: `1.5em 1.5em`, paddingRight: `2.5rem` }}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Related Matter</label>
              <select
                required
                value={caseId}
                onChange={(e) => setCaseId(e.target.value)}
                className="w-full text-gray-900 px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm appearance-none"
                style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: `right 0.5rem center`, backgroundRepeat: `no-repeat`, backgroundSize: `1.5em 1.5em`, paddingRight: `2.5rem` }}
              >
                <option value="">-- Select Matter --</option>
                {cases.map((c) => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full text-gray-900 px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-gray-400 shadow-sm resize-none"
                placeholder="Any additional details..."
              />
            </div>

            <div className="pt-4 flex justify-end gap-3 border-t border-gray-100 mt-2">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-sm transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-sm transition-colors flex items-center gap-2"
              >
                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                {isSubmitting ? "Saving..." : "Create Task"}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
