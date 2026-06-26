import { useCallback, useEffect, useState } from 'react';

import {
  notificationApi,
  type NotificationPreferences,
} from '@/features/notifications/services/notificationApi';

export function useNotificationPreferences() {
  const [data, setData] = useState<NotificationPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setData(await notificationApi.getPreferences());
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to load preferences',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  // Optimistically flip the toggle, then persist; on failure re-sync from the server.
  const update = useCallback(
    async (patch: Partial<NotificationPreferences>) => {
      setData((prev) => (prev ? { ...prev, ...patch } : prev));
      try {
        const next = await notificationApi.updatePreferences(patch);
        setData(next);
      } catch (err) {
        await fetch();
        throw err;
      }
    },
    [fetch],
  );

  return { data, loading, error, refetch: fetch, update };
}
