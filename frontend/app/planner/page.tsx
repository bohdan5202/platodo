"use client";

import { useState } from 'react';
import { useTasks } from '../../hooks/useTasks';
import { CheckCircle2, Circle, Calendar as CalendarIcon, Clock, Loader2, ChevronDown } from 'lucide-react';
import { format, parseISO, isToday, isTomorrow, isPast, isAfter, endOfTomorrow, addDays } from 'date-fns';

export default function PlannerPage() {
  const { tasks, isLoading, error, toggleTaskDone, updateTaskDate } = useTasks();
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-[#6B5CE7]" />
          <p className="text-[#8888AA] font-medium">Loading your planner...</p>
        </div>
      </div>
    );
  }

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 5: return 'bg-[#FEE2E2] text-[#EF4444]'; // Danger (P5)
      case 4: return 'bg-[#FEF3C7] text-[#F59E0B]'; // Amber (P4)
      case 3: return 'bg-[#EEF0FF] text-[#6B5CE7]'; // Violet (P3)
      case 2: return 'bg-[#E0F7F6] text-[#0EA5A0]'; // Teal (P2)
      case 1: default: return 'bg-[#F7F8FC] text-[#8888AA]'; // Gray (P1)
    }
  };

  const pendingSync = tasks.filter(t => !t.is_done && (t.title === null || t.planned_date === null));
  const overdue = tasks.filter(t => t.planned_date && isPast(parseISO(t.planned_date)) && !isToday(parseISO(t.planned_date)) && !t.is_done);
  const today = tasks.filter(t => t.planned_date && isToday(parseISO(t.planned_date)));
  const tomorrow = tasks.filter(t => t.planned_date && isTomorrow(parseISO(t.planned_date)));
  const upcomingRaw = tasks.filter(t => t.planned_date && isAfter(parseISO(t.planned_date), endOfTomorrow()));

  // Group upcoming tasks by their exact date (dd.MM.yyyy)
  const upcomingByDate = upcomingRaw.reduce<Record<string, typeof tasks>>((acc, task) => {
    const key = format(parseISO(task.planned_date!), 'dd.MM.yyyy');
    if (!acc[key]) acc[key] = [];
    acc[key].push(task);
    return acc;
  }, {});
  // Sort the date keys chronologically
  const upcomingDateKeys = Object.keys(upcomingByDate).sort((a, b) => {
    const [da, ma, ya] = a.split('.').map(Number);
    const [db, mb, yb] = b.split('.').map(Number);
    return new Date(ya, ma - 1, da).getTime() - new Date(yb, mb - 1, db).getTime();
  });

  // Named sections (before the date groups)
  const sections = [
    { title: "Pending AI Sync", tasks: pendingSync, color: "text-[#F59E0B]", badge: "bg-[#FEF3C7]" },
    { title: "Overdue (Planned)", tasks: overdue, color: "text-[#EF4444]", badge: "bg-[#FEE2E2]" },
    { title: "Today", tasks: today, color: "text-[#6B5CE7]", badge: "bg-[#EEF0FF]" },
    { title: "Tomorrow", tasks: tomorrow, color: "text-[#0EA5A0]", badge: "bg-[#E0F7F6]" },
  ];


  const handleReschedule = (taskId: string, date: string | null) => {
    updateTaskDate(taskId, date);
    setOpenDropdownId(null);
  };

  const renderTask = (task: any) => {
    const isParsing = task.title === null;
    const isDeadlinePast = task.deadline && isPast(parseISO(task.deadline)) && !isToday(parseISO(task.deadline));

    return (
      <div
        key={task.id}
        className={`bg-white p-4 sm:p-5 rounded-[20px] border flex items-center gap-4 transition-all group relative ${task.is_done ? 'border-[#E4E6F0] opacity-60 bg-[#F7F8FC]' : 'border-[#E4E6F0] shadow-sm hover:border-[#C4BEFA] hover:shadow-md'
          }`}
      >
        <button
          onClick={() => toggleTaskDone(task.id, task.is_done)}
          className={`flex-shrink-0 transition-colors active:scale-95 ${task.is_done ? 'text-[#10B981]' : 'text-[#CDD0E8] hover:text-[#6B5CE7]'}`}
        >
          {task.is_done ? (
            <CheckCircle2 className="w-7 h-7" />
          ) : (
            <Circle className="w-7 h-7" />
          )}
        </button>

        <div className="flex-1 min-w-0">
          {isParsing ? (
             <div className="flex items-center gap-2">
               <span className="text-[#14142B] truncate font-medium text-[15px]">{task.raw_input}</span>
               <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-[#EEF0FF] text-[#6B5CE7]">
                 <span className="w-1.5 h-1.5 rounded-full bg-[#6B5CE7] animate-pulse"></span>
                 AI parsing...
               </span>
             </div>
          ) : (
            <div className="flex flex-col">
              <span className={`text-[15px] font-medium truncate ${task.is_done ? 'line-through text-[#8888AA]' : 'text-[#14142B]'}`}>
                {task.title}
              </span>
              <div className="flex items-center gap-2 mt-1.5 text-xs flex-wrap">
                {task.deadline && (
                  <span className={`font-medium flex items-center gap-1 px-2 py-0.5 rounded-md ${isDeadlinePast && !task.is_done ? 'bg-[#FEE2E2] text-[#EF4444]' : 'bg-[#F7F8FC] text-[#8888AA]'}`}>
                    <Clock className="w-3.5 h-3.5" />
                    Deadline: {format(parseISO(task.deadline), 'MMM d, yyyy')}
                  </span>
                )}
                {task.subject && (
                  <span className="bg-[#E0F7F6] text-[#0EA5A0] px-2.5 py-0.5 rounded-full font-semibold">
                    {task.subject}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {!isParsing && (
          <div className="flex items-center gap-3">
            <span className={`hidden sm:inline-block px-2.5 py-1 rounded-full text-[11px] font-bold ${getPriorityColor(task.priority)}`}>
              P{task.priority}
            </span>
            
            {/* Reschedule Dropdown */}
            <div className="relative">
              <button
                onClick={() => setOpenDropdownId(openDropdownId === task.id ? null : task.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#E4E6F0] text-sm font-medium text-[#4A4A6A] hover:bg-[#F7F8FC] transition-colors"
              >
                <CalendarIcon className="w-4 h-4 text-[#8888AA]" />
                <span className="hidden sm:inline">Move</span>
                <ChevronDown className="w-4 h-4 text-[#8888AA]" />
              </button>
              
              {openDropdownId === task.id && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-[#E4E6F0] rounded-2xl shadow-xl z-50 overflow-hidden">
                  <div className="p-1.5 space-y-1">
                    <button onClick={() => handleReschedule(task.id, new Date().toISOString())} className="w-full text-left px-3 py-2 text-sm font-medium text-[#14142B] hover:bg-[#F7F8FC] rounded-xl transition-colors">
                      Today
                    </button>
                    <button onClick={() => handleReschedule(task.id, addDays(new Date(), 1).toISOString())} className="w-full text-left px-3 py-2 text-sm font-medium text-[#14142B] hover:bg-[#F7F8FC] rounded-xl transition-colors">
                      Tomorrow
                    </button>
                    <button onClick={() => handleReschedule(task.id, addDays(new Date(), 2).toISOString())} className="w-full text-left px-3 py-2 text-sm font-medium text-[#14142B] hover:bg-[#F7F8FC] rounded-xl transition-colors">
                      {format(addDays(new Date(), 2), 'EEEE')}
                    </button>
                    
                    {/* Custom Date Picker */}
                    <div className="px-3 py-2">
                      <label className="text-xs text-[#8888AA] font-medium mb-1.5 block">Custom date</label>
                      <input 
                        type="date" 
                        min={format(new Date(), 'yyyy-MM-dd')}
                        max={task.deadline ? format(parseISO(task.deadline), 'yyyy-MM-dd') : undefined}
                        className="w-full text-sm border border-[#E4E6F0] rounded-lg px-2 py-1.5 outline-none focus:border-[#6B5CE7] text-[#14142B] bg-white cursor-pointer"
                        onChange={(e) => {
                          if (e.target.value) {
                            handleReschedule(task.id, new Date(e.target.value).toISOString());
                          }
                        }}
                      />
                    </div>

                    <div className="h-px bg-[#E4E6F0] my-1 mx-2"></div>
                    <button onClick={() => handleReschedule(task.id, null)} className="w-full text-left px-3 py-2 text-sm font-medium text-[#8888AA] hover:bg-[#F7F8FC] rounded-xl transition-colors">
                      Clear date
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#14142B] tracking-tight">Planner</h1>
          <p className="text-[#8888AA] mt-1.5 font-medium">Your tasks organized by planned work date.</p>
        </div>
      </div>

      {error && (
        <div className="bg-[#FEF2F2] border border-[#FCA5A5] text-[#EF4444] px-4 py-3 rounded-xl flex items-center gap-3 mb-6 text-sm font-medium">
          <p>{error}</p>
        </div>
      )}

      {/* Named sections: Pending, Overdue, Today, Tomorrow */}
      <div className="space-y-10">
        {sections.map(section => {
          if (section.tasks.length === 0) return null;
          
          return (
            <div key={section.title} className="space-y-4">
              <div className="flex items-center gap-3 ml-1">
                <h2 className={`text-sm font-bold tracking-widest uppercase ${section.color}`}>
                  {section.title}
                </h2>
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${section.badge} ${section.color}`}>
                  {section.tasks.length}
                </span>
              </div>
              <div className="space-y-3">
                {section.tasks.map(renderTask)}
              </div>
            </div>
          );
        })}

        {/* Date-grouped upcoming tasks */}
        {upcomingDateKeys.map(dateKey => (
          <div key={dateKey} className="space-y-4">
            <div className="flex items-center gap-3 ml-1">
              <h2 className="text-sm font-bold tracking-widest uppercase text-[#8888AA]">
                {dateKey}
              </h2>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-[#F7F8FC] text-[#8888AA]">
                {upcomingByDate[dateKey].length}
              </span>
            </div>
            <div className="space-y-3">
              {upcomingByDate[dateKey].map(renderTask)}
            </div>
          </div>
        ))}
        
        {tasks.length === 0 && !isLoading && (
          <div className="text-center py-16 bg-white rounded-[24px] border border-[#E4E6F0] border-dashed">
            <div className="bg-[#EEF0FF] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <CalendarIcon className="w-8 h-8 text-[#6B5CE7]" />
            </div>
            <h3 className="text-[#14142B] font-bold text-lg mb-1">Your planner is empty</h3>
            <p className="text-[#8888AA] font-medium text-sm">Add tasks from the dashboard to see them here.</p>
          </div>
        )}
      </div>
    </div>
  );
}
