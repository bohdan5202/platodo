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
  created_at: string;
}

export const useTasks = () => {
  const api = useApi();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        const hasPendingParse = updatedTasks.some(task => task.title === null);
        if (hasPendingParse) {
          setTimeout(poll, 3000);
        } else {
          pollRef.current = false;
        }
      } else {
        pollRef.current = false;
      }
    };

    setTimeout(poll, 3000);
  }, [fetchTasks]);

  // Trigger polling check whenever tasks change
  useEffect(() => {
    const hasPendingParse = tasks.some(task => task.title === null);
    if (hasPendingParse && !pollRef.current) {
      startPolling();
    }

    return () => {
      pollRef.current = false;
    };
  }, [tasks, startPolling]);

  // Add task function
  const addTask = async (text: string) => {
    try {
      const tempId = `temp-${Date.now()}`;
      const tempTask: Task = {
        id: tempId,
        raw_input: text,
        title: null,
        subject: null,
        deadline: null,
        priority: 1,
        planned_date: null,
        is_done: false,
        created_at: new Date().toISOString(),
      };

      setTasks(prev => [tempTask, ...prev]);

      const response = await api.post<{ id: string, raw_input: string }>('/tasks', { text });

      setTasks(prev => prev.map(t => t.id === tempId ? { ...t, id: response.data.id } : t));

    } catch (err) {
      console.error('Failed to add task', err);
      setTasks(prev => prev.filter(t => !t.id.startsWith('temp-')));
      setError('Failed to add task');
    }
  };

  // Toggle task done status
  const toggleTaskDone = async (id: string, currentStatus: boolean) => {
    try {
      setTasks(prev => prev.map(t => t.id === id ? { ...t, is_done: !currentStatus } : t));
      await api.put(`/tasks/${id}`, { is_done: !currentStatus });
    } catch (err) {
      console.error('Failed to update task', err);
      setTasks(prev => prev.map(t => t.id === id ? { ...t, is_done: currentStatus } : t));
      setError('Failed to update task');
    }
  };

  // Delete task function
  const deleteTask = async (id: string) => {
    const previousTasks = [...tasks];
    try {
      setTasks(prev => prev.filter(t => t.id !== id));
      await api.delete(`/tasks/${id}`);
    } catch (err) {
      console.error('Failed to delete task', err);
      setTasks(previousTasks);
      setError('Failed to delete task');
    }
  };

  // Update planned date function
  const updateTaskDate = async (id: string, newDate: string | null) => {
    const previousTasks = [...tasks];
    try {
      setTasks(prev => prev.map(t => t.id === id ? { ...t, planned_date: newDate } : t));
      await api.put(`/tasks/${id}`, { planned_date: newDate });
    } catch (err) {
      console.error('Failed to update task date', err);
      setTasks(previousTasks);
      setError('Failed to update task date');
    }
  };

  // Update task fields
  const updateTask = async (id: string, fields: { title?: string; subject?: string | null; deadline?: string | null; priority?: number }) => {
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
