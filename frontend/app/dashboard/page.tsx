"use client";

import { useState } from 'react';
import { useTasks } from '../../hooks/useTasks';
import { CheckCircle2, Circle, Sparkles, AlertCircle, Trash2, Loader2 } from 'lucide-react';
import { format, parseISO, isToday, isThisWeek } from 'date-fns';

export default function DashboardPage() {
  const { tasks, isLoading, error, addTask, toggleTaskDone, deleteTask } = useTasks();
  const [newTaskText, setNewTaskText] = useState('');

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;

    addTask(newTaskText);
    setNewTaskText('');
  };

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 5: return 'bg-[#FEE2E2] text-[#EF4444]'; // Danger (P5)
      case 4: return 'bg-[#FEF3C7] text-[#F59E0B]'; // Amber (P4)
      case 3: return 'bg-[#EEF0FF] text-[#6B5CE7]'; // Violet (P3)
      case 2: return 'bg-[#E0F7F6] text-[#0EA5A0]'; // Teal (P2)
      case 1: default: return 'bg-[#F7F8FC] text-[#8888AA]'; // Gray (P1)
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-[#6B5CE7]" />
          <p className="text-[#8888AA] font-medium">Loading your tasks...</p>
        </div>
      </div>
    );
  }

  // Calculate Stats
  const tasksToday = tasks.filter(t => t.deadline && isToday(parseISO(t.deadline)) && !t.is_done).length;
  const dueThisWeek = tasks.filter(t => t.deadline && isThisWeek(parseISO(t.deadline)) && !t.is_done).length;
  const completedTasks = tasks.filter(t => t.is_done).length;

  return (
    <div className="max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#14142B] tracking-tight">Good morning, Bohdan 👋</h1>
          <p className="text-[#8888AA] mt-1.5 font-medium">{format(new Date(), 'EEEE, MMMM d')}</p>
        </div>
      </div>

      {error && (
        <div className="bg-[#FEF2F2] border border-[#FCA5A5] text-[#EF4444] px-4 py-3 rounded-xl flex items-center gap-3 mb-6 text-sm font-medium">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {/* Add Task Bar */}
      <div className="bg-white border-[1.5px] border-[#C4BEFA] rounded-2xl p-2.5 flex items-center gap-3 mb-8 shadow-sm transition-all focus-within:ring-4 focus-within:ring-[#6B5CE7]/10 focus-within:border-[#6B5CE7]">
        <span className="text-[#6B5CE7] pl-3"><Sparkles className="w-5 h-5" /></span>
        <form onSubmit={handleAddTask} className="flex-1 flex">
          <input
            type="text"
            value={newTaskText}
            onChange={(e) => setNewTaskText(e.target.value)}
            placeholder='Type anything — "math exam Friday" or "essay by Thursday 11pm"…'
            className="flex-1 text-[15px] text-[#14142B] placeholder-[#8888AA] outline-none bg-transparent py-2 font-medium"
          />
          <button
            type="submit"
            disabled={!newTaskText.trim()}
            className="hidden sm:flex bg-[#6B5CE7] text-white py-2 px-5 rounded-xl text-sm font-semibold items-center gap-2 hover:bg-[#5a4cdb] transition-all disabled:opacity-50 active:scale-[0.98]"
          >
            Add task
          </button>
        </form>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        <div className="bg-gradient-to-br from-[#6B5CE7] to-[#5a4cdb] rounded-[24px] p-6 shadow-lg shadow-[#6B5CE7]/20 relative overflow-hidden">
          <div className="absolute -right-6 -top-6 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
          <div className="text-4xl font-bold text-white mb-1.5 relative z-10">{tasksToday}</div>
          <div className="text-sm text-white/80 font-medium relative z-10">Tasks today</div>
        </div>
        <div className="bg-white border border-[#E4E6F0] rounded-[24px] p-6 shadow-sm">
          <div className="text-4xl font-bold text-[#14142B] mb-1.5">{dueThisWeek}</div>
          <div className="text-sm text-[#8888AA] font-medium">Due this week</div>
        </div>
        <div className="bg-white border border-[#E4E6F0] rounded-[24px] p-6 shadow-sm">
          <div className="text-4xl font-bold text-[#14142B] mb-1.5">{completedTasks}</div>
          <div className="text-sm text-[#8888AA] font-medium">Completed</div>
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-4">
        <h2 className="text-xs font-bold tracking-widest uppercase text-[#8888AA] mb-4 ml-1">Your Tasks</h2>

        {tasks.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-[24px] border border-[#E4E6F0] border-dashed">
            <div className="bg-[#F7F8FC] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-[#CDD0E8]" />
            </div>
            <h3 className="text-[#14142B] font-bold text-lg mb-1">You're all caught up!</h3>
            <p className="text-[#8888AA] font-medium text-sm">Add a new task above to get started.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {tasks.map(task => {
              const isParsing = task.title === null;

              return (
                <div
                  key={task.id}
                  className={`bg-white p-4 sm:p-5 rounded-[20px] border flex items-center gap-4 transition-all group ${task.is_done ? 'border-[#E4E6F0] opacity-60 bg-[#F7F8FC]' : 'border-[#E4E6F0] shadow-sm hover:border-[#C4BEFA] hover:shadow-md'
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
                        <div className="flex items-center gap-2 mt-1.5 text-xs">
                          {task.deadline && (
                            <span className="text-[#8888AA] font-medium flex items-center gap-1">
                              Due {format(parseISO(task.deadline), 'MMM d')}
                            </span>
                          )}
                          {task.deadline && task.subject && <span className="text-[#E4E6F0]">•</span>}
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
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${getPriorityColor(task.priority)}`}>
                        P{task.priority}
                      </span>
                      <button
                        onClick={() => deleteTask(task.id)}
                        className="text-[#CDD0E8] hover:text-[#EF4444] opacity-0 group-hover:opacity-100 transition-all focus:opacity-100 p-1.5 rounded-lg hover:bg-[#FEF2F2]"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
