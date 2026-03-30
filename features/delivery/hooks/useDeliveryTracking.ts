import { useCallback, useEffect, useState } from 'react';
import { deliveryApi } from '@/features/delivery/services/deliveryApi';
import type { ApiDelivery } from '@/services/api/types';

export function useDeliveryTracking(id: string | undefined) {
  const [data, setData] = useState<ApiDelivery | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      const result = await deliveryApi.getById(id);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tracking');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetch(); }, [fetch]);

  return { data, loading, error, refetch: fetch };
}
