import { api } from '@/services/api/apiClient';
import type { ApiUser, UserStats } from '@/services/api/types';

export const profileApi = {
  getMe() {
    return api.get<ApiUser>('/users/me');
  },

  updateMe(data: { name?: string; phone?: string; address?: string; bio?: string }) {
    return api.patch<ApiUser>('/users/me', data);
  },

  getStats() {
    return api.get<UserStats>('/users/me/stats');
  },
};
