import { api } from '@/services/api/apiClient';
import type { ApiNotification } from '@/services/api/types';

export const notificationApi = {
  getAll() {
    return api.get<ApiNotification[]>('/notifications');
  },

  getUnreadCount() {
    return api.get<{ count: number }>('/notifications/unread-count');
  },

  markAsRead(id: string) {
    return api.patch<ApiNotification>(`/notifications/${id}/read`);
  },

  markAllAsRead() {
    return api.patch<{ count: number }>('/notifications/read-all');
  },
};
