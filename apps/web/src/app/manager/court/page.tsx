"use client";

import React, { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import * as Select from "@radix-ui/react-select";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  Filter,
  Gavel,
  List,
  MoreVertical,
  Plus,
  Search,
  X,
  Check,
  ChevronDown,
  Building2,
  AlertCircle
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  startOfWeek, 
  endOfWeek, 
  parseISO 
} from "date-fns";

/** Utility for Tailwind class merging */
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- MOCK DATA ---

const MOCK_CASES = [
  { id: "c1", title: "Smith vs. Global Tech", matterId: "MAT-2023-001" },
  { id: "c2", title: "Estate of Jane Doe", matterId: "MAT-2023-042" },
  { id: "c3", title: "Acme Corp Merger", matterId: "MAT-2024-011" },
];

const EVENT_TYPES = [
  { id: "hearing", label: "Hearing", color: "bg-blue-100 text-blue-800 border-blue-200" },
  { id: "trial", label: "Trial", color: "bg-red-100 text-red-800 border-red-200" },
  { id: "motion", label: "Motion", color: "bg-purple-100 text-purple-800 border-purple-200" },
  { id: "conference", label: "Conference", color: "bg-amber-100 text-amber-800 border-amber-200" },
  { id: "deadline", label: "Filing Deadline", color: "bg-gray-100 text-gray-800 border-gray-200" },
];

const STATUS_OPTIONS = [
  { id: "scheduled", label: "Scheduled" },
  { id: "adjourned", label: "Adjourned" },
  { id: "concluded", label: "Concluded" },
  { id: "reserved", label: "Decision Reserved" },
  { id: "cancelled", label: "Cancelled" },
];

const ATTENDANCE_OPTIONS = [
  { id: "required", label: "Required" },
  { id: "optional", label: "Optional" },
  { id: "not-required", label: "Not Required" },
];

const INITIAL_EVENTS = [
  {
    id: "e1",
    caseId: "c1",
    title: "Preliminary Hearing",
    date: "2026-06-15T09:00:00.000Z",
    type: "hearing",
    status: "scheduled",
    attendance: "required",
    court: "NY Supreme Court, Part 42",
    judge: "Hon. Sarah Jenkins",
    notes: ""
  },
  {
    id: "e2",
    caseId: "c3",
    title: "Motion to Dismiss",
    date: "2026-06-17T14:30:00.000Z",
    type: "motion",
    status: "scheduled",
    attendance: "optional",
    court: "Federal District Court",
    judge: "Hon. Robert Chen",
    notes: ""
  }
];

// --- COMPONENTS ---

// Radix Select Wrapper
interface CustomSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  options: { id: string; label: string }[];
  placeholder: string;
  className?: string;
  required?: boolean;
}

const CustomSelect = ({ value, onValueChange, options, placeholder, className, required }: CustomSelectProps) => (
  <Select.Root value={value} onValueChange={onValueChange} required={required}>
    <Select.Trigger className={cn("flex h-8 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-1 text-sm shadow-sm transition-colors hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500", className)}>
      <Select.Value placeholder={placeholder} />
      <Select.Icon>
        <ChevronDown className="h-4 w-4 opacity-50" />
      </Select.Icon>
    </Select.Trigger>
    <Select.Portal>
      <Select.Content className="z-50 overflow-hidden rounded-md border border-gray-200 bg-white shadow-lg animate-in fade-in-80">
        <Select.Viewport className="p-1">
          {options.map((opt) => (
            <Select.Item
              key={opt.id}
              value={opt.id}
              className="relative flex cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors hover:bg-gray-100 focus:bg-gray-100 data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
            >
              <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                <Select.ItemIndicator>
                  <Check className="h-4 w-4" />
                </Select.ItemIndicator>
              </span>
              <Select.ItemText>{opt.label}</Select.ItemText>
            </Select.Item>
          ))}
        </Select.Viewport>
      </Select.Content>
    </Select.Portal>
  </Select.Root>
);

