import { useCallback, useEffect, useState } from 'react';
import { supportApi } from '@/features/profile/services/supportApi';
import type { ApiFaq } from '@/services/api/types';

export function useFAQ() {
  const [data, setData] = useState<ApiFaq[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await supportApi.getFAQ();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load FAQ');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return { data, loading, error, refetch: fetch };
}
