export const TOKEN_KEY = 'platodo_token';

export const setToken = (token: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(TOKEN_KEY, token);
    // Also write to cookie so Next.js middleware can read it server-side
    document.cookie = `${TOKEN_KEY}=${token}; path=/; max-age=${30 * 24 * 60 * 60}; SameSite=Lax`;
  }
};

export const getToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(TOKEN_KEY);
  }
  return null;
};

export const removeToken = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(TOKEN_KEY);
    // Clear the cookie too
    document.cookie = `${TOKEN_KEY}=; path=/; max-age=0; SameSite=Lax`;
  }
};
