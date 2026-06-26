import { api } from '@/services/api/apiClient';
import type { ApiNotification } from '@/services/api/types';

export interface NotificationPreferences {
  pushEnabled: boolean;
  deliveryUpdates: boolean;
  promotions: boolean;
  // Quiet-hours window (hour-of-day 0–23, [start, end)); null = off.
  quietHoursStart: number | null;
  quietHoursEnd: number | null;
}

export const notificationApi = {
  getAll() {
    return api.get<ApiNotification[]>('/notifications');
  },

  getPreferences() {
    return api.get<NotificationPreferences>('/notifications/preferences');
  },

  updatePreferences(body: Partial<NotificationPreferences>) {
    return api.patch<NotificationPreferences>(
      '/notifications/preferences',
      body,
    );
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

  registerDevice(pushToken: string, platform: 'ios' | 'android') {
    return api.post<{ id: string }>('/notifications/devices', {
      pushToken,
      platform,
    });
  },
};
