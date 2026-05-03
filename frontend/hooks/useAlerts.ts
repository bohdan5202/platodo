import { useState, useEffect, useCallback } from 'react';
import useApi from './useApi';

export interface Alert {
  id: string;
  user_id: string;
  message: string;
  type: string | null;
  created_at: string;
}

export const useAlerts = () => {
  const api = useApi();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAlerts = useCallback(async () => {
    try {
      const response = await api.get<Alert[]>('/planner/alerts');
      setAlerts(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch alerts');
      console.error(err);
    }
  }, [api]);

  useEffect(() => {
    fetchAlerts().finally(() => setIsLoading(false));
  }, [fetchAlerts]);

  const dismissAlert = async (id: string) => {
    // Optimistic update
    setAlerts(prev => prev.filter(a => a.id !== id));
    try {
      await api.delete(`/planner/alerts/${id}`);
    } catch (err) {
      console.error('Failed to dismiss alert', err);
      fetchAlerts(); // revert by re-fetching
    }
  };

  const clearAllAlerts = async () => {
    const previous = [...alerts];
    setAlerts([]);
    try {
      await api.delete('/planner/alerts');
    } catch (err) {
      console.error('Failed to clear alerts', err);
      setAlerts(previous);
    }
  };

  return { alerts, isLoading, error, dismissAlert, clearAllAlerts, fetchAlerts };
};
