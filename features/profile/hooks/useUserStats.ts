import { useCallback, useEffect, useState } from 'react';
import { profileApi } from '@/features/profile/services/profileApi';
import type { UserStats } from '@/services/api/types';

export function useUserStats() {
  const [data, setData] = useState<UserStats>({ total: 0, active: 0, completed: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await profileApi.getStats();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load stats');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return { data, loading, error, refetch: fetch };
}
