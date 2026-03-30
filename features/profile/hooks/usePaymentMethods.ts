import { useCallback, useEffect, useState } from 'react';
import { paymentApi } from '@/features/profile/services/paymentApi';
import type { ApiPaymentMethod } from '@/services/api/types';

export function usePaymentMethods() {
  const [data, setData] = useState<ApiPaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await paymentApi.list();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load payment methods');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const remove = useCallback(async (id: string) => {
    await paymentApi.remove(id);
    setData(prev => prev.filter(m => m.id !== id));
  }, []);

  const setDefault = useCallback(async (id: string) => {
    await paymentApi.setDefault(id);
    setData(prev => prev.map(m => ({ ...m, isDefault: m.id === id })));
  }, []);

  return { data, loading, error, refetch: fetch, remove, setDefault };
}
