"use client";

import React from "react";
import { Calendar as CalendarIcon, Clock, AlertCircle } from "lucide-react";

export default function MatterCourtCalendar({ timelineEvents, tasks, isClient }: { timelineEvents: any[], tasks: any[], isClient: boolean }) {
  
  // Get upcoming deadlines
  const upcomingTasks = tasks
    .filter(t => t.status !== 'completed' && t.due_date)
    .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())
    .slice(0, 3);

  // Get upcoming court dates (events in the future)
  const now = new Date();
  const upcomingEvents = timelineEvents
    .filter(e => new Date(e.event_date) > now && (!isClient || e.client_visible))
    .sort((a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime())
    .slice(0, 2);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-6 border-b border-gray-100 bg-gray-50/50">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <CalendarIcon className="w-5 h-5 text-indigo-600" />
          Upcoming Deadlines
        </h2>
      </div>
      
      <div className="p-6 space-y-6">
        
        {upcomingEvents.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Court & Key Events</h3>
            {upcomingEvents.map(event => (
              <div key={event.id} className="flex items-start gap-3 p-3 rounded-xl bg-indigo-50 border border-indigo-100">
                <div className="bg-white p-2 rounded-lg border border-indigo-200 text-center min-w-[50px] shadow-sm">
                  <div className="text-[10px] font-bold text-indigo-600 uppercase leading-none mb-1">
                    {new Date(event.event_date).toLocaleDateString(undefined, { month: 'short' })}
                  </div>
                  <div className="text-lg font-bold text-gray-900 leading-none">
                    {new Date(event.event_date).toLocaleDateString(undefined, { day: 'numeric' })}
                  </div>
                </div>
                <div className="flex-1 mt-1">
                  <p className="text-sm font-semibold text-indigo-900">{event.title}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {upcomingTasks.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Pending Tasks</h3>
            {upcomingTasks.map(task => {
              const isOverdue = new Date(task.due_date) < now;
              return (
                <div key={task.id} className="flex items-start gap-3">
                  <Clock className={`w-4 h-4 mt-0.5 ${isOverdue ? 'text-rose-500' : 'text-gray-400'}`} />
                  <div>
                    <p className={`text-sm font-medium ${isOverdue ? 'text-rose-700' : 'text-gray-900'}`}>{task.title}</p>
                    <p className={`text-xs mt-0.5 ${isOverdue ? 'text-rose-500 font-medium' : 'text-gray-500'}`}>
                      {isOverdue ? 'Overdue' : 'Due'} {new Date(task.due_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {upcomingEvents.length === 0 && upcomingTasks.length === 0 && (
          <div className="text-center py-6 text-gray-500 flex flex-col items-center">
            <AlertCircle className="w-8 h-8 text-gray-300 mb-2" />
            <p className="text-sm">No upcoming deadlines or court dates.</p>
          </div>
        )}
      </div>
    </div>
  );
}
