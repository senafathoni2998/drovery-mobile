import { useCallback, useEffect, useState } from 'react';
import { notificationApi } from '../services/notificationApi';
import type { ApiNotification } from '@/services/api/types';

export function useNotifications() {
  const [data, setData] = useState<ApiNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await notificationApi.getAll();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const markAsRead = useCallback(async (id: string) => {
    try {
      await notificationApi.markAsRead(id);
      setData((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    } catch {
      // silently fail, user can retry
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      await notificationApi.markAllAsRead();
      setData((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch {
      // silently fail
    }
  }, []);

  return { data, loading, error, refetch: fetch, markAsRead, markAllAsRead };
}
