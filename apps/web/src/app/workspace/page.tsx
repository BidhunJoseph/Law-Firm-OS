"use client";

import React, { useState } from "react";
import { 
  CheckCircle2, 
  Circle, 
  AlertCircle, 
  FileText, 
  MessageSquare, 
  Clock, 
  MoreHorizontal, 
  Calendar, 
  ChevronRight, 
  X, 
  Search, 
  Filter, 
  Briefcase,
  Paperclip,
  Maximize2,
  ExternalLink,
  Eye
} from "lucide-react";
import * as Tabs from "@radix-ui/react-tabs";

type TaskStatus = "pending" | "in_progress" | "completed";
type TaskPriority = "high" | "medium" | "low";
type TaskType = "document_review" | "filing" | "client_communication" | "research";

interface Task {
  id: string;
  title: string;
  caseName: string;
  caseId: string;
  dueDate: string;
  status: TaskStatus;
  type: TaskType;
  priority: TaskPriority;
  description: string;
  assigner: string;
  dateAssigned: string;
  documentCount?: number;
}

const mockTasks: Task[] = [
  {
    id: "TSK-001",
    title: "Review MSA for TechCorp Merger",
    caseName: "TechCorp Acquisition",
    caseId: "MAT-2023-089",
    dueDate: "Today",
    status: "pending",
    type: "document_review",
    priority: "high",
    description: "Please review the indemnification clauses in section 4. Ensure they align with our standard risk profile. The client flagged this as urgent.",
    assigner: "Sarah Jenkins (Partner)",
    dateAssigned: "Oct 12, 2023",
    documentCount: 3,
  },
  {
    id: "TSK-002",
    title: "Draft Motion to Dismiss",
    caseName: "Smith v. Global Retail",
    caseId: "MAT-2023-142",
    dueDate: "Tomorrow",
    status: "in_progress",
    type: "filing",
    priority: "high",
    description: "Draft initial motion to dismiss based on lack of personal jurisdiction. Case law references are in the shared folder.",
    assigner: "David Chen (Partner)",
    dateAssigned: "Oct 10, 2023",
    documentCount: 1,
  },
  {
    id: "TSK-003",
    title: "Follow up with opposing counsel re: Discovery",
    caseName: "Estate of M. Williams",
    caseId: "MAT-2023-055",
    dueDate: "Oct 15",
    status: "pending",
    type: "client_communication",
    priority: "medium",
    description: "Need to secure the remaining financial statements from 2021. They are past the 30-day window.",
    assigner: "Self",
    dateAssigned: "Oct 01, 2023",
  },
  {
    id: "TSK-004",
    title: "Research IP precedents for software patents",
    caseName: "InnoTech Patent Defense",
    caseId: "MAT-2023-112",
    dueDate: "Oct 18",
    status: "completed",
    type: "research",
    priority: "low",
    description: "Find recent CAFC cases regarding abstract ideas in ML algorithms.",
    assigner: "Sarah Jenkins (Partner)",
    dateAssigned: "Sep 28, 2023",
  },
];

