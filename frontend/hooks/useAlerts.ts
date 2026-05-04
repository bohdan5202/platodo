import { useState, useEffect, useCallback } from 'react';
import useApi from './useApi';

export interface Alert {
  id: string;
  user_id: string;
  message: string;
  type: string | null;
  is_read: boolean;
  created_at: string;
}

export const useAlerts = () => {
  const api = useApi();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [historyAlerts, setHistoryAlerts] = useState<Alert[]>([]);
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

  const fetchHistory = useCallback(async () => {
    try {
      const response = await api.get<Alert[]>('/planner/alerts/history');
      setHistoryAlerts(response.data);
    } catch (err) {
      console.error('Failed to fetch history', err);
    }
  }, [api]);

  useEffect(() => {
    fetchAlerts().finally(() => setIsLoading(false));

    // Poll for new alerts every 5 seconds
    const interval = setInterval(() => {
      fetchAlerts();
    }, 5000);

    return () => clearInterval(interval);
  }, [fetchAlerts]);

  const dismissAlert = async (id: string) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
    try {
      await api.delete(`/planner/alerts/${id}`);
    } catch (err) {
      console.error('Failed to dismiss alert', err);
      fetchAlerts(); 
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

  const markAllAsRead = async () => {
    setAlerts(prev => prev.map(a => ({ ...a, is_read: true })));
    try {
      await api.put('/planner/alerts/read');
    } catch (err) {
      console.error('Failed to mark all alerts as read', err);
      fetchAlerts();
    }
  };

  return {
    alerts,
    historyAlerts,
    isLoading,
    error,
    dismissAlert,
    clearAllAlerts,
    fetchAlerts,
    fetchHistory,
    markAllAsRead
  };
};
