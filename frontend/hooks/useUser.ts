import { useState, useEffect, useCallback } from 'react';
import useApi from './useApi';

export interface User {
  id: string;
  email: string;
  name: string | null;
  morning_briefing: string | null;
}

export const useUser = () => {
  const api = useApi();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    try {
      const response = await api.get<User>('/auth/me');
      setUser(response.data);
    } catch (err) {
      console.error('Failed to fetch user profile', err);
    } finally {
      setIsLoading(false);
    }
  }, [api]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  // Derive a display name: prefer full name, fall back to capitalised email prefix
  const rawPrefix = user?.email?.split('@')[0]?.split('.')[0] ?? 'there';
  const displayName = user?.name || (rawPrefix.charAt(0).toUpperCase() + rawPrefix.slice(1));

  return { user, isLoading, displayName };
};
