import { useCallback, useEffect, useState } from 'react';
import { deliveryApi } from '@/features/delivery/services/deliveryApi';
import type { ApiDelivery, DeliveryQueryParams, PaginatedResponse } from '@/services/api/types';

export function useDeliveries(params: DeliveryQueryParams) {
  const [data, setData] = useState<PaginatedResponse<ApiDelivery>>({
    items: [],
    total: 0,
    page: 1,
    limit: 20,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await deliveryApi.list(params);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load deliveries');
    } finally {
      setLoading(false);
    }
  }, [params.status, params.q, params.sort, params.page, params.limit]);

  useEffect(() => { fetch(); }, [fetch]);

  return { ...data, loading, error, refetch: fetch };
}
