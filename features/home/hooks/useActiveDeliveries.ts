import { useCallback, useEffect, useState } from 'react';
import { deliveryApi } from '@/features/delivery/services/deliveryApi';
import type { ApiDelivery } from '@/services/api/types';

export function useActiveDeliveries() {
  const [data, setData] = useState<ApiDelivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await deliveryApi.getActive();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load deliveries');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return { data, loading, error, refetch: fetch };
}