export default function CourtModule() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState(INITIAL_EVENTS);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [view, setView] = useState("calendar"); // calendar | list

  // Calendar logic
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);
  
  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const today = () => setCurrentDate(new Date());

  // Form State
  const [formData, setFormData] = useState({
    caseId: "",
    title: "",
    date: "",
    time: "",
    type: "",
    status: "scheduled",
    attendance: "required",
    court: "",
    judge: "",
    notes: ""
  });

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.caseId || !formData.type || !formData.date || !formData.title) {
      alert("Please fill out all required fields");
      return;
    }
    
    const newEvent = {
      ...formData,
      id: Math.random().toString(),
      date: new Date(`${formData.date}T${formData.time || "09:00"}`).toISOString(),
    };
    
    setEvents([...events, newEvent]);
    setIsUpdateModalOpen(false);
    
    // Reset
    setFormData({
      caseId: "", title: "", date: "", time: "", type: "", status: "scheduled", attendance: "required", court: "", judge: "", notes: ""
    });
  };

  return (
    <div className="flex h-full flex-col">
      {/* HEADER */}
      <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-gray-900">Court & Hearings</h1>
          <p className="text-sm text-gray-500">Manage court dates, statuses, and strict event deadlines</p>
        </div>
        
        <div className="flex w-full items-center gap-2 sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-2.5 top-2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search cases or judges..."
              className="h-8 w-full rounded-md border border-gray-300 bg-white pl-8 pr-3 text-sm shadow-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          
          <Dialog.Root open={isUpdateModalOpen} onOpenChange={setIsUpdateModalOpen}>
            <Dialog.Trigger asChild>
              <button className="flex h-8 whitespace-nowrap items-center gap-1.5 rounded-md bg-blue-600 px-3 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1">
                <Plus className="h-4 w-4" />
                Add Event
              </button>
            </Dialog.Trigger>
            <Dialog.Portal>
              <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
              <Dialog.Content className="fixed left-[50%] top-[50%] z-50 w-[95vw] max-w-lg translate-x-[-50%] translate-y-[-50%] rounded-xl bg-white shadow-xl duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]">
                <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
                  <div>
                    <Dialog.Title className="text-lg font-semibold text-gray-900">Log Court Event</Dialog.Title>
                    <Dialog.Description className="text-sm text-gray-500 mt-0.5">Strictly structure the event details. No free-text statuses allowed.</Dialog.Description>
                  </div>
                  <Dialog.Close className="rounded-full p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1">
                    <X className="h-5 w-5" />
                  </Dialog.Close>
                </div>
                
                <form onSubmit={handleFormSubmit} className="p-5 overflow-y-auto max-h-[80vh]">
                  <div className="space-y-4">
                    {/* Case Selection */}
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-gray-700">Case / Matter <span className="text-red-500">*</span></label>
                      <CustomSelect 
                        value={formData.caseId} 
                        onValueChange={(val: string) => setFormData({...formData, caseId: val})}
                        options={MOCK_CASES.map(c => ({id: c.id, label: `${c.matterId} - ${c.title}`}))}
                        placeholder="Select Case"
                      />
                    </div>
                    
                    {/* Title & Type */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="mb-1.5 block text-xs font-medium text-gray-700">Event Title <span className="text-red-500">*</span></label>
                        <input 
                          required
                          type="text" 
                          placeholder="e.g. Motion to Dismiss"
                          value={formData.title}
                          onChange={(e) => setFormData({...formData, title: e.target.value})}
                          className="h-8 w-full rounded-md border border-gray-300 px-3 text-sm shadow-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="mb-1.5 block text-xs font-medium text-gray-700">Event Type <span className="text-red-500">*</span></label>
                        <CustomSelect 
                          value={formData.type} 
                          onValueChange={(val: string) => setFormData({...formData, type: val})}
                          options={EVENT_TYPES}
                          placeholder="Select Type"
                        />
                      </div>
                    </div>

                    {/* Date & Time */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="mb-1.5 block text-xs font-medium text-gray-700">Date <span className="text-red-500">*</span></label>
                        <input 
                          required
                          type="date" 
                          value={formData.date}
                          onChange={(e) => setFormData({...formData, date: e.target.value})}
                          className="h-8 w-full rounded-md border border-gray-300 px-3 text-sm shadow-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="mb-1.5 block text-xs font-medium text-gray-700">Time</label>
                        <input 
                          type="time" 
                          value={formData.time}
                          onChange={(e) => setFormData({...formData, time: e.target.value})}
                          className="h-8 w-full rounded-md border border-gray-300 px-3 text-sm shadow-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    {/* Court & Judge */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="mb-1.5 block text-xs font-medium text-gray-700">Court / Venue</label>
                        <input 
                          type="text" 
                          placeholder="e.g. NY Supreme Court"
                          value={formData.court}
                          onChange={(e) => setFormData({...formData, court: e.target.value})}
                          className="h-8 w-full rounded-md border border-gray-300 px-3 text-sm shadow-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="mb-1.5 block text-xs font-medium text-gray-700">Judge / Authority</label>
                        <input 
                          type="text" 
                          placeholder="e.g. Hon. Smith"
                          value={formData.judge}
                          onChange={(e) => setFormData({...formData, judge: e.target.value})}
                          className="h-8 w-full rounded-md border border-gray-300 px-3 text-sm shadow-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    {/* Strict Status & Attendance */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="rounded-md border border-amber-200 bg-amber-50/50 p-3 shadow-sm">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="mt-0.5 h-4 w-4 text-amber-600 shrink-0" />
                          <div className="w-full">
                            <label className="mb-1.5 block text-xs font-semibold text-amber-900">Current Status</label>
                            <CustomSelect 
                              value={formData.status} 
                              onValueChange={(val: string) => setFormData({...formData, status: val})}
                              options={STATUS_OPTIONS}
                              placeholder="Select Status"
                              className="border-amber-300 focus:ring-amber-500"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="rounded-md border border-gray-200 bg-gray-50/50 p-3 shadow-sm">
                        <div className="w-full">
                          <label className="mb-1.5 block text-xs font-semibold text-gray-700">Attendance</label>
                          <CustomSelect 
                            value={formData.attendance} 
                            onValueChange={(val: string) => setFormData({...formData, attendance: val})}
                            options={ATTENDANCE_OPTIONS}
                            placeholder="Select Attendance"
                          />
                        </div>
                      </div>
                    </div>
                    
                    {/* Remarks */}
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-gray-700">Next Steps / Remarks</label>
                      <textarea 
                        rows={2}
                        placeholder="Keep this brief. State procedural next steps only."
                        value={formData.notes}
                        onChange={(e) => setFormData({...formData, notes: e.target.value})}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                      />
                    </div>
                  </div>
                  
                  <div className="mt-6 flex justify-end gap-2 pt-4 border-t border-gray-100">
                    <Dialog.Close asChild>
                      <button type="button" className="rounded-md border border-gray-300 bg-white px-4 py-1.5 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1">
                        Cancel
                      </button>
                    </Dialog.Close>
                    <button type="submit" className="rounded-md bg-blue-600 px-4 py-1.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1">
                      Save Event
                    </button>
                  </div>
                </form>
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="flex flex-1 flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        
        {/* View Toggle & Controls */}
        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-2 bg-gray-50/50">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex items-center gap-1 rounded-md border border-gray-300 bg-white p-0.5 shadow-sm">
              <button 
                onClick={() => setView("calendar")}
                className={cn("flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-medium transition-colors", view === "calendar" ? "bg-gray-100 text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900 hover:bg-gray-50")}
              >
                <CalendarIcon className="h-3.5 w-3.5" />
                Calendar
              </button>
              <button 
                onClick={() => setView("list")}
                className={cn("flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-medium transition-colors", view === "list" ? "bg-gray-100 text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900 hover:bg-gray-50")}
              >
                <List className="h-3.5 w-3.5" />
                List
              </button>
            </div>

            {view === "calendar" && (
              <div className="flex items-center gap-3">
                <button onClick={today} className="text-xs font-medium text-gray-600 hover:text-gray-900 transition-colors">Today</button>
                <div className="flex items-center gap-1">
                  <button onClick={prevMonth} className="rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors">
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <span className="w-32 text-center text-sm font-semibold text-gray-900">
                    {format(currentDate, "MMMM yyyy")}
                  </span>
                  <button onClick={nextMonth} className="rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors">
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
              <button className="flex items-center gap-1.5 rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1">
                <Filter className="h-3.5 w-3.5 text-gray-400" />
                Filter
              </button>
          </div>
        </div>

        {/* CALENDAR VIEW */}
        {view === "calendar" && (
          <div className="flex flex-1 flex-col overflow-hidden bg-white">
            <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {day}
                </div>
              ))}
            </div>
            <div className="flex-1 grid grid-cols-7 grid-rows-5 overflow-y-auto">
              {calendarDays.map((day, idx) => {
                const dayEvents = events.filter(e => isSameDay(parseISO(e.date), day));
                const isCurrentMonth = isSameMonth(day, currentDate);
                const isToday = isSameDay(day, new Date());

                return (
                  <div 
                    key={day.toString()} 
                    className={cn(
                      "min-h-[100px] border-b border-r border-gray-100 p-1.5 transition-colors hover:bg-gray-50/50",
                      !isCurrentMonth && "bg-gray-50/30 text-gray-400",
                      idx % 7 === 6 && "border-r-0"
                    )}
                  >
                    <div className="flex items-center justify-between px-1 mb-1.5">
                      <span className={cn(
                        "flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium",
                        isToday ? "bg-blue-600 text-white" : "text-gray-700"
                      )}>
                        {format(day, "d")}
                      </span>
                    </div>
                    <div className="space-y-1.5 px-0.5 overflow-y-auto max-h-[calc(100%-28px)] no-scrollbar">
                      {dayEvents.map(event => {
                        const eventType = EVENT_TYPES.find(t => t.id === event.type) || EVENT_TYPES[0];
                        return (
                          <div 
                            key={event.id}
                            className={cn(
                              "cursor-pointer rounded-md px-1.5 py-1 text-[11px] leading-tight font-medium border shadow-sm transition-all hover:shadow hover:opacity-90 truncate",
                              eventType.color
                            )}
                            title={`${event.title} - ${event.court}`}
                          >
                            <div className="flex items-center gap-1 truncate">
                              <span className="font-bold opacity-80">{format(parseISO(event.date), "h:mm a")}</span>
                              <span>{event.title}</span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* LIST VIEW */}
        {view === "list" && (
          <div className="flex-1 overflow-auto bg-gray-50/30 p-4 sm:p-6">
            <div className="max-w-4xl mx-auto space-y-3">
              {events.sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map(event => {
                const eventType = EVENT_TYPES.find(t => t.id === event.type) || EVENT_TYPES[0];
                const caseObj = MOCK_CASES.find(c => c.id === event.caseId);
                const statusObj = STATUS_OPTIONS.find(s => s.id === event.status);

                return (
                  <div key={event.id} className="group flex flex-col sm:flex-row items-start sm:items-center gap-4 rounded-xl border border-gray-200 bg-white p-3 shadow-sm transition-all hover:shadow-md hover:border-gray-300">
                    <div className="flex flex-col items-center justify-center min-w-[72px] rounded-lg bg-gray-50 p-2 border border-gray-100">
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{format(parseISO(event.date), "MMM")}</span>
                      <span className="text-2xl font-bold text-gray-900 leading-none mt-0.5">{format(parseISO(event.date), "dd")}</span>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <span className={cn("inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider", eventType.color)}>
                          {eventType.label}
                        </span>
                        <span className="inline-flex items-center gap-1 rounded bg-gray-100 border border-gray-200 px-2 py-0.5 text-[11px] font-semibold text-gray-700">
                          {statusObj?.label}
                        </span>
                      </div>
                      <h3 className="text-sm font-semibold text-gray-900 truncate">{event.title}</h3>
                      <p className="text-xs text-gray-500 mt-0.5 truncate">{caseObj?.title} <span className="text-gray-400 ml-1">({caseObj?.matterId})</span></p>
                    </div>

                    <div className="flex-1 min-w-0 text-xs text-gray-600 space-y-1.5 sm:pl-4 sm:border-l sm:border-gray-100">
                      <div className="flex items-center gap-2 truncate">
                        <Clock className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                        {format(parseISO(event.date), "h:mm a")}
                      </div>
                      <div className="flex items-center gap-2 truncate">
                        <Building2 className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                        {event.court || "No court specified"}
                      </div>
                      <div className="flex items-center gap-2 truncate">
                        <Gavel className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                        {event.judge || "No judge specified"}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 sm:ml-auto">
                      <button className="invisible group-hover:visible rounded-md p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-900">
                        <MoreVertical className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
              {events.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="rounded-full bg-gray-100 p-4 mb-4">
                    <CalendarIcon className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-sm font-medium text-gray-900">No events found</h3>
                  <p className="text-sm text-gray-500 mt-1 max-w-sm">Get started by creating a new structured court event or deadline.</p>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
