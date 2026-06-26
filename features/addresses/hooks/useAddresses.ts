import { useCallback, useEffect, useState } from 'react';
import {
  addressApi,
  type CreateSavedAddressInput,
  type SavedAddress,
  type UpdateSavedAddressInput,
} from '@/features/addresses/services/addressApi';

export function useAddresses() {
  const [data, setData] = useState<SavedAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await addressApi.list();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load addresses');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const create = useCallback(async (input: CreateSavedAddressInput) => {
    const created = await addressApi.create(input);
    setData(prev =>
      created.isDefault
        ? [created, ...prev.map(a => ({ ...a, isDefault: false }))]
        : [...prev, created],
    );
    return created;
  }, []);

  const update = useCallback(async (id: string, input: UpdateSavedAddressInput) => {
    const updated = await addressApi.update(id, input);
    setData(prev =>
      prev.map(a => {
        if (a.id === id) return updated;
        // If the updated address became default, demote the others.
        if (updated.isDefault) return { ...a, isDefault: false };
        return a;
      }),
    );
    return updated;
  }, []);

  const setDefault = useCallback(async (id: string) => {
    // Optimistic flip; reconcile from the server response.
    setData(prev => prev.map(a => ({ ...a, isDefault: a.id === id })));
    const updated = await addressApi.setDefault(id);
    setData(prev => prev.map(a => (a.id === id ? updated : { ...a, isDefault: false })));
  }, []);

  const remove = useCallback(async (id: string) => {
    setData(prev => prev.filter(a => a.id !== id));
    await addressApi.remove(id);
  }, []);

  return { data, loading, error, refetch: fetch, create, update, setDefault, remove };
}
