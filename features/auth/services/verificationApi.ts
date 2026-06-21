import { api } from '@/services/api/apiClient';

export const verificationApi = {
  verifyEmail(token: string) {
    return api.post<{ success: boolean }>(
      '/auth/verify-email',
      { token },
      { skipAuth: true },
    );
  },

  resendVerification() {
    return api.post<{ success: boolean }>('/auth/resend-verification');
  },
};
