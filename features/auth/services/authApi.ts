import { api } from '@/services/api/apiClient';
import type { AuthResponse } from '@/services/api/types';

export const authApi = {
  login(email: string, password: string) {
    return api.post<AuthResponse>('/auth/login', { email, password }, { skipAuth: true });
  },

  signup(name: string, email: string, password: string) {
    return api.post<AuthResponse>('/auth/signup', { name, email, password }, { skipAuth: true });
  },

  refresh(refreshToken: string) {
    return api.post<{ accessToken: string; refreshToken: string }>(
      '/auth/refresh',
      { refreshToken },
      { skipAuth: true },
    );
  },
};
