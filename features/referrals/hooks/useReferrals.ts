import { useCallback, useEffect, useState } from 'react';
import { referralApi, type Referrals } from '@/features/referrals/services/referralApi';

export function useReferrals() {
  const [data, setData] = useState<Referrals | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await referralApi.getReferrals();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load referrals');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, loading, error, refetch: fetch };
}
