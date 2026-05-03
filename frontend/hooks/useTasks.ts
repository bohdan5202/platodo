import { useState, useEffect, useCallback, useRef } from 'react';
import useApi from './useApi';

export interface Task {
  id: string;
  raw_input: string;
  title: string | null;
  subject: string | null;
  deadline: string | null;
  priority: number;
  planned_date: string | null;
  is_done: boolean;
}

export const useTasks = () => {
  const api = useApi();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  // Function to fetch tasks
  const fetchTasks = useCallback(async () => {
    try {
      const response = await api.get<Task[]>('/planner');
      setTasks(response.data);
      setError(null);
      return response.data;
    } catch (err) {
      setError('Failed to fetch tasks');
      console.error(err);
      return null;
    }
  }, [api]);

  // Initial fetch
  useEffect(() => {
    fetchTasks().finally(() => setIsLoading(false));
  }, [fetchTasks]);

  // Polling logic
  const pollRef = useRef<boolean>(false);

  const startPolling = useCallback(async () => {
    if (pollRef.current) return;
    pollRef.current = true;

    const poll = async () => {
      if (!pollRef.current) return;

      const updatedTasks = await fetchTasks();
      if (updatedTasks) {
        // Poll until Thread 1 (AI parser) sets the title.
        // Thread 3 (plannerSync) fires right after Thread 1, so planned_date
        // will also be set before the next 3s poll cycle completes.
        const hasPendingParse = updatedTasks.some(task => task.title === null);
        if (hasPendingParse) {
          setTimeout(poll, 3000);
        } else {
          pollRef.current = false;
        }
      } else {
        // Stop polling on error
        pollRef.current = false;
      }
    };

    setTimeout(poll, 3000);
  }, [fetchTasks]);

  // Trigger polling check whenever tasks change
  useEffect(() => {
    // Only start polling when a task is mid-parse (title not yet set by Thread 1)
    const hasPendingParse = tasks.some(task => task.title === null);
    if (hasPendingParse && !pollRef.current) {
      startPolling();
    }

    // Cleanup on unmount
    return () => {
      pollRef.current = false;
    };
  }, [tasks, startPolling]);

  // Add task function
  const addTask = async (text: string) => {
    try {
      // Optimistic update
      const tempId = `temp-${Date.now()}`;
      const tempTask: Task = {
        id: tempId,
        raw_input: text,
        title: null,
        subject: null,
        deadline: null,
        priority: 1, // Default, will be updated by AI
        planned_date: null,
        is_done: false,
      };

      setTasks(prev => [tempTask, ...prev]);

      const response = await api.post<{ id: string, raw_input: string }>('/tasks', { text });

      // Update temp task with real ID from backend to allow polling to match it
      setTasks(prev => prev.map(t => t.id === tempId ? { ...t, id: response.data.id } : t));

    } catch (err) {
      console.error('Failed to add task', err);
      // Revert optimistic update on failure
      setTasks(prev => prev.filter(t => !t.id.startsWith('temp-')));
      setError('Failed to add task');
    }
  };

  // Toggle task done status
  const toggleTaskDone = async (id: string, currentStatus: boolean) => {
    try {
      // Optimistic update
      setTasks(prev => prev.map(t => t.id === id ? { ...t, is_done: !currentStatus } : t));

      await api.put(`/tasks/${id}`, { is_done: !currentStatus });
    } catch (err) {
      console.error('Failed to update task', err);
      // Revert optimistic update on failure
      setTasks(prev => prev.map(t => t.id === id ? { ...t, is_done: currentStatus } : t));
      setError('Failed to update task');
    }
  };

  // Delete task function
  const deleteTask = async (id: string) => {
    // Keep a reference to the previous state to revert if needed
    const previousTasks = [...tasks];
    try {
      // Optimistic update
      setTasks(prev => prev.filter(t => t.id !== id));

      await api.delete(`/tasks/${id}`);
    } catch (err) {
      console.error('Failed to delete task', err);
      // Revert optimistic update on failure
      setTasks(previousTasks);
      setError('Failed to delete task');
    }
  };

  // Update planned date function
  const updateTaskDate = async (id: string, newDate: string | null) => {
    // Keep a reference to the previous state to revert if needed
    const previousTasks = [...tasks];
    try {
      // Optimistic update
      setTasks(prev => prev.map(t => t.id === id ? { ...t, planned_date: newDate } : t));

      await api.put(`/tasks/${id}`, { planned_date: newDate });
    } catch (err) {
      console.error('Failed to update task date', err);
      // Revert optimistic update on failure
      setTasks(previousTasks);
      setError('Failed to update task date');
    }
  };

  // Update task fields (title, subject, deadline)
  const updateTask = async (id: string, fields: { title?: string; subject?: string | null; deadline?: string | null }) => {
    const previousTasks = [...tasks];
    try {
      setTasks(prev => prev.map(t => t.id === id ? { ...t, ...fields } : t));
      await api.put(`/tasks/${id}`, fields);
    } catch (err) {
      console.error('Failed to update task', err);
      setTasks(previousTasks);
      setError('Failed to update task');
    }
  };

  return { tasks, isLoading, error, addTask, toggleTaskDone, deleteTask, updateTaskDate, updateTask, fetchTasks };
};
