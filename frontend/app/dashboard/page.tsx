"use client";

import { useState } from 'react';
import { useTasks } from '../../hooks/useTasks';
import { CheckCircle2, Circle, Sparkles, AlertCircle } from 'lucide-react';
import { format, parseISO } from 'date-fns';

export default function Dashboard() {
  const { tasks, isLoading, error, addTask, toggleTaskDone } = useTasks();
  const [newTaskText, setNewTaskText] = useState('');

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;
    
    addTask(newTaskText);
    setNewTaskText('');
  };

  const getPriorityColor = (priority: number) => {
    switch(priority) {
      case 5: return 'bg-[#EF4444] text-white'; // Danger (P5)
      case 4: return 'bg-[#F59E0B] text-white'; // Amber (P4)
      case 3: return 'bg-[#6B5CE7] text-white'; // Violet (P3)
      case 2: return 'bg-[#0EA5A0] text-white'; // Teal (P2)
      case 1: default: return 'bg-[#E4E6F0] text-[#4A4A6A]'; // Gray (P1)
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-full"><p className="text-[#8888AA]">Loading tasks...</p></div>;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-[#14142B]">Dashboard</h1>
          <p className="text-[#8888AA] mt-1">Here is what you need to focus on today.</p>
        </div>
      </header>

      {error && (
        <div className="bg-[#EF4444]/10 border border-[#EF4444]/20 text-[#EF4444] px-4 py-3 rounded-xl flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          <p>{error}</p>
        </div>
      )}

      {/* Add Task Bar */}
      <section className="bg-white rounded-2xl p-2 shadow-sm border border-[#E4E6F0]">
        <form onSubmit={handleAddTask} className="flex items-center gap-2">
          <input
            type="text"
            value={newTaskText}
            onChange={(e) => setNewTaskText(e.target.value)}
            placeholder='e.g., "Math exam next Friday"'
            className="flex-1 bg-transparent px-4 py-3 outline-none text-[#14142B] placeholder-[#8888AA]"
          />
          <button 
            type="submit"
            disabled={!newTaskText.trim()}
            className="bg-[#6B5CE7] text-white px-6 py-3 rounded-xl font-medium flex items-center gap-2 hover:bg-[#6B5CE7]/90 transition-colors disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            Add Task
          </button>
        </form>
        <div className="px-4 pb-2 text-xs text-[#8888AA] flex items-center gap-1">
          <Sparkles className="w-3 h-3" />
          AI automatically parses subject, deadline, and priority.
        </div>
      </section>

      {/* Task List */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-[#14142B]">Your Tasks</h2>
        
        {tasks.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-[#E4E6F0] border-dashed">
            <p className="text-[#8888AA]">No tasks yet. Add one above!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {tasks.map(task => {
              const isParsing = task.title === null;

              return (
                <div 
                  key={task.id}
                  className={`bg-white p-4 rounded-xl border flex items-center gap-4 transition-all ${
                    task.is_done ? 'border-[#E4E6F0] opacity-60' : 'border-[#E4E6F0] shadow-sm hover:border-[#6B5CE7]/30'
                  }`}
                >
                  <button 
                    onClick={() => toggleTaskDone(task.id, task.is_done)}
                    className="flex-shrink-0 text-[#8888AA] hover:text-[#6B5CE7] transition-colors"
                  >
                    {task.is_done ? (
                      <CheckCircle2 className="w-6 h-6 text-[#10B981]" />
                    ) : (
                      <Circle className="w-6 h-6" />
                    )}
                  </button>
                  
                  <div className="flex-1 min-w-0">
                    {isParsing ? (
                      <div className="flex items-center gap-2">
                        <span className="text-[#14142B] truncate font-medium">{task.raw_input}</span>
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-[#6B5CE7]/10 text-[#6B5CE7] animate-pulse">
                          <Sparkles className="w-3 h-3" />
                          AI Parsing...
                        </span>
                      </div>
                    ) : (
                      <div className="flex flex-col">
                        <span className={`text-[#14142B] font-medium ${task.is_done ? 'line-through text-[#8888AA]' : ''}`}>
                          {task.title}
                        </span>
                        <div className="flex items-center gap-3 mt-1 text-xs text-[#8888AA]">
                          {task.subject && (
                            <span className="bg-[#F7F8FC] px-2 py-0.5 rounded text-[#4A4A6A]">
                              {task.subject}
                            </span>
                          )}
                          {task.deadline && (
                            <span className="flex items-center gap-1">
                              Due: {format(parseISO(task.deadline), 'MMM d, yyyy')}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {!isParsing && (
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${getPriorityColor(task.priority)}`}>
                        P{task.priority}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
