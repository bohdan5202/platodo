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

  const updateName = async (newName: string) => {
    await api.put('/auth/me', { name: newName });
    setUser(prev => prev ? { ...prev, name: newName } : prev);
  };

  const displayName = isLoading
    ? null
    : user?.name?.trim() ||
      (user?.email
        ? user.email.split('@')[0].split('.')[0].charAt(0).toUpperCase() +
          user.email.split('@')[0].split('.')[0].slice(1)
        : 'there');

  return { user, isLoading, displayName, updateName };
};