const PriorityBadge = ({ priority }: { priority: TaskPriority }) => {
  const styles = {
    high: "bg-red-50 text-red-700 border-red-200",
    medium: "bg-orange-50 text-orange-700 border-orange-200",
    low: "bg-blue-50 text-blue-700 border-blue-200",
  };
  
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${styles[priority]}`}>
      {priority.charAt(0).toUpperCase() + priority.slice(1)}
    </span>
  );
};

const TypeIcon = ({ type }: { type: TaskType }) => {
  switch (type) {
    case "document_review": return <FileText className="w-4 h-4 text-blue-600" />;
    case "filing": return <Briefcase className="w-4 h-4 text-purple-600" />;
    case "client_communication": return <MessageSquare className="w-4 h-4 text-green-600" />;
    case "research": return <Search className="w-4 h-4 text-orange-600" />;
  }
};

export default function WorkspacePage() {
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(mockTasks[0].id);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const selectedTask = mockTasks.find(t => t.id === selectedTaskId);

  const filteredTasks = mockTasks.filter(task => {
    if (activeTab === "pending" && task.status === "completed") return false;
    if (activeTab === "completed" && task.status !== "completed") return false;
    if (searchQuery && !task.title.toLowerCase().includes(searchQuery.toLowerCase()) && !task.caseName.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="flex h-full bg-[#f8f9fa] overflow-hidden font-sans">
      
      {/* Main Task List Area */}
      <div className="flex-1 flex flex-col min-w-0 transition-all duration-300">
        
        {/* Header */}
        <div className="px-8 py-6 bg-white border-b border-gray-200 shrink-0">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-normal text-[#202124] tracking-tight">Unified Workspace</h1>
              <p className="text-sm text-[#5f6368] mt-1">Manage your tasks and review cases across all matters.</p>
            </div>
            <button className="bg-[#1a73e8] hover:bg-[#1557b0] text-white px-5 py-2.5 rounded-full text-sm font-medium transition-colors shadow-sm">
              + New Task
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
                  className="pl-9 pr-4 py-2 bg-[#f1f3f4] border-transparent focus:bg-white focus:border-[#1a73e8] focus:ring-1 focus:ring-[#1a73e8] rounded-full text-sm w-64 transition-all outline-none"
                />
              </div>
              <button className="p-2 text-[#5f6368] hover:bg-[#f1f3f4] rounded-full transition-colors">
                <Filter className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Task List */}
        <div className="flex-1 overflow-y-auto p-4 bg-[#f8f9fa]">
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
            {filteredTasks.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {filteredTasks.map((task) => (
                  <div 
                    key={task.id}
                    onClick={() => setSelectedTaskId(task.id)}
                    className={`group flex items-start gap-4 p-4 cursor-pointer transition-colors hover:bg-[#f8f9fa] ${selectedTaskId === task.id ? 'bg-[#f4f7fe]' : ''}`}
                  >
                    <button className="mt-1 text-gray-400 hover:text-[#1a73e8] transition-colors shrink-0">
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
                          {task.priority === 'high' && <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />}
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <PriorityBadge priority={task.priority} />
                          <span className={`text-xs font-medium ${task.dueDate === 'Today' ? 'text-red-600' : 'text-[#5f6368]'}`}>
                            {task.dueDate}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-[#5f6368]">
                        <div className="flex items-center gap-1.5">
                          <Briefcase className="w-3.5 h-3.5" />
                          <span className="truncate">{task.caseName}</span>
                        </div>
                        <div className="w-1 h-1 rounded-full bg-gray-300" />
                        <div className="flex items-center gap-1.5">
                          <TypeIcon type={task.type} />
                          <span className="capitalize">{task.type.replace('_', ' ')}</span>
                        </div>
                        {task.documentCount && (
                          <>
                            <div className="w-1 h-1 rounded-full bg-gray-300" />
                            <div className="flex items-center gap-1.5">
                              <Paperclip className="w-3.5 h-3.5" />
                              <span>{task.documentCount}</span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center text-[#5f6368]">
                <CheckCircle2 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-[#202124] mb-1">No tasks found</h3>
                <p>You're all caught up or try adjusting your search filters.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Focus Mode Panel */}
      {selectedTask && (
        <div className="w-[40%] max-w-lg min-w-[380px] bg-white border-l border-gray-200 flex flex-col shadow-[-4px_0_24px_rgba(0,0,0,0.02)] z-10">
          {/* Panel Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white shrink-0">
            <div className="flex items-center gap-2">
              <span className="bg-blue-50 text-blue-700 px-2.5 py-1 rounded-md text-xs font-semibold tracking-wide uppercase">
                Focus Mode
              </span>
              <span className="text-sm text-[#5f6368]">{selectedTask.id}</span>
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
                <PriorityBadge priority={selectedTask.priority} />
                <span className="flex items-center gap-1.5 text-sm text-[#5f6368] capitalize">
                  <TypeIcon type={selectedTask.type} />
                  {selectedTask.type.replace('_', ' ')}
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
                      {selectedTask.caseName}
                    </span>
                    <ExternalLink className="w-3 h-3 text-[#1a73e8]" />
                  </div>
                </div>
                <div>
                  <span className="block text-xs font-medium text-[#5f6368] uppercase tracking-wider mb-1">Due Date</span>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className={`text-sm font-medium ${selectedTask.dueDate === 'Today' ? 'text-red-600' : 'text-[#202124]'}`}>
                      {selectedTask.dueDate}
                    </span>
                  </div>
                </div>
                <div>
                  <span className="block text-xs font-medium text-[#5f6368] uppercase tracking-wider mb-1">Assigned By</span>
                  <span className="text-sm text-[#202124]">{selectedTask.assigner}</span>
                </div>
                <div>
                  <span className="block text-xs font-medium text-[#5f6368] uppercase tracking-wider mb-1">Date Assigned</span>
                  <span className="text-sm text-[#202124]">{selectedTask.dateAssigned}</span>
                </div>
              </div>

              <div className="mb-8">
                <span className="block text-xs font-medium text-[#5f6368] uppercase tracking-wider mb-2">Description</span>
                <p className="text-sm text-[#3c4043] leading-relaxed whitespace-pre-wrap bg-gray-50 p-4 rounded-xl border border-gray-100">
                  {selectedTask.description}
                </p>
              </div>

              {/* Quick Document Viewer Preview */}
              {selectedTask.type === 'document_review' && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="block text-xs font-medium text-[#5f6368] uppercase tracking-wider">Attached Documents</span>
                    <span className="text-xs text-[#1a73e8] font-medium cursor-pointer hover:underline">View All</span>
                  </div>
                  <div className="space-y-2">
                    {[1, 2].map((i) => (
                      <div key={i} className="group flex items-center justify-between p-3 rounded-xl border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors cursor-pointer">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                            <FileText className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-[#202124] group-hover:text-blue-700 transition-colors">
                              {i === 1 ? 'MSA_Draft_v2.docx' : 'Indemnification_Standard.pdf'}
                            </p>
                            <p className="text-xs text-[#5f6368]">Modified 2 hours ago</p>
                          </div>
                        </div>
                        <button className="opacity-0 group-hover:opacity-100 p-1.5 text-blue-600 hover:bg-blue-100 rounded-md transition-all">
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Context Actions */}
              <div className="mt-8 pt-6 border-t border-gray-100 flex gap-3">
                <button className="flex-1 bg-[#1a73e8] hover:bg-[#1557b0] text-white py-2.5 rounded-full text-sm font-medium transition-colors">
                  Complete Task
                </button>
                <button className="flex-1 bg-white border border-gray-300 hover:bg-gray-50 text-[#202124] py-2.5 rounded-full text-sm font-medium transition-colors">
                  Add Note
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Missing Eye icon from lucide-react import, adding it here or fixing imports.
// Ah, I missed importing Eye. I will add it to the import list in a replace call.
