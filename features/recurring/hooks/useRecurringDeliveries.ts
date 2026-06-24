import { useCallback, useEffect, useState } from 'react';
import {
  recurringApi,
  type RecurringDelivery,
} from '@/features/recurring/services/recurringApi';

export function useRecurringDeliveries() {
  const [data, setData] = useState<RecurringDelivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await recurringApi.list();
      setData(result.items);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to load recurring deliveries',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const pause = useCallback(async (id: string) => {
    // Optimistic flip; reconcile from the server response.
    setData(prev => prev.map(r => (r.id === id ? { ...r, active: false } : r)));
    try {
      const updated = await recurringApi.pause(id);
      setData(prev => prev.map(r => (r.id === id ? updated : r)));
    } catch (err) {
      // Roll back on failure.
      setData(prev => prev.map(r => (r.id === id ? { ...r, active: true } : r)));
      throw err;
    }
  }, []);

  const resume = useCallback(async (id: string) => {
    setData(prev => prev.map(r => (r.id === id ? { ...r, active: true } : r)));
    try {
      const updated = await recurringApi.resume(id);
      setData(prev => prev.map(r => (r.id === id ? updated : r)));
    } catch (err) {
      setData(prev => prev.map(r => (r.id === id ? { ...r, active: false } : r)));
      throw err;
    }
  }, []);

  const remove = useCallback(async (id: string) => {
    const prevData = data;
    setData(prev => prev.filter(r => r.id !== id));
    try {
      await recurringApi.remove(id);
    } catch (err) {
      // Restore the list on failure.
      setData(prevData);
      throw err;
    }
  }, [data]);

  return { data, loading, error, refetch: fetch, pause, resume, remove };
}
