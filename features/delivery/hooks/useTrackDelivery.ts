import { useCallback, useState } from 'react';
import { deliveryApi } from '@/features/delivery/services/deliveryApi';
import type { ApiDelivery } from '@/services/api/types';

export function useTrackDelivery() {
  const [data, setData] = useState<ApiDelivery | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const track = useCallback(async (trackingId: string) => {
    try {
      setLoading(true);
      setError(null);
      const result = await deliveryApi.track(trackingId);
      setData(result);
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Package not found';
      setError(message);
      setData(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, loading, error, track };
}
