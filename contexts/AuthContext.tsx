import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { api, setOnLogout } from '@/services/api/apiClient';
import { saveTokens, getTokens, clearTokens } from '@/services/api/tokenStorage';
import type { AuthResponse, ApiUser } from '@/services/api/types';

interface AuthState {
  user: ApiUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  const logout = useCallback(async () => {
    // Revoke the refresh token server-side (best-effort), then always clear locally.
    try {
      const { refreshToken } = await getTokens();
      if (refreshToken) {
        await api.post('/auth/logout', { refreshToken }, { skipAuth: true });
      }
    } catch {
      // ignore — logout must succeed locally regardless
    }
    await clearTokens();
    setState({ user: null, isAuthenticated: false, isLoading: false });
  }, []);

  // Register logout callback for apiClient to call on token expiry
  useEffect(() => {
    setOnLogout(() => {
      logout();
    });
  }, [logout]);

  // Hydrate auth state from persisted tokens on mount
  useEffect(() => {
    (async () => {
      try {
        const { accessToken } = await getTokens();
        if (!accessToken) {
          setState({ user: null, isAuthenticated: false, isLoading: false });
          return;
        }

        const user = await api.get<ApiUser>('/users/me');
        setState({ user, isAuthenticated: true, isLoading: false });
      } catch {
        await clearTokens();
        setState({ user: null, isAuthenticated: false, isLoading: false });
      }
    })();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const res = await api.post<AuthResponse>('/auth/login', { email, password }, { skipAuth: true });
      await saveTokens(res.accessToken, res.refreshToken);

      // Fetch full user profile
      const user = await api.get<ApiUser>('/users/me');
      setState({ user, isAuthenticated: true, isLoading: false });
      return { success: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed';
      return { success: false, error: message };
    }
  }, []);

  const signup = useCallback(async (name: string, email: string, password: string) => {
    try {
      const res = await api.post<AuthResponse>('/auth/signup', { name, email, password }, { skipAuth: true });
      await saveTokens(res.accessToken, res.refreshToken);

      const user = await api.get<ApiUser>('/users/me');
      setState({ user, isAuthenticated: true, isLoading: false });
      return { success: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Signup failed';
      return { success: false, error: message };
    }
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const user = await api.get<ApiUser>('/users/me');
      setState(prev => ({ ...prev, user }));
    } catch {
      // Silently fail - user data stays stale
    }
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, signup, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
