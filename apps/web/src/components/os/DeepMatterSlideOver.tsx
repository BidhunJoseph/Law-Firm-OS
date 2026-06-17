'use client';

import React, { useState, useTransition, useMemo, memo, useEffect } from 'react';
import { X, UserPlus, Plus, CheckCircle2, Trash2, CalendarClock, MoreHorizontal, Edit2, CheckSquare, Archive } from 'lucide-react';
import { DocumentVaultTab } from './DocumentVaultTab';
import { addTask, updateTask, deleteTask, renamePhaseTasks, completePhaseTasks, deletePhaseTasks, initializeEmptyPhase } from '@/server/actions/task-actions';
import { shiftCaseTimelines } from '@/server/actions/timeline-actions';
import { assignUserToCase, removeUserFromCase } from '@/server/actions/case-assignment-actions';
import { addCourtEvent, updateCourtEvent, deleteCourtEvent } from '@/server/actions/court-actions';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';

// --- Subcomponents for Performance --- //

const InlineTaskAdder = memo(({ phaseId, matterId, onAdd, onCancel }: { phaseId: string, matterId: string, onAdd: (t: any) => void, onCancel: () => void }) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [newTaskTitle, setNewTaskTitle] = useState('');

  const handleAddTask = () => {
    if (!newTaskTitle.trim()) return;
    
    // Optimistic UI update
    const tempTask = {
      id: 'temp-' + Date.now(),
      title: newTaskTitle,
      task_type: phaseId,
      status: 'open',
      due_at: null,
      assigned_to: null,
      assignee: null
    };
    onAdd(tempTask);
    setNewTaskTitle('');
    onCancel();

    startTransition(async () => {
      await addTask({
        case_id: matterId,
        title: tempTask.title,
        phase_name: phaseId
      });
      router.refresh();
    });
  };

  return (
    <div className="flex flex-col sm:flex-row items-center gap-3 mt-2 bg-white p-3 pl-4 rounded-xl border border-[#0066CC]/20 shadow-[0_4px_14px_rgba(0,102,204,0.1)]">
      <input 
        type="text" 
        autoFocus
        value={newTaskTitle}
        onChange={(e) => setNewTaskTitle(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
        placeholder="New task description..."
        className="w-full sm:flex-1 bg-transparent border-none outline-none text-[15px] text-[#1D1D1F]"
      />
      <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
        <button onClick={onCancel} className="px-4 py-2.5 text-neutral-500 hover:text-neutral-800 font-medium text-[13px] transition-colors rounded-lg">Cancel</button>
        <button onClick={handleAddTask} disabled={isPending} className="px-5 py-2.5 bg-[#0066CC] hover:bg-blue-700 transition-colors text-white rounded-lg text-[13px] font-bold shadow-sm">Save</button>
      </div>
    </div>
  );
});

InlineTaskAdder.displayName = 'InlineTaskAdder';

const AssigneeSelect = ({ currentAssigneeId, firmUsers, onAssign, onCancel }: { currentAssigneeId: string | null, firmUsers: any[], onAssign: (id: string) => void, onCancel: () => void }) => {
  const [search, setSearch] = useState('');
  
  const filteredUsers = firmUsers.filter(u => u.full_name.toLowerCase().includes(search.toLowerCase()) || u.role.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="absolute top-full left-0 mt-2 w-60 bg-white rounded-xl shadow-[0_12px_40px_rgba(0,0,0,0.12)] border border-black/[0.04] z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
      <div className="p-2 border-b border-black/[0.04]">
        <input 
          autoFocus
          type="text" 
          placeholder="Search team..." 
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full bg-black/5 rounded-lg px-3 py-1.5 text-[12px] font-medium outline-none focus:ring-2 focus:ring-[#0066CC]/20"
        />
      </div>
      <div className="max-h-48 overflow-y-auto p-1 custom-scrollbar">
        <button 
          onClick={() => onAssign('unassigned')}
          className="w-full text-left px-3 py-2 text-[12px] font-bold text-neutral-500 hover:bg-neutral-100 rounded-lg transition-colors flex items-center justify-between"
        >
          Unassigned
          {!currentAssigneeId && <CheckCircle2 className="w-3 h-3 text-[#0066CC]" />}
        </button>
        {filteredUsers.map(u => (
          <button 
            key={u.id}
            onClick={() => onAssign(u.id)}
            className="w-full text-left px-3 py-2.5 text-[12px] font-bold text-[#1D1D1F] hover:bg-[#FBFBFD] rounded-lg transition-colors flex items-center justify-between group"
          >
            <div className="flex items-center gap-2.5">
               <div className="w-6 h-6 rounded-full bg-black/5 flex items-center justify-center text-[9px] uppercase">{u.full_name.charAt(0)}</div>
               <div className="flex flex-col leading-none gap-0.5">
                 <span>{u.full_name}</span>
                 <span className="text-[10px] font-medium text-neutral-400 capitalize">{u.role.replace('_', ' ')}</span>
               </div>
            </div>
            {currentAssigneeId === u.id && <CheckCircle2 className="w-3 h-3 text-[#0066CC]" />}
          </button>
        ))}
        {filteredUsers.length === 0 && (
          <div className="px-3 py-4 text-center text-[11px] text-neutral-400 font-medium">No matches found</div>
        )}
      </div>
    </div>
  );
};

const MemoizedTaskRow = memo(({ task, firmUsers, onUpdate, onDelete }: { task: any, firmUsers: any[], onUpdate: (id: string, partial: any) => void, onDelete: (id: string) => void }) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [editingAssignee, setEditingAssignee] = useState(false);
  const [editingDate, setEditingDate] = useState(false);

  const handleToggle = () => {
    const newStatus = task.status === 'completed' ? 'open' : 'completed';
    onUpdate(task.id, { status: newStatus });
    startTransition(async () => {
      await updateTask(task.id, { status: newStatus });
      router.refresh();
    });
  };

  const handleDelete = () => {
    onDelete(task.id);
    startTransition(async () => {
      await deleteTask(task.id);
      router.refresh();
    });
  };

  const handleAssign = (userId: string) => {
    const assignedUser = userId === 'unassigned' ? null : firmUsers.find(u => u.id === userId);
    onUpdate(task.id, { assigned_to: userId === 'unassigned' ? null : userId, assignee: assignedUser });
    setEditingAssignee(false);
    startTransition(async () => {
      await updateTask(task.id, { assigned_to: userId === 'unassigned' ? null : userId });
      router.refresh();
    });
  };

  const handleDate = (dateStr: string) => {
    onUpdate(task.id, { due_at: dateStr ? new Date(dateStr).toISOString() : null });
    setEditingDate(false);
    startTransition(async () => {
      await updateTask(task.id, { due_at: dateStr ? new Date(dateStr).toISOString() : null });
      router.refresh();
    });
  };

  return (
    <div className={`group flex flex-col sm:flex-row sm:items-start gap-4 rounded-2xl bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.02)] border border-black/[0.03] hover:shadow-[0_8px_24px_rgba(0,0,0,0.04)] transition-all duration-300 ${task.status === 'completed' ? 'opacity-60 grayscale' : ''}`}>
      <div className="flex items-center gap-4 w-full sm:w-auto">
        <div 
          onClick={handleToggle}
          className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-[2px] transition-colors cursor-pointer ${task.status === 'completed' ? 'bg-[#0066CC] border-[#0066CC]' : 'border-[#86868B]/30 group-hover:border-[#0066CC]'}`}
        >
          {task.status === 'completed' && <CheckCircle2 className="w-4 h-4 text-white" />}
        </div>
        <div className="flex-1 sm:hidden">
            <h4 className={`text-[15px] font-medium leading-tight ${task.status === 'completed' ? 'text-[#86868B] line-through' : 'text-[#1D1D1F]'}`}>{task.title}</h4>
        </div>
      </div>
      
      <div className="flex-1 pl-10 sm:pl-0">
        <div className="hidden sm:block">
          <h4 className={`text-[16px] font-semibold leading-tight ${task.status === 'completed' ? 'text-[#86868B] line-through' : 'text-[#1D1D1F]'}`}>{task.title}</h4>
        </div>
        {task.description && (
          <p className="text-[13px] text-[#86868B] mt-1.5 leading-snug">{task.description}</p>
        )}
        
        <div className="mt-3 flex flex-wrap items-center gap-3">
            <div className="relative">
              <div onClick={() => setEditingAssignee(true)} className="cursor-pointer hover:ring-2 hover:ring-[#0066CC]/30 rounded-md transition-all">
                {task.assignee ? (
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#1D1D1F] uppercase tracking-wider bg-black/[0.03] px-2.5 py-1 rounded-md">
                    <div className="w-4 h-4 rounded-full bg-white border border-black/5 flex items-center justify-center text-[8px]">{task.assignee.full_name.charAt(0)}</div>
                    {task.assignee.full_name}
                  </span>
                ) : (
                  <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider bg-neutral-100 px-2.5 py-1 rounded-md hover:bg-neutral-200 hover:text-neutral-600 transition-colors">Unassigned</span>
                )}
              </div>
              {editingAssignee && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setEditingAssignee(false)} />
                  <AssigneeSelect 
                    currentAssigneeId={task.assigned_to} 
                    firmUsers={firmUsers} 
                    onAssign={handleAssign} 
                    onCancel={() => setEditingAssignee(false)} 
                  />
                </>
              )}
            </div>
            
            {editingDate ? (
              <input 
                autoFocus
                type="date"
                className="bg-white border border-black/10 rounded-md text-[11px] font-bold text-[#1D1D1F] px-2 py-0.5 outline-none shadow-sm"
                defaultValue={task.due_at ? new Date(task.due_at).toISOString().split('T')[0] : ''}
                onChange={(e) => handleDate(e.target.value)}
                onBlur={() => setEditingDate(false)}
              />
            ) : (
              <div onClick={() => setEditingDate(true)} className="cursor-pointer hover:ring-2 hover:ring-[#0066CC]/30 rounded-md transition-all">
                {task.due_at ? (
                  <span className={`inline-flex text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md ${new Date(task.due_at) < new Date() && task.status !== 'completed' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-[#0066CC]'}`}>
                    {format(new Date(task.due_at), 'MMM d')}
                  </span>
                ) : (
                  <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider bg-neutral-100 px-2.5 py-1 rounded-md hover:bg-neutral-200 hover:text-neutral-600 transition-colors">+ Date</span>
                )}
              </div>
            )}
        </div>
      </div>
      <button onClick={handleDelete} className="opacity-0 group-hover:opacity-100 p-2 text-neutral-400 hover:text-red-600 transition-all rounded-lg hover:bg-red-50 self-end sm:self-start">
        <Trash2 className="w-5 h-5" />
      </button>
    </div>
  );
});
MemoizedTaskRow.displayName = 'MemoizedTaskRow';


