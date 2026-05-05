"use client";

import { useState } from 'react';
import { useTasks, Task } from '../../hooks/useTasks';
import { useUser } from '../../hooks/useUser';
import { useAlerts } from '../../hooks/useAlerts';
import { CheckCircle2, Circle, Sparkles, AlertCircle, Loader2, MoreVertical, Pencil, Trash2, Check, X, Sun, Bell, ArrowRight } from 'lucide-react';
import { format, parseISO, isToday, isThisWeek, isTomorrow, isPast, isAfter, endOfTomorrow } from 'date-fns';
import Link from 'next/link';

const PRIORITIES = [
  { value: 5, label: 'P5 — Critical', color: 'text-[#EF4444]', bg: 'bg-[#FEE2E2]' },
  { value: 4, label: 'P4 — High', color: 'text-[#F59E0B]', bg: 'bg-[#FEF3C7]' },
  { value: 3, label: 'P3 — Medium', color: 'text-[#6B5CE7]', bg: 'bg-[#EEF0FF]' },
  { value: 2, label: 'P2 — Low', color: 'text-[#0EA5A0]', bg: 'bg-[#E0F7F6]' },
  { value: 1, label: 'P1 — Minimal', color: 'text-[#8888AA]', bg: 'bg-[#F7F8FC]' },
];

