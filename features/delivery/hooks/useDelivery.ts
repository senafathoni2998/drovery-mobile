import { useCallback, useEffect, useState } from 'react';
import { deliveryApi } from '@/features/delivery/services/deliveryApi';
import type { ApiDelivery } from '@/services/api/types';

export function useDelivery(id: string | undefined) {
  const [data, setData] = useState<ApiDelivery | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!id) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      console.log('[useDelivery] fetching id:', id);
      const result = await deliveryApi.getById(id);
      console.log('[useDelivery] result:', JSON.stringify(result, null, 2));
      setData(result);
    } catch (err) {
      console.log('[useDelivery] error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load delivery');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetch(); }, [fetch]);

  return { data, loading, error, refetch: fetch };
}
