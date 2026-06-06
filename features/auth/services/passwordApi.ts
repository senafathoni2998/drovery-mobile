import { api } from '@/services/api/apiClient';

export const passwordApi = {
  forgotPassword(email: string) {
    return api.post<{ success: boolean }>(
      '/auth/forgot-password',
      { email },
      { skipAuth: true },
    );
  },

  resetPassword(token: string, newPassword: string) {
    return api.post<{ success: boolean }>(
      '/auth/reset-password',
      { token, newPassword },
      { skipAuth: true },
    );
  },
};