export default function DashboardPage() {
  const { tasks, isLoading, error, addTask, toggleTaskDone, deleteTask, updateTask } = useTasks();
  const { displayName, user, updateName } = useUser();
  const { alerts, markAllAsRead } = useAlerts();
  const unreadAlerts = alerts.filter(a => !a.is_read);
  const unreadConflicts = unreadAlerts.filter(a => a.type !== 'morning_briefing');
  const unreadBriefings = unreadAlerts.filter(a => a.type === 'morning_briefing');
  const [alertsBannerHidden, setAlertsBannerHidden] = useState(false);
  const [newTaskText, setNewTaskText] = useState('');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ title: '', subject: '', deadline: '', priority: 1 });
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [savingName, setSavingName] = useState(false);

  // Sorting and Grouping State
  const [groupBy, setGroupBy] = useState<'date' | 'priority' | 'subject' | 'none'>('date');
  const [sortBy, setSortBy] = useState<'deadline' | 'priority' | 'created'>('deadline');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;
    addTask(newTaskText);
    setNewTaskText('');
  };

  const getPriorityColor = (priority: number) => {
    const p = PRIORITIES.find(p => p.value === priority);
    return p ? `${p.bg} ${p.color}` : 'bg-[#F7F8FC] text-[#8888AA]';
  };

  const startEditing = (task: Task) => {
    setEditingId(task.id);
    setEditForm({
      title: task.title || '',
      subject: task.subject || '',
      deadline: task.deadline ? format(parseISO(task.deadline), 'yyyy-MM-dd') : '',
      priority: task.priority ?? 1,
    });
    setOpenMenuId(null);
  };

  const saveEdit = (id: string) => {
    updateTask(id, {
      title: editForm.title,
      subject: editForm.subject || null,
      deadline: editForm.deadline ? new Date(editForm.deadline).toISOString() : null,
      priority: editForm.priority,
    });
    setEditingId(null);
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

  const tasksToday = tasks.filter(t => t.deadline && isToday(parseISO(t.deadline)) && !t.is_done).length;
  const dueThisWeek = tasks.filter(t => t.deadline && isThisWeek(parseISO(t.deadline)) && !t.is_done).length;
  const completedTasks = tasks.filter(t => t.is_done).length;

  const hour = new Date().getHours();
  let greetingText = 'Good evening';
  if (hour >= 5 && hour < 12) greetingText = 'Good morning';
  else if (hour >= 12 && hour < 17) greetingText = 'Good afternoon';

  const sortedTasks = [...tasks].sort((a, b) => {
    const isErrorA = a.title === '⚠️ AI Parsing Failed' ? 1 : 0;
    const isErrorB = b.title === '⚠️ AI Parsing Failed' ? 1 : 0;
    if (isErrorA !== isErrorB) return isErrorB - isErrorA; // always top

    let diff = 0;
    if (sortBy === 'deadline') {
      const da = a.deadline ? new Date(a.deadline).getTime() : Infinity;
      const db = b.deadline ? new Date(b.deadline).getTime() : Infinity;
      diff = da - db;
    } else if (sortBy === 'priority') {
      diff = (a.priority || 0) - (b.priority || 0);
    } else if (sortBy === 'created') {
      const da = a.created_at ? new Date(a.created_at).getTime() : 0;
      const db = b.created_at ? new Date(b.created_at).getTime() : 0;
      diff = da - db;
    }
    return sortOrder === 'asc' ? diff : -diff;
  });

  let displaySections: { title: string; tasks: Task[]; color?: string; badge?: string }[] = [];

  if (groupBy === 'none') {
    displaySections = [{ title: 'All Tasks', tasks: sortedTasks, color: "text-[#4A4A6A]", badge: "bg-[#E4E6F0]" }];
  } else if (groupBy === 'priority') {
    const pGroups = (sortOrder === 'desc' ? [1, 2, 3, 4, 5] : [5, 4, 3, 2, 1]).map(pVal => {
      const pData = PRIORITIES.find(p => p.value === pVal);
      return {
        title: pData?.label || `Priority ${pVal}`,
        tasks: sortedTasks.filter(t => t.priority === pVal),
        color: pData?.color,
        badge: pData?.bg
      };
    });
    displaySections = pGroups.filter(g => g.tasks.length > 0);
  } else if (groupBy === 'subject') {
    const subjects = Array.from(new Set(sortedTasks.map(t => t.subject || 'No Subject'))).sort();
    if (sortOrder === 'desc') subjects.reverse();
    displaySections = subjects.map(sub => ({
      title: sub,
      tasks: sortedTasks.filter(t => (t.subject || 'No Subject') === sub),
      color: "text-[#6B5CE7]",
      badge: "bg-[#EEF0FF]"
    }));
  } else if (groupBy === 'date') {
    const pendingSync = sortedTasks.filter(t => !t.is_done && (t.title === null || t.deadline === null));
    const overdue = sortedTasks.filter(t => t.deadline && isPast(parseISO(t.deadline)) && !isToday(parseISO(t.deadline)) && !t.is_done);
    const todayTasks = sortedTasks.filter(t => t.deadline && isToday(parseISO(t.deadline)));
    const tomorrowTasks = sortedTasks.filter(t => t.deadline && isTomorrow(parseISO(t.deadline)));
    const upcomingRaw = sortedTasks.filter(t => t.deadline && isAfter(parseISO(t.deadline), endOfTomorrow()));

    const upcomingByDate = upcomingRaw.reduce<Record<string, Task[]>>((acc, task) => {
      const key = format(parseISO(task.deadline!), 'dd.MM.yyyy');
      if (!acc[key]) acc[key] = [];
      acc[key].push(task);
      return acc;
    }, {});
    
    const upcomingDateKeys = Object.keys(upcomingByDate).sort((a, b) => {
      const [da, ma, ya] = a.split('.').map(Number);
      const [db, mb, yb] = b.split('.').map(Number);
      const diff = new Date(ya, ma - 1, da).getTime() - new Date(yb, mb - 1, db).getTime();
      return sortOrder === 'asc' ? diff : -diff;
    });

    const dateSections = [
      { title: "Pending AI Sync", tasks: pendingSync, color: "text-[#F59E0B]", badge: "bg-[#FEF3C7]" },
      { title: "Overdue (Deadline)", tasks: overdue, color: "text-[#EF4444]", badge: "bg-[#FEE2E2]" },
      { title: "Today", tasks: todayTasks, color: "text-[#6B5CE7]", badge: "bg-[#EEF0FF]" },
      { title: "Tomorrow", tasks: tomorrowTasks, color: "text-[#0EA5A0]", badge: "bg-[#E0F7F6]" },
    ];
    
    upcomingDateKeys.forEach(dateKey => {
      dateSections.push({
        title: dateKey,
        tasks: upcomingByDate[dateKey],
        color: "text-[#4A4A6A]",
        badge: "bg-[#E4E6F0]"
      });
    });

    displaySections = sortOrder === 'desc' ? dateSections.reverse().filter(s => s.tasks.length > 0) : dateSections.filter(s => s.tasks.length > 0);
  }

  const renderTask = (task: Task) => {
    const isParsing = task.title === null;
    const isEditing = editingId === task.id;
    const isError = task.title === '⚠️ AI Parsing Failed';

    return (
      <div
        key={task.id}
        onClick={e => e.stopPropagation()}
        className={`bg-white p-4 sm:p-5 rounded-[20px] border flex items-start gap-4 transition-all group ${
          isError ? 'border-[#EF4444] bg-[#FEF2F2] shadow-sm' :
          task.is_done ? 'border-[#E4E6F0] opacity-60 bg-[#F7F8FC]' : 'border-[#E4E6F0] shadow-sm hover:border-[#C4BEFA] hover:shadow-md'
        }`}
      >
        {/* Checkbox / Error Icon */}
        {!isError ? (
          <button
            onClick={() => toggleTaskDone(task.id, task.is_done)}
            className={`flex-shrink-0 mt-0.5 transition-colors active:scale-95 ${task.is_done ? 'text-[#10B981]' : 'text-[#CDD0E8] hover:text-[#6B5CE7]'}`}
          >
            {task.is_done ? <CheckCircle2 className="w-7 h-7" /> : <Circle className="w-7 h-7" />}
          </button>
        ) : (
          <div className="flex-shrink-0 mt-0.5 text-[#EF4444]">
            <AlertCircle className="w-7 h-7" />
          </div>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">
          {isParsing ? (
            <div className="flex items-center gap-2">
              <span className="text-[#14142B] truncate font-medium text-[15px]">{task.raw_input}</span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-[#EEF0FF] text-[#6B5CE7]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#6B5CE7] animate-pulse"></span>
                AI parsing...
              </span>
            </div>
          ) : isEditing ? (
            /* ── Inline Edit Form ── */
            <div className="space-y-2.5">
              <input
                autoFocus
                value={editForm.title}
                onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))}
                placeholder="Task title"
                className="w-full text-[15px] font-medium border border-[#C4BEFA] rounded-xl px-3 py-1.5 outline-none focus:ring-2 focus:ring-[#6B5CE7]/20 text-[#14142B]"
              />
              <div className="flex gap-2 flex-wrap">
                <input
                  value={editForm.subject}
                  onChange={e => setEditForm(f => ({ ...f, subject: e.target.value }))}
                  placeholder="Subject (optional)"
                  className="flex-1 min-w-[120px] text-sm border border-[#E4E6F0] rounded-xl px-3 py-1.5 outline-none focus:border-[#6B5CE7] text-[#14142B]"
                />
                <input
                  type="date"
                  value={editForm.deadline}
                  onChange={e => setEditForm(f => ({ ...f, deadline: e.target.value }))}
                  className="text-sm border border-[#E4E6F0] rounded-xl px-3 py-1.5 outline-none focus:border-[#6B5CE7] text-[#14142B] cursor-pointer"
                />
              </div>
              {/* Priority selector */}
              <div className="flex gap-1.5 flex-wrap">
                {PRIORITIES.map(p => (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => setEditForm(f => ({ ...f, priority: p.value }))}
                    className={`px-3 py-1 rounded-full text-[11px] font-bold border-2 transition-all ${editForm.priority === p.value ? `${p.bg} ${p.color} border-current` : 'bg-transparent text-[#8888AA] border-[#E4E6F0] hover:border-[#C4BEFA]'}`}
                  >
                    P{p.value}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => saveEdit(task.id)}
                  className="flex items-center gap-1.5 px-4 py-1.5 bg-[#6B5CE7] text-white text-sm font-semibold rounded-xl hover:bg-[#5a4cdb] transition-colors"
                >
                  <Check className="w-4 h-4" /> Save
                </button>
                <button
                  onClick={() => setEditingId(null)}
                  className="flex items-center gap-1.5 px-4 py-1.5 border border-[#E4E6F0] text-[#8888AA] text-sm font-medium rounded-xl hover:bg-[#F7F8FC] transition-colors"
                >
                  <X className="w-4 h-4" /> Cancel
                </button>
              </div>
            </div>
          ) : isError ? (
            /* ── Error View ── */
            <div className="flex flex-col">
              <span className="text-[15px] font-bold text-[#EF4444]">
                {task.title}
              </span>
              <span className="text-xs font-medium text-[#EF4444]/80 mt-1">
                We couldn't understand: <span className="italic">"{task.raw_input}"</span>. Please edit to set details manually.
              </span>
            </div>
          ) : (
            /* ── Normal View ── */
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
                {(task.deadline || task.subject) && task.created_at && <span className="text-[#E4E6F0]">•</span>}
                {task.created_at && (
                  <span className="text-[#8888AA]/70 font-medium">
                    Added {format(parseISO(task.created_at), 'MMM d, HH:mm')}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right controls */}
        {!isParsing && !isEditing && (
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${getPriorityColor(task.priority)}`}>
              P{task.priority}
            </span>

            {/* ··· Menu */}
            <div className="relative">
              <button
                onClick={() => setOpenMenuId(openMenuId === task.id ? null : task.id)}
                className="p-1.5 rounded-xl border border-transparent text-[#CDD0E8] hover:border-[#E4E6F0] hover:bg-[#F7F8FC] hover:text-[#14142B] transition-colors opacity-100 sm:opacity-0 sm:group-hover:opacity-100 focus:opacity-100"
              >
                <MoreVertical className="w-4 h-4" />
              </button>
              {openMenuId === task.id && (
                <div className="absolute right-0 top-full mt-2 w-40 bg-white border border-[#E4E6F0] rounded-2xl shadow-xl z-50 overflow-hidden">
                  <div className="p-1.5 space-y-1">
                    <button
                      onClick={() => startEditing(task)}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-[#14142B] hover:bg-[#EEF0FF] hover:text-[#6B5CE7] rounded-xl transition-colors"
                    >
                      <Pencil className="w-4 h-4" /> Edit
                    </button>
                    <button
                      onClick={() => { deleteTask(task.id); setOpenMenuId(null); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-[#EF4444] hover:bg-[#FEF2F2] rounded-xl transition-colors"
                    >
                      <Trash2 className="w-4 h-4" /> Delete
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
    <div className="max-w-4xl mx-auto pb-12" onClick={() => { setOpenMenuId(null); }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#14142B] tracking-tight flex items-center gap-2 flex-wrap">
            {greetingText},{' '}
            {editingName ? (
              <span className="flex items-center gap-2">
                <input
                  autoFocus
                  value={nameInput}
                  onChange={e => setNameInput(e.target.value)}
                  onKeyDown={async e => {
                    if (e.key === 'Enter') { setSavingName(true); await updateName(nameInput); setEditingName(false); setSavingName(false); }
                    if (e.key === 'Escape') setEditingName(false);
                  }}
                  className="text-2xl font-bold border-b-2 border-[#6B5CE7] bg-transparent outline-none text-[#14142B] w-48"
                />
                <button onClick={async () => { setSavingName(true); await updateName(nameInput); setEditingName(false); setSavingName(false); }} className="text-[#10B981]">
                  {savingName ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
                </button>
                <button onClick={() => setEditingName(false)} className="text-[#8888AA]"><X className="w-5 h-5" /></button>
              </span>
            ) : (
              displayName
                ? <span className="flex items-center gap-1.5 group">
                  {displayName} 👋
                  <button
                    onClick={() => { setNameInput(user?.name || ''); setEditingName(true); }}
                    className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity p-1 rounded-lg hover:bg-[#EEF0FF] text-[#8888AA] hover:text-[#6B5CE7]"
                    title="Edit name"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                </span>
                : <span className="inline-block w-32 h-8 bg-[#E4E6F0] rounded-lg animate-pulse align-middle" />
            )}
          </h1>
          <p className="text-[#8888AA] mt-1.5 font-medium">{format(new Date(), 'EEEE, MMMM d')}</p>
        </div>
      </div>
      {/* Alerts Warning Banner */}
      {unreadConflicts.length > 0 && !alertsBannerHidden && (
        <div className="bg-gradient-to-r from-[#FEF2F2] to-[#FFF5F5] border border-[#FCA5A5] rounded-2xl p-4 flex gap-3 mb-6 items-center">
          <div className="flex-shrink-0 w-9 h-9 bg-[#EF4444] rounded-xl flex items-center justify-center">
            <Bell className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-[#EF4444] uppercase tracking-wider mb-0.5">New Alerts</p>
            <p className="text-[#14142B] text-sm font-medium">
              You have <span className="font-bold text-[#EF4444]">{unreadConflicts.length}</span> unread alert{unreadConflicts.length > 1 ? 's' : ''} — deadline conflict detected!
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Link
              href="/alerts"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#EF4444] text-white text-xs font-semibold rounded-xl hover:bg-[#dc2626] transition-colors"
            >
              View <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <button
              onClick={() => {
                setAlertsBannerHidden(true);
                markAllAsRead();
              }}
              className="px-3 py-1.5 border border-[#FCA5A5] text-[#EF4444] text-xs font-semibold rounded-xl hover:bg-[#FEF2F2] transition-colors"
            >
              Hide
            </button>
          </div>
        </div>
      )}



      {/* Morning Briefing Banner */}
      {unreadBriefings.length > 0 && (
        <div className="bg-gradient-to-r from-[#FEF3C7] to-[#FFF7ED] border border-[#FDE68A] rounded-2xl p-4 flex gap-3 mb-6 items-center">
          <div className="flex-shrink-0 w-9 h-9 bg-[#F59E0B] rounded-xl flex items-center justify-center">
            <Sun className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-[#F59E0B] uppercase tracking-wider mb-1">New Morning Briefing</p>
            <p className="text-[#14142B] text-sm font-medium leading-relaxed line-clamp-2">
              {unreadBriefings[0].message}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Link
              href="/alerts"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F59E0B] text-white text-xs font-semibold rounded-xl hover:bg-[#d97706] transition-colors"
            >
              Read <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}


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
            className="flex flex-shrink-0 bg-[#6B5CE7] text-white py-2 px-4 sm:px-5 rounded-xl text-sm font-semibold items-center gap-2 hover:bg-[#5a4cdb] transition-all disabled:opacity-50 active:scale-[0.98]"
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

      {/* Task Controls & List */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-xs font-bold tracking-widest uppercase text-[#8888AA] ml-1">Your Tasks</h2>
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={groupBy}
              onChange={e => setGroupBy(e.target.value as any)}
              className="text-xs font-semibold bg-white border border-[#E4E6F0] rounded-xl px-3 py-2 outline-none text-[#4A4A6A] hover:bg-[#F7F8FC] cursor-pointer"
            >
              <option value="date">Group: Date</option>
              <option value="priority">Group: Priority</option>
              <option value="subject">Group: Subject</option>
              <option value="none">Group: None</option>
            </select>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="text-xs font-semibold bg-white border border-[#E4E6F0] rounded-xl px-3 py-2 outline-none text-[#4A4A6A] hover:bg-[#F7F8FC] cursor-pointer"
            >
              <option value="deadline">Sort: Deadline</option>
              <option value="priority">Sort: Priority</option>
              <option value="created">Sort: Added Date</option>
            </select>
            <button
              onClick={() => setSortOrder(o => o === 'asc' ? 'desc' : 'asc')}
              className="text-xs font-semibold bg-white border border-[#E4E6F0] rounded-xl px-3 py-2 text-[#4A4A6A] hover:bg-[#F7F8FC] transition-colors"
            >
              {sortOrder === 'asc' ? 'Asc ↑' : 'Desc ↓'}
            </button>
          </div>
        </div>

        {tasks.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-[24px] border border-[#E4E6F0] border-dashed">
            <div className="bg-[#F7F8FC] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-[#CDD0E8]" />
            </div>
            <h3 className="text-[#14142B] font-bold text-lg mb-1">You're all caught up!</h3>
            <p className="text-[#8888AA] font-medium text-sm">Add a new task above to get started.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {displaySections.map(section => (
              <div key={section.title}>
                {groupBy !== 'none' && (
                  <h3 className={`text-xs font-bold uppercase tracking-widest mb-3 flex items-center gap-2 ${section.color}`}>
                    <span className={`w-2 h-2 rounded-full ${section.badge}`}></span>
                    {section.title}
                  </h3>
                )}
                <div className="space-y-3">
                  {section.tasks.map(renderTask)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