// --- Main Component --- //

export function DeepMatterSlideOver({ matter, onClose, firmUsers = [] }: { matter: any, onClose: () => void, firmUsers?: any[] }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('checklist');
  const [isPending, startTransition] = useTransition();
  const [addingTaskToPhase, setAddingTaskToPhase] = useState<string | null>(null);
  
  // Local Optimistic Tasks State
  const [localTasks, setLocalTasks] = useState<any[]>(matter?.tasks || []);
  useEffect(() => {
    setLocalTasks(matter?.tasks || []);
  }, [matter?.tasks]);

  const handleOptimisticUpdate = (taskId: string, partial: any) => {
    setLocalTasks(prev => prev.map(t => t.id === taskId ? { ...t, ...partial } : t));
  };
  const handleOptimisticDelete = (taskId: string) => {
    setLocalTasks(prev => prev.filter(t => t.id !== taskId));
  };
  const handleOptimisticAdd = (task: any) => {
    setLocalTasks(prev => [...prev, task]);
  };
  
  // Phase actions state
  const [addingPhase, setAddingPhase] = useState(false);
  const [newPhaseName, setNewPhaseName] = useState('');
  const [menuOpenPhase, setMenuOpenPhase] = useState<string | null>(null);

  // Smooth UI states for phase manipulation
  const [renamingPhase, setRenamingPhase] = useState<string | null>(null);
  const [renamePhaseValue, setRenamePhaseValue] = useState('');
  
  const [confirmingCompletePhase, setConfirmingCompletePhase] = useState<string | null>(null);
  const [confirmingDeletePhase, setConfirmingDeletePhase] = useState<string | null>(null);
  
  // Smooth UI states for timeline shifting
  const [shiftingTimeline, setShiftingTimeline] = useState(false);
  const [shiftDays, setShiftDays] = useState('7');

  // Team & Access State
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [localAssignments, setLocalAssignments] = useState<any[]>(matter?.assignments || []);
  
  useEffect(() => {
    setLocalAssignments(matter?.assignments || []);
  }, [matter?.assignments]);

  const handleAssignMember = (user: any) => {
    // Optimistic UI
    const tempAssignment = {
      id: 'temp-' + Date.now(),
      case_id: matter.id,
      user_id: user.id,
      assignment_role: user.role,
      active: true,
      user: user
    };
    setLocalAssignments(prev => [...prev, tempAssignment]);
    setIsAddingMember(false);
    
    startTransition(async () => {
      await assignUserToCase(matter.id, user.id, user.role);
      router.refresh();
    });
  };

  const handleRemoveMember = (userId: string) => {
    // Optimistic UI
    setLocalAssignments(prev => prev.filter(a => a.user_id !== userId));
    
    startTransition(async () => {
      await removeUserFromCase(matter.id, userId);
      router.refresh();
    });
  };

  // Court Event Logging State
  const [addingCourtEvent, setAddingCourtEvent] = useState(false);
  const [courtEventData, setCourtEventData] = useState({ event_type: '', court_name: '', event_at: '', internal_notes: '' });

  const executeAddCourtEvent = () => {
    if (!courtEventData.event_type || !courtEventData.event_at) return;
    
    // Optimistic UI for Court Event
    const tempCe = {
      id: 'temp-ce-' + Date.now(),
      case_id: matter.id,
      event_type: courtEventData.event_type,
      court_name: courtEventData.court_name,
      event_at: courtEventData.event_at,
      internal_notes: courtEventData.internal_notes,
      created_at: new Date().toISOString()
    };
    
    // Nasty trick to instantly push to interleavedBlocks by hacking `matter.court_events`
    // but React props are immutable. So we need local state for court events too.
    // I'll add localCourtEvents!
    setLocalCourtEvents(prev => [...prev, tempCe]);
    setAddingCourtEvent(false);
    setCourtEventData({ event_type: '', court_name: '', event_at: '', internal_notes: '' });
    
    startTransition(async () => {
      await addCourtEvent({
        case_id: matter.id,
        event_type: tempCe.event_type,
        court_name: tempCe.court_name,
        event_at: tempCe.event_at,
        internal_notes: tempCe.internal_notes
      });
      router.refresh();
    });
  };

  const [editingCourtEvent, setEditingCourtEvent] = useState<string | null>(null);
  const [editCourtEventData, setEditCourtEventData] = useState({ event_type: '', court_name: '', event_at: '', internal_notes: '' });

  const startEditCourtEvent = (ce: any) => {
    setEditingCourtEvent(ce.id);
    setEditCourtEventData({
      event_type: ce.event_type || '',
      court_name: ce.court_name || '',
      event_at: ce.event_at ? new Date(ce.event_at).toISOString().slice(0, 16) : '',
      internal_notes: ce.internal_notes || ''
    });
  };

  const executeUpdateCourtEvent = (id: string) => {
    setLocalCourtEvents(prev => prev.map(ce => ce.id === id ? { ...ce, ...editCourtEventData } : ce));
    setEditingCourtEvent(null);
    
    startTransition(async () => {
      await updateCourtEvent(id, editCourtEventData);
      router.refresh();
    });
  };

  const executeDeleteCourtEvent = (id: string) => {
    setLocalCourtEvents(prev => prev.filter(ce => ce.id !== id));
    
    startTransition(async () => {
      await deleteCourtEvent(id);
      router.refresh();
    });
  };

  const [localCourtEvents, setLocalCourtEvents] = useState<any[]>(matter?.court_events || []);
  useEffect(() => {
    setLocalCourtEvents(matter?.court_events || []);
  }, [matter?.court_events]);

  // Algorithm: Interleave Phases and Court Events
  const interleavedBlocks = useMemo(() => {
    const blocks: any[] = [];
    
    // 1. Group tasks by Phase
    const phaseMap = new Map<string, any[]>();
    localTasks.forEach((t: any) => {
      if (!phaseMap.has(t.task_type)) phaseMap.set(t.task_type, []);
      phaseMap.get(t.task_type)!.push(t);
    });

    // 2. Create Phase Blocks
    phaseMap.forEach((tasks, phaseName) => {
      let sortDate = new Date(8640000000000000); // Max date fallback
      tasks.forEach(t => {
        if (t.due_at && new Date(t.due_at) < sortDate) {
          sortDate = new Date(t.due_at); // Sort by earliest task date
        }
      });
      // Fallback: If no tasks have due dates, place it at the end but sort alphabetically or by phase number
      const numMatch = phaseName.match(/\d+/);
      const tieBreaker = numMatch ? parseInt(numMatch[0]) * 1000 : 999999;

      blocks.push({
        type: 'phase',
        id: phaseName,
        title: phaseName,
        tasks,
        sortDate: sortDate.getTime() === 8640000000000000 ? 8640000000000000 + tieBreaker : sortDate.getTime()
      });
    });

    // 3. Create Court Event Blocks
    if (localCourtEvents) {
      localCourtEvents.forEach((ce: any) => {
        blocks.push({
          type: 'court_event',
          id: ce.id,
          data: ce,
          sortDate: ce.event_at ? new Date(ce.event_at).getTime() : 8640000000000000
        });
      });
    }

    // 4. Sort all blocks
    blocks.sort((a, b) => a.sortDate - b.sortDate);

    return blocks;
  }, [localTasks, localCourtEvents]);

  if (!matter) return null;

  const executeShiftTimelines = () => {
    const daysInt = parseInt(shiftDays, 10);
    if (isNaN(daysInt)) return;
    
    startTransition(async () => {
      await shiftCaseTimelines(matter.id, daysInt);
      setShiftingTimeline(false);
      router.refresh();
    });
  };

  const handleAddPhase = () => {
    if (!newPhaseName.trim()) return;
    
    const tempPhaseTask = {
       id: 'temp-phase-' + Date.now(),
       title: `Initiate ${newPhaseName}`,
       task_type: newPhaseName,
       status: 'open',
       due_at: null,
       assigned_to: null,
       assignee: null
    };
    setLocalTasks(prev => [...prev, tempPhaseTask]);
    
    startTransition(async () => {
      await initializeEmptyPhase(matter.id, newPhaseName);
      setAddingPhase(false);
      setNewPhaseName('');
      router.refresh();
    });
  };

  const executeRenamePhase = (oldName: string) => {
    if (!renamePhaseValue.trim() || renamePhaseValue === oldName) {
      setRenamingPhase(null);
      return;
    }
    
    setLocalTasks(prev => prev.map(t => t.task_type === oldName ? { ...t, task_type: renamePhaseValue } : t));
    
    startTransition(async () => {
      await renamePhaseTasks(matter.id, oldName, renamePhaseValue);
      setRenamingPhase(null);
      router.refresh();
    });
  };

  const executeCompletePhase = (phaseName: string) => {
    setLocalTasks(prev => prev.map(t => t.task_type === phaseName && t.status !== 'completed' ? { ...t, status: 'completed' } : t));
    
    startTransition(async () => {
      await completePhaseTasks(matter.id, phaseName);
      setConfirmingCompletePhase(null);
      router.refresh();
    });
  };

  const executeDeletePhase = (phaseName: string) => {
    setLocalTasks(prev => prev.filter(t => t.task_type !== phaseName));
    
    startTransition(async () => {
      await deletePhaseTasks(matter.id, phaseName);
      setConfirmingDeletePhase(null);
      router.refresh();
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-[#1D1D1F]/20 backdrop-blur-[4px] transition-opacity duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]" onClick={onClose}>
      
      <div onClick={(e) => e.stopPropagation()} className="relative h-full w-[85vw] max-w-6xl translate-x-0 transform rounded-l-[40px] bg-[#FBFBFD] shadow-[-20px_0_80px_rgba(0,0,0,0.07)] transition-transform duration-700 ease-[cubic-bezier(0.2,0.8,0.2,1)] flex flex-col animate-in slide-in-from-right-full">
        
        {/* Frosted Header */}
        <header className="sticky top-0 z-10 rounded-tl-[40px] bg-white/70 px-8 sm:px-12 py-8 backdrop-blur-2xl border-b border-black/[0.04] flex items-start justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-[#1D1D1F]">{matter.title}</h2>
            <div className="mt-3 flex items-center gap-3 flex-wrap">
              <span className="inline-flex items-center rounded-full bg-[#0066CC]/10 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-[#0066CC]">
                {matter.case_type || 'Civil & Commercial'}
              </span>
              <span className="text-sm font-medium text-[#86868B]">{matter.client?.name}</span>
              <button 
                onClick={() => {
                   if (confirm("Are you sure you want to officially close and archive this matter?")) {
                      import('@/server/actions/case-actions').then(m => {
                         startTransition(async () => {
                            await m.closeCaseManually(matter.id);
                            onClose();
                            router.refresh();
                         });
                      });
                   }
                }}
                disabled={isPending}
                className="ml-auto flex items-center gap-2 bg-green-50 hover:bg-green-100 text-green-700 px-3 py-1.5 rounded-lg text-[12px] font-bold transition-colors"
              >
                <Archive className="w-3.5 h-3.5" /> Archive & Close Matter
              </button>
            </div>
            
            {/* Tabs */}
            <div className="flex items-center gap-6 mt-6 overflow-x-auto custom-scrollbar">
              {[
                { id: 'checklist', label: 'Execution Checklist' },
                { id: 'timeline', label: 'Audit Timeline' },
                { id: 'documents', label: 'Document Vault' },
                { id: 'team', label: 'Team & Access' }
              ].map(tab => (
                 <button 
                   key={tab.id}
                   onClick={() => setActiveTab(tab.id)}
                   className={`text-sm font-semibold transition-colors pb-2 border-b-2 whitespace-nowrap ${activeTab === tab.id ? 'text-[#1D1D1F] border-[#1D1D1F]' : 'text-[#86868B] border-transparent hover:text-[#1D1D1F]'}`}
                 >
                   {tab.label}
                 </button>
              ))}
            </div>
          </div>
          
          <button onClick={onClose} className="h-10 w-10 shrink-0 rounded-full bg-[#1D1D1F]/5 flex items-center justify-center hover:bg-[#1D1D1F]/10 transition-colors">
            <X className="w-5 h-5 text-[#1D1D1F]" />
          </button>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-8 sm:px-12 py-8 custom-scrollbar relative">
          
          {activeTab === 'checklist' && (
             <div className="max-w-4xl space-y-8 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
               
               {/* --- HORIZONTAL VISUAL TIMELINE --- */}
               <div className="mb-12 w-full overflow-x-auto custom-scrollbar pb-6 pt-4 relative">
                  <div className="flex items-center min-w-max px-4 relative">
                     {/* Connecting Line background */}
                     <div className="absolute top-1/2 left-8 right-8 h-[3px] bg-black/[0.04] -translate-y-1/2 rounded-full z-0" />
                     
                     {interleavedBlocks.map((block, i) => {
                       const isCourtEvent = block.type === 'court_event';
                       const isPhase = block.type === 'phase';
                       
                       let isCompleted = false;
                       if (isPhase) {
                          isCompleted = block.tasks.length > 0 && block.tasks.every((t: any) => t.status === 'completed');
                       } else if (isCourtEvent) {
                          isCompleted = block.data.event_at && new Date(block.data.event_at) < new Date();
                       }

                       return (
                         <div key={`tl-${block.id}-${i}`} className="relative z-10 flex flex-col items-center group px-6">
                            {/* Connecting Line Fill (if completed) */}
                            {i > 0 && isCompleted && (
                               <div className="absolute top-[22px] right-1/2 w-full h-[3px] bg-[#0066CC] -translate-y-1/2 z-0" />
                            )}
                            
                            {/* Node */}
                            <div className={`w-[44px] h-[44px] rounded-full flex items-center justify-center border-[4px] border-[#FBFBFD] shadow-sm relative z-10 transition-transform duration-300 group-hover:scale-110
                              ${isCompleted ? (isCourtEvent ? 'bg-[#FF3B30]' : 'bg-[#0066CC]') : 'bg-white border-black/[0.08]'}`}
                            >
                               {isCompleted ? <CheckCircle2 className="w-5 h-5 text-white" /> : (
                                  isCourtEvent ? <CalendarClock className="w-4 h-4 text-neutral-400" /> : <div className="w-3 h-3 rounded-full bg-neutral-300" />
                               )}
                            </div>
                            
                            {/* Label */}
                            <div className="mt-3 text-center max-w-[120px]">
                               <p className={`text-[12px] font-bold tracking-tight leading-tight line-clamp-2 ${isCompleted ? 'text-[#1D1D1F]' : 'text-[#86868B]'}`}>
                                  {isPhase ? block.title : block.data.event_type}
                               </p>
                               {isPhase && (
                                  <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 mt-1">
                                    {block.tasks.filter((t: any) => t.status === 'completed').length}/{block.tasks.length} tasks
                                  </p>
                               )}
                               {isCourtEvent && block.data.event_at && (
                                  <p className="text-[10px] font-bold uppercase tracking-wider text-red-500/80 mt-1">
                                     {format(new Date(block.data.event_at), 'MMM d, yyyy')}
                                  </p>
                               )}
                            </div>
                         </div>
                       );
                     })}
                  </div>
               </div>

               <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-white border border-black/[0.03] p-6 rounded-3xl shadow-[0_4px_24px_rgba(0,0,0,0.02)] gap-4">
                 <div>
                   <h3 className="text-lg font-bold text-[#1D1D1F]">Timeline Controls</h3>
                   <p className="text-[13px] text-[#86868B] mt-1 font-medium max-w-xl">
                     Log official court hearings/deadlines, or shift the entire case timeline to automatically cascade and offset all upcoming task due dates intelligently.
                   </p>
                 </div>
                 
                 <div className="flex flex-col sm:flex-row gap-3">
                   {shiftingTimeline ? (
                     <div className="flex items-center gap-2 bg-[#FBFBFD] p-1.5 rounded-2xl border border-black/[0.04]">
                       <input 
                         type="number" 
                         autoFocus
                         className="w-16 bg-white border border-black/10 rounded-xl text-sm font-bold text-center px-2 py-2 outline-none shadow-sm"
                         value={shiftDays}
                         onChange={e => setShiftDays(e.target.value)}
                         placeholder="Days"
                       />
                       <span className="text-[13px] font-bold text-[#86868B] px-1">days</span>
                       <button onClick={() => setShiftingTimeline(false)} className="px-3 py-2 text-neutral-500 hover:text-neutral-800 font-bold text-[13px] transition-colors">Cancel</button>
                       <button onClick={executeShiftTimelines} disabled={isPending} className="px-4 py-2 bg-[#1D1D1F] text-white rounded-xl text-[13px] font-bold shadow-sm hover:bg-black transition-all">Shift</button>
                     </div>
                   ) : (
                     <button 
                       onClick={() => setShiftingTimeline(true)}
                       disabled={isPending || addingCourtEvent}
                       className="flex items-center justify-center gap-2 bg-[#1D1D1F] text-white px-5 py-3 rounded-xl text-[13px] font-bold shadow-[0_4px_14px_rgba(0,0,0,0.1)] hover:bg-black transition-all active:scale-95 disabled:opacity-50"
                     >
                       <CalendarClock className="w-4 h-4" /> Shift Dates
                     </button>
                   )}
                   
                   {!addingCourtEvent && (
                      <button 
                         onClick={() => setAddingCourtEvent(true)}
                         disabled={isPending || shiftingTimeline}
                         className="flex items-center justify-center gap-2 bg-[#0066CC] hover:bg-blue-700 text-white px-5 py-3 rounded-xl text-[13px] font-bold shadow-[0_4px_14px_rgba(0,102,204,0.3)] transition-all active:scale-95 disabled:opacity-50"
                      >
                         <Plus className="w-4 h-4" /> Log Event
                      </button>
                   )}
                 </div>
               </div>

               {addingCourtEvent && (
                 <div className="bg-red-50/50 border border-red-500/20 p-5 rounded-3xl shadow-sm animate-in fade-in slide-in-from-top-2">
                    <h4 className="text-[13px] font-bold text-red-700 uppercase tracking-wider mb-4 flex items-center gap-2">
                       <CalendarClock className="w-4 h-4" /> Register Official Court Event
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       <input type="text" placeholder="Event Type (e.g., First Hearing, Expert Meeting)" value={courtEventData.event_type} onChange={e => setCourtEventData(p => ({...p, event_type: e.target.value}))} className="w-full px-4 py-3 bg-white border border-red-500/20 rounded-xl focus:ring-2 focus:ring-red-500/20 outline-none text-[14px] font-medium" />
                       <input type="text" placeholder="Court Name / Circuit (e.g., Civil CFI Circuit 3)" value={courtEventData.court_name} onChange={e => setCourtEventData(p => ({...p, court_name: e.target.value}))} className="w-full px-4 py-3 bg-white border border-red-500/20 rounded-xl focus:ring-2 focus:ring-red-500/20 outline-none text-[14px] font-medium" />
                       <input type="datetime-local" value={courtEventData.event_at} onChange={e => setCourtEventData(p => ({...p, event_at: e.target.value}))} className="w-full px-4 py-3 bg-white border border-red-500/20 rounded-xl focus:ring-2 focus:ring-red-500/20 outline-none text-[14px] font-medium" />
                       <input type="text" placeholder="Internal Notes (Optional)" value={courtEventData.internal_notes} onChange={e => setCourtEventData(p => ({...p, internal_notes: e.target.value}))} className="w-full px-4 py-3 bg-white border border-red-500/20 rounded-xl focus:ring-2 focus:ring-red-500/20 outline-none text-[14px] font-medium" />
                    </div>
                    <div className="flex justify-end gap-3 mt-5 pt-5 border-t border-red-500/10">
                       <button onClick={() => setAddingCourtEvent(false)} className="px-5 py-2.5 text-red-700 font-bold text-[13px] hover:bg-red-50 rounded-xl transition-colors">Cancel</button>
                       <button onClick={executeAddCourtEvent} disabled={!courtEventData.event_type || !courtEventData.event_at || isPending} className="px-6 py-2.5 bg-[#FF3B30] text-white rounded-xl text-[13px] font-bold shadow-sm hover:bg-red-700 transition-all disabled:opacity-50">Save Official Event</button>
                    </div>
                 </div>
               )}

               {interleavedBlocks.map((block, index) => {
                  if (block.type === 'court_event') {
                    const ce = block.data;
                    const isEditing = editingCourtEvent === ce.id;

                    return (
                      <div key={`ce-${ce.id}`} className="relative pl-8 my-6 group">
                         <div className="absolute left-[11px] top-[-2rem] bottom-[-2rem] w-px bg-black/[0.04]" />
                         <div className="absolute left-[-2px] top-4 w-7 h-7 rounded-full border-[3px] border-[#FBFBFD] bg-[#FF3B30] shadow-sm flex items-center justify-center">
                            <CalendarClock className="w-3 h-3 text-white" />
                         </div>
                         <div className="bg-red-50/50 border border-red-500/20 rounded-2xl p-5 shadow-sm relative">
                            
                            {/* Actions Menu */}
                            {!isEditing && (
                              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                                 <button onClick={() => startEditCourtEvent(ce)} className="p-2 text-red-500 hover:bg-red-100 rounded-lg transition-colors">
                                    <Edit2 className="w-4 h-4" />
                                 </button>
                                 <button onClick={() => executeDeleteCourtEvent(ce.id)} className="p-2 text-red-500 hover:bg-red-100 hover:text-red-700 rounded-lg transition-colors">
                                    <Trash2 className="w-4 h-4" />
                                 </button>
                              </div>
                            )}

                            {isEditing ? (
                              <div className="animate-in fade-in">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                   <input type="text" placeholder="Event Type" value={editCourtEventData.event_type} onChange={e => setEditCourtEventData(p => ({...p, event_type: e.target.value}))} className="w-full px-4 py-2 bg-white border border-red-500/20 rounded-xl outline-none text-[14px] font-medium" />
                                   <input type="text" placeholder="Court Name" value={editCourtEventData.court_name} onChange={e => setEditCourtEventData(p => ({...p, court_name: e.target.value}))} className="w-full px-4 py-2 bg-white border border-red-500/20 rounded-xl outline-none text-[14px] font-medium" />
                                   <input type="datetime-local" value={editCourtEventData.event_at} onChange={e => setEditCourtEventData(p => ({...p, event_at: e.target.value}))} className="w-full px-4 py-2 bg-white border border-red-500/20 rounded-xl outline-none text-[14px] font-medium" />
                                   <input type="text" placeholder="Internal Notes" value={editCourtEventData.internal_notes} onChange={e => setEditCourtEventData(p => ({...p, internal_notes: e.target.value}))} className="w-full px-4 py-2 bg-white border border-red-500/20 rounded-xl outline-none text-[14px] font-medium" />
                                </div>
                                <div className="flex justify-end gap-2 mt-3 pt-3 border-t border-red-500/10">
                                   <button onClick={() => setEditingCourtEvent(null)} className="px-4 py-1.5 text-red-700 font-bold text-[12px] hover:bg-red-100 rounded-xl transition-colors">Cancel</button>
                                   <button onClick={() => executeUpdateCourtEvent(ce.id)} disabled={!editCourtEventData.event_type || !editCourtEventData.event_at || isPending} className="px-4 py-1.5 bg-[#FF3B30] text-white rounded-xl text-[12px] font-bold hover:bg-red-700 transition-all disabled:opacity-50">Save</button>
                                </div>
                              </div>
                            ) : (
                              <>
                                <div className="flex justify-between items-start">
                                  <div className="pr-16">
                                    <h3 className="text-[15px] font-bold text-[#1D1D1F]">{ce.event_type} {ce.court_name && `- ${ce.court_name}`}</h3>
                                    <p className="text-[13px] text-red-700/80 font-medium mt-1">
                                      {ce.event_at ? format(new Date(ce.event_at), 'MMMM d, yyyy h:mm a') : 'Unscheduled'}
                                    </p>
                                  </div>
                                  {ce.outcome && <span className="bg-white px-3 py-1 rounded-lg text-[11px] font-bold text-red-600 uppercase tracking-wider shadow-sm">{ce.outcome}</span>}
                                </div>
                                {ce.internal_notes && <p className="text-[13px] text-[#1D1D1F]/70 mt-3 bg-white/50 p-3 rounded-xl">{ce.internal_notes}</p>}
                              </>
                            )}
                         </div>
                      </div>
                    );
                 }

                 // Phase Block
                 const isLast = index === interleavedBlocks.length - 1;
                 
                 return (
                  <div key={`phase-${block.id}`} className="relative pl-8 mt-10 mb-2">
                     {!isLast && <div className="absolute left-[11px] top-8 bottom-[-4rem] w-px bg-black/[0.04]" />}
                     
                     <div 
                       className={`absolute left-0 top-1.5 w-6 h-6 rounded-full border-[3px] shadow-sm flex items-center justify-center transition-colors cursor-pointer border-[#FBFBFD] hover:scale-105
                         ${block.tasks.every((t: any) => t.status === 'completed') && block.tasks.length > 0 ? 'bg-[#0066CC]' : 'bg-neutral-300 hover:bg-[#0066CC]'}`}
                       onClick={() => setConfirmingCompletePhase(block.id)}
                       title="Click to complete phase"
                     >
                        {(block.tasks.every((t: any) => t.status === 'completed') && block.tasks.length > 0) && <CheckCircle2 className="w-3 h-3 text-white" />}
                     </div>
                     
                     {/* Phase Header area */}
                     <div className="flex items-center justify-between mb-4">
                        {renamingPhase === block.id ? (
                           <div className="flex items-center gap-2 flex-1 mr-4">
                             <input 
                               autoFocus
                               type="text"
                               className="flex-1 bg-white border border-[#0066CC]/30 rounded-xl text-lg font-bold tracking-tight text-[#1D1D1F] px-4 py-1.5 outline-none shadow-[0_0_0_2px_rgba(0,102,204,0.1)]"
                               value={renamePhaseValue}
                               onChange={(e) => setRenamePhaseValue(e.target.value)}
                               onKeyDown={(e) => e.key === 'Enter' && executeRenamePhase(block.id)}
                             />
                             <button onClick={() => setRenamingPhase(null)} className="px-3 py-1.5 text-neutral-500 hover:text-neutral-800 font-bold text-[13px] transition-colors rounded-lg">Cancel</button>
                             <button onClick={() => executeRenamePhase(block.id)} disabled={isPending} className="px-4 py-1.5 bg-[#0066CC] text-white rounded-lg text-[13px] font-bold shadow-sm hover:bg-blue-700 transition-colors">Save</button>
                           </div>
                        ) : (
                           <h3 className="text-lg font-bold tracking-tight text-[#1D1D1F] flex items-center gap-2">
                             {block.title}
                             <span className="bg-black/5 text-black/60 text-[11px] px-2 py-0.5 rounded-full font-bold">{block.tasks.length} tasks</span>
                           </h3>
                        )}
                        
                        {/* Phase Actions Dropdown */}
                        {renamingPhase !== block.id && (
                          <div className="relative">
                             <button onClick={() => setMenuOpenPhase(menuOpenPhase === block.id ? null : block.id)} className="p-2 hover:bg-black/5 rounded-xl transition-colors">
                                <MoreHorizontal className="w-5 h-5 text-[#86868B]" />
                             </button>
                             {menuOpenPhase === block.id && (
                               <>
                                 <div className="fixed inset-0 z-40" onClick={() => setMenuOpenPhase(null)} />
                                 <div className="absolute right-0 mt-1 w-48 bg-white rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-black/[0.04] z-50 py-2 animate-in fade-in slide-in-from-top-2">
                                    <button onClick={() => { setMenuOpenPhase(null); setConfirmingCompletePhase(block.id); }} className="w-full text-left px-4 py-2.5 text-[13px] font-semibold text-[#1D1D1F] hover:bg-[#FBFBFD] flex items-center gap-2 transition-colors">
                                       <CheckSquare className="w-4 h-4 text-green-600" /> Complete Phase
                                    </button>
                                    <button onClick={() => { setMenuOpenPhase(null); setRenamePhaseValue(block.id); setRenamingPhase(block.id); }} className="w-full text-left px-4 py-2.5 text-[13px] font-semibold text-[#1D1D1F] hover:bg-[#FBFBFD] flex items-center gap-2 transition-colors">
                                       <Edit2 className="w-4 h-4 text-blue-600" /> Rename Phase
                                    </button>
                                    <div className="h-px bg-black/[0.04] my-1" />
                                    <button onClick={() => { setMenuOpenPhase(null); setConfirmingDeletePhase(block.id); }} className="w-full text-left px-4 py-2.5 text-[13px] font-semibold text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors">
                                       <Trash2 className="w-4 h-4" /> Delete Phase
                                    </button>
                                 </div>
                               </>
                             )}
                          </div>
                        )}
                     </div>

                     {/* Inline Confirmations */}
                     {confirmingCompletePhase === block.id && (
                       <div className="mb-4 flex flex-col sm:flex-row items-center gap-3 bg-green-50 p-4 rounded-2xl border border-green-200 animate-in fade-in zoom-in-95 duration-200">
                         <div className="flex-1">
                           <p className="text-sm font-bold text-green-900">Complete this entire phase?</p>
                           <p className="text-[13px] text-green-700/80 mt-0.5 font-medium">This will instantly mark all open tasks inside this phase as completed.</p>
                         </div>
                         <div className="flex gap-2 w-full sm:w-auto">
                           <button onClick={() => setConfirmingCompletePhase(null)} className="px-4 py-2 bg-white/50 hover:bg-white text-green-800 text-[13px] font-bold rounded-xl transition-colors">Cancel</button>
                           <button onClick={() => executeCompletePhase(block.id)} disabled={isPending} className="px-5 py-2 bg-green-600 hover:bg-green-700 text-white text-[13px] font-bold rounded-xl shadow-sm transition-colors flex items-center gap-2">
                             <CheckCircle2 className="w-4 h-4" /> Confirm
                           </button>
                         </div>
                       </div>
                     )}

                     {confirmingDeletePhase === block.id && (
                       <div className="mb-4 flex flex-col sm:flex-row items-center gap-3 bg-red-50 p-4 rounded-2xl border border-red-200 animate-in fade-in zoom-in-95 duration-200">
                         <div className="flex-1">
                           <p className="text-sm font-bold text-red-900">Delete phase and ALL its tasks?</p>
                           <p className="text-[13px] text-red-700/80 mt-0.5 font-medium">This action cannot be undone. All tasks inside this phase will be permanently erased.</p>
                         </div>
                         <div className="flex gap-2 w-full sm:w-auto">
                           <button onClick={() => setConfirmingDeletePhase(null)} className="px-4 py-2 bg-white/50 hover:bg-white text-red-800 text-[13px] font-bold rounded-xl transition-colors">Cancel</button>
                           <button onClick={() => executeDeletePhase(block.id)} disabled={isPending} className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white text-[13px] font-bold rounded-xl shadow-sm transition-colors flex items-center gap-2">
                             <Trash2 className="w-4 h-4" /> Delete Forever
                           </button>
                         </div>
                       </div>
                     )}
                     
                     <div className="space-y-3">
                       {block.tasks.map((task: any) => (
                          <MemoizedTaskRow key={task.id} task={task} firmUsers={firmUsers} onUpdate={handleOptimisticUpdate} onDelete={handleOptimisticDelete} />
                       ))}
                       
                       {addingTaskToPhase === block.id ? (
                          <InlineTaskAdder phaseId={block.id} matterId={matter.id} onAdd={handleOptimisticAdd} onCancel={() => setAddingTaskToPhase(null)} />
                       ) : (
                         <button onClick={() => setAddingTaskToPhase(block.id)} className="flex items-center gap-2 text-[13px] font-bold text-[#0066CC] hover:text-blue-800 transition-colors py-2 group">
                           <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#0066CC]/10 group-hover:bg-[#0066CC]/20 transition-colors">
                             <Plus className="w-4 h-4" /> 
                           </div>
                           Add granular task
                         </button>
                       )}
                     </div>
                  </div>
                 );
               })}

               {/* Add Phase Global Action */}
               <div className="pt-8 mt-8 border-t border-black/[0.04] max-w-lg">
                  {addingPhase ? (
                    <div className="flex flex-col sm:flex-row items-center gap-3 bg-white p-3 pl-4 rounded-xl border border-neutral-200 shadow-sm">
                      <input 
                        type="text" 
                        autoFocus
                        value={newPhaseName}
                        onChange={(e) => setNewPhaseName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddPhase()}
                        placeholder="e.g. Discovery Phase..."
                        className="w-full sm:flex-1 bg-transparent border-none outline-none text-[15px] text-[#1D1D1F]"
                      />
                      <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                        <button onClick={() => setAddingPhase(false)} className="px-4 py-2 text-neutral-500 hover:text-neutral-800 font-medium text-[13px] transition-colors">Cancel</button>
                        <button onClick={handleAddPhase} disabled={isPending} className="px-5 py-2.5 bg-[#1D1D1F] hover:bg-black transition-colors text-white rounded-lg text-[13px] font-bold shadow-sm">Initialize Phase</button>
                      </div>
                    </div>
                  ) : (
                    <button 
                      onClick={() => setAddingPhase(true)}
                      className="flex items-center gap-3 bg-white border border-black/[0.04] hover:border-black/[0.08] hover:shadow-sm px-6 py-4 rounded-2xl w-full transition-all group"
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-100 group-hover:bg-[#0066CC]/10 group-hover:text-[#0066CC] transition-colors">
                         <Plus className="w-5 h-5 text-neutral-500 group-hover:text-[#0066CC]" />
                      </div>
                      <span className="text-[15px] font-bold text-[#1D1D1F] group-hover:text-[#0066CC] transition-colors">Initialize New Phase</span>
                    </button>
                  )}
               </div>

             </div>
          )}

          {activeTab === 'timeline' && (
            <div className="max-w-3xl space-y-6 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
               {matter.timeline_events?.map((event: any) => (
                 <div key={event.id} className="flex gap-4">
                    <div className="w-12 pt-1 text-right shrink-0">
                       <p className="text-[11px] font-bold text-[#86868B]">{new Date(event.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                    </div>
                    <div className="relative pb-6">
                       <div className="absolute left-[-1rem] top-2 bottom-0 w-px bg-black/[0.05]" />
                       <div className="absolute left-[-1.25rem] top-2 w-2 h-2 rounded-full bg-neutral-300 border-2 border-[#FBFBFD]" />
                       <div className="bg-white rounded-xl p-4 shadow-[0_2px_8px_rgba(0,0,0,0.02)] border border-black/[0.03]">
                          <p className="text-[14px] font-medium text-[#1D1D1F]">{event.title}</p>
                          {event.description && <p className="text-[13px] text-[#86868B] mt-1">{event.description}</p>}
                       </div>
                    </div>
                 </div>
               ))}
               {(!matter.timeline_events || matter.timeline_events.length === 0) && (
                 <p className="text-[#86868B] text-sm font-medium">No events logged yet.</p>
               )}
            </div>
          )}

          {activeTab === 'documents' && (
            <div className="h-full max-w-4xl pb-20">
              <DocumentVaultTab matter={matter} />
            </div>
          )}

          {activeTab === 'team' && (
             <div className="max-w-3xl space-y-8 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
               <div className="flex items-center justify-between border-b border-black/[0.04] pb-4 relative">
                  <div>
                    <h3 className="text-xl font-bold tracking-tight text-[#1D1D1F]">Assigned Legal Team & Clients</h3>
                    <p className="text-[13px] text-[#86868B] mt-1 font-medium">Manage access and roles for this specific matter.</p>
                  </div>
                  <div className="relative">
                    <button 
                      onClick={() => setIsAddingMember(!isAddingMember)}
                      className="flex items-center gap-2 text-[13px] font-bold text-[#0066CC] hover:bg-[#0066CC]/5 px-4 py-2 rounded-xl transition-all"
                    >
                      <UserPlus className="w-4 h-4" /> Add Member
                    </button>
                    {isAddingMember && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setIsAddingMember(false)} />
                        <div className="absolute right-0 mt-2 w-72 max-h-96 overflow-y-auto bg-white rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.12)] border border-black/[0.04] z-50 py-2 animate-in fade-in slide-in-from-top-2">
                          <div className="px-4 py-2 text-[11px] font-bold uppercase tracking-wider text-[#86868B] border-b border-black/[0.04]">Available Personnel</div>
                          {firmUsers.filter(u => u.is_active && !localAssignments.some(a => a.user_id === u.id)).length === 0 ? (
                            <div className="px-4 py-4 text-[13px] text-center text-neutral-500 font-medium">All personnel assigned.</div>
                          ) : (
                            firmUsers.filter(u => u.is_active && !localAssignments.some(a => a.user_id === u.id)).map(u => (
                              <button 
                                key={u.id}
                                onClick={() => handleAssignMember(u)}
                                className="w-full text-left px-4 py-3 hover:bg-[#FBFBFD] transition-colors flex items-center gap-3 border-b border-black/[0.02] last:border-0"
                              >
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold ${u.role === 'client' ? 'bg-[#0066CC]/10 text-[#0066CC]' : 'bg-neutral-100 text-[#1D1D1F]'}`}>
                                  {u.full_name?.charAt(0)}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-[13px] font-bold text-[#1D1D1F] truncate">{u.full_name}</p>
                                  <p className="text-[11px] font-bold text-[#86868B] uppercase tracking-wider mt-0.5">{u.role.replace('_', ' ')}</p>
                                </div>
                              </button>
                            ))
                          )}
                        </div>
                      </>
                    )}
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                 {localAssignments.map((a: any) => (
                    <div key={a.id} className="group flex items-center gap-4 bg-white border border-black/[0.03] p-4 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.04)] transition-all duration-300">
                       <div className={`w-12 h-12 rounded-full border flex items-center justify-center font-bold shadow-inner ${a.user?.role === 'client' ? 'bg-[#0066CC]/5 border-[#0066CC]/10 text-[#0066CC]' : 'bg-[#FBFBFD] border-black/[0.05] text-[#1D1D1F]'}`}>
                          {a.user?.full_name?.charAt(0) || a.user?.email?.charAt(0)}
                       </div>
                       <div className="flex-1 min-w-0">
                          <p className="text-[15px] font-semibold text-[#1D1D1F] truncate">{a.user?.full_name}</p>
                          <p className={`text-[12px] font-medium uppercase tracking-wider mt-0.5 ${a.user?.role === 'client' ? 'text-[#0066CC]' : 'text-[#86868B]'}`}>{a.assignment_role.replace('_', ' ')}</p>
                       </div>
                       <button onClick={() => handleRemoveMember(a.user_id)} className="p-2 text-[#86868B] opacity-0 group-hover:opacity-100 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all">
                          <X className="w-4 h-4" />
                       </button>
                    </div>
                 ))}
                 {localAssignments.length === 0 && (
                    <div className="col-span-full py-8 text-center bg-white/50 border border-black/[0.04] border-dashed rounded-2xl">
                       <p className="text-sm font-medium text-[#86868B]">No team members assigned.</p>
                    </div>
                 )}
               </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
