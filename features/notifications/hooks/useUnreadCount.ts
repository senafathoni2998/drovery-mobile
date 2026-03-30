import { useCallback, useEffect, useState } from 'react';
import { notificationApi } from '../services/notificationApi';

export function useUnreadCount() {
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      const result = await notificationApi.getUnreadCount();
      setCount(result.count);
    } catch {
      // keep previous count on error
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return { count, loading, refetch: fetch };
}
