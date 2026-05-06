// utils/auth.ts

export const TOKEN_KEY = 'platodo_token';

/**
 * Saves token to BOTH cookie and localStorage.
 * Cookie → read by Next.js middleware (server-side)
 * localStorage → legacy fallback, kept for compatibility
 */
export const setToken = (token: string): void => {
  if (typeof window === 'undefined') return;
  const maxAge = 30 * 24 * 60 * 60; // 30 days
  document.cookie = `${TOKEN_KEY}=${token}; path=/; max-age=${maxAge}; SameSite=Lax`;
  localStorage.setItem(TOKEN_KEY, token);
};

/**
 * Reads token from COOKIE — the single source of truth.
 * localStorage can be empty on a new browser/device, but the cookie
 * is always what middleware checks, so we must read the same thing.
 */
export const getToken = (): string | null => {
  if (typeof window === 'undefined') return null;

  // Primary source: cookie (consistent with middleware)
  const cookieToken = document.cookie
    .split('; ')
    .find(row => row.startsWith(`${TOKEN_KEY}=`))
    ?.split('=')[1];

  if (cookieToken) return cookieToken;

  // Fallback: localStorage (for users who logged in before this fix)
  // If found, promote it to cookie so future reads are consistent
  const lsToken = localStorage.getItem(TOKEN_KEY);
  if (lsToken) {
    const maxAge = 30 * 24 * 60 * 60;
    document.cookie = `${TOKEN_KEY}=${lsToken}; path=/; max-age=${maxAge}; SameSite=Lax`;
    return lsToken;
  }

  return null;
};

/**
 * Removes token from BOTH cookie and localStorage.
 */
export const removeToken = (): void => {
  if (typeof window === 'undefined') return;
  document.cookie = `${TOKEN_KEY}=; path=/; max-age=0; SameSite=Lax`;
  localStorage.removeItem(TOKEN_KEY);
};

export const isAuthenticated = (): boolean => !!getToken();