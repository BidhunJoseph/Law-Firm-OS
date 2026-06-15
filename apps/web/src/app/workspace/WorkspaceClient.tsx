"use client";

import React, { useState } from "react";
import { 
  CheckCircle2, 
  Circle, 
  AlertCircle, 
  FileText, 
  MessageSquare, 
  MoreHorizontal, 
  Calendar, 
  X, 
  Search, 
  Filter, 
  Briefcase,
  Maximize2,
  ExternalLink,
  Loader2,
  Plus
} from "lucide-react";
import * as Tabs from "@radix-ui/react-tabs";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { updateTaskStatus } from "@/server/actions/workspace-actions";
import NewTaskDialog from "./NewTaskDialog";
import MatterCockpit from "@/components/features/cases/MatterCockpit";
import KYCModal from "./KYCModal";

type TaskStatus = "pending" | "in_progress" | "completed";

// The real Prisma Task type
interface CaseData {
  title: string;
}
interface RealTask {
  id: string;
  title: string;
  description: string | null;
  due_date: Date;
  status: TaskStatus;
  priority?: string; // Optional since it may not exist in schema
  case: CaseData;
  created_at: Date;
  assignee_id: string;
}

const PriorityBadge = ({ priority }: { priority: string }) => {
  const p = priority.toLowerCase();
  const styles: Record<string, string> = {
    high: "bg-red-50 text-red-700 border-red-200",
    medium: "bg-orange-50 text-orange-700 border-orange-200",
    low: "bg-blue-50 text-blue-700 border-blue-200",
  };
  const fallback = "bg-gray-50 text-gray-700 border-gray-200";
  
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${styles[p] || fallback}`}>
      {priority.charAt(0).toUpperCase() + priority.slice(1)}
    </span>
  );
};

const TypeIcon = ({ type }: { type: string }) => {
  switch (type) {
    case "document_review": return <FileText className="w-4 h-4 text-blue-600" />;
    case "filing": return <Briefcase className="w-4 h-4 text-purple-600" />;
    case "client_communication": return <MessageSquare className="w-4 h-4 text-green-600" />;
    case "research": return <Search className="w-4 h-4 text-orange-600" />;
    default: return <FileText className="w-4 h-4 text-gray-600" />;
  }
};

export default function WorkspaceClient({ initialTasks, cases = [], userId }: { initialTasks: RealTask[], cases?: any[], userId: string }) {
  const router = useRouter();
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(initialTasks.length > 0 ? initialTasks[0].id : null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [isKYCModalOpen, setIsKYCModalOpen] = useState(false);
  const [selectedTaskObj, setSelectedTaskObj] = useState<any>(null);

  const selectedTask = initialTasks.find(t => t.id === selectedTaskId);
  // selectedCase removed to fix lint

  const filteredTasks = initialTasks.filter(task => {
    if (activeTab === "pending" && task.status === "completed") return false;
    if (activeTab === "completed" && task.status !== "completed") return false;
    const titleMatch = task.title.toLowerCase().includes(searchQuery.toLowerCase());
    const caseMatch = task.case?.title?.toLowerCase().includes(searchQuery.toLowerCase());
    if (searchQuery && !titleMatch && !caseMatch) return false;
    return true;
  });

  const filteredCases = cases.filter(c => 
    c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.client?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-full bg-[#f8f9fa] overflow-hidden font-sans">
      
      {/* Main Task List Area */}
      <div className="flex-1 flex flex-col min-w-0 transition-all duration-300">
        
        {/* Header */}
        <div className="px-8 py-6 bg-white/80 backdrop-blur-xl border-b border-gray-200/50 shrink-0 shadow-[0_2px_10px_rgb(0,0,0,0.02)] z-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-normal text-[#202124] tracking-tight">Unified Workspace</h1>
              <p className="text-sm text-[#5f6368] mt-1">Manage your tasks and review cases across all matters.</p>
            </div>
            <button 
              onClick={() => setIsNewTaskOpen(true)}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-all shadow-md hover:shadow-lg active:scale-95 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> New Task
            </button>
          </div>

          <div className="flex items-center justify-between">
            <Tabs.Root value={activeTab} onValueChange={setActiveTab} className="w-full">
              <Tabs.List className="flex gap-6 border-b border-gray-100">
                <Tabs.Trigger 
                  value="all" 
                  className={`pb-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'all' ? 'border-[#1a73e8] text-[#1a73e8]' : 'border-transparent text-[#5f6368] hover:text-[#202124]'}`}
                >
                  All Tasks
                </Tabs.Trigger>
                <Tabs.Trigger 
                  value="pending" 
                  className={`pb-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'pending' ? 'border-[#1a73e8] text-[#1a73e8]' : 'border-transparent text-[#5f6368] hover:text-[#202124]'}`}
                >
                  Pending & Active
                </Tabs.Trigger>
                <Tabs.Trigger 
                  value="completed" 
                  className={`pb-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'completed' ? 'border-[#1a73e8] text-[#1a73e8]' : 'border-transparent text-[#5f6368] hover:text-[#202124]'}`}
                >
                  Completed
                </Tabs.Trigger>
                <Tabs.Trigger 
                  value="matters" 
                  className={`pb-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'matters' ? 'border-purple-600 text-purple-700' : 'border-transparent text-[#5f6368] hover:text-[#202124]'}`}
                >
                  <Briefcase className="w-4 h-4" /> Matters Pipeline
                </Tabs.Trigger>
              </Tabs.List>
            </Tabs.Root>

            <div className="flex items-center gap-3 -mt-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Search tasks..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-4 py-2.5 bg-[#f1f3f4]/80 backdrop-blur-md text-gray-900 border-transparent focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl text-sm w-64 transition-all outline-none"
                />
              </div>
              <button className="p-2 text-[#5f6368] hover:bg-white hover:shadow-sm rounded-xl transition-all active:scale-95 border border-transparent hover:border-gray-200/50">
                <Filter className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Task List */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-gradient-to-br from-[#f8f9fa] to-gray-50">
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-white/40 overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300">
            {filteredTasks.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {filteredTasks.map((task) => {
                  const priority = task.priority || "medium";
                  const type = "document_review"; // Default since not in schema
                  const dueDate = format(new Date(task.due_date), "MMM dd, yyyy");
                  const isToday = format(new Date(), "MMM dd, yyyy") === dueDate;
                  const displayDate = isToday ? "Today" : dueDate;

                  return (
                    <div 
                      key={task.id}
                      onClick={() => {
                        setSelectedTaskId(task.id);
                        if (task.title === "Collect KYC" && task.status !== "completed") {
                          setSelectedTaskObj(task);
                          setIsKYCModalOpen(true);
                        }
                      }}
                      className={`group flex items-start gap-4 p-4 cursor-pointer transition-all duration-300 hover:bg-blue-50/50 active:bg-blue-100/50 ${selectedTaskId === task.id ? 'bg-blue-50/80 shadow-[inset_4px_0_0_0_rgb(37,99,235)]' : ''}`}
                    >
                      <button className="mt-1 text-gray-400 hover:text-blue-600 transition-colors shrink-0 group-hover:scale-110">
                        {task.status === 'completed' ? (
                          <CheckCircle2 className="w-5 h-5 text-green-500" />
                        ) : (
                          <Circle className="w-5 h-5" />
                        )}
                      </button>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-4 mb-1">
                          <div className="flex items-center gap-2 truncate">
                            <span className="truncate font-medium text-[#202124]">{task.title}</span>
                            {priority === 'high' && <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />}
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            <PriorityBadge priority={priority} />
                            <span className={`text-xs font-medium ${isToday ? 'text-red-600' : 'text-[#5f6368]'}`}>
                              {displayDate}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-[#5f6368]">
                          <div className="flex items-center gap-1.5">
                            <Briefcase className="w-3.5 h-3.5" />
                            <span className="truncate">{task.case?.title || "No Case"}</span>
                          </div>
                          <div className="w-1 h-1 rounded-full bg-gray-300" />
                          <div className="flex items-center gap-1.5">
                            <TypeIcon type={type} />
                            <span className="capitalize">{type.replace('_', ' ')}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-12 text-center text-[#5f6368]">
                <CheckCircle2 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-[#202124] mb-1">No tasks found</h3>
                <p>You're all caught up or try adjusting your search filters.</p>
              </div>
            )}
            
            {activeTab === 'matters' && (
              filteredCases.length > 0 ? (
                <div className="divide-y divide-gray-100">
                  {filteredCases.map(c => (
                    <div 
                      key={c.id}
                      onClick={() => {
                        router.push(`/workspace/cases/${c.id}`);
                      }}
                      className={`group flex items-center gap-4 p-4 cursor-pointer transition-all duration-300 hover:bg-purple-50/50 active:bg-purple-100/50`}
                    >
                      <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                        <Briefcase className="w-5 h-5 text-purple-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-[#202124] truncate">{c.title}</span>
                          <span className="text-xs font-medium text-[#5f6368] bg-gray-100 px-2 py-0.5 rounded-full capitalize">{c.current_phase || 'Intake'}</span>
                        </div>
                        <div className="text-sm text-[#5f6368] flex items-center gap-3">
                          <span className="truncate">{c.client?.name || "No Client"}</span>
                          <span>•</span>
                          <span className="truncate text-blue-600">Next: {c.next_action || "Awaiting Review"}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center text-[#5f6368]">
                  <Briefcase className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium text-[#202124] mb-1">No matters found</h3>
                  <p>There are no active matters matching your search.</p>
                </div>
              )
            )}
          </div>
        </div>
      </div>

      {/* Focus Mode Panel */}
      {selectedTask && (
        <div className="w-[40%] max-w-lg min-w-[380px] bg-white/95 backdrop-blur-2xl border-l border-white/40 flex flex-col shadow-[-20px_0_40px_-10px_rgba(0,0,0,0.05)] z-20 animate-in slide-in-from-right-8 duration-300">
          {/* Panel Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100/50 bg-transparent shrink-0">
            <div className="flex items-center gap-2">
              <span className="bg-blue-50 text-blue-700 px-2.5 py-1 rounded-md text-xs font-semibold tracking-wide uppercase">
                Focus Mode
              </span>
              <span className="text-sm text-[#5f6368]">{selectedTask.id.slice(0,8)}...</span>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 text-gray-400 hover:text-[#202124] hover:bg-gray-50 rounded-full transition-colors">
                <Maximize2 className="w-4 h-4" />
              </button>
              <button className="p-2 text-gray-400 hover:text-[#202124] hover:bg-gray-50 rounded-full transition-colors">
                <MoreHorizontal className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setSelectedTaskId(null)}
                className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-50 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {/* Task Details Content */}
            <div className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <PriorityBadge priority={selectedTask.priority || "medium"} />
                <span className="flex items-center gap-1.5 text-sm text-[#5f6368] capitalize">
                  <TypeIcon type="document_review" />
                  Document Review
                </span>
              </div>
              
              <h2 className="text-2xl font-semibold text-[#202124] mb-6 leading-tight">
                {selectedTask.title}
              </h2>

              <div className="grid grid-cols-2 gap-y-4 mb-8">
                <div>
                  <span className="block text-xs font-medium text-[#5f6368] uppercase tracking-wider mb-1">Matter</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-[#1a73e8] font-medium hover:underline cursor-pointer">
                      {selectedTask.case?.title || "No Case"}
                    </span>
                    <ExternalLink className="w-3 h-3 text-[#1a73e8]" />
                  </div>
                </div>
                <div>
                  <span className="block text-xs font-medium text-[#5f6368] uppercase tracking-wider mb-1">Due Date</span>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className={`text-sm font-medium ${format(new Date(), "MMM dd, yyyy") === format(new Date(selectedTask.due_date), "MMM dd, yyyy") ? 'text-red-600' : 'text-[#202124]'}`}>
                      {format(new Date(selectedTask.due_date), "MMM dd, yyyy")}
                    </span>
                  </div>
                </div>
                <div>
                  <span className="block text-xs font-medium text-[#5f6368] uppercase tracking-wider mb-1">Assigned By</span>
                  <span className="text-sm text-[#202124]">System / Partner</span>
                </div>
                <div>
                  <span className="block text-xs font-medium text-[#5f6368] uppercase tracking-wider mb-1">Date Assigned</span>
                  <span className="text-sm text-[#202124]">{format(new Date(selectedTask.created_at), "MMM dd, yyyy")}</span>
                </div>
              </div>

              <div className="mb-8">
                <span className="block text-xs font-medium text-[#5f6368] uppercase tracking-wider mb-2">Description</span>
                <p className="text-sm text-[#3c4043] leading-relaxed whitespace-pre-wrap bg-gray-50/50 p-5 rounded-2xl border border-gray-100/50 shadow-inner">
                  {selectedTask.description || "No description provided."}
                </p>
              </div>

              {/* Context Actions */}
              <div className="mt-8 pt-6 border-t border-gray-100 flex gap-3">
                {selectedTask.status !== 'completed' && (
                  <button 
                    onClick={async () => {
                      setIsCompleting(true);
                      try {
                        await updateTaskStatus(selectedTask.id, "completed");
                        router.refresh();
                      } catch (err) {
                        console.error(err);
                      } finally {
                        setIsCompleting(false);
                      }
                    }}
                    disabled={isCompleting}
                    className="flex-1 bg-[#1a73e8] hover:bg-[#1557b0] text-white py-2.5 rounded-full text-sm font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    {isCompleting && <Loader2 className="w-4 h-4 animate-spin" />}
                    Complete Task
                  </button>
                )}
                <button className="flex-1 bg-white border border-gray-300 hover:bg-gray-50 text-[#202124] py-2.5 rounded-full text-sm font-medium transition-colors">
                  Add Note
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      <NewTaskDialog 
        isOpen={isNewTaskOpen} 
        setIsOpen={setIsNewTaskOpen} 
        cases={cases} 
        userId={userId}
      />
      <KYCModal
        isOpen={isKYCModalOpen}
        setIsOpen={setIsKYCModalOpen}
        task={selectedTaskObj}
      />
    </div>
  );
}
