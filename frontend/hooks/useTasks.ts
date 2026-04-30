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
      const response = await api.get<Task[]>('/tasks');
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
  const checkAndPoll = useCallback((currentTasks: Task[]) => {
    // Check if any task is still unparsed (assuming title being null means unparsed)
    const hasUnparsedTasks = currentTasks.some(task => task.title === null);

    if (hasUnparsedTasks && !pollingRef.current) {
      // Start polling
      pollingRef.current = setInterval(async () => {
        const updatedTasks = await fetchTasks();
        if (updatedTasks) {
          const stillHasUnparsed = updatedTasks.some(task => task.title === null);
          if (!stillHasUnparsed && pollingRef.current) {
            clearInterval(pollingRef.current);
            pollingRef.current = null;
          }
        }
      }, 3000);
    } else if (!hasUnparsedTasks && pollingRef.current) {
      // Stop polling if everything is parsed
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  }, [fetchTasks]);

  // Trigger polling check whenever tasks change
  useEffect(() => {
    checkAndPoll(tasks);
    
    // Cleanup on unmount
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    };
  }, [tasks, checkAndPoll]);

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

  return { tasks, isLoading, error, addTask, toggleTaskDone, fetchTasks };
};
